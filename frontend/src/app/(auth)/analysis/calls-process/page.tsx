'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ComposedChart, Line, FunnelChart, Funnel, LabelList, Cell
} from 'recharts'
import { format } from 'date-fns'
import { DateRangeFilter, DateRange } from 'redish_shared_components'

interface CallProcessData {
  funnel: Array<{
    stage: string
    count: number
    conversion: number
    dropoff: number
  }>
  processMetrics: {
    avgCallsToAppointment: number
    avgAppointmentToSetup: number
    avgSetupToClose: number
    totalProcessTime: number
  }
  stageDetails: Array<{
    stage: string
    avgTime: number
    successRate: number
    bottleneck: boolean
  }>
  trends: Array<{
    display: string
    calls: number
    appointments: number
    setups: number
    closes: number
  }>
}

export default function CallProcessAnalysisPage() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null)

  const { data, isLoading, error } = useQuery<CallProcessData>({
    queryKey: ['call-process-analysis', dateRange?.start?.toISOString(), dateRange?.end?.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateRange?.start) {
        params.set('start', format(dateRange.start, 'yyyy-MM-dd'))
      }
      if (dateRange?.end) {
        params.set('end', format(dateRange.end, 'yyyy-MM-dd'))
      }
      const response = await fetch(`/api/analysis/calls?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch call process analysis data')
      const callData = await response.json()
      
      // プロセス分析用のデータを構築
      const totalCalls = callData.summary?.totalCalls || 0
      const appointments = callData.summary?.appointments || 0
      const setups = callData.summary?.setups || 0
      
      // ファネルデータを構築
      const funnel = [
        {
          stage: '架電',
          count: totalCalls,
          conversion: 100,
          dropoff: 0
        },
        {
          stage: 'アポ獲得',
          count: appointments,
          conversion: totalCalls > 0 ? (appointments / totalCalls) * 100 : 0,
          dropoff: totalCalls > 0 ? ((totalCalls - appointments) / totalCalls) * 100 : 0
        },
        {
          stage: '商談設定',
          count: setups,
          conversion: appointments > 0 ? (setups / appointments) * 100 : 0,
          dropoff: appointments > 0 ? ((appointments - setups) / appointments) * 100 : 0
        }
      ]
      
      return {
        funnel,
        processMetrics: {
          avgCallsToAppointment: totalCalls > 0 ? (totalCalls / appointments) : 0,
          avgAppointmentToSetup: appointments > 0 ? (appointments / setups) : 0,
          avgSetupToClose: 0, // 成約データがない場合は0
          totalProcessTime: 0
        },
        stageDetails: [
          {
            stage: '架電→アポ',
            avgTime: 0,
            successRate: totalCalls > 0 ? (appointments / totalCalls) * 100 : 0,
            bottleneck: false
          },
          {
            stage: 'アポ→商談',
            avgTime: 0,
            successRate: appointments > 0 ? (setups / appointments) * 100 : 0,
            bottleneck: false
          }
        ],
        trends: callData.trends || []
      }
    },
    enabled: dateRange !== null,
  })

  if (error) return <div className="p-4 text-red-600">エラーが発生しました: {(error as Error).message}</div>

  const COLORS = ['#0083a0', '#00a4c5', '#4ade80', '#22c55e']

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">架電プロセス分析</h1>
          <p className="mt-1 text-sm text-gray-500">架電から成約までのプロセス全体を可視化し、ボトルネックを特定</p>
        </div>
        <DateRangeFilter
          defaultPreset="thisMonth"
          onChange={setDateRange}
        />
      </div>

      {/* プロセスメトリクス */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 bg-white border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">架電→アポ獲得率</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {isLoading ? '---' : data?.processMetrics?.avgCallsToAppointment && data.processMetrics.avgCallsToAppointment > 0 ? `${(1 / data.processMetrics.avgCallsToAppointment * 100).toFixed(1)}%` : '0%'}
          </p>
          <p className="text-xs text-gray-400 mt-2">平均 {isLoading ? '---' : data?.processMetrics?.avgCallsToAppointment ? data.processMetrics.avgCallsToAppointment.toFixed(1) : '---'} 架電で1アポ獲得</p>
        </div>
        <div className="card p-5 bg-white border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-500">アポ→商談設定率</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {isLoading ? '---' : data?.processMetrics?.avgAppointmentToSetup && data.processMetrics.avgAppointmentToSetup > 0 ? `${(1 / data.processMetrics.avgAppointmentToSetup * 100).toFixed(1)}%` : '0%'}
          </p>
          <p className="text-xs text-gray-400 mt-2">平均 {isLoading ? '---' : data?.processMetrics?.avgAppointmentToSetup ? data.processMetrics.avgAppointmentToSetup.toFixed(1) : '---'} アポで1商談設定</p>
        </div>
        <div className="card p-5 bg-white border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">全体転換率</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {isLoading ? '---' : data?.funnel && data.funnel.length > 0 && data.funnel[0].count > 0 
              ? `${((data.funnel[data.funnel.length - 1].count / data.funnel[0].count) * 100).toFixed(1)}%`
              : '0%'}
          </p>
          <p className="text-xs text-gray-400 mt-2">架電から商談設定までの転換率</p>
        </div>
      </div>

      {/* ファネルチャート */}
      <div className="card p-6 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">プロセスファネル</h2>
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
          {data?.funnel.map((stage, index) => (
            <div key={stage.stage} className="text-center">
              <p className="text-sm font-medium text-gray-600">{stage.stage}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{stage.count.toLocaleString()}件</p>
              {index > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  転換率: {stage.conversion.toFixed(1)}%
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* プロセス推移チャート */}
      <div className="card p-6 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">プロセス推移</h2>
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
                <Bar dataKey="calls" name="架電数" fill="#e5e7eb" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="appointments" name="アポ獲得" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="setups" name="商談設定" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
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
