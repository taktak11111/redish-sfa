'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Deal, DealRank, DealResult } from '@/types/sfa'
import { DealDetailPanel } from '@/components/deals/DealDetailPanel'
import { DateRangeFilter, DateRange } from '@redish/shared'
import { getDropdownOptions, refreshDropdownSettingsFromDB, type DropdownOption } from '@/lib/dropdownSettings'

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

// 非表示可能な列キー
const hideableColumns = new Set([
  'id', 'service', 'leadSource', 'contactName', 'dealSetupDate', 'dealTime',
  'dealStaffFS', 'dealExecutionStatus', 'rankEstimate1', 'nextActionContent', 'actionCompleted',
  'finalResult', 'resultDate'
])

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

// KPIフィルタータイプ
type KpiFilterType = 'all' | 'setup' | 'executed' | 'contract' | 'instant' | 'executionRate' | 'contractRate' | 'instantRate'

export default function DealsPage() {
  const [filterRank, setFilterRank] = useState<string>('all')
  const [filterResult, setFilterResult] = useState<string>('all')
  const [selectedKpiFilter, setSelectedKpiFilter] = useState<KpiFilterType>('all')
  const [selectedStaff, setSelectedStaff] = useState<Set<string>>(new Set())
  const [showStaffFilter, setShowStaffFilter] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false)
  const [isServiceKpiCollapsed, setIsServiceKpiCollapsed] = useState(true)
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    id: 80,
    service: 130,
    leadSource: 85,
    contactName: 125,
    dealSetupDate: 70,
    dealTime: 65,
    dealStaffFS: 65,
    dealExecutionStatus: 80,
    rankEstimate1: 70,
    nextActionContent: 140,
    actionCompleted: 50,
    finalResult: 75,
    resultDate: 70,
  })
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set())
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)
  // 担当者オプション（設定メニューから取得）
  const [staffOptions, setStaffOptions] = useState<DropdownOption[]>([])
  const queryClient = useQueryClient()

  // 担当者オプションの取得（設定メニューと連動）
  useEffect(() => {
    const handleStorageChange = () => {
      const newOptions = getDropdownOptions('dealStaffFS')
      setStaffOptions((prev) => {
        const prevStr = JSON.stringify(prev)
        const newStr = JSON.stringify(newOptions)
        if (prevStr === newStr) return prev
        return newOptions
      })
    }
    // 初回はDBからも取得
    void refreshDropdownSettingsFromDB().finally(handleStorageChange)
    handleStorageChange()
    window.addEventListener('storage', handleStorageChange)
    const interval = window.setInterval(handleStorageChange, 30000)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.clearInterval(interval)
    }
  }, [])

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

  // KPI計算
  const kpiStats = useMemo(() => {
    const deals = data?.data as Deal[] || []
    const filteredForKpi = dateRange
      ? deals.filter(deal => {
          if (!deal.dealSetupDate) return false
          const recordDate = new Date(deal.dealSetupDate)
          recordDate.setHours(0, 0, 0, 0)
          return recordDate >= dateRange.start && recordDate <= dateRange.end
        })
      : deals

    const dealSetupCount = filteredForKpi.length
    const dealExecutedCount = filteredForKpi.filter(d => d.dealExecutionStatus === '実施済').length
    const contractCount = filteredForKpi.filter(d => d.finalResult === '成約' || d.finalResult === '成約（即決）').length
    const instantContractCount = filteredForKpi.filter(d => d.finalResult === '成約（即決）').length

    const executionRate = dealSetupCount > 0 ? (dealExecutedCount / dealSetupCount * 100) : 0
    const contractRate = dealExecutedCount > 0 ? (contractCount / dealExecutedCount * 100) : 0
    const instantRate = dealExecutedCount > 0 ? (instantContractCount / dealExecutedCount * 100) : 0

    return {
      dealSetupCount,
      dealExecutedCount,
      contractCount,
      instantContractCount,
      executionRate,
      contractRate,
      instantRate,
    }
  }, [data, dateRange])

  // 商材別KPI計算
  const serviceKpiStats = useMemo(() => {
    const deals = data?.data as Deal[] || []
    const filteredForKpi = dateRange
      ? deals.filter(deal => {
          if (!deal.dealSetupDate) return false
          const recordDate = new Date(deal.dealSetupDate)
          recordDate.setHours(0, 0, 0, 0)
          return recordDate >= dateRange.start && recordDate <= dateRange.end
        })
      : deals

    const services = ['RO:税務（税理士）', 'RO:開業（融資）', 'RO:集客（MEO）']
    const serviceLabels: Record<string, string> = {
      'RO:税務（税理士）': 'REDISH税務',
      'RO:開業（融資）': 'REDISH開業',
      'RO:集客（MEO）': 'REDISH集客',
    }

    return services.map(service => {
      const serviceDeals = filteredForKpi.filter(d => d.service === service)
      const dealSetupCount = serviceDeals.length
      const dealExecutedCount = serviceDeals.filter(d => d.dealExecutionStatus === '実施済').length
      const contractCount = serviceDeals.filter(d => d.finalResult === '成約' || d.finalResult === '成約（即決）').length
      const instantContractCount = serviceDeals.filter(d => d.finalResult === '成約（即決）').length

      const executionRate = dealSetupCount > 0 ? (dealExecutedCount / dealSetupCount * 100) : 0
      const contractRate = dealExecutedCount > 0 ? (contractCount / dealExecutedCount * 100) : 0
      const instantRate = dealExecutedCount > 0 ? (instantContractCount / dealExecutedCount * 100) : 0

      return {
        service,
        label: serviceLabels[service] || service,
        dealSetupCount,
        dealExecutedCount,
        contractCount,
        instantContractCount,
        executionRate,
        contractRate,
        instantRate,
      }
    })
  }, [data, dateRange])

  // 列非表示設定の復元
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('deals.hiddenColumns')
      if (raw) {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr)) {
          setHiddenColumns(new Set(arr))
        }
      }
    } catch {
      // noop
    }
  }, [])

  // 列非表示設定の保存
  useEffect(() => {
    try {
      window.localStorage.setItem('deals.hiddenColumns', JSON.stringify(Array.from(hiddenColumns)))
    } catch {
      // noop
    }
  }, [hiddenColumns])

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

  // 列の表示/非表示判定
  const isColumnVisible = (key: string) => {
    if (!hideableColumns.has(key)) return true
    return !hiddenColumns.has(key)
  }

  // 列を非表示にする
  const hideColumn = (key: string) => {
    if (!hideableColumns.has(key)) return
    setHiddenColumns(prev => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }

  // 列設定リセット
  const resetColumns = () => {
    try {
      window.localStorage.removeItem('deals.hiddenColumns')
    } catch {
      // noop
    }
    window.location.reload()
  }

  // KPIカードクリック時のハンドラー
  const handleKpiCardClick = (kpiType: KpiFilterType) => {
    if (selectedKpiFilter === kpiType) {
      // 同じカードを再度クリックした場合は解除
      setSelectedKpiFilter('all')
    } else {
      // 新しいカードを選択した場合
      setSelectedKpiFilter(kpiType)
      // 「すべての確度」「すべての結果」をリセット
      setFilterRank('all')
      setFilterResult('all')
    }
  }

  const filteredDeals = (data?.data as Deal[] || []).filter(deal => {
    const matchesRank = filterRank === 'all' || deal.rank === filterRank
    const matchesResult = filterResult === 'all' || 
      (filterResult === 'active' && !deal.result) ||
      deal.result === filterResult
    const matchesStaff = selectedStaff.size === 0 || (deal.dealStaffFS && selectedStaff.has(deal.dealStaffFS))
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

    // KPIフィルター
    let matchesKpiFilter = true
    if (selectedKpiFilter !== 'all') {
      switch (selectedKpiFilter) {
        case 'setup':
          // 商談設定数：商談設定日がある全ての商談
          matchesKpiFilter = !!deal.dealSetupDate
          break
        case 'executed':
        case 'executionRate':
          // 商談実施数/商談実施率：実施済の商談
          matchesKpiFilter = deal.dealExecutionStatus === '実施済'
          break
        case 'contract':
        case 'contractRate':
          // 成約数/成約率：成約した商談
          matchesKpiFilter = deal.finalResult === '成約' || deal.finalResult === '成約（即決）'
          break
        case 'instant':
        case 'instantRate':
          // 即決数/即決率：即決した商談
          matchesKpiFilter = deal.finalResult === '成約（即決）'
          break
      }
    }
    
    return matchesRank && matchesResult && matchesStaff && matchesSearch && matchesDateRange && matchesKpiFilter
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
          <div className="flex items-center gap-3">
            {/* 担当者フィルタ */}
            <div className="flex flex-wrap items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white shadow-sm">
              <span className="text-sm font-medium text-gray-700">担当者フィルタ</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStaff.size === 0}
                  onChange={() => setSelectedStaff(new Set())}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">すべて</span>
              </label>
              <span className="text-xs text-gray-400">|</span>
              {staffOptions.map((opt) => {
                const v = String(opt.value)
                const checked = selectedStaff.has(v)
                return (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = new Set(selectedStaff)
                        if (e.target.checked) {
                          next.add(v)
                        } else {
                          next.delete(v)
                        }
                        setSelectedStaff(next)
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => setIsFilterCollapsed((prev) => !prev)}
              className="px-4 py-2 text-sm font-medium text-primary-800 bg-primary-100 border border-primary-200 rounded-md hover:bg-primary-200 shadow-sm"
              aria-label={isFilterCollapsed ? 'フィルターを開く' : 'フィルターを閉じる'}
            >
              {isFilterCollapsed ? 'Open' : 'Close'}
            </button>
            <button
              type="button"
              onClick={resetColumns}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
            >
              列表示リセット
            </button>
          </div>
        </div>

        {!isFilterCollapsed && (
          <>
            {/* フィルター行 */}
            <div className="card p-4 mb-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex justify-end lg:justify-start">
                  <DateRangeFilter
                    defaultPreset="thisMonth"
                    onChange={setDateRange}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 lg:justify-end lg:items-center">
                  <div className="sm:w-[400px] lg:w-[400px]">
                    <input
                      type="text"
                      placeholder="会社名、担当者名、商談IDで検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input w-full"
                    />
                  </div>
                  <div className="sm:w-32 lg:w-32">
                    <select
                      value={filterRank}
                      onChange={(e) => setFilterRank(e.target.value)}
                      className="input w-full text-sm"
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
                  <div className="sm:w-40 lg:w-40">
                    <select
                      value={filterResult}
                      onChange={(e) => setFilterResult(e.target.value)}
                      className="input w-full text-sm"
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

            {/* KPIカード */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-4">
              {/* 商談設定数 */}
              <div 
                onClick={() => handleKpiCardClick('setup')}
                className={`card p-4 border-l-4 relative cursor-pointer transition-all ${
                  selectedKpiFilter === 'setup' 
                    ? 'border-gray-600 ring-2 ring-gray-400 bg-gray-50' 
                    : 'border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="absolute right-2 top-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 border border-gray-200">
                  商談量
                </div>
                <div className="text-xs text-gray-500">商談設定数</div>
                <div className={`mt-1 text-2xl font-bold tabular-nums ${kpiStats.dealSetupCount === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{kpiStats.dealSetupCount === 0 ? '-' : kpiStats.dealSetupCount}</div>
              </div>
              {/* 商談実施数 */}
              <div 
                onClick={() => handleKpiCardClick('executed')}
                className={`card p-4 border-l-4 relative cursor-pointer transition-all ${
                  selectedKpiFilter === 'executed' 
                    ? 'border-teal-600 ring-2 ring-teal-400 bg-teal-50' 
                    : 'border-teal-400 hover:bg-gray-50'
                }`}
              >
                <div className="absolute right-2 top-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 border border-gray-200">
                  商談量
                </div>
                <div className="text-xs text-gray-500">商談実施数</div>
                <div className={`mt-1 text-2xl font-bold tabular-nums ${kpiStats.dealExecutedCount === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{kpiStats.dealExecutedCount === 0 ? '-' : kpiStats.dealExecutedCount}</div>
              </div>
              {/* 成約数 */}
              <div 
                onClick={() => handleKpiCardClick('contract')}
                className={`card p-4 border-l-4 relative cursor-pointer transition-all ${
                  selectedKpiFilter === 'contract' 
                    ? 'border-teal-600 ring-2 ring-teal-400 bg-teal-50' 
                    : 'border-teal-400 hover:bg-gray-50'
                }`}
              >
                <div className="absolute right-2 top-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 border border-gray-200">
                  成約実績
                </div>
                <div className="text-xs text-gray-500">成約数</div>
                <div className={`mt-1 text-2xl font-bold tabular-nums ${kpiStats.contractCount === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{kpiStats.contractCount === 0 ? '-' : kpiStats.contractCount}</div>
              </div>
              {/* 即決数 */}
              <div 
                onClick={() => handleKpiCardClick('instant')}
                className={`card p-4 border-l-4 relative cursor-pointer transition-all ${
                  selectedKpiFilter === 'instant' 
                    ? 'border-gray-600 ring-2 ring-gray-400 bg-gray-50' 
                    : 'border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="absolute right-2 top-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 border border-gray-200">
                  成約実績
                </div>
                <div className="text-xs text-gray-500">即決数</div>
                <div className={`mt-1 text-2xl font-bold tabular-nums ${kpiStats.instantContractCount === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{kpiStats.instantContractCount === 0 ? '-' : kpiStats.instantContractCount}</div>
              </div>
              {/* 商談実施率 */}
              <div 
                onClick={() => handleKpiCardClick('executionRate')}
                className={`card p-4 border-l-4 relative cursor-pointer transition-all ${
                  selectedKpiFilter === 'executionRate' 
                    ? 'border-gray-600 ring-2 ring-gray-400 bg-gray-50' 
                    : 'border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="absolute right-2 top-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 border border-gray-200">
                  効率
                </div>
                <div className="text-xs text-gray-500">商談実施率</div>
                <div className={`mt-1 text-2xl font-bold tabular-nums ${kpiStats.executionRate === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{kpiStats.executionRate === 0 ? '-' : `${kpiStats.executionRate.toFixed(1)}%`}</div>
              </div>
              {/* 成約率 */}
              <div 
                onClick={() => handleKpiCardClick('contractRate')}
                className={`card p-4 border-l-4 relative cursor-pointer transition-all ${
                  selectedKpiFilter === 'contractRate' 
                    ? 'border-teal-600 ring-2 ring-teal-400 bg-teal-50' 
                    : 'border-teal-400 hover:bg-gray-50'
                }`}
              >
                <div className="absolute right-2 top-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 border border-gray-200">
                  効率
                </div>
                <div className="text-xs text-gray-500">成約率</div>
                <div className={`mt-1 text-2xl font-bold tabular-nums ${kpiStats.contractRate === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{kpiStats.contractRate === 0 ? '-' : `${kpiStats.contractRate.toFixed(1)}%`}</div>
              </div>
              {/* 即決率 */}
              <div 
                onClick={() => handleKpiCardClick('instantRate')}
                className={`card p-4 border-l-4 relative cursor-pointer transition-all ${
                  selectedKpiFilter === 'instantRate' 
                    ? 'border-gray-600 ring-2 ring-gray-400 bg-gray-50' 
                    : 'border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="absolute right-2 top-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 border border-gray-200">
                  効率
                </div>
                <div className="text-xs text-gray-500">即決率</div>
                <div className={`mt-1 text-2xl font-bold tabular-nums ${kpiStats.instantRate === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{kpiStats.instantRate === 0 ? '-' : `${kpiStats.instantRate.toFixed(1)}%`}</div>
              </div>
            </div>

            {/* 商材別KPIセクション（折畳可能） */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setIsServiceKpiCollapsed(prev => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-t-lg border border-gray-200"
              >
                <span>{isServiceKpiCollapsed ? '▶' : '▼'} 商材別KPI</span>
                <span className="text-xs text-gray-500">{isServiceKpiCollapsed ? '開く' : '閉じる'}</span>
              </button>
              {!isServiceKpiCollapsed && (
                <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg p-3 space-y-2">
                  {serviceKpiStats.map(stat => (
                    <div key={stat.service} className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded border border-gray-100">
                      <span className="text-sm font-semibold text-gray-800 min-w-[85px]">{stat.label}</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 設定数 */}
                        <div className="bg-white border border-gray-200 rounded px-5 py-1.5 flex items-center gap-5 min-w-[170px]">
                          <span className="text-xs text-gray-500">設定数</span>
                          <span className={`text-xl font-bold ${stat.dealSetupCount === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{stat.dealSetupCount === 0 ? '-' : stat.dealSetupCount}</span>
                        </div>
                        {/* 実施数 */}
                        <div className="bg-white border border-gray-200 border-l-4 border-l-teal-400 rounded px-5 py-1.5 flex items-center gap-5 min-w-[170px]">
                          <span className="text-xs text-gray-500">実施数</span>
                          <span className={`text-xl font-bold ${stat.dealExecutedCount === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{stat.dealExecutedCount === 0 ? '-' : stat.dealExecutedCount}</span>
                        </div>
                        {/* 成約 */}
                        <div className="bg-white border border-gray-200 border-l-4 border-l-teal-400 rounded px-5 py-1.5 flex items-center gap-5 min-w-[145px]">
                          <span className="text-xs text-gray-500">成約</span>
                          <span className={`text-xl font-bold ${stat.contractCount === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{stat.contractCount === 0 ? '-' : stat.contractCount}</span>
                        </div>
                        {/* 即決 */}
                        <div className="bg-white border border-gray-200 rounded px-5 py-1.5 flex items-center gap-5 min-w-[145px]">
                          <span className="text-xs text-gray-500">即決</span>
                          <span className={`text-xl font-bold ${stat.instantContractCount === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{stat.instantContractCount === 0 ? '-' : stat.instantContractCount}</span>
                        </div>
                        {/* 実施率 */}
                        <div className="bg-white border border-gray-200 rounded px-5 py-1.5 flex items-center gap-5 min-w-[180px]">
                          <span className="text-xs text-gray-500">実施率</span>
                          <span className={`text-xl font-bold ${stat.executionRate === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{stat.executionRate === 0 ? '-' : `${stat.executionRate.toFixed(0)}%`}</span>
                        </div>
                        {/* 成約率 */}
                        <div className="bg-white border border-gray-200 border-l-4 border-l-teal-400 rounded px-5 py-1.5 flex items-center gap-5 min-w-[180px]">
                          <span className="text-xs text-gray-500">成約率</span>
                          <span className={`text-xl font-bold ${stat.contractRate === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{stat.contractRate === 0 ? '-' : `${stat.contractRate.toFixed(0)}%`}</span>
                        </div>
                        {/* 即決率 */}
                        <div className="bg-white border border-gray-200 rounded px-5 py-1.5 flex items-center gap-5 min-w-[180px]">
                          <span className="text-xs text-gray-500">即決率</span>
                          <span className={`text-xl font-bold ${stat.instantRate === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{stat.instantRate === 0 ? '-' : `${stat.instantRate.toFixed(0)}%`}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-4">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-340px)]">
            <table className="divide-y divide-gray-200" style={{ width: 'max-content', minWidth: '100%' }}>
              <thead className="bg-gray-100 sticky top-0 z-20 shadow-sm">
                <tr>
                  {/* 商談ID */}
                  {isColumnVisible('id') && (
                    <th 
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                      style={{ width: columnWidths.id, minWidth: 20 }}
                      onClick={() => setSortConfig(prev => ({ key: 'id', direction: prev?.key === 'id' && prev?.direction === 'asc' ? 'desc' : 'asc' }))}
                      onDoubleClick={() => hideColumn('id')}
                      title="ダブルクリックで非表示"
                    >
                      <span className="inline-flex items-center justify-center w-full">
                        <span>商談ID</span>
                        <SortIcons active={sortConfig?.key === 'id' ? sortConfig.direction : undefined} />
                      </span>
                    </th>
                  )}
                  {/* サービス */}
                  {isColumnVisible('service') && (
                    <th 
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                      style={{ width: columnWidths.service, minWidth: 20 }}
                      onClick={() => setSortConfig(prev => ({ key: 'service', direction: prev?.key === 'service' && prev?.direction === 'asc' ? 'desc' : 'asc' }))}
                      onDoubleClick={() => hideColumn('service')}
                      title="ダブルクリックで非表示"
                    >
                      <span className="inline-flex items-center justify-center w-full">
                        <span>サービス</span>
                        <SortIcons active={sortConfig?.key === 'service' ? sortConfig.direction : undefined} />
                      </span>
                    </th>
                  )}
                  {/* リードソース */}
                  {isColumnVisible('leadSource') && (
                    <th 
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                      style={{ width: columnWidths.leadSource, minWidth: 20 }}
                      onClick={() => setSortConfig(prev => ({ key: 'leadSource', direction: prev?.key === 'leadSource' && prev?.direction === 'asc' ? 'desc' : 'asc' }))}
                      onDoubleClick={() => hideColumn('leadSource')}
                      title="ダブルクリックで非表示"
                    >
                      <span className="inline-flex items-center justify-center w-full">
                        <span>ソース</span>
                        <SortIcons active={sortConfig?.key === 'leadSource' ? sortConfig.direction : undefined} />
                      </span>
                    </th>
                  )}
                  {/* 顧客氏名 */}
                  {isColumnVisible('contactName') && (
                    <th 
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                      style={{ width: columnWidths.contactName, minWidth: 20 }}
                      onClick={() => setSortConfig(prev => ({ key: 'contactName', direction: prev?.key === 'contactName' && prev?.direction === 'asc' ? 'desc' : 'asc' }))}
                      onDoubleClick={() => hideColumn('contactName')}
                      title="ダブルクリックで非表示"
                    >
                      <span className="inline-flex items-center justify-center w-full">
                        <span>顧客氏名</span>
                        <SortIcons active={sortConfig?.key === 'contactName' ? sortConfig.direction : undefined} />
                      </span>
                    </th>
                  )}
                  {/* 商談設定日 */}
                  {isColumnVisible('dealSetupDate') && (
                    <th 
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                      style={{ width: columnWidths.dealSetupDate, minWidth: 20 }}
                      onClick={() => setSortConfig(prev => ({ key: 'dealSetupDate', direction: prev?.key === 'dealSetupDate' && prev?.direction === 'asc' ? 'desc' : 'asc' }))}
                      onDoubleClick={() => hideColumn('dealSetupDate')}
                      title="ダブルクリックで非表示"
                    >
                      <span className="inline-flex items-center justify-center w-full">
                        <span>設定日</span>
                        <SortIcons active={sortConfig?.key === 'dealSetupDate' ? sortConfig.direction : undefined} />
                      </span>
                    </th>
                  )}
                  {/* 商談時間 */}
                  {isColumnVisible('dealTime') && (
                    <th 
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                      style={{ width: columnWidths.dealTime, minWidth: 20 }}
                      onClick={() => setSortConfig(prev => ({ key: 'dealTime', direction: prev?.key === 'dealTime' && prev?.direction === 'asc' ? 'desc' : 'asc' }))}
                      onDoubleClick={() => hideColumn('dealTime')}
                      title="ダブルクリックで非表示"
                    >
                      <span className="inline-flex items-center justify-center w-full">
                        <span>時間</span>
                        <SortIcons active={sortConfig?.key === 'dealTime' ? sortConfig.direction : undefined} />
                      </span>
                    </th>
                  )}
                  {/* 担当者 */}
                  {isColumnVisible('dealStaffFS') && (
                    <th 
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                      style={{ width: columnWidths.dealStaffFS, minWidth: 20 }}
                      onClick={() => setSortConfig(prev => ({ key: 'dealStaffFS', direction: prev?.key === 'dealStaffFS' && prev?.direction === 'asc' ? 'desc' : 'asc' }))}
                      onDoubleClick={() => hideColumn('dealStaffFS')}
                      title="ダブルクリックで非表示"
                    >
                      <span className="inline-flex items-center justify-center w-full">
                        <span>担当者</span>
                        <SortIcons active={sortConfig?.key === 'dealStaffFS' ? sortConfig.direction : undefined} />
                      </span>
                    </th>
                  )}
                  {/* 商談実施状況 */}
                  {isColumnVisible('dealExecutionStatus') && (
                    <th 
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                      style={{ width: columnWidths.dealExecutionStatus, minWidth: 20 }}
                      onClick={() => setSortConfig(prev => ({ key: 'dealExecutionStatus', direction: prev?.key === 'dealExecutionStatus' && prev?.direction === 'asc' ? 'desc' : 'asc' }))}
                      onDoubleClick={() => hideColumn('dealExecutionStatus')}
                      title="ダブルクリックで非表示"
                    >
                      <span className="inline-flex items-center justify-center w-full">
                        <span>実施状況</span>
                        <SortIcons active={sortConfig?.key === 'dealExecutionStatus' ? sortConfig.direction : undefined} />
                      </span>
                    </th>
                  )}
                  {/* 確度ヨミ */}
                  {isColumnVisible('rankEstimate1') && (
                    <th 
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                      style={{ width: columnWidths.rankEstimate1, minWidth: 20 }}
                      onClick={() => setSortConfig(prev => ({ key: 'rankEstimate1', direction: prev?.key === 'rankEstimate1' && prev?.direction === 'asc' ? 'desc' : 'asc' }))}
                      onDoubleClick={() => hideColumn('rankEstimate1')}
                      title="ダブルクリックで非表示"
                    >
                      <span className="inline-flex items-center justify-center w-full">
                        <span>確度ヨミ</span>
                        <SortIcons active={sortConfig?.key === 'rankEstimate1' ? sortConfig.direction : undefined} />
                      </span>
                    </th>
                  )}
                  {/* ネクストアクション */}
                  {isColumnVisible('nextActionContent') && (
                    <th 
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                      style={{ width: columnWidths.nextActionContent, minWidth: 20 }}
                      onClick={() => setSortConfig(prev => ({ key: 'nextActionContent', direction: prev?.key === 'nextActionContent' && prev?.direction === 'asc' ? 'desc' : 'asc' }))}
                      onDoubleClick={() => hideColumn('nextActionContent')}
                      title="ダブルクリックで非表示"
                    >
                      <span className="inline-flex items-center justify-center w-full">
                        <span>ネクストアクション</span>
                        <SortIcons active={sortConfig?.key === 'nextActionContent' ? sortConfig.direction : undefined} />
                      </span>
                    </th>
                  )}
                  {/* 実施チェック */}
                  {isColumnVisible('actionCompleted') && (
                    <th 
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                      style={{ width: columnWidths.actionCompleted, minWidth: 20 }}
                      onDoubleClick={() => hideColumn('actionCompleted')}
                      title="ダブルクリックで非表示"
                    >
                      <span className="inline-flex items-center justify-center w-full">
                        <span>実施✅</span>
                      </span>
                    </th>
                  )}
                  {/* 商談最終結果 */}
                  {isColumnVisible('finalResult') && (
                    <th 
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                      style={{ width: columnWidths.finalResult, minWidth: 20 }}
                      onClick={() => setSortConfig(prev => ({ key: 'finalResult', direction: prev?.key === 'finalResult' && prev?.direction === 'asc' ? 'desc' : 'asc' }))}
                      onDoubleClick={() => hideColumn('finalResult')}
                      title="ダブルクリックで非表示"
                    >
                      <span className="inline-flex items-center justify-center w-full">
                        <span>最終結果</span>
                        <SortIcons active={sortConfig?.key === 'finalResult' ? sortConfig.direction : undefined} />
                      </span>
                    </th>
                  )}
                  {/* 結果確定日 */}
                  {isColumnVisible('resultDate') && (
                    <th 
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                      style={{ width: columnWidths.resultDate, minWidth: 20 }}
                      onClick={() => setSortConfig(prev => ({ key: 'resultDate', direction: prev?.key === 'resultDate' && prev?.direction === 'asc' ? 'desc' : 'asc' }))}
                      onDoubleClick={() => hideColumn('resultDate')}
                      title="ダブルクリックで非表示"
                    >
                      <span className="inline-flex items-center justify-center w-full">
                        <span>確定日</span>
                        <SortIcons active={sortConfig?.key === 'resultDate' ? sortConfig.direction : undefined} />
                      </span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={`loading-${i}`}>
                      {[...Array(13)].map((_, j) => (
                        <td key={`loading-${i}-${j}`} className="px-2 py-2">
                          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-8 text-center text-gray-500">
                      商談データがありません
                    </td>
                  </tr>
                ) : (
                  sortedDeals.map((deal, index) => {
                    const dealId = (deal as any).dealId || deal.id || ''
                    const formatDate = (d: string | undefined) => d ? d.slice(5).replace('-', '/') : '-'
                    
                    // 商談実施日からの経過日数によるハイライト判定
                    let rowHighlightClass = 'hover:bg-gray-50'
                    if (deal.dealExecutionDate && !deal.finalResult) {
                      const executionDate = new Date(deal.dealExecutionDate)
                      const today = new Date()
                      const diffDays = Math.floor((today.getTime() - executionDate.getTime()) / (1000 * 60 * 60 * 24))
                      if (diffDays >= 30) {
                        rowHighlightClass = 'bg-pink-100 hover:bg-pink-200'
                      } else if (diffDays >= 7) {
                        rowHighlightClass = 'bg-yellow-100 hover:bg-yellow-200'
                      }
                    }
                    
                    return (
                      <tr 
                        key={dealId || `deal-${index}`}
                        onClick={() => handleRowClick(deal)}
                        className={`${rowHighlightClass} cursor-pointer`}
                      >
                        {isColumnVisible('id') && (
                          <td className="px-4 py-4 text-sm font-medium text-gray-900" style={{ width: columnWidths.id }}>{dealId}</td>
                        )}
                        {isColumnVisible('service') && (
                          <td className="px-4 py-4 text-sm text-gray-700 truncate" style={{ width: columnWidths.service }}>{deal.service}</td>
                        )}
                        {isColumnVisible('leadSource') && (
                          <td className="px-4 py-4 text-sm text-gray-500 truncate" style={{ width: columnWidths.leadSource }}>{deal.leadSource}</td>
                        )}
                        {isColumnVisible('contactName') && (
                          <td className="px-4 py-4 text-sm text-gray-900 truncate" style={{ width: columnWidths.contactName }}>{deal.contactName}</td>
                        )}
                        {isColumnVisible('dealSetupDate') && (
                          <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.dealSetupDate }}>{formatDate(deal.dealSetupDate)}</td>
                        )}
                        {isColumnVisible('dealTime') && (
                          <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.dealTime }}>{deal.dealTime || '-'}</td>
                        )}
                        {isColumnVisible('dealStaffFS') && (
                          <td className="px-4 py-4 text-sm text-gray-700 truncate" style={{ width: columnWidths.dealStaffFS }}>{deal.dealStaffFS || '-'}</td>
                        )}
                        {isColumnVisible('dealExecutionStatus') && (
                          <td className="px-4 py-4 text-sm" style={{ width: columnWidths.dealExecutionStatus }}>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              deal.dealExecutionStatus === '実施済' ? 'bg-green-100 text-green-700' :
                              deal.dealExecutionStatus === 'ノーショー 連絡なし' ? 'bg-red-100 text-red-700' :
                              deal.dealExecutionStatus === 'キャンセル' ? 'bg-orange-100 text-orange-700' :
                              deal.dealExecutionStatus === 'リスケ' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {deal.dealExecutionStatus || '実施前'}
                            </span>
                          </td>
                        )}
                        {isColumnVisible('rankEstimate1') && (
                          <td className="px-4 py-4 text-sm text-gray-700" style={{ width: columnWidths.rankEstimate1 }}>{deal.rankEstimate1 || '-'}</td>
                        )}
                        {isColumnVisible('nextActionContent') && (
                          <td className="px-4 py-4 text-sm text-gray-700 truncate" style={{ width: columnWidths.nextActionContent }}>{deal.nextActionContent || '-'}</td>
                        )}
                        {isColumnVisible('actionCompleted') && (
                          <td 
                            className="px-4 py-4 text-center" 
                            style={{ width: columnWidths.actionCompleted }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input 
                              type="checkbox" 
                              checked={deal.actionCompleted === '済'} 
                              onChange={(e) => {
                                const dealIdForUpdate = (deal as any).dealId || deal.id
                                updateMutation.mutate({ dealId: dealIdForUpdate, updates: { actionCompleted: e.target.checked ? '済' : '' } })
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                        )}
                        {isColumnVisible('finalResult') && (
                          <td className="px-4 py-4 text-sm" style={{ width: columnWidths.finalResult }}>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              deal.finalResult === '成約' || deal.finalResult === '成約（即決）' ? 'bg-green-100 text-green-700' :
                              deal.finalResult === '失注' ? 'bg-red-100 text-red-700' :
                              'bg-gray-50 text-gray-500'
                            }`}>
                              {deal.finalResult || '-'}
                            </span>
                          </td>
                        )}
                        {isColumnVisible('resultDate') && (
                          <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.resultDate }}>{formatDate(deal.resultDate)}</td>
                        )}
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







