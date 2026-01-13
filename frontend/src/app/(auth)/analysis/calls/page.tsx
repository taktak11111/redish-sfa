'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ComposedChart, Line
} from 'recharts'
import { format } from 'date-fns'
import { DateRangeFilter, DateRange } from 'redish_shared_components'

interface CallAnalysisData {
  summary: {
    totalCalls: number
    appointments: number
    setups: number
    conversion: number
    setupRate: number
  }
  trends: Array<{
    display: string
    calls: number
    appointments: number
  }>
  staffPerformance: Array<{
    name: string
    calls: number
    appointments: number
    setups: number
    conversion: number
    setupRate: number
  }>
  channelPerformance: Array<{
    name: string
    calls: number
    appointments: number
    setups: number
    conversion: number
    setupRate: number
  }>
}

export default function CallAnalysisPage() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [activeTab, setActiveTab] = useState<'staff' | 'channel'>('staff')

  const { data, isLoading, error } = useQuery<CallAnalysisData>({
    queryKey: ['call-analysis', dateRange?.start?.toISOString(), dateRange?.end?.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateRange?.start) {
        params.set('start', format(dateRange.start, 'yyyy-MM-dd'))
      }
      if (dateRange?.end) {
        params.set('end', format(dateRange.end, 'yyyy-MM-dd'))
      }
      const response = await fetch(`/api/analysis/calls?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch call analysis data')
      return response.json()
    },
    enabled: dateRange !== null,
  })

  if (error) return <div className="p-4 text-red-600">エラーが発生しました: {(error as Error).message}</div>

  const tableData = activeTab === 'staff' ? data?.staffPerformance : data?.channelPerformance

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">架電分析</h1>
          <p className="mt-1 text-sm text-gray-500">インサイドセールスの活動量と成果の可視化</p>
        </div>
        <DateRangeFilter
          defaultPreset="thisMonth"
          onChange={setDateRange}
        />
      </div>

      {/* 主要KPIカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5 bg-white border-l-4 border-gray-400">
          <p className="text-sm font-medium text-gray-500">総架電数</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {isLoading ? '---' : data?.summary.totalCalls.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-2">期間内の全活動量</p>
        </div>
        <div className="card p-5 bg-white border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">商談獲得数 (アポ)</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {isLoading ? '---' : data?.summary.appointments.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-2">獲得アポイント総数</p>
        </div>
        <div className="card p-5 bg-white border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-500">商談獲得率 (アポ率)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {isLoading ? '---' : `${(data?.summary.conversion || 0).toFixed(1)}%`}
          </p>
          <p className="text-xs text-gray-400 mt-2">架電数に対する獲得率</p>
        </div>
        <div className="card p-5 bg-white border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">商談実施率 (有効率)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {isLoading ? '---' : `${(data?.summary.setupRate || 0).toFixed(1)}%`}
          </p>
          <p className="text-xs text-gray-400 mt-2">アポから商談設定への転換</p>
        </div>
      </div>

      {/* 活動推移チャート */}
      <div className="card p-6 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">活動量・成果推移</h2>
        <div className="h-80 w-full">
          {isLoading ? (
            <div className="w-full h-full bg-gray-50 animate-pulse rounded"></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data?.trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="display" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Bar dataKey="calls" name="架電数" fill="#e5e7eb" radius={[4, 4, 0, 0]} barSize={30} />
                <Line type="monotone" dataKey="appointments" name="アポ獲得数" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 多軸比較テーブル */}
      <div className="card bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('staff')}
              className={`text-sm font-semibold pb-1 border-b-2 transition-all ${activeTab === 'staff' ? 'border-[#0083a0] text-[#0083a0]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              担当者別分析
            </button>
            <button 
              onClick={() => setActiveTab('channel')}
              className={`text-sm font-semibold pb-1 border-b-2 transition-all ${activeTab === 'channel' ? 'border-[#0083a0] text-[#0083a0]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              チャネル別分析
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{activeTab === 'staff' ? '担当者' : 'チャネル'}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">架電数</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">アポ獲得</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">商談設定</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">アポ率</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">商談実施率</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-4 animate-pulse"><div className="h-4 bg-gray-100 rounded"></div></td></tr>
                ))
              ) : (
                tableData?.map((item) => (
                  <tr key={item.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{item.calls.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">{item.appointments}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">{item.setups}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-indigo-600 font-medium">{item.conversion.toFixed(1)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">{item.setupRate.toFixed(1)}%</td>
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
