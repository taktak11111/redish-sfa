import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { requireAuth, isAuthError } from '@/lib/auth/guard'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, subDays } from 'date-fns'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabaseClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    })
  }
  return supabaseClient
}

export async function GET(request: NextRequest) {
  const authResult = await requireAuth()
  if (isAuthError(authResult)) return authResult

  try {
    const supabase = getSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')
    
    const endDate = new Date()
    const startDate = subDays(endDate, days - 1)

    // 1. 架電データの取得
    const { data: calls, error: callsError } = await supabase
      .from('call_records')
      .select('lead_id, lead_source, status, linked_at, staff_is')
      .gte('linked_at', startDate.toISOString())
      .lte('linked_at', endDate.toISOString())

    if (callsError) throw callsError

    // 2. 商談データの取得 (商談実施率の計算用)
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('lead_id, service, category, deal_setup_date')
      .in('lead_id', (calls || []).map(c => c.lead_id))

    if (dealsError) throw dealsError

    // --- 集計ロジック ---

    const totalCalls = (calls || []).length
    const appointments = (calls || []).filter(c => c.status === '09.アポ獲得' || c.status === '03.アポイント獲得済').length
    const setups = (deals || []).filter(d => d.deal_setup_date).length

    // トレンドデータ (日次)
    const interval = eachDayOfInterval({ start: startDate, end: endDate })
    const trends = interval.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayCalls = (calls || []).filter(c => c.linked_at && c.linked_at.startsWith(dateStr))
      const dayAppoints = dayCalls.filter(c => c.status === '09.アポ獲得' || c.status === '03.アポイント獲得済')
      
      return {
        date: dateStr,
        display: format(date, 'M/d'),
        calls: dayCalls.length,
        appointments: dayAppoints.length
      }
    })

    // 担当者別
    const staffNames = Array.from(new Set((calls || []).map(c => c.staff_is).filter(Boolean)))
    const staffPerformance = staffNames.map(name => {
      const sCalls = (calls || []).filter(c => c.staff_is === name)
      const sAppoints = sCalls.filter(c => c.status === '09.アポ獲得' || c.status === '03.アポイント獲得済')
      const sDeals = (deals || []).filter(d => sAppoints.some(sa => sa.lead_id === d.lead_id))
      const sSetups = sDeals.filter(d => d.deal_setup_date).length

      return {
        name,
        calls: sCalls.length,
        appointments: sAppoints.length,
        setups: sSetups,
        conversion: sCalls.length > 0 ? (sAppoints.length / sCalls.length) * 100 : 0,
        setupRate: sAppoints.length > 0 ? (sSetups / sAppoints.length) * 100 : 0
      }
    }).sort((a, b) => b.appointments - a.appointments)

    // チャネル別
    const channels = Array.from(new Set((calls || []).map(c => c.lead_source).filter(Boolean)))
    const channelPerformance = channels.map(source => {
      const cCalls = (calls || []).filter(c => c.lead_source === source)
      const cAppoints = cCalls.filter(c => c.status === '09.アポ獲得' || c.status === '03.アポイント獲得済')
      const cDeals = (deals || []).filter(d => cAppoints.some(ca => ca.lead_id === d.lead_id))
      const cSetups = cDeals.filter(d => d.deal_setup_date).length

      return {
        name: source,
        calls: cCalls.length,
        appointments: cAppoints.length,
        setups: cSetups,
        conversion: cCalls.length > 0 ? (cAppoints.length / cCalls.length) * 100 : 0,
        setupRate: cAppoints.length > 0 ? (cSetups / cAppoints.length) * 100 : 0
      }
    }).sort((a, b) => b.appointments - a.appointments)

    return NextResponse.json({
      summary: {
        totalCalls,
        appointments,
        setups,
        conversion: totalCalls > 0 ? (appointments / totalCalls) * 100 : 0,
        setupRate: appointments > 0 ? (setups / appointments) * 100 : 0
      },
      trends,
      staffPerformance,
      channelPerformance
    })

  } catch (error: any) {
    console.error('[API/analysis/calls] Error:', error)
    return NextResponse.json({ error: '集計に失敗しました', details: error.message }, { status: 500 })
  }
}
