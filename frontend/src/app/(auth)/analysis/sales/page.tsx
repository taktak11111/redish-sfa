'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, ComposedChart, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts'
import { format } from 'date-fns'
import { DateRangeFilter, DateRange } from '@redish/shared'

interface AnalysisData {
  summary: {
    totalRevenue: number
    currentRevenue: number
    growthRate: number
    avgDealSize: number
    overallConversion: number
  }
  trends: Array<{
    period: string
    display: string
    revenue: number
    deals: number
  }>
  funnel: Array<{
    stage: string
    count: number
  }>
  staffPerformance: Array<{
    name: string
    revenue: number
    contracts: number
    conversion: number
    avgAmount: number
  }>
}

export default function SalesAnalysisPage() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null)

  const { data, isLoading, error } = useQuery<AnalysisData>({
    queryKey: ['sales-analysis', dateRange?.start?.toISOString(), dateRange?.end?.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateRange?.start) {
        params.set('start', format(dateRange.start, 'yyyy-MM-dd'))
      }
      if (dateRange?.end) {
        params.set('end', format(dateRange.end, 'yyyy-MM-dd'))
      }
      const response = await fetch(`/api/analysis/sales?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch analysis data')
      return response.json()
    },
    enabled: dateRange !== null,
  })

  if (error) return <div className="p-4 text-red-600">エラーが発生しました: {(error as Error).message}</div>

  const formatYen = (val: number) => `¥${(val / 10000).toLocaleString()}万`
  const formatFullYen = (val: number) => `¥${val.toLocaleString()}`

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">売上・成約分析</h1>
          <p className="mt-1 text-sm text-gray-500">成約パフォーマンスと収益推移の可視化</p>
        </div>
        <DateRangeFilter
          defaultPreset="thisMonth"
          onChange={setDateRange}
        />
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">データの取得に失敗しました。再試行してください。</span>
        </div>
      )}

      {/* 主要KPIカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5 bg-white border-l-4 border-[#0083a0]">
          <p className="text-sm font-medium text-gray-500">期間内 総成約金額</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {isLoading ? '---' : formatYen(data?.summary?.totalRevenue ?? 0)}
          </p>
          <div className="mt-2 flex items-center text-xs">
            <span className={(data?.summary?.growthRate ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
              {(data?.summary?.growthRate ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(data?.summary?.growthRate ?? 0).toFixed(1)}%
            </span>
            <span className="text-gray-400 ml-1">前月比</span>
          </div>
        </div>
        <div className="card p-5 bg-white border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">平均成約単価</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {isLoading ? '---' : formatYen(data?.summary?.avgDealSize ?? 0)}
          </p>
          <p className="text-xs text-gray-400 mt-2">1案件あたりの期待収益</p>
        </div>
        <div className="card p-5 bg-white border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-500">総合成約率</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {isLoading ? '---' : `${(data?.summary?.overallConversion ?? 0).toFixed(1)}%`}
          </p>
          <p className="text-xs text-gray-400 mt-2">リード獲得からの決定率</p>
        </div>
        <div className="card p-5 bg-white border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">今月の売上（着地）</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {isLoading ? '---' : formatYen(data?.summary?.currentRevenue ?? 0)}
          </p>
          <p className="text-xs text-gray-400 mt-2">{format(new Date(), 'M月')}の合計成約額</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 売上・件数推移チャート */}
        <div className="lg:col-span-2 card p-6 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">売上高・成約件数推移</h2>
          <div className="h-80 w-full">
            {isLoading ? (
              <div className="w-full h-full bg-gray-50 animate-pulse rounded"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data?.trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="display" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(v) => `${v/10000}万`} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      name === 'revenue' ? formatFullYen(value) : `${value}件`,
                      name === 'revenue' ? '売上高' : '成約件数'
                    ]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" />
                  <Bar yAxisId="left" dataKey="revenue" name="revenue" fill="#0083a0" radius={[4, 4, 0, 0]} barSize={40} />
                  <Line yAxisId="right" type="monotone" dataKey="deals" name="deals" stroke="#ef4444" strokeWidth={3} dot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 営業ファンネル */}
        <div className="card p-6 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">営業プロセス歩留まり</h2>
          <div className="space-y-4">
            {isLoading ? (
              <div className="h-64 bg-gray-50 animate-pulse rounded"></div>
            ) : (
              data?.funnel.map((step, i) => {
                const prevCount = i > 0 ? data.funnel[i - 1].count : step.count
                const conversion = prevCount > 0 ? (step.count / prevCount) * 100 : 0
                const width = `${(step.count / data.funnel[0].count) * 100}%`

                return (
                  <div key={step.stage} className="relative">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{step.stage}</span>
                      <span className="text-gray-500">{step.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                      <div 
                        className="h-full bg-[#0083a0] opacity-80 transition-all duration-1000 ease-out"
                        style={{ width: data?.funnel?.[0]?.count ? width : '0%' }}
                      ></div>
                    </div>
                    {i > 0 && (
                      <div className="absolute -top-3 right-0 bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded border border-blue-100 font-bold">
                        {conversion.toFixed(1)}%
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
          <p className="mt-8 text-xs text-gray-400 leading-relaxed">
            ※リード（架電リスト）から成約に至るまでの各フェーズの転換率を表示しています。
          </p>
        </div>
      </div>

      {/* 担当者別パフォーマンス */}
      <div className="card bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">担当者別・収益性分析</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">担当者</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">成約金額合計</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">成約件数</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">成約率</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">平均成約単価</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">貢献度</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-4 animate-pulse"><div className="h-4 bg-gray-100 rounded"></div></td></tr>
                ))
              ) : data?.staffPerformance?.length ? (
                data.staffPerformance.map((staff) => {
                  const contribution = (staff.revenue / (data?.summary?.totalRevenue || 1)) * 100
                  return (
                    <tr key={staff.name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">{formatFullYen(staff.revenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{staff.contracts}件</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-medium">{(staff.conversion ?? 0).toFixed(1)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{formatFullYen(Math.round(staff.avgAmount ?? 0))}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-2">
                            <div className="bg-[#0083a0] h-2 rounded-full" style={{ width: `${contribution}%` }}></div>
                          </div>
                          <span className="text-[10px] text-gray-400">{contribution.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    該当期間のデータがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
