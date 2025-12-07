'use client'

import { useState, useEffect } from 'react'
import { CallHistory, CallHistoryStatus } from '@/types/sfa'
import { getDropdownOptions } from '@/lib/dropdownSettings'

const HISTORY_STATUS_OPTIONS: { value: CallHistoryStatus; label: string }[] = [
  { value: '不通', label: '不通' },
  { value: '通話できた', label: '通話できた' },
  { value: '再架電依頼', label: '再架電依頼' },
  { value: 'アポ獲得', label: 'アポ獲得' },
  { value: '不在', label: '不在' },
  { value: '拒否', label: '拒否' },
  { value: 'その他', label: 'その他' },
]

interface CallHistoryModalProps {
  isOpen: boolean
  history: CallHistory | null
  onClose: () => void
  onSave: (history: Omit<CallHistory, 'id' | 'createdAt'>) => void
}

export function CallHistoryModal({ isOpen, history, onClose, onSave }: CallHistoryModalProps) {
  const [formData, setFormData] = useState({
    callDate: '',
    callTime: '',
    staffIS: '',
    status: '不通' as CallHistoryStatus,
    result: '',
    duration: '',
    memo: '',
  })
  const [staffOptions, setStaffOptions] = useState(getDropdownOptions('staffIS'))

  useEffect(() => {
    if (history) {
      setFormData({
        callDate: history.callDate,
        callTime: history.callTime || '',
        staffIS: history.staffIS,
        status: history.status,
        result: history.result || '',
        duration: history.duration ? String(Math.floor(history.duration / 60)) : '',
        memo: history.memo || '',
      })
    } else {
      // 新規追加時は今日の日付をデフォルトに
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        callDate: today,
        callTime: '',
        staffIS: '',
        status: '不通' as CallHistoryStatus,
        result: '',
        duration: '',
        memo: '',
      })
    }
  }, [history, isOpen])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      callDate: formData.callDate,
      callTime: formData.callTime || undefined,
      staffIS: formData.staffIS,
      status: formData.status,
      result: formData.result || undefined,
      duration: formData.duration ? parseInt(formData.duration) * 60 : undefined,
      memo: formData.memo || undefined,
    })
    onClose()
  }

  const getStatusBadgeColor = (status: CallHistoryStatus) => {
    switch (status) {
      case '通話できた':
      case 'アポ獲得':
        return 'bg-green-100 text-green-800'
      case '再架電依頼':
        return 'bg-blue-100 text-blue-800'
      case '不在':
        return 'bg-yellow-100 text-yellow-800'
      case '拒否':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {history ? '架電履歴を編集' : '架電履歴を追加'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="閉じる"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="label">架電日</label>
              <input
                type="date"
                value={formData.callDate}
                onChange={(e) => setFormData({ ...formData, callDate: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">架電時刻（オプション）</label>
              <input
                type="time"
                value={formData.callTime}
                onChange={(e) => setFormData({ ...formData, callTime: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">担当IS</label>
              <select
                value={formData.staffIS}
                onChange={(e) => setFormData({ ...formData, staffIS: e.target.value })}
                className="input"
                required
              >
                <option value="">選択してください</option>
                {staffOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">状況</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CallHistoryStatus })}
                className="input"
                required
              >
                {HISTORY_STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {(formData.status === '通話できた' || formData.status === 'アポ獲得') && (
              <div>
                <label className="label">通話時間（分）</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="input"
                  min="0"
                  placeholder="例: 5"
                />
              </div>
            )}
            <div>
              <label className="label">結果・メモ</label>
              <textarea
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                className="input"
                rows={4}
                placeholder="架電の結果やメモを入力してください"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
