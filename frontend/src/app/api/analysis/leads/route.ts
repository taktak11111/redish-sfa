import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    const supabase = getSupabaseClient()

    // 基本クエリ
    let query = supabase
      .from('call_records')
      .select('lead_id, lead_source, company_name, contact_name, phone, status, linked_date, created_at')

    // 期間フィルタ
    if (startDate) {
      query = query.gte('linked_date', startDate)
    }
    if (endDate) {
      query = query.lte('linked_date', endDate)
    }

    const { data: records, error: recordsError } = await query

    if (recordsError) {
      console.error('[API/analysis/leads] Records error:', recordsError)
      return NextResponse.json({ error: recordsError.message }, { status: 500 })
    }

    // 商談データを取得
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('lead_id, status, amount, created_at')

    if (dealsError) {
      console.error('[API/analysis/leads] Deals error:', dealsError)
    }

    // lead_idごとの商談をマップ化
    const dealsMap = new Map<string, { hasDeal: boolean; isWon: boolean; amount: number }>()
    if (deals) {
      deals.forEach(deal => {
        const existing = dealsMap.get(deal.lead_id)
        const isWon = deal.status === '成約' || deal.status === '受注'
        if (existing) {
          existing.hasDeal = true
          existing.isWon = existing.isWon || isWon
          existing.amount = existing.amount + (deal.amount || 0)
        } else {
          dealsMap.set(deal.lead_id, { hasDeal: true, isWon, amount: deal.amount || 0 })
        }
      })
    }

    // ソース別集計
    const sourceStats: Record<string, {
      total: number
      deals: number
      won: number
      totalAmount: number
    }> = {}

    const allRecords = records || []
    
    allRecords.forEach(record => {
      const source = record.lead_source || '不明'
      if (!sourceStats[source]) {
        sourceStats[source] = { total: 0, deals: 0, won: 0, totalAmount: 0 }
      }
      sourceStats[source].total++
      
      const dealInfo = dealsMap.get(record.lead_id)
      if (dealInfo?.hasDeal) {
        sourceStats[source].deals++
        if (dealInfo.isWon) {
          sourceStats[source].won++
          sourceStats[source].totalAmount += dealInfo.amount
        }
      }
    })

    // 日別推移データ
    const dailyStats: Record<string, Record<string, number>> = {}
    allRecords.forEach(record => {
      const date = record.linked_date?.split('T')[0] || 'unknown'
      const source = record.lead_source || '不明'
      if (!dailyStats[date]) {
        dailyStats[date] = {}
      }
      dailyStats[date][source] = (dailyStats[date][source] || 0) + 1
    })

    // トレンドデータを配列に変換
    const trends = Object.entries(dailyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, sources]) => ({
        date,
        display: date.slice(5), // MM-DD形式
        ...sources,
        total: Object.values(sources).reduce((sum, v) => sum + v, 0)
      }))

    // サマリー計算
    const totalLinked = allRecords.length
    const totalDeals = Array.from(dealsMap.values()).filter(d => d.hasDeal).length
    const totalWon = Array.from(dealsMap.values()).filter(d => d.isWon).length
    const dealRate = totalLinked > 0 ? (totalDeals / totalLinked) * 100 : 0
    const wonRate = totalLinked > 0 ? (totalWon / totalLinked) * 100 : 0

    // ソース別パフォーマンス
    const sourcePerformance = Object.entries(sourceStats).map(([source, stats]) => ({
      name: source,
      total: stats.total,
      deals: stats.deals,
      won: stats.won,
      dealRate: stats.total > 0 ? (stats.deals / stats.total) * 100 : 0,
      wonRate: stats.total > 0 ? (stats.won / stats.total) * 100 : 0,
      totalAmount: stats.totalAmount
    }))

    // 最新レコード
    const recentRecords = allRecords
      .sort((a, b) => (b.linked_date || '').localeCompare(a.linked_date || ''))
      .slice(0, 50)
      .map(record => ({
        ...record,
        hasDeal: dealsMap.has(record.lead_id),
        isWon: dealsMap.get(record.lead_id)?.isWon || false
      }))

    // ソースリスト
    const sources = Array.from(new Set(allRecords.map(r => r.lead_source).filter(Boolean)))

    return NextResponse.json({
      summary: {
        totalLinked,
        totalDeals,
        totalWon,
        dealRate,
        wonRate
      },
      trends,
      sourcePerformance,
      recentRecords,
      sources
    })

  } catch (error: any) {
    console.error('[API/analysis/leads] Error:', error)
    return NextResponse.json(
      { error: error.message || 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}
