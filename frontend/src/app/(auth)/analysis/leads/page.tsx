'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ComposedChart, Line
} from 'recharts'
import { format } from 'date-fns'
import { DateRangeFilter, DateRange } from '@redish/shared'

interface LeadAnalysisData {
  summary: {
    totalLinked: number
    totalDeals: number
    totalWon: number
    dealRate: number
    wonRate: number
  }
  trends: Array<{
    date: string
    display: string
    total: number
    [key: string]: string | number
  }>
  sourcePerformance: Array<{
    name: string
    total: number
    deals: number
    won: number
    dealRate: number
    wonRate: number
    totalAmount: number
  }>
  recentRecords: Array<{
    lead_id: string
    lead_source: string
    company_name: string
    contact_name: string
    phone: string
    status: string
    linked_date: string
    hasDeal: boolean
    isWon: boolean
  }>
  sources: string[]
}

export default function LeadAnalysisPage() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  const { data, isLoading, error } = useQuery<LeadAnalysisData>({
    queryKey: ['lead-analysis', dateRange?.start?.toISOString(), dateRange?.end?.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateRange?.start) {
        params.set('start', format(dateRange.start, 'yyyy-MM-dd'))
      }
      if (dateRange?.end) {
        params.set('end', format(dateRange.end, 'yyyy-MM-dd'))
      }
      const response = await fetch(`/api/analysis/leads?${params}`)
      if (!response.ok) throw new Error('Failed to fetch lead analysis data')
      return response.json()
    },
    enabled: !!dateRange
  })

  const formatYen = (val: number) => `¥${val.toLocaleString()}`

  // ソースフィルタ適用
  const filteredRecords = data?.recentRecords?.filter(
    r => sourceFilter === 'all' || r.lead_source === sourceFilter
  ) || []

  return (
    <div className="space-y-6 pb-12">
      {/* ヘッダー */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">リード連携分析</h1>
          <p className="mt-1 text-sm text-gray-500">各リードソースからの連携状況とコンバージョン分析</p>
        </div>
        <DateRangeFilter
          defaultPreset="thisMonth"
          presets={['today', 'thisWeek', 'thisMonth', 'lastMonth', 'fiscalYear']}
          showCustomRange={true}
          fiscalYearStart={4}
          onChange={setDateRange}
          disabled={isLoading}
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

      {/* KPIカード */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card p-5 bg-white border-l-4 border-[#0083a0]">
          <p className="text-sm font-medium text-gray-500">連携数</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {isLoading ? '---' : data?.summary?.totalLinked?.toLocaleString() ?? '0'}
          </p>
          <p className="text-xs text-gray-400 mt-2">期間内の総連携リード数</p>
        </div>
        <div className="card p-5 bg-white border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">商談数</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {isLoading ? '---' : data?.summary?.totalDeals?.toLocaleString() ?? '0'}
          </p>
          <p className="text-xs text-gray-400 mt-2">商談化したリード数</p>
        </div>
        <div className="card p-5 bg-white border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-500">商談化率</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {isLoading ? '---' : `${(data?.summary?.dealRate ?? 0).toFixed(1)}%`}
          </p>
          <p className="text-xs text-gray-400 mt-2">連携→商談の転換率</p>
        </div>
        <div className="card p-5 bg-white border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">成約数</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {isLoading ? '---' : data?.summary?.totalWon?.toLocaleString() ?? '0'}
          </p>
          <p className="text-xs text-gray-400 mt-2">成約したリード数</p>
        </div>
        <div className="card p-5 bg-white border-l-4 border-amber-500">
          <p className="text-sm font-medium text-gray-500">成約率</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {isLoading ? '---' : `${(data?.summary?.wonRate ?? 0).toFixed(1)}%`}
          </p>
          <p className="text-xs text-gray-400 mt-2">連携→成約の転換率</p>
        </div>
      </div>

      {/* チャートセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 連携推移チャート */}
        <div className="lg:col-span-2 card p-6 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">連携推移</h2>
          <div className="h-80 w-full">
            {isLoading ? (
              <div className="w-full h-full bg-gray-50 animate-pulse rounded"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data?.trends || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="display" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" />
                  <Bar dataKey="total" name="連携数" fill="#0083a0" radius={[4, 4, 0, 0]} barSize={30} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ソース別コンバージョン */}
        <div className="card p-6 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">ソース別商談化率</h2>
          <div className="space-y-4">
            {isLoading ? (
              <div className="h-64 bg-gray-50 animate-pulse rounded"></div>
            ) : (
              data?.sourcePerformance?.map((source) => (
                <div key={source.name} className="relative">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{source.name}</span>
                    <span className="text-gray-500">{source.dealRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div 
                      className="h-full bg-[#0083a0] opacity-80 transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(source.dealRate, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {source.total}件中 {source.deals}件商談化
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ソース別分析テーブル */}
      <div className="card bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">ソース別分析</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">リードソース</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">連携数</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">商談数</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">成約数</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">商談化率</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">成約率</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-4 animate-pulse"><div className="h-4 bg-gray-100 rounded"></div></td></tr>
                ))
              ) : data?.sourcePerformance?.length ? (
                <>
                  {data.sourcePerformance.map((source) => (
                    <tr key={source.name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{source.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{source.total.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">{source.deals}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">{source.won}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-indigo-600 font-medium">{source.dealRate.toFixed(1)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">{source.wonRate.toFixed(1)}%</td>
                    </tr>
                  ))}
                  {/* 合計行 */}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">合計</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{data.summary.totalLinked.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600">{data.summary.totalDeals}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">{data.summary.totalWon}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-indigo-600">{data.summary.dealRate.toFixed(1)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">{data.summary.wonRate.toFixed(1)}%</td>
                  </tr>
                </>
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

      {/* 最新連携リード一覧 */}
      <div className="card bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">最新連携リード（直近50件）</h2>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0083a0]"
          >
            <option value="all">すべてのソース</option>
            {data?.sources?.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto max-h-[400px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50">連携日</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50">ソース</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50">会社名</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50">担当者</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50">電話番号</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50">状態</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3 animate-pulse"><div className="h-4 bg-gray-100 rounded"></div></td></tr>
                ))
              ) : filteredRecords.length ? (
                filteredRecords.map((record) => (
                  <tr key={record.lead_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{record.linked_date?.split('T')[0] || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {record.lead_source || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate">{record.company_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.contact_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{record.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {record.isWon ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">成約</span>
                      ) : record.hasDeal ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">商談中</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">未商談</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                    該当するデータがありません
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
