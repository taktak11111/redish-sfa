import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { requireAuth, isAuthError } from '@/lib/auth/guard'
import { startOfMonth, endOfMonth, eachMonthOfInterval, format, subMonths, isSameMonth } from 'date-fns'

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
    const months = parseInt(searchParams.get('months') || '6')
    
    const endDate = endOfMonth(new Date())
    const startDate = startOfMonth(subMonths(new Date(), months - 1))

    // 1. 商談データの取得 (成約金額含む)
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('amount, result, result_date, staff_is, service, category')
      .gte('result_date', format(startDate, 'yyyy-MM-dd'))
      .lte('result_date', format(endDate, 'yyyy-MM-dd'))

    if (dealsError) throw dealsError

    // 2. 架電データの取得 (リード・アポ数計算用)
    const { data: calls, error: callsError } = await supabase
      .from('call_records')
      .select('status, linked_date')
      .gte('linked_date', format(startDate, 'yyyy-MM-dd'))
      .lte('linked_date', format(endDate, 'yyyy-MM-dd'))

    if (callsError) throw callsError

    // --- 集計ロジック ---

    // 期間内の月リスト生成
    const interval = eachMonthOfInterval({ start: startDate, end: endDate })
    
    // トレンドデータ
    const trends = interval.map(month => {
      const monthStr = format(month, 'yyyy-MM')
      const monthDeals = (deals || []).filter(d => d.result_date && d.result_date.startsWith(monthStr))
      const contracts = monthDeals.filter(d => d.result === '01.成約（契約締結）')
      
      const revenue = contracts.reduce((sum, d) => {
        const amt = Number(d.amount)
        return sum + (isNaN(amt) ? 0 : amt)
      }, 0)

      return {
        period: monthStr,
        display: format(month, 'M月'),
        revenue,
        deals: contracts.length,
      }
    })

    // サマリー
    const currentMonthStr = format(new Date(), 'yyyy-MM')
    const prevMonthStr = format(subMonths(new Date(), 1), 'yyyy-MM')

    const currentMonthDeals = (deals || []).filter(d => d.result_date && d.result_date.startsWith(currentMonthStr))
    const prevMonthDeals = (deals || []).filter(d => d.result_date && d.result_date.startsWith(prevMonthStr))
    
    const currentRevenue = currentMonthDeals
      .filter(d => d.result === '01.成約（契約締結）')
      .reduce((sum, d) => {
        const amt = Number(d.amount)
        return sum + (isNaN(amt) ? 0 : amt)
      }, 0)

    const prevRevenue = prevMonthDeals
      .filter(d => d.result === '01.成約（契約締結）')
      .reduce((sum, d) => {
        const amt = Number(d.amount)
        return sum + (isNaN(amt) ? 0 : amt)
      }, 0)
    
    const growthRate = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0
    const totalContracts = (deals || []).filter(d => d.result === '01.成約（契約締結）')
    const totalRevenue = totalContracts.reduce((sum, d) => {
      const amt = Number(d.amount)
      return sum + (isNaN(amt) ? 0 : amt)
    }, 0)

    // ファンネル (全体期間)
    const callsList = calls || []
    const dealsList = deals || []
    const funnel = [
      { stage: 'リード', count: callsList.length },
      { stage: 'アポ獲得', count: callsList.filter(c => c.status === '09.アポ獲得' || c.status === '03.アポイント獲得済').length },
      { stage: '商談実施', count: dealsList.length },
      { stage: '成約', count: totalContracts.length },
    ]

    // 担当者別
    const staffStats = Array.from(new Set(dealsList.map(d => d.staff_is).filter(Boolean))).map(staff => {
      const sDeals = dealsList.filter(d => d.staff_is === staff)
      const sContracts = sDeals.filter(d => d.result === '01.成約（契約締結）')
      const sRevenue = sContracts.reduce((sum, d) => {
        const amt = Number(d.amount)
        return sum + (isNaN(amt) ? 0 : amt)
      }, 0)
      
      return {
        name: staff || '担当者不明',
        revenue: sRevenue,
        contracts: sContracts.length,
        conversion: sDeals.length > 0 ? (sContracts.length / sDeals.length) * 100 : 0,
        avgAmount: sContracts.length > 0 ? sRevenue / sContracts.length : 0
      }
    }).sort((a, b) => b.revenue - a.revenue)

    return NextResponse.json({
      summary: {
        totalRevenue,
        currentRevenue,
        growthRate,
        avgDealSize: totalContracts.length > 0 ? totalRevenue / totalContracts.length : 0,
        overallConversion: (calls || []).length > 0 ? (totalContracts.length / (calls || []).length) * 100 : 0
      },
      trends,
      funnel,
      staffPerformance: staffStats
    })

  } catch (error: any) {
    console.error('[API/analysis/sales] Error:', error)
    return NextResponse.json({ error: '集計に失敗しました', details: error.message }, { status: 500 })
  }
}
