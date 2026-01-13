import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { requireAuth, isAuthError } from '@/lib/auth/guard'
import { CallList, CallListCondition, CallListAssignment } from '@/types/sfa'

// Supabase設定
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getLocalDateString(date: Date = new Date()): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function normalizeDateStringToYmd(input: string): string {
  const s = String(input || '').trim()
  if (!s) return ''

  // ISO先頭（例: 2026-01-11T...）
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.slice(0, 10)
  }

  // 2026/1/11 や 2026-1-11 などを許容
  const m = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/.exec(s)
  if (m) {
    const yyyy = m[1]
    const mm = String(Number(m[2])).padStart(2, '0')
    const dd = String(Number(m[3])).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  return ''
}

// Supabaseクライアント（遅延初期化）
let supabaseClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error(`Supabase environment variables missing. URL: ${!!SUPABASE_URL}, KEY: ${!!SUPABASE_KEY}`)
    }
    
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
      },
    })
  }
  return supabaseClient
}

// スネークケース → キャメルケース変換
function toCamelCase(record: any): CallList {
  return {
    id: record.id,
    name: record.name,
    date: record.date,
    conditions: record.conditions,
    leadIds: record.lead_ids || [],
    staffIS: record.staff_is,
    isShared: record.is_shared || false,
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at),
  }
}

// キャメルケース → スネークケース変換
function toSnakeCase(data: Partial<CallList>) {
  const result: any = {}
  if (data.name !== undefined) result.name = data.name
  if (data.date !== undefined) result.date = data.date
  if (data.conditions !== undefined) result.conditions = data.conditions
  if (data.leadIds !== undefined) result.lead_ids = data.leadIds
  if (data.staffIS !== undefined) result.staff_is = data.staffIS
  if (data.isShared !== undefined) result.is_shared = data.isShared
  return result
}

// GET: 架電リスト一覧を取得
export async function GET(request: NextRequest) {
  const authResult = await requireAuth()
  if (isAuthError(authResult)) {
    return authResult
  }

  try {
    const supabase = getSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date') // YYYY-MM-DD形式
    const staffIS = searchParams.get('staffIS')
    const limitParam = searchParams.get('limit')
    const limit = (() => {
      if (!limitParam) return null
      const n = Number(limitParam)
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : null
    })()

    let query = supabase
      .from('call_lists')
      .select('*')
      .order('created_at', { ascending: false })

    if (date) {
      query = query.eq('date', date)
    }

    if (staffIS) {
      query = query.eq('staff_is', staffIS)
    }

    if (limit !== null) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('[API/call-lists] Supabase query error:', error)
      // postgrest schema cache上でテーブル未検出
      if (error.code === 'PGRST205') {
        return NextResponse.json(
          {
            error: 'DBテーブル(call_lists)が未作成です。テーブル作成SQLを適用してください。',
            details: error.message,
          },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: 'データの取得に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    const lists = (data || []).map(toCamelCase)
    return NextResponse.json({ data: lists })
  } catch (error: any) {
    console.error('[API/call-lists] Unexpected error:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました', details: error.message || String(error) },
      { status: 500 }
    )
  }
}

// POST: 新規架電リストを作成
export async function POST(request: NextRequest) {
  const authResult = await requireAuth()
  if (isAuthError(authResult)) {
    return authResult
  }

  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { conditions, name, isShared, staffIS } = body

    // 条件に基づいてリードIDを取得
    let leadIds = await getLeadIdsByConditions(supabase, conditions)

    // 重複防止チェック（方針: 他担当に割当済みのものは除外して作成を継続）
    const leadIdsBeforeDuplicationCheck = leadIds.length
    if (conditions.preventDuplication && leadIds.length > 0) {
      const today = getLocalDateString()
      // call_list_assignmentsテーブルから今日の割り当てを確認（他担当のみ）
      // テーブルが存在しない場合は、call_listsテーブルから確認
      let assignmentsQuery = supabase
        .from('call_list_assignments')
        .select('lead_id')
        .in('lead_id', leadIds)
        .eq('assigned_date', today)
      
      // ★ 自分のstaffISの割り当ては除外（自分のリストは重複チェック対象外）
      if (staffIS) {
        assignmentsQuery = assignmentsQuery.neq('staff_is', staffIS)
      }
      
      const { data: existingAssignments, error: assignmentError } = await assignmentsQuery
      
      // テーブルが存在しない場合は、call_listsテーブルから確認
      if (assignmentError && assignmentError.code === '42P01') {
        // call_listsテーブルから今日のリストを確認（自分以外の担当者のリストのみ）
        let todayListsQuery = supabase
          .from('call_lists')
          .select('lead_ids, staff_is')
          .eq('date', today)
        
        // 現在の担当者のリストは除外（自分のリストは重複チェック対象外）
        if (staffIS) {
          todayListsQuery = todayListsQuery.neq('staff_is', staffIS)
        }
        
        const { data: todayLists } = await todayListsQuery
        
        if (todayLists && todayLists.length > 0) {
          const assignedLeadIds = todayLists.flatMap(list => list.lead_ids || [])
          const duplicateLeadIds = leadIds.filter(id => assignedLeadIds.includes(id))
          
          console.log(`[POST] Duplication check via lists: Found ${todayLists.length} other lists with ${assignedLeadIds.length} leads, ${duplicateLeadIds.length} duplicates`)
          
          if (duplicateLeadIds.length > 0) {
            leadIds = leadIds.filter((id) => !duplicateLeadIds.includes(id))
          }
        }
      } else if (existingAssignments && existingAssignments.length > 0) {
        const assignedLeadIds = existingAssignments.map(a => a.lead_id)
        const duplicateLeadIds = leadIds.filter(id => assignedLeadIds.includes(id))
        
        console.log(`[POST] Duplication check via assignments (other staff): ${duplicateLeadIds.length} duplicates found`)
        
        if (duplicateLeadIds.length > 0) {
          leadIds = leadIds.filter((id) => !duplicateLeadIds.includes(id))
        }
      }
    }
    console.log(`[POST] After duplication check: ${leadIdsBeforeDuplicationCheck} -> ${leadIds.length}`)

    // 架電リストを作成
    const today = getLocalDateString()

    // 同名・同日・同担当のリストが既にあれば再利用（重複作成防止）
    {
      let existingQuery = supabase
        .from('call_lists')
        .select('*')
        .eq('date', today)
        .eq('name', name)
        .order('created_at', { ascending: false })
        .limit(1)

      existingQuery = staffIS
        ? existingQuery.eq('staff_is', staffIS)
        : existingQuery.is('staff_is', null)

      const { data: existingList, error: existingErr } = await existingQuery.maybeSingle()

      // 既存リストがあれば更新（上書き）して返す
      if (!existingErr && existingList) {
        // ★ 古いassignmentsを削除（再割り当てのため）
        if (conditions.preventDuplication) {
          await supabase
            .from('call_list_assignments')
            .delete()
            .eq('call_list_id', existingList.id)
            .eq('assigned_date', today)
          console.log(`[POST] Cleared old assignments for list ${existingList.id}`)
        }
        
        const { data: updatedList, error: updateErr } = await supabase
          .from('call_lists')
          .update({
            conditions,
            lead_ids: leadIds,
          })
          .eq('id', existingList.id)
          .select()
          .single()
        
        if (!updateErr && updatedList) {
          // ★ 新しいassignmentsを追加
          if (conditions.preventDuplication && leadIds.length > 0) {
            const assignments = leadIds.map(leadId => ({
              lead_id: leadId,
              call_list_id: updatedList.id,
              staff_is: staffIS || null,
              assigned_date: today,
              assigned_at: new Date().toISOString(),
            }))
            await supabase.from('call_list_assignments').insert(assignments)
            console.log(`[POST] Added ${assignments.length} new assignments for updated list`)
          }
          
          // 担当ISを対象リードへ一括反映 + 架電状態の完全リセット
          const resetFields = {
            call_status_today: null,
            today_call_status: null,
            calling_started_at: null,
            connected_at: null,
            ended_at: null,
            result_contact_status: null,  // 直近結果（ハイライト用）
          }
          if (staffIS && leadIds.length > 0) {
            await supabase
              .from('call_records')
              .update({ staff_is: staffIS, ...resetFields })
              .in('lead_id', leadIds)
          } else if (leadIds.length > 0) {
            await supabase
              .from('call_records')
              .update(resetFields)
              .in('lead_id', leadIds)
          }
          
          return NextResponse.json({ data: toCamelCase(updatedList) })
        }
        // 更新失敗時は新規作成を試みる
      }
    }

    const listData = {
      name,
      date: today,
      conditions,
      lead_ids: leadIds,
      staff_is: staffIS || null,
      is_shared: isShared || false,
    }

    const { data: list, error: listError } = await supabase
      .from('call_lists')
      .insert(listData)
      .select()
      .single()

    if (listError) {
      // テーブル未作成の場合は原因が分かるメッセージにする
      if (listError.code === '42P01' || listError.code === 'PGRST205') {
        return NextResponse.json(
          { error: 'DBテーブル(call_lists)が未作成です。テーブル作成SQLを適用してください。', details: listError.message },
          { status: 500 }
        )
      }
      console.error('[API/call-lists] Supabase error:', listError)
      return NextResponse.json(
        { error: '架電リストの作成に失敗しました', details: listError.message },
        { status: 500 }
      )
    }

    // 担当ISを対象リードへ一括反映 + 架電状態の完全リセット
    // リセット対象: call_status_today, today_call_status, calling_started_at, connected_at, ended_at, result_contact_status
    const resetFields = {
      call_status_today: null,      // 架電結果（不通X、通電など）
      today_call_status: null,      // 本日ステータス（完了など）
      calling_started_at: null,     // 架電開始時刻
      connected_at: null,           // 通電時刻
      ended_at: null,               // 終了時刻
      result_contact_status: null,  // 直近結果（ハイライト用）
    }
    
    if (staffIS && leadIds.length > 0) {
      const { error: updateStaffError } = await supabase
        .from('call_records')
        .update({ 
          staff_is: staffIS,
          ...resetFields,
        })
        .in('lead_id', leadIds)

      if (updateStaffError) {
        console.error('[API/call-lists] call_records reset error:', updateStaffError)
      }
    } else if (leadIds.length > 0) {
      await supabase
        .from('call_records')
        .update(resetFields)
        .in('lead_id', leadIds)
    }

    // 重複防止用の割り当てを記録（テーブルが存在する場合のみ）
    if (conditions.preventDuplication && leadIds.length > 0) {
      const today = getLocalDateString()
      const assignments = leadIds.map(leadId => ({
        lead_id: leadId,
        call_list_id: list.id,
        staff_is: staffIS || null,
        assigned_date: today,
        assigned_at: new Date().toISOString(),
      }))

      const { error: assignmentError } = await supabase
        .from('call_list_assignments')
        .insert(assignments)

      if (assignmentError) {
        // テーブルが存在しない場合は無視（後でテーブルを作成する）
        if (assignmentError.code !== '42P01') {
          console.error('[API/call-lists] Assignment error:', assignmentError)
        }
      }
    }

    return NextResponse.json({ data: toCamelCase(list) })
  } catch (error: any) {
    console.error('[API/call-lists] Error:', error)
    return NextResponse.json(
      { error: '架電リストの作成に失敗しました', details: error.message || String(error) },
      { status: 500 }
    )
  }
}

// PATCH: 架電リストからリードを除外（=割当解除して解放）
export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth()
  if (isAuthError(authResult)) {
    return authResult
  }

  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { id, removeLeadIds } = body as { id?: string; removeLeadIds?: string[] }

    if (!id || !Array.isArray(removeLeadIds) || removeLeadIds.length === 0) {
      return NextResponse.json({ error: 'id と removeLeadIds が必要です' }, { status: 400 })
    }

    // 現在のlead_idsを取得
    const { data: listRow, error: listErr } = await supabase
      .from('call_lists')
      .select('id, lead_ids, staff_is, date')
      .eq('id', id)
      .single()

    if (listErr || !listRow) {
      return NextResponse.json({ error: '架電リストが見つかりません' }, { status: 404 })
    }

    const currentLeadIds: string[] = Array.isArray(listRow.lead_ids) ? listRow.lead_ids : []
    const nextLeadIds = currentLeadIds.filter((x) => !removeLeadIds.includes(x))

    const { error: updateErr } = await supabase
      .from('call_lists')
      .update({ lead_ids: nextLeadIds })
      .eq('id', id)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // 割当解除（解放）
    const assignedDate = listRow.date || getLocalDateString()
    await supabase
      .from('call_list_assignments')
      .delete()
      .eq('call_list_id', id)
      .eq('assigned_date', assignedDate)
      .in('lead_id', removeLeadIds)

    // staff_is も外す（他担当が拾えるように）
    if (listRow.staff_is) {
      await supabase
        .from('call_records')
        .update({ staff_is: null })
        .in('lead_id', removeLeadIds)
        .eq('staff_is', listRow.staff_is)
    }

    return NextResponse.json({ ok: true, leadIds: nextLeadIds })
  } catch (error: any) {
    console.error('[API/call-lists] PATCH error:', error)
    return NextResponse.json(
      { error: '架電リストの更新に失敗しました', details: error.message || String(error) },
      { status: 500 }
    )
  }
}

// 全リードを優先度順に取得する関数
// 優先度: ① 新規リード（連携日降順）→ ② 折返し（最終架電日降順）→ ③ 不通リード（架電回数5回以下優先）→ ④ その他
async function getLeadIdsByConditions(
  supabase: SupabaseClient,
  conditions: CallListCondition
): Promise<string[]> {
  const today = getLocalDateString()
  const maxNoConnectionCount =
    typeof (conditions as any).maxNoConnectionCallCount === 'number'
      ? Math.max(0, Math.floor((conditions as any).maxNoConnectionCallCount))
      : 5

  // 除外すべきステータス（架電対象外）- 完全一致
  const excludeStatusIS = [
    // 正式なステータス値
    '03.アポイント獲得済',           // 商談獲得済み
    '04.失注（ナーチャリング対象外）', // 失注（対象外）
    '05a.対象外（Disqualified）',    // 対象外
    '05b.連絡不能（Unreachable）',   // 連絡不能
    '05.対応不可/対象外（旧）',       // 旧ステータス
    '07.既存顧客（属性へ移行予定）',  // 既存顧客
    // DBに実際に存在する値（正式値と異なる）
    '商談獲得',                       // ← 追加
    '対象外（Disqualified）',        // ← 追加（05a.なし）
    '連絡不能（Unreachable）',       // ← 追加（05b.なし）
    '失注（リサイクル対象外）',       // ← 追加
  ]
  
  // 部分一致で除外するキーワード
  const excludeKeywords = [
    '失注（リサイクル対象',  // 失注（リサイクル対象）、失注（リサイクル対象 A-E付与）など
    'アポイント獲得',        // アポイント獲得済など
    '商談獲得',              // 商談獲得など
  ]

  // 全リードを取得（ソートに必要な情報を含む）- ページネーションで全件
  const allRecords: any[] = []
  const pageSize = 1000
  let offset = 0
  
  while (true) {
    const { data: pageData } = await supabase
      .from('call_records')
      .select('id, lead_id, status, status_is, linked_date, call_count, next_action_date, updated_at')
      .range(offset, offset + pageSize - 1)
    
    if (!pageData || pageData.length === 0) break
    allRecords.push(...pageData)
    if (pageData.length < pageSize) break
    offset += pageSize
  }

  if (!allRecords || allRecords.length === 0) {
    console.log('[getLeadIdsByConditions] No records found')
    return []
  }

  console.log(`[getLeadIdsByConditions] Total records: ${allRecords.length}`)

  // 除外ステータスをフィルタリング
  const eligibleRecords = allRecords.filter((r: any) => {
    const statusIS = String(r.status_is || '').trim()
    
    // 空またはnullのstatus_isは対象に含める（新規リード等）
    if (!statusIS) {
      return true
    }
    
    // 完全一致で除外
    if (excludeStatusIS.includes(statusIS)) {
      return false
    }
    
    // 部分一致で除外（失注リサイクル対象のみ）
    for (const keyword of excludeKeywords) {
      if (statusIS.includes(keyword)) {
        return false
      }
    }
    
    return true
  })

  console.log(`[getLeadIdsByConditions] Eligible records after status filter: ${eligibleRecords.length}`)

  // 不通リードのIDを取得（call_historyテーブルから）
  const { data: noConnectionHistories } = await supabase
    .from('call_history')
    .select('call_record_id')
    .eq('status', '不通')

  const noConnectionRecordIds = new Set(
    (noConnectionHistories || []).map((h: any) => h.call_record_id).filter(Boolean)
  )

  // リードを分類してソート
  type RecordWithPriority = {
    lead_id: string
    priority: number
    sortDate: string
  }

  const recordsWithPriority: RecordWithPriority[] = eligibleRecords.map((r: any) => {
    let priority = 4 // デフォルト: その他
    let sortDate = r.linked_date || '1900-01-01'

    // 新規リード（未架電）→ 優先度1、連携日降順
    if (r.status === '未架電') {
      priority = 1
      sortDate = r.linked_date || '1900-01-01'
    }
    // 折返し（ISステータスがコンタクト試行中系、または次回架電日が今日）→ 優先度2、最終架電日降順
    else if (
      ['02.コンタクト試行中', 'コンタクト試行中（折り返し）'].includes(r.status_is) ||
      normalizeDateStringToYmd(String(r.next_action_date || '')) === today
    ) {
      priority = 2
      sortDate = r.updated_at || r.linked_date || '1900-01-01'
    }
    // 不通リード（架電回数5回以下）→ 優先度3、最終架電日降順
    else if (noConnectionRecordIds.has(r.id) && (r.call_count || 0) <= maxNoConnectionCount) {
      priority = 3
      sortDate = r.updated_at || r.linked_date || '1900-01-01'
    }
    // 不通リード（架電回数5回超）→ 優先度3.5（リスト不足時用）
    else if (noConnectionRecordIds.has(r.id)) {
      priority = 3.5
      sortDate = r.updated_at || r.linked_date || '1900-01-01'
    }
    // その他（ナーチャリング対象など）→ 優先度4、連携日降順
    else {
      priority = 4
      sortDate = r.linked_date || '1900-01-01'
    }

    return {
      lead_id: r.lead_id,
      priority,
      sortDate,
    }
  })

  // ソート: 優先度昇順 → 日付降順（新しいものが先）
  recordsWithPriority.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority
    }
    // 日付降順（新しいものが先）
    return b.sortDate.localeCompare(a.sortDate)
  })

  // lead_idの配列に変換（重複を除去）
  const seenLeadIds = new Set<string>()
  const sortedLeadIds: string[] = []
  for (const r of recordsWithPriority) {
    if (!seenLeadIds.has(r.lead_id)) {
      seenLeadIds.add(r.lead_id)
      sortedLeadIds.push(r.lead_id)
    }
  }

  // 追加条件でフィルタリング（dateRange, leadSources, staffIS, industries）
  let filteredLeadIds = sortedLeadIds

  if (conditions.dateRange || conditions.leadSources?.length || conditions.staffIS?.length || conditions.industries?.length) {
    let filteredQuery = supabase
      .from('call_records')
      .select('lead_id')
      .in('lead_id', sortedLeadIds)

    if (conditions.dateRange) {
      const start = new Date((conditions.dateRange as any).start)
      const end = new Date((conditions.dateRange as any).end)
      filteredQuery = filteredQuery
        .gte('linked_date', start.toISOString().split('T')[0])
        .lte('linked_date', end.toISOString().split('T')[0])
    }

    if (conditions.leadSources && conditions.leadSources.length > 0) {
      filteredQuery = filteredQuery.in('lead_source', conditions.leadSources)
    }

    if (conditions.staffIS && conditions.staffIS.length > 0) {
      filteredQuery = filteredQuery.in('staff_is', conditions.staffIS)
    }

    if (conditions.industries && conditions.industries.length > 0) {
      filteredQuery = filteredQuery.in('industry', conditions.industries)
    }

    const { data: filteredData } = await filteredQuery
    const filteredSet = new Set((filteredData || []).map(r => r.lead_id))
    filteredLeadIds = sortedLeadIds.filter(id => filteredSet.has(id))
  }

  console.log(`[getLeadIdsByConditions] After all filters: ${filteredLeadIds.length}`)

  // 件数上限が指定されていれば制限
  if (conditions.maxCount && conditions.maxCount > 0 && filteredLeadIds.length > conditions.maxCount) {
    console.log(`[getLeadIdsByConditions] Limiting to maxCount: ${conditions.maxCount}`)
    return filteredLeadIds.slice(0, conditions.maxCount)
  }

  return filteredLeadIds
}

// DELETE: 架電リストを削除
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth()
  if (isAuthError(authResult)) {
    return authResult
  }

  try {
    const supabase = getSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'idが必要です' }, { status: 400 })
    }

    // リストを削除
    const { error } = await supabase
      .from('call_lists')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[API/call-lists] DELETE error:', error)
      return NextResponse.json(
        { error: 'リストの削除に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API/call-lists] DELETE unexpected error:', error)
    return NextResponse.json(
      { error: 'リストの削除に失敗しました', details: error.message || String(error) },
      { status: 500 }
    )
  }
}
