'use client'

import { useState, useEffect } from 'react'
import { CallListCondition, LeadSource } from '@/types/sfa'
import { DateRangeFilter, DateRange } from 'redish_shared_components'
import { getDropdownOptions, refreshDropdownSettingsFromDB } from '@/lib/dropdownSettings'

const LEAD_SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: 'Meetsmore', label: 'Meetsmore' },
  { value: 'TEMPOS', label: 'TEMPOS' },
  { value: 'OMC', label: 'OMC' },
  { value: 'Amazon', label: 'Amazon' },
  { value: 'Makuake', label: 'Makuake' },
  { value: 'REDISH', label: 'REDISH' },
]

interface CallListCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (conditions: CallListCondition, name: string, isShared: boolean, staffIS?: string | null) => Promise<void>
}

export function CallListCreateModal({ isOpen, onClose, onCreate }: CallListCreateModalProps) {
  const [listName, setListName] = useState('')
  const [conditions, setConditions] = useState<CallListCondition>({
    newLeads: true, // 新規リードはデフォルトで有効（必須）
    noConnectionLeads: false,
    recallLeads: false,
    recycleLeads: false,
    manualSelection: false,
    preventDuplication: true,
    isShared: false,
  })
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [selectedLeadSources, setSelectedLeadSources] = useState<LeadSource[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedStaffIS, setSelectedStaffIS] = useState<string[]>([])
  const [staffOptions, setStaffOptions] = useState(getDropdownOptions('staffIS'))
  const [isCreating, setIsCreating] = useState(false)

  const getLastSelectedStaffIS = (): string | null => {
    try {
      const v = window.localStorage.getItem('calls.callListStaffIS')
      return v && v.trim() ? v : null
    } catch {
      return null
    }
  }

  const setLastSelectedStaffIS = (value: string | null) => {
    try {
      if (!value) {
        window.localStorage.removeItem('calls.callListStaffIS')
      } else {
        window.localStorage.setItem('calls.callListStaffIS', value)
      }
    } catch {
      // noop
    }
  }

  useEffect(() => {
    if (isOpen) {
      // モーダルを開いた時に、デフォルトのリスト名を設定（今日の日付）
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
      setListName(`${dateStr}_架電リスト`)
      
      // 条件をリセット
      setConditions({
        newLeads: true,
        noConnectionLeads: false,
        recallLeads: false,
        recycleLeads: false,
        manualSelection: false,
        preventDuplication: true,
        isShared: false,
      })
      setDateRange(null)
      setSelectedLeadSources([])
      setSelectedIndustries([])
      // 担当ISは「前回選択した担当者」をデフォルト（なければ未選択）
      const last = getLastSelectedStaffIS()
      setSelectedStaffIS(last ? [last] : [])

      // settingsページを開いていなくても最新の担当ISを反映（DB→localStorage同期）
      refreshDropdownSettingsFromDB().then((latest) => {
        const nextOptions = latest.staffIS || []
        setStaffOptions(nextOptions)
        // 選択中の担当が候補に無い場合はクリア（保存値が古いケース）
        setSelectedStaffIS((prev) => {
          const current = prev[0]
          if (current && nextOptions.some((o) => o.value === current)) return prev
          const last2 = getLastSelectedStaffIS()
          if (last2 && nextOptions.some((o) => o.value === last2)) return [last2]
          return []
        })
      })
    }
  }, [isOpen])

  useEffect(() => {
    const handleStorageChange = () => {
      setStaffOptions(getDropdownOptions('staffIS'))
    }
    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(handleStorageChange, 1000)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!listName.trim()) {
      alert('リスト名を入力してください')
      return
    }
    if (selectedStaffIS.length === 0) {
      alert('担当ISを選択してください')
      return
    }

    setIsCreating(true)
    try {
      const staffISValue = selectedStaffIS.length > 0 ? selectedStaffIS[0] : null
      // 次回のデフォルト用に保持
      setLastSelectedStaffIS(staffISValue)
      const finalConditions: CallListCondition = {
        ...conditions,
        dateRange: dateRange ? { start: dateRange.start, end: dateRange.end } : undefined,
        leadSources: selectedLeadSources.length > 0 ? selectedLeadSources : undefined,
        staffIS: selectedStaffIS.length > 0 ? selectedStaffIS : undefined,
        industries: selectedIndustries.length > 0 ? selectedIndustries : undefined,
      }
      
      await onCreate(finalConditions, listName.trim(), conditions.isShared || false, staffISValue)
      onClose()
    } catch (error) {
      console.error('架電リストの作成に失敗しました:', error)
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : '架電リストの作成に失敗しました'
      alert(message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">本日の架電リスト作成</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="閉じる"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* リスト名 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                リスト名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="input w-full"
                placeholder="例: 2026-01-10_新規リード"
                required
              />
            </div>

            {/* 基本条件 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                基本条件
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={conditions.newLeads || false}
                    onChange={(e) => setConditions({ ...conditions, newLeads: e.target.checked })}
                    className="mr-2"
                    disabled // 新規リードは必須のため無効化
                  />
                  <span className="text-sm text-gray-700">
                    新規リード（未架電）<span className="text-red-500 ml-1">*必須</span>
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={conditions.noConnectionLeads || false}
                    onChange={(e) => setConditions({ ...conditions, noConnectionLeads: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">不通リード</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={conditions.recallLeads || false}
                    onChange={(e) => setConditions({ ...conditions, recallLeads: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">再架電対象リード</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={conditions.recycleLeads || false}
                    onChange={(e) => setConditions({ ...conditions, recycleLeads: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">リサイクル対象リード</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={conditions.manualSelection || false}
                    onChange={(e) => setConditions({ ...conditions, manualSelection: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">その他個別で選択したリード</span>
                </label>
              </div>
            </div>

            {/* 追加条件 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                追加条件（オプション）
              </label>
              
              {/* 連携日の範囲 */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">連携日の範囲</label>
                <DateRangeFilter
                  defaultPreset={undefined}
                  onChange={setDateRange}
                />
              </div>

              {/* リードソース */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">リードソース</label>
                <div className="grid grid-cols-2 gap-2">
                  {LEAD_SOURCE_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedLeadSources.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeadSources([...selectedLeadSources, option.value])
                          } else {
                            setSelectedLeadSources(selectedLeadSources.filter(s => s !== option.value))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 担当IS */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">担当IS</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {staffOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedStaffIS.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // 運用: 架電リスト作成時の担当は「1名」に固定（一覧/詳細へ自動入力するため）
                            setSelectedStaffIS([option.value])
                          } else {
                            setSelectedStaffIS([])
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  選択した担当ISは、リスト作成時に対象リードへ自動入力されます。
                </div>
              </div>
            </div>

            {/* 重複防止設定 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                重複防止設定
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="listMode"
                    checked={!conditions.isShared}
                    onChange={() => setConditions({ ...conditions, isShared: false })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">個人リストモード（担当者ごとにリストを分ける）</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="listMode"
                    checked={conditions.isShared || false}
                    onChange={() => setConditions({ ...conditions, isShared: true })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">共有リストモード（全員で共有、重複チェックあり）</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={conditions.preventDuplication || false}
                    onChange={(e) => setConditions({ ...conditions, preventDuplication: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">重複防止を有効にする</span>
                </label>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isCreating}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isCreating}
              >
                {isCreating ? '作成中...' : 'リストを作成'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
