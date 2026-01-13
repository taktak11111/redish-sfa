import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { requireAuth, isAuthError } from '@/lib/auth/guard'
import { CallList } from '@/types/sfa'

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
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.slice(0, 10)
  }
  const m = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/.exec(s)
  if (m) {
    const yyyy = m[1]
    const mm = String(Number(m[2])).padStart(2, '0')
    const dd = String(Number(m[3])).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }
  return ''
}

let supabaseClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error(`Supabase environment variables missing`)
    }
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    })
  }
  return supabaseClient
}

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

// POST: 既存リストにリードを追加
export async function POST(request: NextRequest) {
  const authResult = await requireAuth()
  if (isAuthError(authResult)) {
    return authResult
  }

  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { callListId, existingLeadIds, addCount, staffIS } = body

    if (!callListId || !Array.isArray(existingLeadIds)) {
      return NextResponse.json({ error: 'callListId と existingLeadIds が必要です' }, { status: 400 })
    }

    const targetAddCount = typeof addCount === 'number' && addCount > 0 ? addCount : 50
    const today = getLocalDateString()

    // 全リードを優先度順に取得（既存リードを除外）
    const { data: allRecords } = await supabase
      .from('call_records')
      .select('id, lead_id, status, status_is, linked_date, call_count, next_action_date, updated_at')

    if (!allRecords || allRecords.length === 0) {
      return NextResponse.json({ error: '追加可能なリードがありません' }, { status: 400 })
    }

    // 不通リードのIDを取得
    const { data: noConnectionHistories } = await supabase
      .from('call_history')
      .select('call_record_id')
      .eq('status', '不通')

    const noConnectionRecordIds = new Set(
      (noConnectionHistories || []).map((h: any) => h.call_record_id).filter(Boolean)
    )

    // 除外すべきステータス（架電対象外）- 完全一致
    const excludeStatusIS = [
      '03.アポイント獲得済',
      '04.失注（ナーチャリング対象外）',
      '05a.対象外（Disqualified）',
      '05b.連絡不能（Unreachable）',
      '05.対応不可/対象外（旧）',
      '07.既存顧客（属性へ移行予定）',
      '商談獲得',
      '対象外（Disqualified）',
      '連絡不能（Unreachable）',
      '失注（リサイクル対象外）',
    ]
    const excludeKeywords = [
      '失注（リサイクル対象',
      'アポイント獲得',
      '商談獲得',
    ]

    // 既存リード + 除外ステータスをフィルタ
    const existingSet = new Set(existingLeadIds)
    const availableRecords = allRecords.filter((r: any) => {
      // 既存リードを除外
      if (existingSet.has(r.lead_id)) return false
      
      // ステータスによる除外
      const statusIS = String(r.status_is || '').trim()
      if (statusIS && excludeStatusIS.includes(statusIS)) return false
      for (const keyword of excludeKeywords) {
        if (statusIS.includes(keyword)) return false
      }
      
      return true
    })

    if (availableRecords.length === 0) {
      return NextResponse.json({ error: '追加可能なリードがありません。全てのリードが既にリストに含まれています。' }, { status: 400 })
    }

    // 優先度付けしてソート
    type RecordWithPriority = { lead_id: string; priority: number; sortDate: string }
    const recordsWithPriority: RecordWithPriority[] = availableRecords.map((r: any) => {
      let priority = 4
      let sortDate = r.linked_date || '1900-01-01'

      if (r.status === '未架電') {
        priority = 1
        sortDate = r.linked_date || '1900-01-01'
      } else if (
        ['02.コンタクト試行中', 'コンタクト試行中（折り返し）'].includes(r.status_is) ||
        normalizeDateStringToYmd(String(r.next_action_date || '')) === today
      ) {
        priority = 2
        sortDate = r.updated_at || r.linked_date || '1900-01-01'
      } else if (noConnectionRecordIds.has(r.id) && (r.call_count || 0) <= 5) {
        priority = 3
        sortDate = r.updated_at || r.linked_date || '1900-01-01'
      } else {
        priority = 4
        sortDate = r.linked_date || '1900-01-01'
      }

      return { lead_id: r.lead_id, priority, sortDate }
    })

    recordsWithPriority.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority
      return b.sortDate.localeCompare(a.sortDate)
    })

    // 重複除去して追加件数分を取得
    const seenLeadIds = new Set<string>()
    const newLeadIds: string[] = []
    for (const r of recordsWithPriority) {
      if (!seenLeadIds.has(r.lead_id)) {
        seenLeadIds.add(r.lead_id)
        newLeadIds.push(r.lead_id)
        if (newLeadIds.length >= targetAddCount) break
      }
    }

    if (newLeadIds.length === 0) {
      return NextResponse.json({ error: '追加可能なリードがありません' }, { status: 400 })
    }

    // 既存リストを更新
    const updatedLeadIds = [...existingLeadIds, ...newLeadIds]

    const { data: updatedList, error: updateErr } = await supabase
      .from('call_lists')
      .update({ lead_ids: updatedLeadIds })
      .eq('id', callListId)
      .select()
      .single()

    if (updateErr) {
      return NextResponse.json({ error: '更新に失敗しました', details: updateErr.message }, { status: 500 })
    }

    // 追加したリードに担当ISを設定（KPIやハイライトはリセットしない）
    if (staffIS && newLeadIds.length > 0) {
      await supabase
        .from('call_records')
        .update({ staff_is: staffIS })
        .in('lead_id', newLeadIds)
    }

    return NextResponse.json({ data: toCamelCase(updatedList) })
  } catch (error: any) {
    console.error('[API/call-lists/add] Error:', error)
    return NextResponse.json(
      { error: 'リードの追加に失敗しました', details: error.message || String(error) },
      { status: 500 }
    )
  }
}
