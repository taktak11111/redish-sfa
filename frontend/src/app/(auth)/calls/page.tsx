'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CallRecord, CallStatus } from '@/types/sfa'
import { CallDetailPanel } from '@/components/calls/CallDetailPanel'
import { DateRangeFilter, DateRange } from '@/components/shared/DateRangeFilter'

const STATUS_OPTIONS: { value: CallStatus; label: string; color: string }[] = [
  { value: '未架電', label: '未架電', color: 'badge-gray' },
  { value: '架電中', label: '架電中', color: 'badge-info' },
  { value: '03.アポイント獲得済', label: 'アポイント獲得済', color: 'badge-success' },
  { value: '09.アポ獲得', label: 'アポ獲得', color: 'badge-success' },
  { value: '04.アポなし', label: 'アポなし', color: 'badge-danger' },
]

export default function CallsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<CallRecord | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    linkedDate: 120,
    leadSource: 100,
    companyName: 200,
    contactName: 120,
    contactNameKana: 120,
    industry: 120,
    phone: 140,
    openingDate: 120,
    contactPreferredDateTime: 150,
    allianceRemarks: 200,
  })
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['calls'],
    queryFn: async () => {
      const response = await fetch('/api/calls')
      if (!response.ok) throw new Error('Failed to fetch calls')
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
      if (!response.ok) throw new Error('Failed to update call')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] })
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
    const matchesSearch = searchTerm === '' || 
      record.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.phone.includes(searchTerm) ||
      record.leadId.toLowerCase().includes(searchTerm.toLowerCase())
    
    // 期間フィルタ
    let matchesDateRange = true
    if (dateRange && record.linkedDate) {
      const recordDate = new Date(record.linkedDate)
      recordDate.setHours(0, 0, 0, 0)
      matchesDateRange = recordDate >= dateRange.start && recordDate <= dateRange.end
    }
    
    return matchesStatus && matchesSearch && matchesDateRange
  })

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
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">架電管理</h1>
          <p className="mt-1 text-sm text-gray-500">リードへの架電状況を管理します</p>
        </div>

        <div className="card p-4 mb-4">
          <div className="mb-4 flex justify-end">
            <DateRangeFilter
              defaultPreset="thisMonth"
              onChange={setDateRange}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="会社名、担当者名、電話番号、リードIDで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input"
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
      </div>

      <div className="mt-6">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="divide-y divide-gray-200" style={{ width: 'max-content', minWidth: '100%' }}>
              <thead className="bg-gray-100">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.linkedDate, minWidth: 20 }}
                  >
                    <span>連携日</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('linkedDate', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.leadSource, minWidth: 20 }}
                  >
                    <span>リードソース</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('leadSource', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.companyName, minWidth: 20 }}
                  >
                    <span>会社名</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('companyName', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.contactName, minWidth: 20 }}
                  >
                    <span>氏名</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('contactName', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.contactNameKana, minWidth: 20 }}
                  >
                    <span>ふりがな</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('contactNameKana', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.industry, minWidth: 20 }}
                  >
                    <span>業種</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('industry', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.phone, minWidth: 20 }}
                  >
                    <span>電話番号</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('phone', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.openingDate, minWidth: 20 }}
                  >
                    <span>開業時期</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('openingDate', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.contactPreferredDateTime, minWidth: 20 }}
                  >
                    <span>連絡希望日時</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('contactPreferredDateTime', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none"
                    style={{ width: columnWidths.allianceRemarks, minWidth: 20 }}
                  >
                    <span>連携元備考</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('allianceRemarks', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={`loading-${i}`}>
                      {[...Array(10)].map((_, j) => (
                        <td key={`loading-${i}-${j}`} className="px-4 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      架電データがありません
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record, index) => (
                    <tr 
                      key={record.leadId || `call-${index}`}
                      onClick={() => handleRowClick(record)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.linkedDate, minWidth: 20 }}>
                        {record.linkedDate || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.leadSource, minWidth: 20 }}>
                        {record.leadSource}
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
                      <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.openingDate, minWidth: 20 }}>
                        {record.openingDate || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.contactPreferredDateTime, minWidth: 20 }}>
                        {record.contactPreferredDateTime || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.allianceRemarks, minWidth: 20 }}>
                        {record.allianceRemarks || '-'}
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
        <CallDetailPanel
          record={selectedRecord}
          onClose={handlePanelClose}
          onSave={handlePanelSave}
          isSaving={updateMutation.isPending}
        />
      )}
    </div>
  )
}







