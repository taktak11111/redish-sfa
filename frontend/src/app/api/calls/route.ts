import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { CallStatus } from '@/types/sfa'

// Supabase設定
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bszxofqfdseqgeccypsq.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzenhvZnFmZHNlcWdlY2N5cHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMDk4NTgsImV4cCI6MjA4MDY4NTg1OH0.ymqLi5JxGvAT9RokHe8_mjl4euXaTljs9bwwlGqeoXg'

// Supabaseクライアント（遅延初期化）
let supabaseClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
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
    openingDate: record.opening_date,
    contactPreferredDateTime: record.contact_preferred_datetime,
    allianceRemarks: record.alliance_remarks,
    omcAdditionalInfo1: record.omc_additional_info1,
    omcSelfFunds: record.omc_self_funds,
    omcPropertyStatus: record.omc_property_status,
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
    dealTime: record.deal_time,
    dealStaffFS: record.deal_staff_fs,
    dealResult: record.deal_result,
    lostReasonFS: record.lost_reason_fs,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
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
  if (data.openingDate !== undefined) result.opening_date = data.openingDate
  if (data.contactPreferredDateTime !== undefined) result.contact_preferred_datetime = data.contactPreferredDateTime
  if (data.allianceRemarks !== undefined) result.alliance_remarks = data.allianceRemarks
  if (data.omcAdditionalInfo1 !== undefined) result.omc_additional_info1 = data.omcAdditionalInfo1
  if (data.omcSelfFunds !== undefined) result.omc_self_funds = data.omcSelfFunds
  if (data.omcPropertyStatus !== undefined) result.omc_property_status = data.omcPropertyStatus
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
  if (data.dealTime !== undefined) result.deal_time = data.dealTime
  if (data.dealStaffFS !== undefined) result.deal_staff_fs = data.dealStaffFS
  if (data.dealResult !== undefined) result.deal_result = data.dealResult
  if (data.lostReasonFS !== undefined) result.lost_reason_fs = data.lostReasonFS
  return result
}

// GET: 架電記録一覧を取得
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as CallStatus | null

    let query = supabase
      .from('call_records')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('[API/calls] Supabase error:', error)
      return NextResponse.json(
        { error: 'データの取得に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    const records = (data || []).map(toCamelCase)
    return NextResponse.json({ data: records })
  } catch (error) {
    console.error('[API/calls] Error:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 新規架電記録を作成
export async function POST(request: NextRequest) {
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

    const snakeCaseUpdates = toSnakeCase(updates)

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
          omc_additional_info1: data.omc_additional_info1,
          omc_self_funds: data.omc_self_funds,
          omc_property_status: data.omc_property_status,
          amazon_tax_accountant: data.amazon_tax_accountant,
          meetsmore_link: data.meetsmore_link,
          conversation_memo: data.conversation_memo,
          staff_is: data.staff_is,
          appointment_date: data.appointment_date,
          deal_setup_date: data.deal_setup_date,
          deal_time: data.deal_time,
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
