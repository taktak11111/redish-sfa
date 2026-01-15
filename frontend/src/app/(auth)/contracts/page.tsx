'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Deal } from '@/types/sfa'
import { ContractDetailPanel } from '@/components/contracts/ContractDetailPanel'
import { FinanceContractDetailPanel } from '@/components/contracts/FinanceContractDetailPanel'
import { MarketingContractDetailPanel } from '@/components/contracts/MarketingContractDetailPanel'
import { DateRangeFilter, DateRange } from '@redish/shared'

// サービス種別の判定関数
function getServiceType(service: string | undefined): 'tax' | 'finance' | 'marketing' {
  if (!service) return 'tax'
  const serviceLower = service.toLowerCase()
  if (serviceLower.includes('融資') || serviceLower.includes('finance') || serviceLower.includes('開業')) return 'finance'
  if (serviceLower.includes('集客') || serviceLower.includes('marketing') || serviceLower.includes('meo')) return 'marketing'
  return 'tax' // デフォルトは税務
}

// サンプルデータ（開発確認用: 融資・集客サービスの成約データ）
const SAMPLE_CONTRACTS: Partial<Deal>[] = [
  {
    id: 'SAMPLE-FN-001',
    leadId: 'LD-SAMPLE-001',
    service: 'RO:開業（融資）',
    category: 'A:飲食',
    leadSource: 'TEMPOS',
    companyName: 'サンプル飲食店A（融資）',
    contactName: '山田太郎',
    contactNameKana: 'やまだたろう',
    phone: '090-1234-5678',
    email: 'yamada@example.com',
    address: '東京都渋谷区1-2-3',
    industry: '飲食業',
    staffIS: '担当者A',
    result: '01.成約（契約締結）',
    resultDate: '2026-01-10',
    dealStaffFS: '担当者X',
  },
  {
    id: 'SAMPLE-FN-002',
    leadId: 'LD-SAMPLE-002',
    service: 'RO:開業（融資）',
    category: 'A:飲食',
    leadSource: 'OMC',
    companyName: 'サンプルカフェB（融資）',
    contactName: '鈴木花子',
    contactNameKana: 'すずきはなこ',
    phone: '080-9876-5432',
    email: 'suzuki@example.com',
    address: '東京都新宿区4-5-6',
    industry: '飲食業',
    staffIS: '担当者B',
    result: '01.成約（契約締結）',
    resultDate: '2026-01-08',
    dealStaffFS: '担当者Y',
  },
  {
    id: 'SAMPLE-MK-001',
    leadId: 'LD-SAMPLE-003',
    service: 'RC:集客（MEO）',
    category: 'A:飲食',
    leadSource: 'TEMPOS',
    companyName: 'サンプルラーメン店C（集客）',
    contactName: '佐藤次郎',
    contactNameKana: 'さとうじろう',
    phone: '070-1111-2222',
    email: 'sato@example.com',
    address: '東京都豊島区7-8-9',
    industry: '飲食業',
    staffIS: '担当者C',
    result: '01.成約（契約締結）',
    resultDate: '2026-01-12',
    dealStaffFS: '担当者Z',
  },
  {
    id: 'SAMPLE-MK-002',
    leadId: 'LD-SAMPLE-004',
    service: 'RC:集客（MEO）',
    category: 'A:飲食',
    leadSource: 'Amazon',
    companyName: 'サンプル居酒屋D（集客）',
    contactName: '田中三郎',
    contactNameKana: 'たなかさぶろう',
    phone: '090-3333-4444',
    email: 'tanaka@example.com',
    address: '東京都港区10-11-12',
    industry: '飲食業',
    staffIS: '担当者A',
    result: '01.成約（契約締結）',
    resultDate: '2026-01-05',
    dealStaffFS: '担当者X',
  },
]

type SortDirection = 'asc' | 'desc'
type SortConfig = { key: string; direction: SortDirection } | null

// KPIフィルタータイプ
type KpiFilterType = 'all' | 'total' | 'byService' | 'rate' | 'contractSigned' | 'paymentDoc' | 'paymentConfirmed'

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

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [selectedContract, setSelectedContract] = useState<Deal | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false)
  const [selectedKpiFilter, setSelectedKpiFilter] = useState<KpiFilterType>('all')
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    dealId: 80,
    service: 130,
    leadSource: 85,
    companyName: 120,
    contactName: 100,
    dealStaffFS: 65,
    result: 80,
    resultDate: 70,
    contractSigned: 50,
    paymentDocCompleted: 50,
    paymentConfirmed: 50,
  })
  // 成約後ワークフロー進捗の仮state（フィールド未実装のため）
  const [workflowStatus, setWorkflowStatus] = useState<Record<string, { contractSigned: boolean; paymentDocCompleted: boolean; paymentConfirmed: boolean }>>({})
  type SaveState = 'idle' | 'saving' | 'saved' | 'error'
  const [saveUi, setSaveUi] = useState<{
    savingDealId?: string
    savedDealId?: string
    errorDealId?: string
    errorMessage?: string
  }>({})
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)
  const queryClient = useQueryClient()

  // 全商談データ（成約率計算用）
  const { data: allDealsData } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const response = await fetch('/api/deals')
      if (!response.ok) throw new Error('Failed to fetch deals')
      return response.json()
    },
  })

  // 成約データのみ（サンプルデータを含む）
  const { data, isLoading, error } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const response = await fetch('/api/deals')
      if (!response.ok) throw new Error('Failed to fetch deals')
      return response.json()
    },
    select: (data) => {
      const realContracts = data.data?.filter((deal: Deal) => deal.result === '01.成約（契約締結）') || []
      // サンプルデータを追加（開発確認用）
      const combinedContracts = [...realContracts, ...SAMPLE_CONTRACTS.map(s => ({ ...s, dealId: s.id }))]
      return {
        ...data,
        data: combinedContracts
      }
    }
  })

  // ワークフローステータスの初期化（成約データ読み込み時）
  useEffect(() => {
    const contracts = data?.data as Deal[] || []
    const initialStatus: Record<string, { contractSigned: boolean; paymentDocCompleted: boolean; paymentConfirmed: boolean }> = {}
    contracts.forEach(c => {
      const dealId = (c as any).dealId || c.id || ''
      if (dealId && !workflowStatus[dealId]) {
        // 仮のランダム初期値（将来的にはDBから取得）
        initialStatus[dealId] = {
          contractSigned: Math.random() > 0.3,
          paymentDocCompleted: Math.random() > 0.5,
          paymentConfirmed: Math.random() > 0.7,
        }
      }
    })
    if (Object.keys(initialStatus).length > 0) {
      setWorkflowStatus(prev => ({ ...prev, ...initialStatus }))
    }
  }, [data])

  // KPI計算
  const kpiStats = useMemo(() => {
    const allDeals = allDealsData?.data as Deal[] || []
    const contracts = data?.data as Deal[] || []
    
    // 期間フィルタ適用
    const filteredContracts = dateRange
      ? contracts.filter(c => {
          if (!c.resultDate) return false
          const recordDate = new Date(c.resultDate)
          recordDate.setHours(0, 0, 0, 0)
          return recordDate >= dateRange.start && recordDate <= dateRange.end
        })
      : contracts

    // 期間内の商談実施総数（成約率の分母）
    const filteredDealsExecuted = dateRange
      ? allDeals.filter(d => {
          if (!d.dealSetupDate) return false
          const recordDate = new Date(d.dealSetupDate)
          recordDate.setHours(0, 0, 0, 0)
          const inRange = recordDate >= dateRange.start && recordDate <= dateRange.end
          // 商談実施済みのみカウント
          return inRange && d.dealExecutionStatus === '実施済'
        })
      : allDeals.filter(d => d.dealExecutionStatus === '実施済')

    const totalContracts = filteredContracts.length
    const totalDealsExecuted = filteredDealsExecuted.length
    const contractRate = totalDealsExecuted > 0 ? (totalContracts / totalDealsExecuted * 100) : 0

    // 商材別成約数
    const serviceBreakdown: Record<string, number> = {}
    const serviceLabels: Record<string, string> = {
      'RO:税務（税理士）': '税務',
      'RO:開業（融資）': '開業',
      'RO:集客（MEO）': '集客',
    }
    filteredContracts.forEach(c => {
      const service = c.service || 'その他'
      const label = serviceLabels[service] || service
      serviceBreakdown[label] = (serviceBreakdown[label] || 0) + 1
    })

    // 成約後ワークフロー進捗（仮: 現段階ではダミー値）
    // 将来的にはフィールド追加後に実際の値を使用
    const contractSignedCount = Math.floor(totalContracts * 0.8) // 仮: 80%
    const paymentDocCount = Math.floor(totalContracts * 0.6) // 仮: 60%
    const paymentConfirmedCount = Math.floor(totalContracts * 0.4) // 仮: 40%

    return {
      totalContracts,
      totalDealsExecuted,
      contractRate,
      serviceBreakdown,
      contractSignedCount,
      paymentDocCount,
      paymentConfirmedCount,
    }
  }, [data, allDealsData, dateRange])

  // KPIカードクリック時のハンドラー
  const handleKpiCardClick = (kpiType: KpiFilterType) => {
    if (selectedKpiFilter === kpiType) {
      setSelectedKpiFilter('all')
    } else {
      setSelectedKpiFilter(kpiType)
    }
  }

  const updateMutation = useMutation({
    mutationFn: async ({ dealId, updates }: { dealId: string; updates: Partial<Deal> }) => {
      const response = await fetch('/api/deals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, ...updates }),
      })
      if (!response.ok) throw new Error('Failed to update contract')
      return response.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      setSaveUi({
        savedDealId: variables.dealId,
      })
    },
    onError: (error, variables) => {
      setSaveUi({
        errorDealId: variables.dealId,
        errorMessage: error instanceof Error ? error.message : '保存に失敗しました',
      })
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

  const contracts = (data?.data as Deal[] || []).filter(contract => {
    const dealId = (contract as any).dealId || contract.id || ''
    const matchesSearch = searchTerm === '' ||
      contract.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contract.staffIS || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      dealId.toLowerCase().includes(searchTerm.toLowerCase())
    
    // 期間フィルタ（成約日を基準）
    let matchesDateRange = true
    if (dateRange && contract.resultDate) {
      const recordDate = new Date(contract.resultDate)
      recordDate.setHours(0, 0, 0, 0)
      matchesDateRange = recordDate >= dateRange.start && recordDate <= dateRange.end
    }
    
    return matchesSearch && matchesDateRange
  })

  const sortedContracts = useMemo(() => {
    if (!sortConfig) return contracts
    const { key, direction } = sortConfig

    const withIndex = contracts.map((contract, idx) => ({ contract, idx }))
    withIndex.sort((a, b) => {
      const aDealId = (a.contract as any).dealId || a.contract.id || ''
      const bDealId = (b.contract as any).dealId || b.contract.id || ''

      const aValRaw =
        key === 'dealId'
          ? aDealId
          : key === 'dealExecutionDate'
            ? (a.contract.dealExecutionDate ? parseDateLike(String(a.contract.dealExecutionDate)) : null)
            : key === 'resultDate'
              ? (a.contract.resultDate ? parseDateLike(String(a.contract.resultDate)) : null)
              : (a.contract as any)[key]

      const bValRaw =
        key === 'dealId'
          ? bDealId
          : key === 'dealExecutionDate'
            ? (b.contract.dealExecutionDate ? parseDateLike(String(b.contract.dealExecutionDate)) : null)
            : key === 'resultDate'
              ? (b.contract.resultDate ? parseDateLike(String(b.contract.resultDate)) : null)
              : (b.contract as any)[key]

      const cmp = compareValues(aValRaw, bValRaw)
      if (cmp !== 0) return direction === 'asc' ? cmp : -cmp
      return a.idx - b.idx
    })

    return withIndex.map(x => x.contract)
  }, [contracts, sortConfig])

  const handleRowClick = (contract: Deal) => {
    setSelectedContract(contract)
    setIsPanelOpen(true)
    // 別レコードに移動したら保存状態表示はリセット
    setSaveUi({})
  }

  const handlePanelClose = () => {
    setIsPanelOpen(false)
    setSelectedContract(null)
  }

  const handlePanelSave = (updates: Partial<Deal>) => {
    if (selectedContract) {
      const dealId = (selectedContract as any).dealId || selectedContract.id
      setSaveUi({ savingDealId: dealId })
      updateMutation.mutate({ dealId, updates })
      // 画面上の反映（即時フィードバック）
      setSelectedContract(prev => (prev ? { ...prev, ...updates } : prev))
    }
  }

  const handlePanelDirty = () => {
    if (!selectedContract) return
    const dealId = (selectedContract as any).dealId || selectedContract.id
    setSaveUi(prev => {
      if (prev.savedDealId === dealId || prev.errorDealId === dealId) {
        return {}
      }
      return prev
    })
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
            <h1 className="text-2xl font-bold text-gray-900">成約・契約管理</h1>
            <p className="mt-1 text-sm text-gray-500">成約した案件を管理します</p>
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
                    placeholder="会社名、氏名、担当、商談IDで検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPIカード（6カード横並び） */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
          {/* 1. 総成約数 */}
          <div 
            onClick={() => handleKpiCardClick('total')}
            className={`card p-4 border-l-4 relative cursor-pointer transition-all ${
              selectedKpiFilter === 'total' 
                ? 'border-l-primary-600 bg-primary-50 ring-2 ring-primary-300' 
                : 'border-l-primary-400 hover:bg-gray-50'
            }`}
          >
            <div className="absolute right-2 top-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 border border-gray-200">
              成約実績
            </div>
            <div className="text-xs text-gray-500">総成約数</div>
            <div className={`mt-1 text-2xl font-bold tabular-nums ${kpiStats.totalContracts === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
              {isLoading ? '-' : kpiStats.totalContracts === 0 ? '-' : kpiStats.totalContracts}
            </div>
          </div>

          {/* 2. 商材別成約数 */}
          <div 
            onClick={() => handleKpiCardClick('byService')}
            className={`card p-4 border-l-4 relative cursor-pointer transition-all ${
              selectedKpiFilter === 'byService' 
                ? 'border-l-blue-600 bg-blue-50 ring-2 ring-blue-300' 
                : 'border-l-blue-400 hover:bg-gray-50'
            }`}
          >
            <div className="absolute right-2 top-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 border border-gray-200">
              成約実績
            </div>
            <div className="text-xs text-gray-500 mb-2">商材別成約数</div>
            {isLoading ? (
              <div className="text-2xl font-bold text-gray-400">-</div>
            ) : (
              <div className="flex items-end justify-between gap-2">
                <div className="text-center flex-1">
                  <div className="text-[10px] text-gray-500">税務</div>
                  <div className={`text-xl font-bold tabular-nums ${(kpiStats.serviceBreakdown['税務'] || 0) === 0 ? 'text-gray-400' : 'text-primary-600'}`}>
                    {kpiStats.serviceBreakdown['税務'] || 0}
                  </div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-[10px] text-gray-500">開業</div>
                  <div className={`text-xl font-bold tabular-nums ${(kpiStats.serviceBreakdown['開業'] || 0) === 0 ? 'text-gray-400' : 'text-green-600'}`}>
                    {kpiStats.serviceBreakdown['開業'] || 0}
                  </div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-[10px] text-gray-500">集客</div>
                  <div className={`text-xl font-bold tabular-nums ${(kpiStats.serviceBreakdown['集客'] || 0) === 0 ? 'text-gray-400' : 'text-amber-600'}`}>
                    {kpiStats.serviceBreakdown['集客'] || 0}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. 成約率 */}
          <div 
            onClick={() => handleKpiCardClick('rate')}
            className={`card p-4 border-l-4 relative cursor-pointer transition-all ${
              selectedKpiFilter === 'rate' 
                ? 'border-l-green-600 bg-green-50 ring-2 ring-green-300' 
                : 'border-l-green-400 hover:bg-gray-50'
            }`}
          >
            <div className="absolute right-2 top-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 border border-gray-200">
              効率
            </div>
            <div className="text-xs text-gray-500">成約率</div>
            <div className={`mt-1 text-2xl font-bold tabular-nums ${kpiStats.contractRate === 0 ? 'text-gray-400' : 'text-green-600'}`}>
              {isLoading ? '-' : kpiStats.contractRate === 0 ? '-' : `${kpiStats.contractRate.toFixed(1)}%`}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {isLoading ? '' : `(${kpiStats.totalContracts}/${kpiStats.totalDealsExecuted}件)`}
            </div>
          </div>

          {/* 4. 契約締結済み */}
          <div 
            onClick={() => handleKpiCardClick('contractSigned')}
            className={`card p-4 border-l-4 relative cursor-pointer transition-all ${
              selectedKpiFilter === 'contractSigned' 
                ? 'border-l-amber-600 bg-amber-50 ring-2 ring-amber-300' 
                : 'border-l-amber-400 hover:bg-gray-50'
            }`}
          >
            <div className="absolute right-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
              進捗①
            </div>
            <div className="text-xs text-gray-500">契約締結済み</div>
            <div className={`mt-1 text-2xl font-bold tabular-nums ${kpiStats.contractSignedCount === 0 ? 'text-gray-400' : 'text-amber-600'}`}>
              {isLoading ? '-' : kpiStats.totalContracts === 0 ? '-' : `${kpiStats.contractSignedCount}/${kpiStats.totalContracts}`}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {isLoading ? '' : kpiStats.totalContracts > 0 ? `(${(kpiStats.contractSignedCount / kpiStats.totalContracts * 100).toFixed(0)}%)` : ''}
            </div>
          </div>

          {/* 5. 決済書類対応済み */}
          <div 
            onClick={() => handleKpiCardClick('paymentDoc')}
            className={`card p-4 border-l-4 relative cursor-pointer transition-all ${
              selectedKpiFilter === 'paymentDoc' 
                ? 'border-l-orange-600 bg-orange-50 ring-2 ring-orange-300' 
                : 'border-l-orange-400 hover:bg-gray-50'
            }`}
          >
            <div className="absolute right-2 top-2 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700 border border-orange-200">
              進捗②
            </div>
            <div className="text-xs text-gray-500">決済書類対応済</div>
            <div className={`mt-1 text-2xl font-bold tabular-nums ${kpiStats.paymentDocCount === 0 ? 'text-gray-400' : 'text-orange-600'}`}>
              {isLoading ? '-' : kpiStats.totalContracts === 0 ? '-' : `${kpiStats.paymentDocCount}/${kpiStats.totalContracts}`}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {isLoading ? '' : kpiStats.totalContracts > 0 ? `(${(kpiStats.paymentDocCount / kpiStats.totalContracts * 100).toFixed(0)}%)` : ''}
            </div>
          </div>

          {/* 6. 入金確認済み */}
          <div 
            onClick={() => handleKpiCardClick('paymentConfirmed')}
            className={`card p-4 border-l-4 relative cursor-pointer transition-all ${
              selectedKpiFilter === 'paymentConfirmed' 
                ? 'border-l-emerald-600 bg-emerald-50 ring-2 ring-emerald-300' 
                : 'border-l-emerald-400 hover:bg-gray-50'
            }`}
          >
            <div className="absolute right-2 top-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
              進捗③
            </div>
            <div className="text-xs text-gray-500">入金確認済み</div>
            <div className={`mt-1 text-2xl font-bold tabular-nums ${kpiStats.paymentConfirmedCount === 0 ? 'text-gray-400' : 'text-emerald-600'}`}>
              {isLoading ? '-' : kpiStats.totalContracts === 0 ? '-' : `${kpiStats.paymentConfirmedCount}/${kpiStats.totalContracts}`}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {isLoading ? '' : kpiStats.totalContracts > 0 ? `(${(kpiStats.paymentConfirmedCount / kpiStats.totalContracts * 100).toFixed(0)}%)` : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-240px)]">
            <table className="divide-y divide-gray-200" style={{ width: 'max-content', minWidth: '100%' }}>
              <thead className="bg-gray-100 sticky top-0 z-20 shadow-sm">
                <tr>
                  {/* 商談ID */}
                  <th 
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                    style={{ width: columnWidths.dealId, minWidth: 20 }}
                    onClick={() => {
                      setSortConfig(prev => {
                        const isSame = prev?.key === 'dealId'
                        const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                        return { key: 'dealId', direction: nextDirection }
                      })
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      <span>商談ID</span>
                      <SortIcons active={sortConfig?.key === 'dealId' ? sortConfig.direction : undefined} />
                    </span>
                    <div className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize z-20" onMouseDown={(e) => handleResizeStart('dealId', e)} style={{ transform: 'translateX(50%)' }} />
                  </th>
                  {/* サービス */}
                  <th 
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
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
                    <div className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize z-20" onMouseDown={(e) => handleResizeStart('service', e)} style={{ transform: 'translateX(50%)' }} />
                  </th>
                  {/* ソース */}
                  <th 
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
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
                      <span>ソース</span>
                      <SortIcons active={sortConfig?.key === 'leadSource' ? sortConfig.direction : undefined} />
                    </span>
                    <div className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize z-20" onMouseDown={(e) => handleResizeStart('leadSource', e)} style={{ transform: 'translateX(50%)' }} />
                  </th>
                  {/* 会社名 */}
                  <th 
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                    style={{ width: columnWidths.companyName, minWidth: 20 }}
                    onClick={() => {
                      setSortConfig(prev => {
                        const isSame = prev?.key === 'companyName'
                        const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                        return { key: 'companyName', direction: nextDirection }
                      })
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      <span>会社名</span>
                      <SortIcons active={sortConfig?.key === 'companyName' ? sortConfig.direction : undefined} />
                    </span>
                    <div className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize z-20" onMouseDown={(e) => handleResizeStart('companyName', e)} style={{ transform: 'translateX(50%)' }} />
                  </th>
                  {/* 氏名 */}
                  <th 
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
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
                    <div className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize z-20" onMouseDown={(e) => handleResizeStart('contactName', e)} style={{ transform: 'translateX(50%)' }} />
                  </th>
                  {/* 担当FS */}
                  <th 
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                    style={{ width: columnWidths.dealStaffFS, minWidth: 20 }}
                    onClick={() => {
                      setSortConfig(prev => {
                        const isSame = prev?.key === 'dealStaffFS'
                        const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                        return { key: 'dealStaffFS', direction: nextDirection }
                      })
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      <span>担当FS</span>
                      <SortIcons active={sortConfig?.key === 'dealStaffFS' ? sortConfig.direction : undefined} />
                    </span>
                    <div className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize z-20" onMouseDown={(e) => handleResizeStart('dealStaffFS', e)} style={{ transform: 'translateX(50%)' }} />
                  </th>
                  {/* 商談結果 */}
                  <th 
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                    style={{ width: columnWidths.result, minWidth: 20 }}
                    onClick={() => {
                      setSortConfig(prev => {
                        const isSame = prev?.key === 'result'
                        const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                        return { key: 'result', direction: nextDirection }
                      })
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      <span>商談結果</span>
                      <SortIcons active={sortConfig?.key === 'result' ? sortConfig.direction : undefined} />
                    </span>
                    <div className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize z-20" onMouseDown={(e) => handleResizeStart('result', e)} style={{ transform: 'translateX(50%)' }} />
                  </th>
                  {/* 確定日 */}
                  <th 
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300 cursor-pointer hover:bg-gray-50"
                    style={{ width: columnWidths.resultDate, minWidth: 20 }}
                    onClick={() => {
                      setSortConfig(prev => {
                        const isSame = prev?.key === 'resultDate'
                        const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                        return { key: 'resultDate', direction: nextDirection }
                      })
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      <span>確定日</span>
                      <SortIcons active={sortConfig?.key === 'resultDate' ? sortConfig.direction : undefined} />
                    </span>
                    <div className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize z-20" onMouseDown={(e) => handleResizeStart('resultDate', e)} style={{ transform: 'translateX(50%)' }} />
                  </th>
                  {/* 契約締結 ☑ */}
                  <th 
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300"
                    style={{ width: columnWidths.contractSigned, minWidth: 20 }}
                  >
                    <span>契約<br/>締結</span>
                  </th>
                  {/* 決済書類 ☑ */}
                  <th 
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-300"
                    style={{ width: columnWidths.paymentDocCompleted, minWidth: 20 }}
                  >
                    <span>決済<br/>書類</span>
                  </th>
                  {/* 入金確認 ☑ */}
                  <th 
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none"
                    style={{ width: columnWidths.paymentConfirmed, minWidth: 20 }}
                  >
                    <span>入金<br/>確認</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={`loading-${i}`}>
                      {[...Array(11)].map((_, j) => (
                        <td key={`loading-${i}-${j}`} className="px-3 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : contracts.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                      成約データがありません
                    </td>
                  </tr>
                ) : (
                  sortedContracts.map((contract, index) => {
                    const dealId = (contract as any).dealId || contract.id || ''
                    const status = workflowStatus[dealId] || { contractSigned: false, paymentDocCompleted: false, paymentConfirmed: false }
                    
                    // 結果表示用のラベル
                    const resultLabel = contract.result === '01.成約（契約締結）' ? '成約' : contract.result || '-'
                    
                    // 日付フォーマット（MM/DD形式）
                    const formatDate = (dateStr?: string) => {
                      if (!dateStr) return '-'
                      const d = new Date(dateStr)
                      if (isNaN(d.getTime())) return dateStr
                      return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
                    }
                    
                    return (
                      <tr 
                        key={dealId || `contract-${index}`}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td 
                          className="px-3 py-3 text-sm font-medium text-primary-600" 
                          style={{ width: columnWidths.dealId, minWidth: 20 }}
                          onClick={() => handleRowClick(contract)}
                        >
                          {dealId}
                        </td>
                        <td 
                          className="px-3 py-3 text-sm text-gray-900" 
                          style={{ width: columnWidths.service, minWidth: 20 }}
                          onClick={() => handleRowClick(contract)}
                        >
                          {contract.service}
                        </td>
                        <td 
                          className="px-3 py-3 text-sm text-gray-500" 
                          style={{ width: columnWidths.leadSource, minWidth: 20 }}
                          onClick={() => handleRowClick(contract)}
                        >
                          {contract.leadSource}
                        </td>
                        <td 
                          className="px-3 py-3 text-sm text-gray-900" 
                          style={{ width: columnWidths.companyName, minWidth: 20 }}
                          onClick={() => handleRowClick(contract)}
                        >
                          {contract.companyName}
                        </td>
                        <td 
                          className="px-3 py-3 text-sm text-gray-900" 
                          style={{ width: columnWidths.contactName, minWidth: 20 }}
                          onClick={() => handleRowClick(contract)}
                        >
                          {contract.contactName}
                        </td>
                        <td 
                          className="px-3 py-3 text-sm text-gray-500" 
                          style={{ width: columnWidths.dealStaffFS, minWidth: 20 }}
                          onClick={() => handleRowClick(contract)}
                        >
                          {(contract as any).dealStaffFS || contract.staffIS || '-'}
                        </td>
                        <td 
                          className="px-3 py-3 text-sm" 
                          style={{ width: columnWidths.result, minWidth: 20 }}
                          onClick={() => handleRowClick(contract)}
                        >
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            {resultLabel}
                          </span>
                        </td>
                        <td 
                          className="px-3 py-3 text-sm text-gray-500" 
                          style={{ width: columnWidths.resultDate, minWidth: 20 }}
                          onClick={() => handleRowClick(contract)}
                        >
                          {formatDate(contract.resultDate)}
                        </td>
                        {/* 契約締結チェックボックス */}
                        <td 
                          className="px-2 py-3 text-center" 
                          style={{ width: columnWidths.contractSigned, minWidth: 20 }}
                        >
                          <input
                            type="checkbox"
                            checked={status.contractSigned}
                            onChange={(e) => {
                              e.stopPropagation()
                              setWorkflowStatus(prev => ({
                                ...prev,
                                [dealId]: { ...status, contractSigned: e.target.checked }
                              }))
                              // 即時保存（将来的にはAPI呼び出し）
                              // updateMutation.mutate({ dealId, updates: { contractSigned: e.target.checked } })
                            }}
                            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                          />
                        </td>
                        {/* 決済書類チェックボックス */}
                        <td 
                          className="px-2 py-3 text-center" 
                          style={{ width: columnWidths.paymentDocCompleted, minWidth: 20 }}
                        >
                          <input
                            type="checkbox"
                            checked={status.paymentDocCompleted}
                            onChange={(e) => {
                              e.stopPropagation()
                              setWorkflowStatus(prev => ({
                                ...prev,
                                [dealId]: { ...status, paymentDocCompleted: e.target.checked }
                              }))
                            }}
                            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                          />
                        </td>
                        {/* 入金確認チェックボックス */}
                        <td 
                          className="px-2 py-3 text-center" 
                          style={{ width: columnWidths.paymentConfirmed, minWidth: 20 }}
                        >
                          <input
                            type="checkbox"
                            checked={status.paymentConfirmed}
                            onChange={(e) => {
                              e.stopPropagation()
                              setWorkflowStatus(prev => ({
                                ...prev,
                                [dealId]: { ...status, paymentConfirmed: e.target.checked }
                              }))
                            }}
                            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                          />
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

      {/* サービス種別に応じた詳細パネルを表示 */}
      {isPanelOpen && selectedContract && (() => {
        const serviceType = getServiceType(selectedContract.service)
        const currentDealId = (selectedContract as any).dealId || selectedContract.id || ''
        const saveState: SaveState =
          saveUi.savingDealId === currentDealId
            ? 'saving'
            : saveUi.savedDealId === currentDealId
              ? 'saved'
              : saveUi.errorDealId === currentDealId
                ? 'error'
                : 'idle'
        switch (serviceType) {
          case 'finance':
            return (
              <FinanceContractDetailPanel
                contract={selectedContract}
                onClose={handlePanelClose}
                onSave={handlePanelSave}
                isSaving={updateMutation.isPending}
                saveState={saveState}
                saveError={saveUi.errorMessage}
                onDirty={handlePanelDirty}
              />
            )
          case 'marketing':
            return (
              <MarketingContractDetailPanel
                contract={selectedContract}
                onClose={handlePanelClose}
                onSave={handlePanelSave}
                isSaving={updateMutation.isPending}
                saveState={saveState}
                saveError={saveUi.errorMessage}
                onDirty={handlePanelDirty}
              />
            )
          default:
            return (
              <ContractDetailPanel
                contract={selectedContract}
                onClose={handlePanelClose}
                onSave={handlePanelSave}
                isSaving={updateMutation.isPending}
                saveState={saveState}
                saveError={saveUi.errorMessage}
                onDirty={handlePanelDirty}
              />
            )
        }
      })()}
    </div>
  )
}







