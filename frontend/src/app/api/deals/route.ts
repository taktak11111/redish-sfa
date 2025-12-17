import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

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
    omcAdditionalInfo1: record.omc_additional_info1,
    omcSelfFunds: record.omc_self_funds,
    omcPropertyStatus: record.omc_property_status,
    amazonTaxAccountant: record.amazon_tax_accountant,
    meetsmoreLink: record.meetsmore_link,
    makuakeLink: record.makuake_link,
    conversationMemo: record.conversation_memo,
    service: record.service,
    category: record.category,
    staffIS: record.staff_is,
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
    lostFactor: record.lost_factor,
    lostReason: record.lost_reason,
    lostAfterAction: record.lost_after_action,
    feedbackToIS: record.feedback_to_is,
    feedback: record.feedback,
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
  if (data.omcAdditionalInfo1 !== undefined) result.omc_additional_info1 = data.omcAdditionalInfo1
  if (data.omcSelfFunds !== undefined) result.omc_self_funds = data.omcSelfFunds
  if (data.omcPropertyStatus !== undefined) result.omc_property_status = data.omcPropertyStatus
  if (data.amazonTaxAccountant !== undefined) result.amazon_tax_accountant = data.amazonTaxAccountant
  if (data.meetsmoreLink !== undefined) result.meetsmore_link = data.meetsmoreLink
  if (data.makuakeLink !== undefined) result.makuake_link = data.makuakeLink
  if (data.conversationMemo !== undefined) result.conversation_memo = data.conversationMemo
  if (data.service !== undefined) result.service = data.service
  if (data.category !== undefined) result.category = data.category
  if (data.staffIS !== undefined) result.staff_is = data.staffIS
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
  if (data.lostFactor !== undefined) result.lost_factor = data.lostFactor
  if (data.lostReason !== undefined) result.lost_reason = data.lostReason
  if (data.lostAfterAction !== undefined) result.lost_after_action = data.lostAfterAction
  if (data.feedbackToIS !== undefined) result.feedback_to_is = data.feedbackToIS
  if (data.feedback !== undefined) result.feedback = data.feedback
  return result
}

// GET: 商談一覧を取得
export async function GET(request: NextRequest) {
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







