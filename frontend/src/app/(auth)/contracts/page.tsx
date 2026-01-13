'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Deal } from '@/types/sfa'
import { ContractDetailPanel } from '@/components/contracts/ContractDetailPanel'
import { DateRangeFilter, DateRange } from '@redish/shared'

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

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [selectedContract, setSelectedContract] = useState<Deal | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    dealId: 100,
    service: 120,
    leadSource: 100,
    companyName: 150,
    contactName: 120,
    staff: 100,
    dealExecutionDate: 140,
    resultDate: 140,
  })
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const response = await fetch('/api/deals')
      if (!response.ok) throw new Error('Failed to fetch deals')
      return response.json()
    },
    select: (data) => ({
      ...data,
      data: data.data?.filter((deal: Deal) => deal.result === '01.成約（契約締結）') || []
    })
  })

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
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
  }

  const handlePanelClose = () => {
    setIsPanelOpen(false)
    setSelectedContract(null)
  }

  const handlePanelSave = (updates: Partial<Deal>) => {
    if (selectedContract) {
      const dealId = (selectedContract as any).dealId || selectedContract.id
      updateMutation.mutate({ dealId, updates })
      handlePanelClose()
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

  const totalContracts = contracts.length
  const thisMonthContracts = contracts.filter(c => {
    if (!c.resultDate) return false
    const now = new Date()
    const resultDate = new Date(c.resultDate)
    return resultDate.getMonth() === now.getMonth() && resultDate.getFullYear() === now.getFullYear()
  }).length
  const foodContracts = contracts.filter(c => c.category === 'A:飲食').length
  const nonFoodContracts = contracts.filter(c => c.category === 'B:非飲食').length

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 bg-white pb-4 border-b border-gray-200 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">成約管理</h1>
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

        {/* 統計カード（フィルタ開閉の対象外） */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="card p-6">
            <p className="text-sm text-gray-500">総成約数</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {isLoading ? '-' : totalContracts}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-500">今月の成約</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {isLoading ? '-' : thisMonthContracts}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-500">飲食 / 非飲食</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {isLoading ? '-' : (
                <span>
                  <span style={{ color: '#0083a0' }}>{foodContracts}</span>
                  {' / '}
                  <span className="text-gray-600">{nonFoodContracts}</span>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-240px)]">
            <table className="divide-y divide-gray-200" style={{ width: 'max-content', minWidth: '100%' }}>
              <thead className="bg-gray-100 sticky top-0 z-20 shadow-sm">
                <tr>
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400 cursor-pointer hover:bg-gray-50"
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
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('dealId', e)}
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
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('companyName', e)}
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
                    style={{ width: columnWidths.staff, minWidth: 20 }}
                    onClick={() => {
                      setSortConfig(prev => {
                        const isSame = prev?.key === 'staff'
                        const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                        return { key: 'staff', direction: nextDirection }
                      })
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      <span>担当</span>
                      <SortIcons active={sortConfig?.key === 'staff' ? sortConfig.direction : undefined} />
                    </span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('staff', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400 cursor-pointer hover:bg-gray-50"
                    style={{ width: columnWidths.dealExecutionDate, minWidth: 20 }}
                    onClick={() => {
                      setSortConfig(prev => {
                        const isSame = prev?.key === 'dealExecutionDate'
                        const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                        return { key: 'dealExecutionDate', direction: nextDirection }
                      })
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      <span>商談実施日</span>
                      <SortIcons active={sortConfig?.key === 'dealExecutionDate' ? sortConfig.direction : undefined} />
                    </span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('dealExecutionDate', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none cursor-pointer hover:bg-gray-50"
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
                      <span>結果確定日</span>
                      <SortIcons active={sortConfig?.key === 'resultDate' ? sortConfig.direction : undefined} />
                    </span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('resultDate', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={`loading-${i}`}>
                      {[...Array(8)].map((_, j) => (
                        <td key={`loading-${i}-${j}`} className="px-4 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : contracts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      成約データがありません
                    </td>
                  </tr>
                ) : (
                  sortedContracts.map((contract, index) => {
                    const dealId = (contract as any).dealId || contract.id || ''
                    return (
                      <tr 
                        key={dealId || `contract-${index}`}
                        onClick={() => handleRowClick(contract)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-gray-900" style={{ width: columnWidths.dealId, minWidth: 20 }}>
                          {dealId}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900" style={{ width: columnWidths.service, minWidth: 20 }}>
                          {contract.service}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.leadSource, minWidth: 20 }}>
                          {contract.leadSource}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900" style={{ width: columnWidths.companyName, minWidth: 20 }}>
                          {contract.companyName}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.contactName, minWidth: 20 }}>
                          {contract.contactName}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.staff, minWidth: 20 }}>
                          {contract.staffIS}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.dealExecutionDate, minWidth: 20 }}>
                          {contract.dealExecutionDate || '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.resultDate, minWidth: 20 }}>
                          {contract.resultDate || '-'}
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

      {isPanelOpen && selectedContract && (
        <ContractDetailPanel
          contract={selectedContract}
          onClose={handlePanelClose}
          onSave={handlePanelSave}
          isSaving={updateMutation.isPending}
        />
      )}
    </div>
  )
}







