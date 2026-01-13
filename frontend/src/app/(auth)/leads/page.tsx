'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CallRecord, CallStatus } from '@/types/sfa'
import { LeadDetailPanel } from '@/components/leads/LeadDetailPanel'
import { DateRangeFilter, DateRange } from 'redish_shared_components'

const STATUS_OPTIONS: { value: CallStatus; label: string; color: string }[] = [
  { value: '未架電', label: '未架電', color: 'badge-gray' },
  { value: '架電中', label: '架電中', color: 'badge-info' },
  { value: '03.アポイント獲得済', label: 'アポイント獲得済', color: 'badge-success' },
  { value: '09.アポ獲得', label: 'アポ獲得', color: 'badge-success' },
  { value: '04.アポなし', label: 'アポなし', color: 'badge-danger' },
]

// リードソースのオプション
const LEAD_SOURCE_OPTIONS = [
  { value: 'all', label: 'すべてのソース' },
  { value: 'Meetsmore', label: 'Meetsmore' },
  { value: 'TEMPOS', label: 'TEMPOS' },
  { value: 'OMC', label: 'OMC' },
  { value: 'Amazon', label: 'Amazon' },
  { value: 'Makuake', label: 'Makuake' },
  { value: 'REDISH', label: 'REDISH' },
]

type SortDirection = 'asc' | 'desc'
type SortConfig = { key: string; direction: SortDirection } | null

function parseDateLike(value: string): Date | null {
  const trimmed = value.trim()
  const m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(trimmed)
  if (!m) return null
  const yyyy = Number(m[1])
  const mm = Number(m[2])
  const dd = Number(m[3])
  const d = new Date(yyyy, mm - 1, dd)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function compareValues(a: unknown, b: unknown): number {
  if (a === null || a === undefined) return 1
  if (b === null || b === undefined) return -1

  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()

  const aStr = String(a)
  const bStr = String(b)
  return aStr.localeCompare(bStr, 'ja', { numeric: true, sensitivity: 'base' })
}

function SortIcons({ active }: { active?: SortDirection }) {
  return (
    <span className="ml-2 inline-flex flex-col items-center justify-center leading-none">
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={active === 'asc' ? 'text-gray-900' : 'text-gray-400'}
      >
        <path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={active === 'desc' ? 'text-gray-900' : 'text-gray-400'}
      >
        <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export default function LeadsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<CallRecord | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false)
  const [isSourceCardExpanded, setIsSourceCardExpanded] = useState(true) // デフォルトで開いた状態
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    leadId: 100,
    linkedDate: 120,
    leadSource: 120,
    companyName: 200,
    contactName: 120,
    contactNameKana: 120,
    industry: 120,
    phone: 140,
    email: 180,
    address: 200,
    openingDate: 120,
    contactPreferredDateTime: 150,
    allianceRemarks: 200,
    status: 120,
  })
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await fetch('/api/calls')
      if (!response.ok) throw new Error('Failed to fetch leads')
      return response.json()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ leadId, updates }: { leadId: string; updates: Partial<CallRecord> }) => {
      const response = await fetch('/api/calls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, ...updates }),
      })
      if (!response.ok) throw new Error('Failed to update lead')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })

  useEffect(() => {
    if (!resizingColumn) return

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX
      const newWidth = Math.max(20, resizeStartWidth + diff)
      setColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: newWidth,
      }))
    }

    const handleMouseUp = () => {
      setResizingColumn(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [resizingColumn, resizeStartX, resizeStartWidth])

  const filteredRecords = (data?.data as CallRecord[] || []).filter(record => {
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus
    const matchesSource = filterSource === 'all' || record.leadSource === filterSource
    const matchesSearch = searchTerm === '' || 
      record.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.phone?.includes(searchTerm) ||
      record.leadId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // 期間フィルタ
    let matchesDateRange = true
    if (dateRange && record.linkedDate) {
      const recordDate = new Date(record.linkedDate)
      recordDate.setHours(0, 0, 0, 0)
      matchesDateRange = recordDate >= dateRange.start && recordDate <= dateRange.end
    }
    
    return matchesStatus && matchesSource && matchesSearch && matchesDateRange
  })

  const sortedRecords = useMemo(() => {
    if (!sortConfig) return filteredRecords
    const { key, direction } = sortConfig

    const withIndex = filteredRecords.map((record, idx) => ({ record, idx }))
    withIndex.sort((a, b) => {
      const aValRaw =
        key === 'linkedDate' ? (a.record.linkedDate ? parseDateLike(a.record.linkedDate) : null) : (a.record as any)[key]
      const bValRaw =
        key === 'linkedDate' ? (b.record.linkedDate ? parseDateLike(b.record.linkedDate) : null) : (b.record as any)[key]

      const cmp = compareValues(aValRaw, bValRaw)
      if (cmp !== 0) return direction === 'asc' ? cmp : -cmp
      return a.idx - b.idx
    })

    return withIndex.map(x => x.record)
  }, [filteredRecords, sortConfig])

  // リードソース別の件数をカウント（フィルタ前の全データから、期間・ステータス・検索のみ適用）
  const sourceCountsData = useMemo(() => {
    const allRecords = data?.data as CallRecord[] || []
    
    // 期間・ステータス・検索フィルタのみ適用（リードソースフィルタは除外）
    const baseFilteredRecords = allRecords.filter(record => {
      const matchesStatus = filterStatus === 'all' || record.status === filterStatus
      const matchesSearch = searchTerm === '' || 
        record.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.phone?.includes(searchTerm) ||
        record.leadId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      let matchesDateRange = true
      if (dateRange && record.linkedDate) {
        const recordDate = new Date(record.linkedDate)
        recordDate.setHours(0, 0, 0, 0)
        matchesDateRange = recordDate >= dateRange.start && recordDate <= dateRange.end
      }
      
      return matchesStatus && matchesSearch && matchesDateRange
    })

    // リードソース別にカウント
    const counts: Record<string, number> = {}
    baseFilteredRecords.forEach(record => {
      const source = record.leadSource || '不明'
      counts[source] = (counts[source] || 0) + 1
    })

    // 件数順にソート
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({ source, count }))

    return {
      total: baseFilteredRecords.length,
      sources: sorted,
    }
  }, [data?.data, filterStatus, searchTerm, dateRange])

  const handleRowClick = (record: CallRecord) => {
    setSelectedRecord(record)
    setIsPanelOpen(true)
  }

  const handlePanelClose = () => {
    setIsPanelOpen(false)
    setSelectedRecord(null)
  }

  const handlePanelSave = (updates: Partial<CallRecord>) => {
    if (selectedRecord) {
      updateMutation.mutate({ leadId: selectedRecord.leadId, updates })
    }
  }

  const handleResizeStart = (columnKey: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingColumn(columnKey)
    setResizeStartX(e.clientX)
    setResizeStartWidth(columnWidths[columnKey] || 120)
  }

  // ステータスに応じた色を返す
  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status)
    if (!option) return <span className="badge badge-gray">{status || '不明'}</span>
    
    const colorClass = option.color
    return <span className={`badge ${colorClass}`}>{option.label}</span>
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <p className="text-red-600">データの取得に失敗しました。再度お試しください。</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 bg-white pb-4 border-b border-gray-200 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">リード管理</h1>
            <p className="mt-1 text-sm text-gray-500">アライアンス先から取り込んだリードを一元管理します</p>
          </div>
          <button
            type="button"
            onClick={() => setIsFilterCollapsed((prev) => !prev)}
            className="px-4 py-2 text-sm font-medium text-primary-800 bg-primary-100 border border-primary-200 rounded-md hover:bg-primary-200 shadow-sm"
            aria-label={isFilterCollapsed ? 'フィルターを開く' : 'フィルターを閉じる'}
          >
            {isFilterCollapsed ? 'Open' : 'Close'}
          </button>
        </div>

        {!isFilterCollapsed && (
          <div className="card p-4 mb-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex justify-end lg:justify-start">
                  <DateRangeFilter
                    defaultPreset="thisMonth"
                    onChange={setDateRange}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 lg:justify-end lg:items-center">
                  <div className="sm:w-[520px] lg:w-[520px]">
                    <input
                      type="text"
                      placeholder="会社名、担当者名、電話番号、メール、リードIDで検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input w-full"
                    />
                  </div>
                  <div className="sm:w-52 lg:w-52">
                    <select
                      value={filterSource}
                      onChange={(e) => setFilterSource(e.target.value)}
                      className="input w-full"
                      aria-label="リードソースでフィルタ"
                    >
                      {LEAD_SOURCE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:w-52 lg:w-52">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="input w-full"
                      aria-label="ステータスでフィルタ"
                    >
                      <option value="all">すべてのステータス</option>
                      {STATUS_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <span>全 {filteredRecords.length} 件</span>
                {filterSource !== 'all' && (
                  <span className="badge badge-info">{filterSource}</span>
                )}
                {filterStatus !== 'all' && (
                  <span className="badge badge-gray">{STATUS_OPTIONS.find(s => s.value === filterStatus)?.label}</span>
                )}
              </div>
          </div>
        )}

        {/* リードソース別件数カード（フィルタ開閉の対象外） */}
        <div className="card p-4 mb-4">
          <button
            type="button"
            onClick={() => setIsSourceCardExpanded(!isSourceCardExpanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">リードソース別</span>
              <span className="text-sm text-gray-500">計 {sourceCountsData.total} 件</span>
              {!isSourceCardExpanded && (
                <div className="flex items-center gap-2 ml-2">
                  {sourceCountsData.sources.slice(0, 4).map(({ source, count }) => (
                    <button
                      key={source}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFilterSource(filterSource === source ? 'all' : source)
                      }}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        filterSource === source
                          ? 'bg-[#0083a0] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {source} ({count})
                    </button>
                  ))}
                  {sourceCountsData.sources.length > 4 && (
                    <span className="text-xs text-gray-400">
                      +{sourceCountsData.sources.length - 4}件
                    </span>
                  )}
                </div>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isSourceCardExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {isSourceCardExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {sourceCountsData.sources.map(({ source, count }) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => setFilterSource(filterSource === source ? 'all' : source)}
                    className={`px-3 py-2 rounded-lg border-2 text-center transition-all ${
                      filterSource === source
                        ? 'border-[#0083a0] bg-gradient-to-b from-[#e6f7fa] to-[#d0f0f5] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        : 'border-gray-200 bg-gradient-to-b from-white to-gray-50 hover:border-[#0083a0]/50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                    }`}
                  >
                    <div className={`flex items-baseline justify-center gap-0.5 ${filterSource === source ? 'text-[#0083a0]' : 'text-gray-900'}`}>
                      <span className="text-2xl font-bold">{count}</span>
                      <span className="text-xs text-gray-400">件</span>
                    </div>
                    <div className={`text-xs truncate mt-1 ${filterSource === source ? 'text-[#0083a0] font-medium' : 'text-gray-500'}`}>
                      {source}
                    </div>
                  </button>
                ))}
              </div>
              {filterSource !== 'all' && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setFilterSource('all')}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    フィルタをクリア
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-240px)]">
            <table className="divide-y divide-gray-200" style={{ width: 'max-content', minWidth: '100%' }}>
              <thead className="bg-gray-100 sticky top-0 z-20 shadow-sm">
                <tr>
                  {[
                    { key: 'leadId', label: 'リードID' },
                    { key: 'linkedDate', label: '連携日' },
                    { key: 'leadSource', label: 'リードソース' },
                    { key: 'companyName', label: '会社名' },
                    { key: 'contactName', label: '氏名' },
                    { key: 'contactNameKana', label: 'ふりがな' },
                    { key: 'industry', label: '業種' },
                    { key: 'phone', label: '電話番号' },
                    { key: 'email', label: 'メール' },
                    { key: 'address', label: '住所/エリア' },
                    { key: 'openingDate', label: '開業時期' },
                    { key: 'contactPreferredDateTime', label: '連絡希望日時' },
                    { key: 'allianceRemarks', label: '連携元備考' },
                    { key: 'status', label: 'ステータス' },
                  ].map((col, idx, arr) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none cursor-pointer hover:bg-gray-50 ${idx < arr.length - 1 ? 'border-r border-gray-400' : ''}`}
                      style={{ width: columnWidths[col.key], minWidth: 20 }}
                      onClick={() => {
                        setSortConfig(prev => {
                          const isSame = prev?.key === col.key
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: col.key, direction: nextDirection }
                        })
                      }}
                    >
                      <span className="inline-flex items-center justify-center w-full">
                        <span>{col.label}</span>
                        <SortIcons active={sortConfig?.key === col.key ? sortConfig.direction : undefined} />
                      </span>
                      <div
                        className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                        onMouseDown={(e) => handleResizeStart(col.key, e)}
                        style={{ transform: 'translateX(50%)' }}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={`loading-${i}`}>
                      {[...Array(14)].map((_, j) => (
                        <td key={`loading-${i}-${j}`} className="px-4 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-8 text-center text-gray-500">
                      リードデータがありません
                    </td>
                  </tr>
                ) : (
                  sortedRecords.map((record, index) => (
                    <tr 
                      key={record.leadId || `lead-${index}`}
                      onClick={() => handleRowClick(record)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-gray-900" style={{ width: columnWidths.leadId, minWidth: 20 }}>
                        {record.leadId}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.linkedDate, minWidth: 20 }}>
                        {record.linkedDate || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm" style={{ width: columnWidths.leadSource, minWidth: 20 }}>
                        <span className="badge badge-info">{record.leadSource}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900" style={{ width: columnWidths.companyName, minWidth: 20 }}>
                        {record.companyName}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900" style={{ width: columnWidths.contactName, minWidth: 20 }}>
                        {record.contactName}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.contactNameKana, minWidth: 20 }}>
                        {record.contactNameKana || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.industry, minWidth: 20 }}>
                        {record.industry || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.phone, minWidth: 20 }}>
                        {record.phone}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.email, minWidth: 20 }}>
                        {record.email || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.address, minWidth: 20 }}>
                        {record.address || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.openingDate, minWidth: 20 }}>
                        {record.openingDate || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.contactPreferredDateTime, minWidth: 20 }}>
                        {record.contactPreferredDateTime || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.allianceRemarks, minWidth: 20 }}>
                        {record.allianceRemarks || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm" style={{ width: columnWidths.status, minWidth: 20 }}>
                        {getStatusBadge(record.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isPanelOpen && selectedRecord && (
        <LeadDetailPanel
          record={selectedRecord}
          onClose={handlePanelClose}
          onSave={handlePanelSave}
          isSaving={updateMutation.isPending}
        />
      )}
    </div>
  )
}







