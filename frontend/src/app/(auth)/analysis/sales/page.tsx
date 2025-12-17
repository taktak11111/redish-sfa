'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Deal, CallRecord } from '@/types/sfa'

export default function SalesAnalysisPage() {
  const [days, setDays] = useState(30)

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
  const deals = dealsData?.data as Deal[] || []
  const calls = callsData?.data as CallRecord[] || []

  // 日別データを生成
  const dailyData = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    date.setHours(0, 0, 0, 0)
    const dateStr = date.toISOString().split('T')[0]
    
    const dayDeals = deals.filter(deal => {
      if (!deal.dealDate) return false
      const dealDate = new Date(deal.dealDate)
      return dealDate.toISOString().split('T')[0] === dateStr
    })
    
    const dayCalls = calls.filter(call => {
      if (!call.linkedAt) return false
      const linkedDate = new Date(call.linkedAt)
      return linkedDate.toISOString().split('T')[0] === dateStr
    })
    
    return {
      date: dateStr,
      displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
      leads: dayCalls.length,
      appointments: dayCalls.filter(c => c.status === '09.アポ獲得' || c.status === '03.アポイント獲得済').length,
      deals: dayDeals.length,
      contracts: dayDeals.filter(d => d.result === '01.成約（契約締結）').length,
      lost: dayDeals.filter(d => d.result?.includes('失注')).length,
    }
  })

  // 合計
  const totals = dailyData.reduce((acc, day) => ({
    leads: acc.leads + day.leads,
    appointments: acc.appointments + day.appointments,
    deals: acc.deals + day.deals,
    contracts: acc.contracts + day.contracts,
    lost: acc.lost + day.lost,
  }), { leads: 0, appointments: 0, deals: 0, contracts: 0, lost: 0 })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">インサイド分析</h1>
        <p className="mt-1 text-sm text-gray-500">日別の営業活動トレンド分析</p>
      </div>

      {/* 期間選択 */}
      <div className="card p-4">
        <div className="flex gap-2">
          {[7, 14, 30, 60, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                days === d 
                  ? 'text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={days === d ? { backgroundColor: '#0083a0' } : {}}
            >
              {d}日間
            </button>
          ))}
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">リード</p>
          <p className="text-2xl font-bold text-gray-900">{isLoading ? '-' : totals.leads}</p>
          <p className="text-xs text-gray-400">期間計</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">アポ獲得</p>
          <p className="text-2xl font-bold text-blue-600">{isLoading ? '-' : totals.appointments}</p>
          <p className="text-xs text-gray-400">期間計</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">商談</p>
          <p className="text-2xl font-bold text-gray-900">{isLoading ? '-' : totals.deals}</p>
          <p className="text-xs text-gray-400">期間計</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">成約</p>
          <p className="text-2xl font-bold text-green-600">{isLoading ? '-' : totals.contracts}</p>
          <p className="text-xs text-gray-400">期間計</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">失注</p>
          <p className="text-2xl font-bold text-red-600">{isLoading ? '-' : totals.lost}</p>
          <p className="text-xs text-gray-400">期間計</p>
        </div>
      </div>

      {/* チャート（簡易バー表示） */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">日別推移</h2>
        {isLoading ? (
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-max">
              <div className="flex items-end gap-1 h-48">
                {dailyData.map((day, i) => {
                  const maxValue = Math.max(...dailyData.map(d => d.leads + d.appointments + d.contracts))
                  const height = maxValue > 0 ? ((day.leads + day.appointments + day.contracts) / maxValue) * 100 : 0
                  
                  return (
                    <div key={i} className="flex flex-col items-center flex-1 min-w-[24px]">
                      <div className="w-full flex flex-col-reverse" style={{ height: '160px' }}>
                        <div 
                          className="w-full bg-gray-300 rounded-t transition-all"
                          style={{ height: `${maxValue > 0 ? (day.leads / maxValue) * 100 : 0}%` }}
                          title={`リード: ${day.leads}`}
                        ></div>
                        <div 
                          className="w-full bg-blue-500 transition-all"
                          style={{ height: `${maxValue > 0 ? (day.appointments / maxValue) * 100 : 0}%` }}
                          title={`アポ: ${day.appointments}`}
                        ></div>
                        <div 
                          className="w-full bg-green-500 rounded-t transition-all"
                          style={{ height: `${maxValue > 0 ? (day.contracts / maxValue) * 100 : 0}%` }}
                          title={`成約: ${day.contracts}`}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                        {day.displayDate}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-8">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded"></div>
                  <span className="text-xs text-gray-500">リード</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-xs text-gray-500">アポ獲得</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-xs text-gray-500">成約</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 日別テーブル */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日付
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  リード
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アポ獲得
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商談
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  成約
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  失注
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                [...Array(7)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                dailyData.slice().reverse().slice(0, 14).map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {day.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {day.leads}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-blue-600">
                      {day.appointments}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {day.deals}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">
                      {day.contracts}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">
                      {day.lost}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">合計</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{totals.leads}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{totals.appointments}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{totals.deals}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">{totals.contracts}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">{totals.lost}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}







