import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { requireAuth, isAuthError } from '@/lib/auth/guard'

// Supabase設定
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
// サーバーサイドでは SERVICE_ROLE_KEY を優先使用、なければ ANON_KEY を使用
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
function toCamelCase(record: any) {
  return {
    id: record.deal_id || record.id,
    dealId: record.deal_id,
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
    openingDate: record.opening_date,
    contactPreferredDateTime: record.contact_preferred_datetime,
    allianceRemarks: record.alliance_remarks,
    omcAdditionalInfo1: record.omc_additional_info1, // 後方互換性
    omcSelfFunds: record.omc_self_funds, // 後方互換性
    omcPropertyStatus: record.omc_property_status, // 後方互換性
    sourceSpecificData: record.source_specific_data || {}, // JSONB形式
    amazonTaxAccountant: record.amazon_tax_accountant,
    meetsmoreLink: record.meetsmore_link,
    makuakeLink: record.makuake_link,
    conversationMemo: record.conversation_memo,
    service: record.service,
    category: record.category,
    staffIS: record.staff_is,
    statusIS: record.status_is,
    statusUpdateDate: record.status_update_date,
    appointmentDate: record.appointment_date,
    dealSetupDate: record.deal_setup_date,
    dealTime: record.deal_time,
    dealStaffFS: record.deal_staff_fs,
    dealExecutionDate: record.deal_execution_date,
    videoLink: record.video_link,
    dealPhase: record.deal_phase,
    phaseUpdateDate: record.phase_update_date,
    rankEstimate: record.rank_estimate,
    rankChange: record.rank_change,
    rankUpdateDate: record.rank_update_date,
    lastContactDate: record.last_contact_date,
    actionScheduledDate: record.action_scheduled_date,
    nextActionContent: record.next_action_content,
    responseDeadline: record.response_deadline,
    actionCompleted: record.action_completed,
    customerBANTInfo: record.customer_bant_info,
    competitorInfo: record.competitor_info,
    dealMemo: record.deal_memo,
    rank: record.rank,
    detailRank: record.detail_rank,
    result: record.result,
    resultDate: record.result_date,
    dealDate: record.deal_date,
    amount: record.amount,
    lostFactor: record.lost_factor,
    lostReason: record.lost_reason,
    lostAfterAction: record.lost_after_action,
    feedbackToIS: record.feedback_to_is,
    feedback: record.feedback,
    dealStarted: record.deal_started,
    dealEnded: record.deal_ended,
    dealStartedAt: record.deal_started_at,
    dealDurationMinutes: record.deal_duration_minutes,
    // 商談実施状況
    dealExecutionStatus: record.deal_execution_status,
    // BANT情報
    bantBudget: record.bant_budget,
    bantAuthority: record.bant_authority,
    bantNeed: record.bant_need,
    bantTimeline: record.bant_timeline,
    bantMemo: record.bant_memo,
    // 競合・自己対応状況
    competitorStatus: record.competitor_status,
    selfHandlingStatus: record.self_handling_status,
    competitorMemo: record.competitor_memo,
    // 商談履歴（1回目）
    dealPhase1: record.deal_phase1,
    phaseUpdateDate1: record.phase_update_date1,
    rankEstimate1: record.rank_estimate1,
    dealMemo1: record.deal_memo1,
    // 商談履歴（2回目）
    dealPhase2: record.deal_phase2,
    phaseUpdateDate2: record.phase_update_date2,
    rankEstimate2: record.rank_estimate2,
    dealMemo2: record.deal_memo2,
    // 商談履歴（3回目）
    dealPhase3: record.deal_phase3,
    phaseUpdateDate3: record.phase_update_date3,
    rankEstimate3: record.rank_estimate3,
    dealMemo3: record.deal_memo3,
    // アクション管理
    actionMemo: record.action_memo,
    actionHistoryDate: record.action_history_date,
    actionHistoryContent: record.action_history_content,
    actionHistoryMemo: record.action_history_memo,
    // 商談最終結果
    finalResult: record.final_result,
    resultMemo: record.result_memo,
    // 成約情報
    contractReason: record.contract_reason,
    contractMemo: record.contract_memo,
    // 失注情報
    lostMemo: record.lost_memo,
    // 改善・学習記録
    learningRecord: record.learning_record,
    learningRecordDate: record.learning_record_date,
    learningRecordTitle: record.learning_record_title,
    learningRecordCategory: record.learning_record_category,
    // ニーズ温度
    needTemperature: record.need_temperature,
    // 商談自己採点
    selfQ1: record.self_q1,
    selfQ2: record.self_q2,
    selfQ3: record.self_q3,
    selfQ4: record.self_q4,
    selfQ5: record.self_q5,
    selfQ6: record.self_q6,
    selfQ7: record.self_q7,
    selfTotalScore: record.self_total_score,
    improvementTheme: record.improvement_theme,
    reflectionMemo: record.reflection_memo,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

// キャメルケース → スネークケース変換
function toSnakeCase(data: any) {
  const result: any = {}
  if (data.dealId !== undefined) result.deal_id = data.dealId
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
  if (data.openingDate !== undefined) result.opening_date = data.openingDate
  if (data.contactPreferredDateTime !== undefined) result.contact_preferred_datetime = data.contactPreferredDateTime
  if (data.allianceRemarks !== undefined) result.alliance_remarks = data.allianceRemarks
  // 後方互換性: omc_*カラムも更新
  if (data.omcAdditionalInfo1 !== undefined) result.omc_additional_info1 = data.omcAdditionalInfo1
  if (data.omcSelfFunds !== undefined) result.omc_self_funds = data.omcSelfFunds
  if (data.omcPropertyStatus !== undefined) result.omc_property_status = data.omcPropertyStatus
  // JSONB形式のsource_specific_dataを更新
  if (data.sourceSpecificData !== undefined) result.source_specific_data = data.sourceSpecificData
  // JSONB形式のsource_specific_dataを更新
  if (data.sourceSpecificData !== undefined) result.source_specific_data = data.sourceSpecificData
  if (data.amazonTaxAccountant !== undefined) result.amazon_tax_accountant = data.amazonTaxAccountant
  if (data.meetsmoreLink !== undefined) result.meetsmore_link = data.meetsmoreLink
  if (data.makuakeLink !== undefined) result.makuake_link = data.makuakeLink
  if (data.conversationMemo !== undefined) result.conversation_memo = data.conversationMemo
  if (data.service !== undefined) result.service = data.service
  if (data.category !== undefined) result.category = data.category
  if (data.staffIS !== undefined) result.staff_is = data.staffIS
  if (data.statusIS !== undefined) result.status_is = data.statusIS
  if (data.statusUpdateDate !== undefined) result.status_update_date = data.statusUpdateDate
  if (data.appointmentDate !== undefined) result.appointment_date = data.appointmentDate
  if (data.dealSetupDate !== undefined) result.deal_setup_date = data.dealSetupDate
  if (data.dealTime !== undefined) result.deal_time = data.dealTime
  if (data.dealStaffFS !== undefined) result.deal_staff_fs = data.dealStaffFS
  if (data.dealExecutionDate !== undefined) result.deal_execution_date = data.dealExecutionDate
  if (data.videoLink !== undefined) result.video_link = data.videoLink
  if (data.dealPhase !== undefined) result.deal_phase = data.dealPhase
  if (data.phaseUpdateDate !== undefined) result.phase_update_date = data.phaseUpdateDate
  if (data.rankEstimate !== undefined) result.rank_estimate = data.rankEstimate
  if (data.rankChange !== undefined) result.rank_change = data.rankChange
  if (data.rankUpdateDate !== undefined) result.rank_update_date = data.rankUpdateDate
  if (data.lastContactDate !== undefined) result.last_contact_date = data.lastContactDate
  if (data.actionScheduledDate !== undefined) result.action_scheduled_date = data.actionScheduledDate
  if (data.nextActionContent !== undefined) result.next_action_content = data.nextActionContent
  if (data.responseDeadline !== undefined) result.response_deadline = data.responseDeadline
  if (data.actionCompleted !== undefined) result.action_completed = data.actionCompleted
  if (data.customerBANTInfo !== undefined) result.customer_bant_info = data.customerBANTInfo
  if (data.competitorInfo !== undefined) result.competitor_info = data.competitorInfo
  if (data.dealMemo !== undefined) result.deal_memo = data.dealMemo
  if (data.rank !== undefined) result.rank = data.rank
  if (data.detailRank !== undefined) result.detail_rank = data.detailRank
  if (data.result !== undefined) result.result = data.result
  if (data.resultDate !== undefined) result.result_date = data.resultDate
  if (data.dealDate !== undefined) result.deal_date = data.dealDate
  if (data.amount !== undefined) result.amount = data.amount
  if (data.lostFactor !== undefined) result.lost_factor = data.lostFactor
  if (data.lostReason !== undefined) result.lost_reason = data.lostReason
  if (data.lostAfterAction !== undefined) result.lost_after_action = data.lostAfterAction
  if (data.feedbackToIS !== undefined) result.feedback_to_is = data.feedbackToIS
  if (data.feedback !== undefined) result.feedback = data.feedback
  if (data.dealStarted !== undefined) result.deal_started = data.dealStarted
  if (data.dealEnded !== undefined) result.deal_ended = data.dealEnded
  if (data.dealStartedAt !== undefined) result.deal_started_at = data.dealStartedAt
  if (data.dealDurationMinutes !== undefined) result.deal_duration_minutes = data.dealDurationMinutes
  // 商談実施状況
  if (data.dealExecutionStatus !== undefined) result.deal_execution_status = data.dealExecutionStatus
  // BANT情報
  if (data.bantBudget !== undefined) result.bant_budget = data.bantBudget
  if (data.bantAuthority !== undefined) result.bant_authority = data.bantAuthority
  if (data.bantNeed !== undefined) result.bant_need = data.bantNeed
  if (data.bantTimeline !== undefined) result.bant_timeline = data.bantTimeline
  if (data.bantMemo !== undefined) result.bant_memo = data.bantMemo
  // 競合・自己対応状況
  if (data.competitorStatus !== undefined) result.competitor_status = data.competitorStatus
  if (data.selfHandlingStatus !== undefined) result.self_handling_status = data.selfHandlingStatus
  if (data.competitorMemo !== undefined) result.competitor_memo = data.competitorMemo
  // 商談履歴（1回目）
  if (data.dealPhase1 !== undefined) result.deal_phase1 = data.dealPhase1
  if (data.phaseUpdateDate1 !== undefined) result.phase_update_date1 = data.phaseUpdateDate1
  if (data.rankEstimate1 !== undefined) result.rank_estimate1 = data.rankEstimate1
  if (data.dealMemo1 !== undefined) result.deal_memo1 = data.dealMemo1
  // 商談履歴（2回目）
  if (data.dealPhase2 !== undefined) result.deal_phase2 = data.dealPhase2
  if (data.phaseUpdateDate2 !== undefined) result.phase_update_date2 = data.phaseUpdateDate2
  if (data.rankEstimate2 !== undefined) result.rank_estimate2 = data.rankEstimate2
  if (data.dealMemo2 !== undefined) result.deal_memo2 = data.dealMemo2
  // 商談履歴（3回目）
  if (data.dealPhase3 !== undefined) result.deal_phase3 = data.dealPhase3
  if (data.phaseUpdateDate3 !== undefined) result.phase_update_date3 = data.phaseUpdateDate3
  if (data.rankEstimate3 !== undefined) result.rank_estimate3 = data.rankEstimate3
  if (data.dealMemo3 !== undefined) result.deal_memo3 = data.dealMemo3
  // アクション管理
  if (data.actionMemo !== undefined) result.action_memo = data.actionMemo
  if (data.actionHistoryDate !== undefined) result.action_history_date = data.actionHistoryDate
  if (data.actionHistoryContent !== undefined) result.action_history_content = data.actionHistoryContent
  if (data.actionHistoryMemo !== undefined) result.action_history_memo = data.actionHistoryMemo
  // 商談最終結果
  if (data.finalResult !== undefined) result.final_result = data.finalResult
  if (data.resultMemo !== undefined) result.result_memo = data.resultMemo
  // 成約情報
  if (data.contractReason !== undefined) result.contract_reason = data.contractReason
  if (data.contractMemo !== undefined) result.contract_memo = data.contractMemo
  // 失注情報
  if (data.lostMemo !== undefined) result.lost_memo = data.lostMemo
  // 改善・学習記録
  if (data.learningRecord !== undefined) result.learning_record = data.learningRecord
  if (data.learningRecordDate !== undefined) result.learning_record_date = data.learningRecordDate
  if (data.learningRecordTitle !== undefined) result.learning_record_title = data.learningRecordTitle
  if (data.learningRecordCategory !== undefined) result.learning_record_category = data.learningRecordCategory
  // ニーズ温度
  if (data.needTemperature !== undefined) result.need_temperature = data.needTemperature
  // 商談自己採点
  if (data.selfQ1 !== undefined) result.self_q1 = data.selfQ1
  if (data.selfQ2 !== undefined) result.self_q2 = data.selfQ2
  if (data.selfQ3 !== undefined) result.self_q3 = data.selfQ3
  if (data.selfQ4 !== undefined) result.self_q4 = data.selfQ4
  if (data.selfQ5 !== undefined) result.self_q5 = data.selfQ5
  if (data.selfQ6 !== undefined) result.self_q6 = data.selfQ6
  if (data.selfQ7 !== undefined) result.self_q7 = data.selfQ7
  if (data.selfTotalScore !== undefined) result.self_total_score = data.selfTotalScore
  if (data.improvementTheme !== undefined) result.improvement_theme = data.improvementTheme
  if (data.reflectionMemo !== undefined) result.reflection_memo = data.reflectionMemo
  return result
}

// GET: 商談一覧を取得
export async function GET(request: NextRequest) {
  // 認証チェック
  const authResult = await requireAuth()
  if (isAuthError(authResult)) {
    return authResult
  }

  try {
    const supabase = getSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const staff = searchParams.get('staff')

    let query = supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false })

    if (staff) {
      query = query.eq('staff_is', staff)
    }

    const { data, error } = await query

    if (error) {
      console.error('[API/deals] Supabase error:', error)
      return NextResponse.json(
        { error: 'データの取得に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    const deals = (data || []).map(toCamelCase)
    return NextResponse.json({ data: deals })
  } catch (error) {
    console.error('[API/deals] Error:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 新規商談を作成
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

    // deal_idがない場合は自動生成
    if (!snakeCaseData.deal_id) {
      const { count } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })

      snakeCaseData.deal_id = `SA${String((count || 0) + 1).padStart(4, '0')}`
    }

    const { data, error } = await supabase
      .from('deals')
      .insert(snakeCaseData)
      .select()
      .single()

    if (error) {
      console.error('[API/deals] Supabase error:', error)
      return NextResponse.json(
        { error: '商談の作成に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: toCamelCase(data) })
  } catch (error) {
    console.error('[API/deals] Error:', error)
    return NextResponse.json(
      { error: '商談の作成に失敗しました' },
      { status: 500 }
    )
  }
}

// PATCH: 商談を更新
export async function PATCH(request: NextRequest) {
  // 認証チェック
  const authResult = await requireAuth()
  if (isAuthError(authResult)) {
    return authResult
  }

  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { dealId, ...updates } = body

    if (!dealId) {
      return NextResponse.json(
        { error: '商談IDが必要です' },
        { status: 400 }
      )
    }

    const snakeCaseUpdates = toSnakeCase(updates)

    const { data, error } = await supabase
      .from('deals')
      .update(snakeCaseUpdates)
      .eq('deal_id', dealId)
      .select()
      .single()

    if (error) {
      console.error('[API/deals] Supabase error:', error)
      return NextResponse.json(
        { error: 'データの更新に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    // 成約になった場合のログ
    if (updates.result === '01.成約（契約締結）') {
      console.log('Deal closed:', dealId)
    }

    return NextResponse.json({ success: true, data: toCamelCase(data) })
  } catch (error) {
    console.error('[API/deals] Error:', error)
    return NextResponse.json(
      { error: 'データの更新に失敗しました' },
      { status: 500 }
    )
  }
}







