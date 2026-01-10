'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Deal, CallRecord, LostReason, DealRank } from '@/types/sfa'
import { DateRangeFilter, DateRange } from '@/components/shared/DateRangeFilter'

export default function FieldAnalysisPage() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null)

  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const response = await fetch('/api/deals')
      if (!response.ok) throw new Error('Failed to fetch deals')
      return response.json()
    },
  })

  const { data: callsData, isLoading: callsLoading } = useQuery({
    queryKey: ['calls'],
    queryFn: async () => {
      const response = await fetch('/api/calls')
      if (!response.ok) throw new Error('Failed to fetch calls')
      return response.json()
    },
  })

  const isLoading = dealsLoading || callsLoading
  const deals = (dealsData?.data as Deal[] || []).filter(deal => {
    if (!deal.dealDate || !dateRange) return false
    const dealDate = new Date(deal.dealDate)
    dealDate.setHours(0, 0, 0, 0)
    return dealDate >= dateRange.start && dealDate <= dateRange.end
  })

  const calls = (callsData?.data as CallRecord[] || []).filter(call => {
    if (!call.linkedAt || !dateRange) return false
    const linkedDate = new Date(call.linkedAt)
    linkedDate.setHours(0, 0, 0, 0)
    return linkedDate >= dateRange.start && linkedDate <= dateRange.end
  })

  // 統計を計算
  const stats = {
    total: deals.length,
    contracts: deals.filter(d => d.result === '01.成約（契約締結）').length,
    lost: deals.filter(d => d.result?.includes('失注')).length,
    active: deals.filter(d => !d.result).length,
  }

  // 確度別集計
  const rankCounts: Record<DealRank, number> = {
    'A:80%': deals.filter(d => d.rank === 'A:80%').length,
    'B:50%': deals.filter(d => d.rank === 'B:50%').length,
    'C:20%': deals.filter(d => d.rank === 'C:20%').length,
    'D:10%': deals.filter(d => d.rank === 'D:10%').length,
  }

  // 失注理由別集計
  const lostReasons = deals.filter(d => d.lostReason).reduce((acc, deal) => {
    if (deal.lostReason) {
      acc[deal.lostReason] = (acc[deal.lostReason] || 0) + 1
    }
    return acc
  }, {} as Record<LostReason, number>)

  // チャネル別集計
  const channelStats = ['Meetsmore', 'TEMPOS', 'OMC', 'Amazon', 'Makuake'].map(source => {
    const channelCalls = calls.filter(c => c.leadSource === source)
    const channelDeals = deals.filter(d => {
      const call = calls.find(c => c.leadId === d.leadId)
      return call?.leadSource === source
    })
    
    return {
      name: source,
      leads: channelCalls.length,
      appointments: channelCalls.filter(c => c.status === '09.アポ獲得' || c.status === '03.アポイント獲得済').length,
      deals: channelDeals.length,
      contracts: channelDeals.filter(d => d.result === '01.成約（契約締結）').length,
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">フィールド分析</h1>
          <p className="mt-1 text-sm text-gray-500">営業担当者別・期間別のパフォーマンス分析</p>
        </div>
        <DateRangeFilter
          defaultPreset="thisMonth"
          onChange={setDateRange}
        />
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">総商談数</p>
          <p className="text-2xl font-bold text-gray-900">{isLoading ? '-' : stats.total}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">成約</p>
          <p className="text-2xl font-bold text-green-600">{isLoading ? '-' : stats.contracts}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">失注</p>
          <p className="text-2xl font-bold text-red-600">{isLoading ? '-' : stats.lost}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">進行中</p>
          <p className="text-2xl font-bold text-blue-600">{isLoading ? '-' : stats.active}</p>
        </div>
      </div>

      {/* 確度別分布 */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">確度別分布</h2>
        {isLoading ? (
          <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
        ) : (
          <div className="space-y-3">
            {Object.entries(rankCounts).map(([rank, count]) => (
              <div key={rank} className="flex items-center gap-4">
                <span className="w-16 text-sm font-medium">{rank}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      rank === 'A:80%' ? 'bg-green-500' :
                      rank === 'B:50%' ? 'bg-blue-500' :
                      rank === 'C:20%' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="w-12 text-sm text-right">{count}件</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* チャネル別パフォーマンス */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">チャネル別パフォーマンス</h2>
        {isLoading ? (
          <div className="h-48 bg-gray-100 rounded animate-pulse"></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium text-gray-500">チャネル</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-500">リード</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-500">アポ獲得</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-500">商談</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-500">成約</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-500">成約率</th>
                </tr>
              </thead>
              <tbody>
                {channelStats.map(channel => (
                  <tr key={channel.name} className="border-b last:border-0">
                    <td className="py-3 text-sm font-medium text-gray-900">{channel.name}</td>
                    <td className="py-3 text-sm text-right text-gray-600">{channel.leads}</td>
                    <td className="py-3 text-sm text-right text-gray-600">{channel.appointments}</td>
                    <td className="py-3 text-sm text-right text-gray-600">{channel.deals}</td>
                    <td className="py-3 text-sm text-right text-green-600">{channel.contracts}</td>
                    <td className="py-3 text-sm text-right text-gray-600">
                      {channel.deals > 0 ? Math.round((channel.contracts / channel.deals) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 失注理由 */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">失注理由分析</h2>
        {isLoading ? (
          <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
        ) : Object.keys(lostReasons).length === 0 ? (
          <p className="text-gray-500">失注データがありません</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(lostReasons)
              .sort((a, b) => b[1] - a[1])
              .map(([reason, count]) => (
                <div key={reason} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500 mt-1">{reason}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}







