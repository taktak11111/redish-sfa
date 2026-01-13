'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Deal, DealRank, DealResult } from '@/types/sfa'
import { DealDetailPanel } from '@/components/deals/DealDetailPanel'
import { DateRangeFilter, DateRange } from '@redish/shared'

const RANK_OPTIONS: { value: DealRank; label: string; color: string }[] = [
  { value: 'A:80%', label: 'A:80%', color: 'badge-success' },
  { value: 'B:50%', label: 'B:50%', color: 'badge-info' },
  { value: 'C:20%', label: 'C:20%', color: 'badge-warning' },
  { value: 'D:10%', label: 'D:10%', color: 'badge-danger' },
]

const RESULT_OPTIONS: { value: DealResult | ''; label: string }[] = [
  { value: '', label: '進行中' },
  { value: '01.成約（契約締結）', label: '成約' },
  { value: '02.失注（リサイクル対象外）', label: '失注（対象外）' },
  { value: '03.失注（リサイクル対象）', label: '失注（リサイクル）' },
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

export default function DealsPage() {
  const [filterRank, setFilterRank] = useState<string>('all')
  const [filterResult, setFilterResult] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    id: 100,
    service: 120,
    leadSource: 100,
    linkedDate: 120,
    contactName: 120,
    staffIS: 100,
    appointmentDate: 140,
    dealSetupDate: 140,
    dealTime: 120,
  })
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const response = await fetch('/api/deals')
      if (!response.ok) throw new Error('Failed to fetch deals')
      return response.json()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ dealId, updates }: { dealId: string; updates: Partial<Deal> }) => {
      const response = await fetch('/api/deals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, ...updates }),
      })
      if (!response.ok) throw new Error('Failed to update deal')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
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

  const filteredDeals = (data?.data as Deal[] || []).filter(deal => {
    const matchesRank = filterRank === 'all' || deal.rank === filterRank
    const matchesResult = filterResult === 'all' || 
      (filterResult === 'active' && !deal.result) ||
      deal.result === filterResult
    const dealId = (deal as any).dealId || deal.id || ''
    const matchesSearch = searchTerm === '' ||
      deal.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((deal as any).staff || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      dealId.toLowerCase().includes(searchTerm.toLowerCase())
    
    // 期間フィルタ（商談設定日を基準）
    let matchesDateRange = true
    if (dateRange && deal.dealSetupDate) {
      const recordDate = new Date(deal.dealSetupDate)
      recordDate.setHours(0, 0, 0, 0)
      matchesDateRange = recordDate >= dateRange.start && recordDate <= dateRange.end
    }
    
    return matchesRank && matchesResult && matchesSearch && matchesDateRange
  })

  const sortedDeals = useMemo(() => {
    if (!sortConfig) return filteredDeals
    const { key, direction } = sortConfig

    const withIndex = filteredDeals.map((deal, idx) => ({ deal, idx }))
    withIndex.sort((a, b) => {
      const aDealId = (a.deal as any).dealId || a.deal.id || ''
      const bDealId = (b.deal as any).dealId || b.deal.id || ''

      const aValRaw =
        key === 'id'
          ? aDealId
          : key === 'linkedDate'
            ? (a.deal.linkedDate ? parseDateLike(String(a.deal.linkedDate)) : null)
            : key === 'appointmentDate'
              ? (a.deal.appointmentDate ? parseDateLike(String(a.deal.appointmentDate)) : null)
              : key === 'dealSetupDate'
                ? (a.deal.dealSetupDate ? parseDateLike(String(a.deal.dealSetupDate)) : null)
                : (a.deal as any)[key]

      const bValRaw =
        key === 'id'
          ? bDealId
          : key === 'linkedDate'
            ? (b.deal.linkedDate ? parseDateLike(String(b.deal.linkedDate)) : null)
            : key === 'appointmentDate'
              ? (b.deal.appointmentDate ? parseDateLike(String(b.deal.appointmentDate)) : null)
              : key === 'dealSetupDate'
                ? (b.deal.dealSetupDate ? parseDateLike(String(b.deal.dealSetupDate)) : null)
                : (b.deal as any)[key]

      const cmp = compareValues(aValRaw, bValRaw)
      if (cmp !== 0) return direction === 'asc' ? cmp : -cmp
      return a.idx - b.idx
    })

    return withIndex.map(x => x.deal)
  }, [filteredDeals, sortConfig])

  const handleRowClick = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsPanelOpen(true)
  }

  const handlePanelClose = () => {
    setIsPanelOpen(false)
    setSelectedDeal(null)
  }

  const handlePanelSave = (updates: Partial<Deal>) => {
    if (selectedDeal) {
      const dealId = (selectedDeal as any).dealId || selectedDeal.id
      updateMutation.mutate({ dealId, updates })
    }
  }

  const handleResizeStart = (columnKey: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingColumn(columnKey)
    setResizeStartX(e.clientX)
    setResizeStartWidth(columnWidths[columnKey] || 120)
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
            <h1 className="text-2xl font-bold text-gray-900">商談管理</h1>
            <p className="mt-1 text-sm text-gray-500">商談の進捗を管理します</p>
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
                    placeholder="会社名、担当者名、営業担当、商談IDで検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div className="sm:w-36 lg:w-36">
                  <select
                    value={filterRank}
                    onChange={(e) => setFilterRank(e.target.value)}
                    className="input w-full"
                    aria-label="確度フィルター"
                  >
                    <option value="all">すべての確度</option>
                    {RANK_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:w-48 lg:w-48">
                  <select
                    value={filterResult}
                    onChange={(e) => setFilterResult(e.target.value)}
                    className="input w-full"
                    aria-label="結果フィルター"
                  >
                    <option value="all">すべての結果</option>
                    <option value="active">進行中のみ</option>
                    {RESULT_OPTIONS.filter(o => o.value).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-240px)]">
            <table className="divide-y divide-gray-200" style={{ width: 'max-content', minWidth: '100%' }}>
              <thead className="bg-gray-100 sticky top-0 z-20 shadow-sm">
                <tr>
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400 cursor-pointer hover:bg-gray-50"
                    style={{ width: columnWidths.id, minWidth: 20 }}
                    onClick={() => {
                      setSortConfig(prev => {
                        const isSame = prev?.key === 'id'
                        const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                        return { key: 'id', direction: nextDirection }
                      })
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      <span>商談ID</span>
                      <SortIcons active={sortConfig?.key === 'id' ? sortConfig.direction : undefined} />
                    </span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('id', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400 cursor-pointer hover:bg-gray-50"
                    style={{ width: columnWidths.service, minWidth: 20 }}
                    onClick={() => {
                      setSortConfig(prev => {
                        const isSame = prev?.key === 'service'
                        const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                        return { key: 'service', direction: nextDirection }
                      })
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      <span>サービス</span>
                      <SortIcons active={sortConfig?.key === 'service' ? sortConfig.direction : undefined} />
                    </span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('service', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400 cursor-pointer hover:bg-gray-50"
                    style={{ width: columnWidths.leadSource, minWidth: 20 }}
                    onClick={() => {
                      setSortConfig(prev => {
                        const isSame = prev?.key === 'leadSource'
                        const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                        return { key: 'leadSource', direction: nextDirection }
                      })
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      <span>リードソース</span>
                      <SortIcons active={sortConfig?.key === 'leadSource' ? sortConfig.direction : undefined} />
                    </span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('leadSource', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400 cursor-pointer hover:bg-gray-50"
                    style={{ width: columnWidths.linkedDate, minWidth: 20 }}
                    onClick={() => {
                      setSortConfig(prev => {
                        const isSame = prev?.key === 'linkedDate'
                        const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                        return { key: 'linkedDate', direction: nextDirection }
                      })
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      <span>連携日</span>
                      <SortIcons active={sortConfig?.key === 'linkedDate' ? sortConfig.direction : undefined} />
                    </span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('linkedDate', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400 cursor-pointer hover:bg-gray-50"
                    style={{ width: columnWidths.contactName, minWidth: 20 }}
                    onClick={() => {
                      setSortConfig(prev => {
                        const isSame = prev?.key === 'contactName'
                        const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                        return { key: 'contactName', direction: nextDirection }
                      })
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      <span>氏名</span>
                      <SortIcons active={sortConfig?.key === 'contactName' ? sortConfig.direction : undefined} />
                    </span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('contactName', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400 cursor-pointer hover:bg-gray-50"
                    style={{ width: columnWidths.staffIS, minWidth: 20 }}
                    onClick={() => {
                      setSortConfig(prev => {
                        const isSame = prev?.key === 'staffIS'
                        const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                        return { key: 'staffIS', direction: nextDirection }
                      })
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      <span>担当IS</span>
                      <SortIcons active={sortConfig?.key === 'staffIS' ? sortConfig.direction : undefined} />
                    </span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('staffIS', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400 cursor-pointer hover:bg-gray-50"
                    style={{ width: columnWidths.appointmentDate, minWidth: 20 }}
                    onClick={() => {
                      setSortConfig(prev => {
                        const isSame = prev?.key === 'appointmentDate'
                        const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                        return { key: 'appointmentDate', direction: nextDirection }
                      })
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      <span>アポイント獲得日</span>
                      <SortIcons active={sortConfig?.key === 'appointmentDate' ? sortConfig.direction : undefined} />
                    </span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('appointmentDate', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400 cursor-pointer hover:bg-gray-50"
                    style={{ width: columnWidths.dealSetupDate, minWidth: 20 }}
                    onClick={() => {
                      setSortConfig(prev => {
                        const isSame = prev?.key === 'dealSetupDate'
                        const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                        return { key: 'dealSetupDate', direction: nextDirection }
                      })
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      <span>商談設定日</span>
                      <SortIcons active={sortConfig?.key === 'dealSetupDate' ? sortConfig.direction : undefined} />
                    </span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('dealSetupDate', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none cursor-pointer hover:bg-gray-50"
                    style={{ width: columnWidths.dealTime, minWidth: 20 }}
                    onClick={() => {
                      setSortConfig(prev => {
                        const isSame = prev?.key === 'dealTime'
                        const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                        return { key: 'dealTime', direction: nextDirection }
                      })
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      <span>商談時間</span>
                      <SortIcons active={sortConfig?.key === 'dealTime' ? sortConfig.direction : undefined} />
                    </span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('dealTime', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={`loading-${i}`}>
                      {[...Array(9)].map((_, j) => (
                        <td key={`loading-${i}-${j}`} className="px-4 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      商談データがありません
                    </td>
                  </tr>
                ) : (
                  sortedDeals.map((deal, index) => {
                    const dealId = (deal as any).dealId || deal.id || ''
                    return (
                      <tr 
                        key={dealId || `deal-${index}`}
                        onClick={() => handleRowClick(deal)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-gray-900" style={{ width: columnWidths.id, minWidth: 20 }}>
                          {dealId}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900" style={{ width: columnWidths.service, minWidth: 20 }}>
                          {deal.service}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.leadSource, minWidth: 20 }}>
                          {deal.leadSource}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.linkedDate, minWidth: 20 }}>
                          {deal.linkedDate}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900" style={{ width: columnWidths.contactName, minWidth: 20 }}>
                          {deal.contactName}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.staffIS, minWidth: 20 }}>
                          {deal.staffIS}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.appointmentDate, minWidth: 20 }}>
                          {deal.appointmentDate || '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.dealSetupDate, minWidth: 20 }}>
                          {deal.dealSetupDate || '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.dealTime, minWidth: 20 }}>
                          {deal.dealTime || '-'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isPanelOpen && selectedDeal && (
        <DealDetailPanel
          deal={selectedDeal}
          onClose={handlePanelClose}
          onSave={handlePanelSave}
          isSaving={updateMutation.isPending}
        />
      )}
    </div>
  )
}







