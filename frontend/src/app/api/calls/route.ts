import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { CallStatus } from '@/types/sfa'
import { requireAuth, isAuthError } from '@/lib/auth/guard'

// Supabase設定
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
// サーバーサイドでは SERVICE_ROLE_KEY を優先使用、なければ ANON_KEY を使用
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabaseクライアント（遅延初期化）
let supabaseClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    console.log('[API/calls] Checking environment variables...')
    console.log(`[API/calls] NEXT_PUBLIC_SUPABASE_URL: '${SUPABASE_URL}'`)
    console.log(`[API/calls] SUPABASE_KEY length: ${SUPABASE_KEY?.length}`)
    
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error(`Supabase environment variables missing. URL: ${!!SUPABASE_URL}, KEY: ${!!SUPABASE_KEY}`)
    }
    
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          persistSession: false,
        },
      })
      console.log('[API/calls] Supabase client created successfully')
    } catch (err) {
      console.error('[API/calls] Failed to create Supabase client:', err)
      throw err
    }
  }
  return supabaseClient
}

// スネークケース → キャメルケース変換
function toCamelCase(record: any) {
  return {
    id: record.id,
    leadId: record.lead_id,
    leadSource: record.lead_source,
    linkedDate: record.linked_date,
    industry: record.industry,
    companyName: record.company_name,
    contactName: record.contact_name,
    contactNameKana: record.contact_name_kana,
    phone: record.phone,
    email: record.email,
    address: record.address,
    openingDateOriginal: record.opening_date_original,
    openingDate: record.opening_date,
    contactPreferredDateTime: record.contact_preferred_datetime,
    allianceRemarks: record.alliance_remarks,
    omcAdditionalInfo1: record.omc_additional_info1, // 後方互換性
    omcSelfFunds: record.omc_self_funds, // 後方互換性
    omcPropertyStatus: record.omc_property_status, // 後方互換性
    desiredLoanamount: record.desired_loan_amount,
    sourceSpecificData: record.source_specific_data || {}, // JSONB形式
    amazonTaxAccountant: record.amazon_tax_accountant,
    meetsmoreLink: record.meetsmore_link,
    meetsmoreEntityType: record.meetsmore_entity_type,
    makuakePjtPage: record.makuake_pjt_page,
    makuakeExecutorPage: record.makuake_executor_page,
    status: record.status,
    staffIS: record.staff_is,
    statusIS: record.status_is,
    statusUpdateDate: record.status_update_date,
    cannotContactReason: record.cannot_contact_reason,
    recyclePriority: record.recycle_priority,
    resultContactStatus: record.result_contact_status,
    lastCalledDate: record.last_called_date,
    callCount: record.call_count,
    callDuration: record.call_duration,
    conversationMemo: record.conversation_memo,
    actionOutsideCall: record.action_outside_call,
    nextActionDate: record.next_action_date,
    nextActionContent: record.next_action_content,
    nextActionSupplement: record.next_action_supplement,
    nextActionCompleted: record.next_action_completed,
    appointmentDate: record.appointment_date,
    dealSetupDate: record.deal_setup_date,
    linkedAt: record.linked_at,
    dealTime: record.deal_time,
    dealStaffFS: record.deal_staff_fs,
    dealResult: record.deal_result,
    lostReasonFS: record.lost_reason_fs,
    needTemperature: record.need_temperature,
    customerType: record.customer_type,
    disqualifyReason: record.disqualify_reason,
    unreachableReason: record.unreachable_reason,
    lostReasonPrimary: record.lost_reason_primary,
    lostReasonCustomerSub: record.lost_reason_customer_sub,
    lostReasonCompanySub: record.lost_reason_company_sub,
    lostReasonCompetitorSub: record.lost_reason_competitor_sub,
    lostReasonSelfSub: record.lost_reason_self_sub,
    lostReasonOtherSub: record.lost_reason_other_sub,
    lostReasonMemoTemplate: record.lost_reason_memo_template,
    // 架電オペレーション状態（Phase 1/2）
    todayCallStatus: record.today_call_status,
    callStatusToday: record.call_status_today,
    callingStartedAt: record.calling_started_at,
    connectedAt: record.connected_at,
    endedAt: record.ended_at,
    callingStaffIS: record.calling_staff_is,
    lastConnectedDurationSeconds: record.last_connected_duration_seconds,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

// status自動遷移ルール: status_isとcall_countに基づいてstatusを決定
// ルール:
// 1. status_isが「アポ獲得」系 → '商談獲得'
// 2. call_count >= 1 → 最低でも '架電中'
// 3. status_isが失注系/既存顧客系/コンタクト試行中等 → '架電中'
// 4. それ以外 → '未架電'
function determineStatus(statusIS: string | null | undefined, callCount: number | null | undefined, currentStatus: string | null | undefined): string {
  // アポ獲得系ステータスの場合は商談獲得
  const appointmentStatuses = ['03.アポ獲得', '03.アポイント獲得済', '09.アポ獲得', 'アポ獲得']
  if (statusIS && appointmentStatuses.some(s => statusIS.includes(s) || statusIS.includes('アポ'))) {
    return '商談獲得'
  }

  const isDisqualified =
    !!statusIS &&
    (
      statusIS.startsWith('05a.') ||
      statusIS.includes('Disqualified') ||
      (statusIS.includes('対象外') && !statusIS.includes('失注') && !statusIS.includes('リサイクル対象外'))
    )
  if (isDisqualified) {
    return '架電対象外'
  }

  if (currentStatus === '通電') {
    return '通電'
  }
  
  // 架電回数が1以上なら最低でも架電中
  if (callCount && callCount >= 1) {
    // 現在が商談獲得ならそのまま維持
    if (currentStatus === '商談獲得') {
      return '商談獲得'
    }
    return '架電中'
  }
  
  // status_isが架電中相当のステータスの場合
  const callingStatuses = [
    '02.コンタクト試行中', 'コンタクト試行中',
    '04.失注', '失注', '90.失注', '90. 失注',
    '05.対応不可/対象外', '対応不可', '対象外', '架電対象外',
    '06.ナーチャリング対象', 'ナーチャリング', 'リサイクル',
    '07.既存顧客', '既存顧客',
    '08.掛け直し', '掛け直し',
  ]
  if (statusIS && callingStatuses.some(s => statusIS.includes(s))) {
    return '架電中'
  }
  
  // 現在のステータスを維持（undefinedの場合）、なければ未架電
  return currentStatus || '未架電'
}

// キャメルケース → スネークケース変換
function toSnakeCase(data: any) {
  const result: any = {}
  if (data.leadId !== undefined) result.lead_id = data.leadId
  if (data.leadSource !== undefined) result.lead_source = data.leadSource
  if (data.linkedDate !== undefined) result.linked_date = data.linkedDate
  if (data.industry !== undefined) result.industry = data.industry
  if (data.companyName !== undefined) result.company_name = data.companyName
  if (data.contactName !== undefined) result.contact_name = data.contactName
  if (data.contactNameKana !== undefined) result.contact_name_kana = data.contactNameKana
  if (data.phone !== undefined) result.phone = data.phone
  if (data.email !== undefined) result.email = data.email
  if (data.address !== undefined) result.address = data.address
  if (data.openingDateOriginal !== undefined) result.opening_date_original = data.openingDateOriginal
  if (data.openingDate !== undefined) result.opening_date = data.openingDate
  if (data.contactPreferredDateTime !== undefined) result.contact_preferred_datetime = data.contactPreferredDateTime
  if (data.allianceRemarks !== undefined) result.alliance_remarks = data.allianceRemarks
  // 後方互換性: omc_*カラムも更新
  // 後方互換性: omc_*カラムも更新
  if (data.omcAdditionalInfo1 !== undefined) result.omc_additional_info1 = data.omcAdditionalInfo1
  if (data.omcSelfFunds !== undefined) result.omc_self_funds = data.omcSelfFunds
  if (data.omcPropertyStatus !== undefined) result.omc_property_status = data.omcPropertyStatus
  if (data.desiredLoanamount !== undefined) result.desired_loan_amount = data.desiredLoanamount
  // JSONB形式のsource_specific_dataを更新
  if (data.sourceSpecificData !== undefined) result.source_specific_data = data.sourceSpecificData
  // JSONB形式のsource_specific_dataを更新
  if (data.sourceSpecificData !== undefined) result.source_specific_data = data.sourceSpecificData
  if (data.amazonTaxAccountant !== undefined) result.amazon_tax_accountant = data.amazonTaxAccountant
  if (data.meetsmoreLink !== undefined) result.meetsmore_link = data.meetsmoreLink
  if (data.meetsmoreEntityType !== undefined) result.meetsmore_entity_type = data.meetsmoreEntityType
  if (data.makuakePjtPage !== undefined) result.makuake_pjt_page = data.makuakePjtPage
  if (data.makuakeExecutorPage !== undefined) result.makuake_executor_page = data.makuakeExecutorPage
  if (data.status !== undefined) result.status = data.status
  if (data.staffIS !== undefined) result.staff_is = data.staffIS
  if (data.statusIS !== undefined) result.status_is = data.statusIS
  if (data.statusUpdateDate !== undefined) result.status_update_date = data.statusUpdateDate
  if (data.cannotContactReason !== undefined) result.cannot_contact_reason = data.cannotContactReason
  if (data.recyclePriority !== undefined) result.recycle_priority = data.recyclePriority
  if (data.resultContactStatus !== undefined) result.result_contact_status = data.resultContactStatus
  if (data.lastCalledDate !== undefined) result.last_called_date = data.lastCalledDate
  if (data.callCount !== undefined) result.call_count = data.callCount
  if (data.callDuration !== undefined) result.call_duration = data.callDuration
  if (data.conversationMemo !== undefined) result.conversation_memo = data.conversationMemo
  if (data.actionOutsideCall !== undefined) result.action_outside_call = data.actionOutsideCall
  if (data.nextActionDate !== undefined) result.next_action_date = data.nextActionDate
  if (data.nextActionContent !== undefined) result.next_action_content = data.nextActionContent
  if (data.nextActionSupplement !== undefined) result.next_action_supplement = data.nextActionSupplement
  if (data.nextActionCompleted !== undefined) result.next_action_completed = data.nextActionCompleted
  if (data.appointmentDate !== undefined) result.appointment_date = data.appointmentDate
  if (data.dealSetupDate !== undefined) result.deal_setup_date = data.dealSetupDate
  if (data.linkedAt !== undefined) result.linked_at = data.linkedAt
  if (data.dealTime !== undefined) result.deal_time = data.dealTime
  if (data.dealStaffFS !== undefined) result.deal_staff_fs = data.dealStaffFS
  if (data.dealResult !== undefined) result.deal_result = data.dealResult
  if (data.lostReasonFS !== undefined) result.lost_reason_fs = data.lostReasonFS
  if (data.needTemperature !== undefined) result.need_temperature = data.needTemperature
  if (data.customerType !== undefined) result.customer_type = data.customerType
  if (data.disqualifyReason !== undefined) result.disqualify_reason = data.disqualifyReason
  if (data.unreachableReason !== undefined) result.unreachable_reason = data.unreachableReason
  if (data.lostReasonPrimary !== undefined) result.lost_reason_primary = data.lostReasonPrimary
  if (data.lostReasonCustomerSub !== undefined) result.lost_reason_customer_sub = data.lostReasonCustomerSub
  if (data.lostReasonCompanySub !== undefined) result.lost_reason_company_sub = data.lostReasonCompanySub
  if (data.lostReasonCompetitorSub !== undefined) result.lost_reason_competitor_sub = data.lostReasonCompetitorSub
  if (data.lostReasonSelfSub !== undefined) result.lost_reason_self_sub = data.lostReasonSelfSub
  if (data.lostReasonOtherSub !== undefined) result.lost_reason_other_sub = data.lostReasonOtherSub
  if (data.lostReasonMemoTemplate !== undefined) result.lost_reason_memo_template = data.lostReasonMemoTemplate
  // 架電オペレーション状態（Phase 1/2）
  if (data.todayCallStatus !== undefined) result.today_call_status = data.todayCallStatus
  if (data.callStatusToday !== undefined) result.call_status_today = data.callStatusToday
  if (data.callingStartedAt !== undefined) result.calling_started_at = data.callingStartedAt
  if (data.connectedAt !== undefined) result.connected_at = data.connectedAt
  if (data.endedAt !== undefined) result.ended_at = data.endedAt
  if (data.callingStaffIS !== undefined) result.calling_staff_is = data.callingStaffIS
  if (data.lastConnectedDurationSeconds !== undefined) result.last_connected_duration_seconds = data.lastConnectedDurationSeconds
  return result
}

// ページネーションで全件取得（Supabase 1000件上限対策）
async function fetchAllRecords(supabase: SupabaseClient, baseQuery: any): Promise<any[]> {
  const allRecords: any[] = []
  const pageSize = 1000
  let offset = 0
  let retryCount = 0
  const maxRetries = 3
  
  while (true) {
    try {
      const { data, error } = await baseQuery.range(offset, offset + pageSize - 1)
      if (error) {
        console.error(`[API/calls] Supabase query error at offset ${offset}:`, error)
        throw error
      }
      if (!data || data.length === 0) break
      
      allRecords.push(...data)
      if (data.length < pageSize) break // 最後のページ
      offset += pageSize
      retryCount = 0 // 成功したらリトライカウントをリセット
    } catch (error: any) {
      retryCount++
      if (retryCount > maxRetries) {
        console.error(`[API/calls] Max retries exceeded at offset ${offset}`)
        throw error
      }
      console.log(`[API/calls] Retrying query at offset ${offset} (attempt ${retryCount}/${maxRetries})`)
      // リトライ前に少し待機
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
    }
  }
  
  return allRecords
}

// GET: 架電記録一覧を取得
// パフォーマンス最適化: サーバーサイドフィルタリング対応
// - leadIds: カンマ区切りのリードID（リスト表示モード用、最大500件）
// - startDate, endDate: 期間フィルタ（分析モード用）
// - staffIS: 担当者フィルタ
export async function GET(request: NextRequest) {
  // 認証チェック
  const authResult = await requireAuth()
  if (isAuthError(authResult)) {
    return authResult
  }

  try {
    console.log('[API/calls] Connecting to Supabase...')
    const supabase = getSupabaseClient()
    
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as CallStatus | null
    const leadIdsParam = searchParams.get('leadIds')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const staffIS = searchParams.get('staffIS')

    let query = supabase
      .from('call_records')
      .select('*')
      .order('created_at', { ascending: false })

    // リスト表示モード: leadIdsで絞り込み（最優先、高速）
    if (leadIdsParam) {
      const leadIds = leadIdsParam.split(',').slice(0, 500) // 最大500件
      query = query.in('lead_id', leadIds)
      console.log(`[API/calls] Filtering by leadIds: ${leadIds.length} items`)
    } else {
      // 通常モード: 期間・担当者でフィルタ
      if (startDate) {
        query = query.gte('linked_date', startDate)
        console.log(`[API/calls] Filtering by startDate: ${startDate}`)
      }
      if (endDate) {
        query = query.lte('linked_date', endDate)
        console.log(`[API/calls] Filtering by endDate: ${endDate}`)
      }
      if (staffIS) {
        query = query.eq('staff_is', staffIS)
        console.log(`[API/calls] Filtering by staffIS: ${staffIS}`)
      }
    }

    if (status) {
      query = query.eq('status', status)
    }

    console.log('[API/calls] Executing query...')
    // ページネーションで全件取得（1000件上限対策）
    const data = await fetchAllRecords(supabase, query)

    console.log(`[API/calls] Successfully fetched ${data?.length || 0} records`)
    const records = (data || []).map(toCamelCase)
    return NextResponse.json({ data: records })
  } catch (error: any) {
    console.error('[API/calls] Unexpected error:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました', details: error.message || String(error) },
      { status: 500 }
    )
  }
}

// POST: 新規架電記録を作成
export async function POST(request: NextRequest) {
  // 認証チェック
  const authResult = await requireAuth()
  if (isAuthError(authResult)) {
    return authResult
  }

  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const snakeCaseData = toSnakeCase(body)

    const { data, error } = await supabase
      .from('call_records')
      .insert(snakeCaseData)
      .select()
      .single()

    if (error) {
      console.error('[API/calls] Supabase error:', error)
      return NextResponse.json(
        { error: '架電記録の作成に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: toCamelCase(data) })
  } catch (error) {
    console.error('[API/calls] Error:', error)
    return NextResponse.json(
      { error: '架電記録の作成に失敗しました' },
      { status: 500 }
    )
  }
}

// PATCH: 架電記録を更新
export async function PATCH(request: NextRequest) {
  // 認証チェック
  const authResult = await requireAuth()
  if (isAuthError(authResult)) {
    return authResult
  }

  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { leadId, ...updates } = body

    if (!leadId) {
      return NextResponse.json(
        { error: 'リードIDが必要です' },
        { status: 400 }
      )
    }

    // 現在のレコードを取得（status自動遷移の判定に必要）
    const { data: currentRecord, error: fetchError } = await supabase
      .from('call_records')
      .select('status, status_is, call_count')
      .eq('lead_id', leadId)
      .single()

    if (fetchError) {
      console.error('[API/calls] Failed to fetch current record:', fetchError)
    }

    const snakeCaseUpdates = toSnakeCase(updates)

    // status自動遷移ロジック: status_isまたはcall_countが更新された場合
    // または明示的にstatusが指定されていない場合に自動計算
    const newStatusIS = snakeCaseUpdates.status_is ?? currentRecord?.status_is
    const newCallCount = snakeCaseUpdates.call_count ?? currentRecord?.call_count
    const currentStatus = currentRecord?.status

    // statusが明示的に指定されていない場合、自動計算
    if (updates.status === undefined) {
      const calculatedStatus = determineStatus(newStatusIS, newCallCount, currentStatus)
      // 現在のstatusと異なる場合のみ更新
      if (calculatedStatus !== currentStatus) {
        snakeCaseUpdates.status = calculatedStatus
        console.log(`[API/calls] Auto-transitioning status: ${currentStatus} -> ${calculatedStatus} (statusIS: ${newStatusIS}, callCount: ${newCallCount})`)
      }
    }

    const { data, error } = await supabase
      .from('call_records')
      .update(snakeCaseUpdates)
      .eq('lead_id', leadId)
      .select()
      .single()

    if (error) {
      console.error('[API/calls] Supabase error:', error)
      return NextResponse.json(
        { error: 'データの更新に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    // 商談獲得ステータスの場合、商談管理に自動移行
    const isDealAcquired =
      updates.status === '03.アポイント獲得済' ||
      updates.status === '09.アポ獲得'

    if (isDealAcquired && data) {
      // 既存の商談をチェック
      const { data: existingDeal } = await supabase
        .from('deals')
        .select('deal_id')
        .eq('lead_id', leadId)
        .single()

      if (!existingDeal) {
        // 商談IDを生成
        const { count } = await supabase
          .from('deals')
          .select('*', { count: 'exact', head: true })

        const dealId = `SA${String((count || 0) + 1).padStart(4, '0')}`

        // 商談を作成
        await supabase.from('deals').insert({
          deal_id: dealId,
          lead_id: data.lead_id,
          lead_source: data.lead_source,
          linked_date: data.linked_date,
          industry: data.industry,
          company_name: data.company_name,
          contact_name: data.contact_name,
          contact_name_kana: data.contact_name_kana,
          phone: data.phone,
          email: data.email,
          address: data.address,
          opening_date: data.opening_date,
          contact_preferred_datetime: data.contact_preferred_datetime,
          alliance_remarks: data.alliance_remarks,
          omc_additional_info1: data.omc_additional_info1, // 後方互換性
          omc_self_funds: data.omc_self_funds, // 後方互換性
          omc_property_status: data.omc_property_status, // 後方互換性
          source_specific_data: data.source_specific_data || {}, // JSONB形式
          amazon_tax_accountant: data.amazon_tax_accountant,
          meetsmore_link: data.meetsmore_link,
          conversation_memo: data.conversation_memo,
          staff_is: data.staff_is,
          status_is: data.status_is,
          status_update_date: data.status_update_date,
          appointment_date: data.appointment_date,
          deal_setup_date: data.deal_setup_date,
          deal_time: data.deal_time,
          deal_staff_fs: data.deal_staff_fs,
          need_temperature: data.need_temperature,
          service: 'RO:開業（融資）',
          category: 'A:飲食',
          rank: 'C:20%',
        })

        console.log('Deal created automatically:', dealId)
      }
    }

    return NextResponse.json({ success: true, data: toCamelCase(data) })
  } catch (error) {
    console.error('[API/calls] Error:', error)
    return NextResponse.json(
      { error: 'データの更新に失敗しました' },
      { status: 500 }
    )
  }
}







