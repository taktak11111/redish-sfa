'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ComposedChart, Line, Cell
} from 'recharts'
import { format } from 'date-fns'
import { DateRangeFilter, DateRange } from '@redish/shared'

interface DealProcessData {
  funnel: Array<{
    stage: string
    count: number
    conversion: number
  }>
  processMetrics: {
    avgDealTime: number
    avgStageTime: number
    winRate: number
  }
  stageDetails: Array<{
    stage: string
    avgTime: number
    successRate: number
    bottleneck: boolean
  }>
  trends: Array<{
    display: string
    deals: number
    won: number
    lost: number
  }>
}

export default function DealProcessAnalysisPage() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null)

  const { data, isLoading, error } = useQuery<DealProcessData>({
    queryKey: ['deal-process-analysis', dateRange?.start?.toISOString(), dateRange?.end?.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateRange?.start) {
        params.set('start', format(dateRange.start, 'yyyy-MM-dd'))
      }
      if (dateRange?.end) {
        params.set('end', format(dateRange.end, 'yyyy-MM-dd'))
      }
      // 商談データを取得（実際のAPIエンドポイントに合わせて調整）
      const response = await fetch(`/api/deals?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch deal process analysis data')
      const dealsData = await response.json()
      
      const deals = dealsData.deals || []
      const totalDeals = deals.length
      const wonDeals = deals.filter((d: any) => d.result === 'won' || d.status === 'closed_won').length
      const lostDeals = deals.filter((d: any) => d.result === 'lost' || d.status === 'closed_lost').length
      const inProgress = deals.filter((d: any) => !['won', 'lost', 'closed_won', 'closed_lost'].includes(d.result || d.status)).length
      
      // ファネルデータを構築
      const funnel = [
        {
          stage: '商談開始',
          count: totalDeals,
          conversion: 100
        },
        {
          stage: '進行中',
          count: inProgress,
          conversion: totalDeals > 0 ? (inProgress / totalDeals) * 100 : 0
        },
        {
          stage: '成約',
          count: wonDeals,
          conversion: totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0
        }
      ]
      
      return {
        funnel,
        processMetrics: {
          avgDealTime: 0,
          avgStageTime: 0,
          winRate: totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0
        },
        stageDetails: [
          {
            stage: '商談開始→進行中',
            avgTime: 0,
            successRate: totalDeals > 0 ? (inProgress / totalDeals) * 100 : 0,
            bottleneck: false
          },
          {
            stage: '進行中→成約',
            avgTime: 0,
            successRate: inProgress > 0 ? (wonDeals / inProgress) * 100 : 0,
            bottleneck: false
          }
        ],
        trends: []
      }
    },
    enabled: dateRange !== null,
  })

  if (error) return <div className="p-4 text-red-600">エラーが発生しました: {(error as Error).message}</div>

  const COLORS = ['#0083a0', '#00a4c5', '#4ade80']

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商談プロセス分析</h1>
          <p className="mt-1 text-sm text-gray-500">商談開始から成約までのプロセス全体を可視化し、ボトルネックを特定</p>
        </div>
        <DateRangeFilter
          defaultPreset="thisMonth"
          onChange={setDateRange}
        />
      </div>

      {/* プロセスメトリクス */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 bg-white border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">成約率</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {isLoading ? '---' : `${data?.processMetrics.winRate.toFixed(1)}%`}
          </p>
          <p className="text-xs text-gray-400 mt-2">商談開始から成約までの転換率</p>
        </div>
        <div className="card p-5 bg-white border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-500">平均商談期間</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {isLoading ? '---' : `${data?.processMetrics.avgDealTime.toFixed(0)}日`}
          </p>
          <p className="text-xs text-gray-400 mt-2">商談開始から成約までの平均日数</p>
        </div>
        <div className="card p-5 bg-white border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">進行中商談</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {isLoading ? '---' : data?.funnel[1]?.count.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-400 mt-2">現在進行中の商談数</p>
        </div>
      </div>

      {/* ファネルチャート */}
      <div className="card p-6 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">商談プロセスファネル</h2>
        <div className="h-96 w-full">
          {isLoading ? (
            <div className="w-full h-full bg-gray-50 animate-pulse rounded"></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.funnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis 
                  dataKey="stage" 
                  type="category" 
                  width={100}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [value.toLocaleString(), '件']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {data?.funnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {data?.funnel.map((stage) => (
            <div key={stage.stage} className="text-center">
              <p className="text-sm font-medium text-gray-600">{stage.stage}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{stage.count.toLocaleString()}件</p>
              <p className="text-xs text-gray-500 mt-1">
                転換率: {stage.conversion.toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ステージ詳細テーブル */}
      <div className="card bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">プロセスステージ詳細</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ステージ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">転換率</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">成功率</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ボトルネック</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                [...Array(2)].map((_, i) => (
                  <tr key={i}><td colSpan={4} className="px-6 py-4 animate-pulse"><div className="h-4 bg-gray-100 rounded"></div></td></tr>
                ))
              ) : (
                data?.stageDetails.map((stage) => (
                  <tr key={stage.stage} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stage.stage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                      {stage.successRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                      {stage.successRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {stage.bottleneck ? (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">要改善</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">正常</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
