'use client'

import { useState, useEffect } from 'react'
import { CallRecord, CallStatus, CallHistory, CallHistoryStatus } from '@/types/sfa'
import { getDropdownOptions } from '@/lib/dropdownSettings'
import { CallHistoryModal } from './CallHistoryModal'

const STATUS_OPTIONS: { value: CallStatus; label: string }[] = [
  { value: '未架電', label: '未架電' },
  { value: '架電中', label: '架電中' },
  { value: '03.アポイント獲得済', label: 'アポイント獲得済' },
  { value: '09.アポ獲得', label: 'アポ獲得' },
  { value: '04.アポなし', label: 'アポなし' },
]

interface CallDetailPanelProps {
  record: CallRecord
  onClose: () => void
  onSave: (updates: Partial<CallRecord>) => void
  isSaving: boolean
}

export function CallDetailPanel({ record, onClose, onSave, isSaving }: CallDetailPanelProps) {
  const [formData, setFormData] = useState<Partial<CallRecord>>(record)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    alliance: true,
    call: true,
    callHistory: true,
    action: true,
    deal: true,
  })
  const [showRecyclePriorityModal, setShowRecyclePriorityModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [editingHistory, setEditingHistory] = useState<CallHistory | null>(null)
  const [dropdownSettings, setDropdownSettings] = useState({
    staffIS: getDropdownOptions('staffIS'),
    statusIS: getDropdownOptions('statusIS'),
    cannotContactReason: getDropdownOptions('cannotContactReason'),
    recyclePriority: getDropdownOptions('recyclePriority'),
    resultContactStatus: getDropdownOptions('resultContactStatus'),
    actionOutsideCall: getDropdownOptions('actionOutsideCall'),
    nextActionContent: getDropdownOptions('nextActionContent'),
    nextActionSupplement: getDropdownOptions('nextActionSupplement'),
    nextActionCompleted: getDropdownOptions('nextActionCompleted'),
    dealStaffFS: getDropdownOptions('dealStaffFS'),
    dealResult: getDropdownOptions('dealResult'),
    lostReasonFS: getDropdownOptions('lostReasonFS'),
  })

  useEffect(() => {
    setFormData(record)
  }, [record])

  useEffect(() => {
    const handleStorageChange = () => {
      setDropdownSettings({
        staffIS: getDropdownOptions('staffIS'),
        statusIS: getDropdownOptions('statusIS'),
        cannotContactReason: getDropdownOptions('cannotContactReason'),
        recyclePriority: getDropdownOptions('recyclePriority'),
        resultContactStatus: getDropdownOptions('resultContactStatus'),
        actionOutsideCall: getDropdownOptions('actionOutsideCall'),
        nextActionContent: getDropdownOptions('nextActionContent'),
        nextActionSupplement: getDropdownOptions('nextActionSupplement'),
        nextActionCompleted: getDropdownOptions('nextActionCompleted'),
        dealStaffFS: getDropdownOptions('dealStaffFS'),
        dealResult: getDropdownOptions('dealResult'),
        lostReasonFS: getDropdownOptions('lostReasonFS'),
      })
    }
    
    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(handleStorageChange, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // CallRecord の任意フィールドを柔軟に更新できるユーティリティ
  const handleChange = <K extends keyof CallRecord>(field: K, value: CallRecord[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleAddHistory = () => {
    setEditingHistory(null)
    setShowHistoryModal(true)
  }

  const handleEditHistory = (history: CallHistory) => {
    setEditingHistory(history)
    setShowHistoryModal(true)
  }

  const handleDeleteHistory = (historyId: string) => {
    if (confirm('この架電履歴を削除してもよろしいですか？')) {
      const updatedHistory = (formData.callHistory || []).filter(h => h.id !== historyId)
      const updatedCallCount = Math.max(0, (formData.callCount || 0) - 1)
      
      let updatedLastCalledDate = formData.lastCalledDate
      if (updatedHistory.length > 0) {
        const sortedHistory = [...updatedHistory].sort((a, b) => 
          new Date(b.callDate).getTime() - new Date(a.callDate).getTime()
        )
        updatedLastCalledDate = sortedHistory[0].callDate
      } else {
        updatedLastCalledDate = undefined
      }

      handleChange('callHistory', updatedHistory)
      handleChange('callCount', updatedCallCount)
      handleChange('lastCalledDate', updatedLastCalledDate)
    }
  }

  const handleSaveHistory = (historyData: Omit<CallHistory, 'id' | 'createdAt'>) => {
    const now = new Date()
    let updatedHistory: CallHistory[]

    if (editingHistory) {
      updatedHistory = (formData.callHistory || []).map(h =>
        h.id === editingHistory.id
          ? { ...historyData, id: h.id, createdAt: h.createdAt }
          : h
      )
    } else {
      const newHistory: CallHistory = {
        ...historyData,
        id: `ch_${now.getTime()}`,
        createdAt: now,
      }
      updatedHistory = [...(formData.callHistory || []), newHistory]
      handleChange('callCount', (formData.callCount || 0) + 1)
    }

    const sortedHistory = [...updatedHistory].sort((a, b) =>
      new Date(b.callDate).getTime() - new Date(a.callDate).getTime()
    )
    const latestCallDate = sortedHistory[0]?.callDate

    handleChange('callHistory', updatedHistory)
    if (latestCallDate) {
      handleChange('lastCalledDate', latestCallDate)
    }
  }

  const getStatusBadgeClass = (status: CallHistoryStatus) => {
    switch (status) {
      case '通話できた':
      case 'アポ獲得':
        return 'badge-success'
      case '再架電依頼':
        return 'badge-info'
      case '不在':
        return 'badge-warning'
      case '拒否':
        return 'badge-danger'
      default:
        return 'badge-gray'
    }
  }

  const formatCallDateTime = (date: string, time?: string) => {
    const d = new Date(date)
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`
    return time ? `${dateStr} ${time}` : dateStr
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        style={{ animation: 'fadeIn 0.3s ease-out' }}
        onClick={onClose}
      />
      
      <div 
        className="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 overflow-y-auto"
        style={{ 
          width: 'min(600px, 50vw)',
          animation: 'slideInRight 0.3s ease-out',
        }}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">架電詳細</h2>
            <p className="text-sm text-gray-500 mt-1">{record.leadId}</p>
          </div>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <section>
            <button
              type="button"
              onClick={() => toggleSection('basic')}
              className="w-full text-left flex items-center justify-between text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300 bg-gray-100 hover:bg-gray-200 -mx-6 px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <span>基本情報</span>
              <svg
                className={`w-6 h-6 text-gray-700 transition-transform duration-200 ${expandedSections.basic ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {expandedSections.basic && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label">リードID</label>
                <input type="text" value={formData.leadId || ''} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="label">リードソース</label>
                <input type="text" value={formData.leadSource || ''} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="label">連携日</label>
                <input 
                  type="date" 
                  value={formData.linkedDate || ''} 
                  onChange={(e) => handleChange('linkedDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">業種</label>
                <input 
                  type="text" 
                  value={formData.industry || ''} 
                  onChange={(e) => handleChange('industry', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">会社名/店舗名</label>
                <input 
                  type="text" 
                  value={formData.companyName || ''} 
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">氏名</label>
                <input 
                  type="text" 
                  value={formData.contactName || ''} 
                  onChange={(e) => handleChange('contactName', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">ふりがな</label>
                <input 
                  type="text" 
                  value={formData.contactNameKana || ''} 
                  onChange={(e) => handleChange('contactNameKana', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">電話番号</label>
                <input 
                  type="tel" 
                  value={formData.phone || ''} 
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">メールアドレス</label>
                <input 
                  type="email" 
                  value={formData.email || ''} 
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">住所／エリア</label>
                <input 
                  type="text" 
                  value={formData.address || ''} 
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">開業時期</label>
                <input 
                  type="text" 
                  value={formData.openingDate || ''} 
                  onChange={(e) => handleChange('openingDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">連絡希望日時</label>
                <input 
                  type="text" 
                  value={formData.contactPreferredDateTime || ''} 
                  onChange={(e) => handleChange('contactPreferredDateTime', e.target.value)}
                  className="input"
                />
              </div>
            </div>
            )}
          </section>

          <section>
            <button
              type="button"
              onClick={() => toggleSection('alliance')}
              className="w-full text-left flex items-center justify-between text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300 bg-gray-100 hover:bg-gray-200 -mx-6 px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <span>連携元情報</span>
              <svg
                className={`w-6 h-6 text-gray-700 transition-transform duration-200 ${expandedSections.alliance ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {expandedSections.alliance && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label">連携元備考</label>
                <textarea 
                  value={formData.allianceRemarks || ''} 
                  onChange={(e) => handleChange('allianceRemarks', e.target.value)}
                  className="input"
                  rows={3}
                />
              </div>
              <div>
                <label className="label">OMC追加情報①</label>
                <input 
                  type="text" 
                  value={formData.omcAdditionalInfo1 || ''} 
                  onChange={(e) => handleChange('omcAdditionalInfo1', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">⓶自己資金</label>
                <input 
                  type="text" 
                  value={formData.omcSelfFunds || ''} 
                  onChange={(e) => handleChange('omcSelfFunds', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">⓷物件状況</label>
                <input 
                  type="text" 
                  value={formData.omcPropertyStatus || ''} 
                  onChange={(e) => handleChange('omcPropertyStatus', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Amazon税理士有無</label>
                <input 
                  type="text" 
                  value={formData.amazonTaxAccountant || ''} 
                  onChange={(e) => handleChange('amazonTaxAccountant', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Meetsmoreリンク</label>
                <input 
                  type="text" 
                  value={formData.meetsmoreLink || ''} 
                  onChange={(e) => handleChange('meetsmoreLink', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Meetsmore法人・個人</label>
                <input 
                  type="text" 
                  value={formData.meetsmoreEntityType || ''} 
                  onChange={(e) => handleChange('meetsmoreEntityType', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">MakuakePJT page</label>
                <input 
                  type="text" 
                  value={formData.makuakePjtPage || ''} 
                  onChange={(e) => handleChange('makuakePjtPage', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Makuake実行者page</label>
                <input 
                  type="text" 
                  value={formData.makuakeExecutorPage || ''} 
                  onChange={(e) => handleChange('makuakeExecutorPage', e.target.value)}
                  className="input"
                />
              </div>
            </div>
            )}
          </section>

          <section>
            <button
              type="button"
              onClick={() => toggleSection('call')}
              className="w-full text-left flex items-center justify-between text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300 bg-gray-100 hover:bg-gray-200 -mx-6 px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <span>架電管理</span>
              <svg
                className={`w-6 h-6 text-gray-700 transition-transform duration-200 ${expandedSections.call ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {expandedSections.call && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label">担当IS</label>
                <select
                  value={formData.staffIS || ''}
                  onChange={(e) => handleChange('staffIS', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {dropdownSettings.staffIS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">ISステータス</label>
                <select
                  value={formData.statusIS || ''}
                  onChange={(e) => handleChange('statusIS', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {dropdownSettings.statusIS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">ステータス更新日</label>
                <input 
                  type="date" 
                  value={formData.statusUpdateDate || ''} 
                  onChange={(e) => handleChange('statusUpdateDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">ステータス</label>
                <select
                  value={formData.status || '未架電'}
                  onChange={(e) => handleChange('status', e.target.value as CallStatus)}
                  className="input"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">対応不可/失注理由</label>
                <select
                  value={formData.cannotContactReason || ''}
                  onChange={(e) => handleChange('cannotContactReason', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {dropdownSettings.cannotContactReason.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-sm font-medium text-gray-700">リサイクル優先度</label>
                  <button
                    type="button"
                    onClick={() => setShowRecyclePriorityModal(true)}
                    className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors cursor-pointer"
                    title="リサイクル優先度の定義を表示"
                  >
                    <span className="text-xs text-gray-600 font-bold">?</span>
                  </button>
                </div>
                <select
                  value={formData.recyclePriority || ''}
                  onChange={(e) => handleChange('recyclePriority', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {dropdownSettings.recyclePriority.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">結果/コンタクト状況</label>
                <select
                  value={formData.resultContactStatus || ''}
                  onChange={(e) => handleChange('resultContactStatus', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {dropdownSettings.resultContactStatus.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">直近架電日</label>
                <input 
                  type="date" 
                  value={formData.lastCalledDate || ''} 
                  onChange={(e) => handleChange('lastCalledDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">架電数カウント</label>
                <input 
                  type="number" 
                  value={formData.callCount || 0} 
                  onChange={(e) => handleChange('callCount', parseInt(e.target.value) || 0)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">通話時間（目安）</label>
                <input 
                  type="text" 
                  value={formData.callDuration || ''} 
                  onChange={(e) => handleChange('callDuration', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">会話メモ・その他</label>
                <textarea 
                  value={formData.conversationMemo || ''} 
                  onChange={(e) => handleChange('conversationMemo', e.target.value)}
                  className="input"
                  rows={4}
                />
              </div>
            </div>
            )}
          </section>

          <section>
            <button
              type="button"
              onClick={() => toggleSection('callHistory')}
              className="w-full text-left flex items-center justify-between text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300 bg-gray-100 hover:bg-gray-200 -mx-6 px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <span>架電履歴</span>
              <svg
                className={`w-6 h-6 text-gray-700 transition-transform duration-200 ${expandedSections.callHistory ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {expandedSections.callHistory && (
            <div className="space-y-4">
              {(formData.callHistory || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>架電履歴がありません</p>
                  <p className="text-sm mt-2">「+ 架電履歴を追加」ボタンから追加してください</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...(formData.callHistory || [])]
                    .sort((a, b) => {
                      const dateA = new Date(`${a.callDate} ${a.callTime || '00:00'}`).getTime()
                      const dateB = new Date(`${b.callDate} ${b.callTime || '00:00'}`).getTime()
                      return dateB - dateA
                    })
                    .map((history) => (
                      <div
                        key={history.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                {formatCallDateTime(history.callDate, history.callTime)}
                              </span>
                              <span className={`badge ${getStatusBadgeClass(history.status)} text-xs`}>
                                {history.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>担当: {history.staffIS}</p>
                              {history.duration && (
                                <p>通話時間: {Math.floor(history.duration / 60)}分</p>
                              )}
                              {history.memo && (
                                <p className="mt-2 text-gray-700">{history.memo}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditHistory(history)}
                              className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            >
                              編集
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteHistory(history.id)}
                              className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              <button
                type="button"
                onClick={handleAddHistory}
                className="w-full px-4 py-2 text-sm text-gray-600 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                架電履歴を追加
              </button>
            </div>
            )}
          </section>

          <section>
            <button
              type="button"
              onClick={() => toggleSection('action')}
              className="w-full text-left flex items-center justify-between text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300 bg-gray-100 hover:bg-gray-200 -mx-6 px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <span>アクション管理</span>
              <svg
                className={`w-6 h-6 text-gray-700 transition-transform duration-200 ${expandedSections.action ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {expandedSections.action && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label">架電外アクション</label>
                <select
                  value={formData.actionOutsideCall || ''}
                  onChange={(e) => handleChange('actionOutsideCall', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {dropdownSettings.actionOutsideCall.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">ネクストアクション日</label>
                <input 
                  type="date" 
                  value={formData.nextActionDate || ''} 
                  onChange={(e) => handleChange('nextActionDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">ネクストアクション内容</label>
                <select
                  value={formData.nextActionContent || ''}
                  onChange={(e) => handleChange('nextActionContent', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {dropdownSettings.nextActionContent.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">ネクストアクション補足</label>
                <select
                  value={formData.nextActionSupplement || ''}
                  onChange={(e) => handleChange('nextActionSupplement', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {dropdownSettings.nextActionSupplement.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">実施</label>
                <select
                  value={formData.nextActionCompleted || ''}
                  onChange={(e) => handleChange('nextActionCompleted', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {dropdownSettings.nextActionCompleted.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            )}
          </section>

          <section>
            <button
              type="button"
              onClick={() => toggleSection('deal')}
              className="w-full text-left flex items-center justify-between text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300 bg-gray-100 hover:bg-gray-200 -mx-6 px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <span>商談情報</span>
              <svg
                className={`w-6 h-6 text-gray-700 transition-transform duration-200 ${expandedSections.deal ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {expandedSections.deal && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label">アポイント獲得日</label>
                <input 
                  type="date" 
                  value={formData.appointmentDate || ''} 
                  onChange={(e) => handleChange('appointmentDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">商談設定日</label>
                <input 
                  type="date" 
                  value={formData.dealSetupDate || ''} 
                  onChange={(e) => handleChange('dealSetupDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">商談時間</label>
                <input 
                  type="text" 
                  value={formData.dealTime || ''} 
                  onChange={(e) => handleChange('dealTime', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">商談担当FS</label>
                <select
                  value={formData.dealStaffFS || ''}
                  onChange={(e) => handleChange('dealStaffFS', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {dropdownSettings.dealStaffFS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">商談結果</label>
                <select
                  value={formData.dealResult || ''}
                  onChange={(e) => handleChange('dealResult', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {dropdownSettings.dealResult.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">失注理由（FS→IS）</label>
                <select
                  value={formData.lostReasonFS || ''}
                  onChange={(e) => handleChange('lostReasonFS', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {dropdownSettings.lostReasonFS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            )}
          </section>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>

      {showRecyclePriorityModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
            onClick={() => setShowRecyclePriorityModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">リサイクル優先度の定義</h2>
                <button
                  onClick={() => setShowRecyclePriorityModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="閉じる"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg font-bold text-gray-900">優先度 A</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">判断基準例</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>失注理由が「タイミング」</li>
                        <li>RDで解決できる明確な課題あり</li>
                        <li>自己対応による失注</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">対応アクション</h4>
                      <p className="text-sm text-gray-600">
                        再度アプローチすることで、短期間（例：1ヶ月以内）での商談化が期待できる最優先リード。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg font-bold text-gray-900">優先度 B</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">判断基準例</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>サービスに興味あり</li>
                        <li>課題感は明確</li>
                        <li>失注理由が「予算」</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">対応アクション</h4>
                      <p className="text-sm text-gray-600">
                        関心は示しており、タイミングや追加情報提供によって商談化の可能性があるリード。定期的なフォローアップ対象。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg font-bold text-gray-900">優先度 C</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">判断基準例</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>課題認識は低いが課題あり</li>
                        <li>過去の接触で明確な反応は薄い</li>
                        <li>他の税理士決定だが不満が出る可能性</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">対応アクション</h4>
                      <p className="text-sm text-gray-600">
                        中長期的な関係構築が必要なリード。有益な情報提供を通じて関心度を高めるナーチャリング対象。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg font-bold text-gray-900">優先度 D</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">判断基準例</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>反応がほとんどない</li>
                        <li>失注理由が「機能不足」「競合決定」</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">対応アクション</h4>
                      <p className="text-sm text-gray-600">
                        アプローチの優先度は低いが、将来的に状況が変わる可能性もあるリード。低頻度での情報提供や、新機能リリースなどのタイミングで再アプローチを検討。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg font-bold text-gray-900">優先度 E</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">判断基準例</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>ターゲット条件から外れている（業種、規模など）</li>
                        <li>連絡先不明、コンタクト不可</li>
                        <li>明確なアプローチ拒否</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">対応アクション</h4>
                      <p className="text-sm text-gray-600">
                        基本的にリサイクル対象外とするリード。CRM上は区別して管理。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setShowRecyclePriorityModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#0083a0' }}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <CallHistoryModal
        isOpen={showHistoryModal}
        history={editingHistory}
        onClose={() => {
          setShowHistoryModal(false)
          setEditingHistory(null)
        }}
        onSave={handleSaveHistory}
      />
    </>
  )
}
