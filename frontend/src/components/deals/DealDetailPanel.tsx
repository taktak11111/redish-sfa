'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Deal, DealRank, DealResult } from '@/types/sfa'
import { getDropdownOptions } from '@/lib/dropdownSettings'

const RANK_OPTIONS: { value: DealRank; label: string }[] = [
  { value: 'A:80%', label: 'A:80%' },
  { value: 'B:50%', label: 'B:50%' },
  { value: 'C:20%', label: 'C:20%' },
  { value: 'D:10%', label: 'D:10%' },
]

const RESULT_OPTIONS: { value: DealResult | ''; label: string }[] = [
  { value: '', label: '進行中' },
  { value: '01.成約（契約締結）', label: '成約' },
  { value: '02.失注（リサイクル対象外）', label: '失注（対象外）' },
  { value: '03.失注（リサイクル対象）', label: '失注（リサイクル）' },
]

interface DealDetailPanelProps {
  deal: Deal
  onClose: () => void
  onSave: (updates: Partial<Deal>) => void
  isSaving: boolean
}

export function DealDetailPanel({ deal, onClose, onSave, isSaving }: DealDetailPanelProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<Deal>>(deal)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    alliance: true,
    deal: true,
    phase: true,
    action: true,
    result: true,
  })
  const [dropdownSettings, setDropdownSettings] = useState({
    staffIS: getDropdownOptions('staffIS'),
    dealStaffFS: getDropdownOptions('dealStaffFS'),
    dealResult: getDropdownOptions('dealResult'),
    lostReasonFS: getDropdownOptions('lostReasonFS'),
    dealPhase: getDropdownOptions('dealPhase'),
    rankEstimate: getDropdownOptions('rankEstimate'),
    rankChange: getDropdownOptions('rankChange'),
  })

  useEffect(() => {
    setFormData(deal)
  }, [deal])

  useEffect(() => {
    const handleStorageChange = () => {
      setDropdownSettings({
        staffIS: getDropdownOptions('staffIS'),
        dealStaffFS: getDropdownOptions('dealStaffFS'),
        dealResult: getDropdownOptions('dealResult'),
        lostReasonFS: getDropdownOptions('lostReasonFS'),
        dealPhase: getDropdownOptions('dealPhase'),
        rankEstimate: getDropdownOptions('rankEstimate'),
        rankChange: getDropdownOptions('rankChange'),
      })
    }
    
    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(handleStorageChange, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const handleChange = (field: keyof Deal, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        style={{ animation: 'fadeIn 0.3s ease-out' }}
        onClick={onClose}
      />
      
      {/* サイドパネル */}
      <div 
        className="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 overflow-y-auto"
        style={{ 
          width: 'min(600px, 50vw)',
          animation: 'slideInRight 0.3s ease-out',
        }}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">商談詳細</h2>
            <p className="text-sm text-gray-500 mt-1">{deal.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-outline"
              onClick={() => router.push(`/analysis/deal-feedback?dealId=${encodeURIComponent(deal.id)}`)}
              title="この商談をAI商談FBで振り返る"
            >
              AI商談FBを開く
            </button>
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
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基本情報セクション */}
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
                <label className="label">商談ID</label>
                <input type="text" value={formData.id || ''} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="label">リードID</label>
                <input type="text" value={formData.leadId || ''} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="label">サービス</label>
                <select
                  value={formData.service || ''}
                  onChange={(e) => handleChange('service', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  <option value="RO:開業（融資）">RO:開業（融資）</option>
                  <option value="RT:税務">RT:税務</option>
                  <option value="RA:補助金">RA:補助金</option>
                  <option value="RB:融資（借り換え）">RB:融資（借り換え）</option>
                </select>
              </div>
              <div>
                <label className="label">カテゴリ</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  <option value="A:飲食">A:飲食</option>
                  <option value="B:非飲食">B:非飲食</option>
                </select>
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

          {/* 連携元情報セクション */}
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
                <label className="label">備考</label>
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
                <label className="label">Makuakeリンク</label>
                <input 
                  type="text" 
                  value={formData.makuakeLink || ''} 
                  onChange={(e) => handleChange('makuakeLink', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">会話メモ</label>
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

          {/* 商談管理セクション */}
          <section>
            <button
              type="button"
              onClick={() => toggleSection('deal')}
              className="w-full text-left flex items-center justify-between text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300 bg-gray-100 hover:bg-gray-200 -mx-6 px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <span>商談管理</span>
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
                <label className="label">商談担当</label>
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
                <label className="label">商談実施日</label>
                <input 
                  type="date" 
                  value={formData.dealExecutionDate || ''} 
                  onChange={(e) => handleChange('dealExecutionDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">動画リンク</label>
                <input 
                  type="text" 
                  value={formData.videoLink || ''} 
                  onChange={(e) => handleChange('videoLink', e.target.value)}
                  className="input"
                />
              </div>
            </div>
            )}
          </section>

          {/* 商談フェーズセクション */}
          <section>
            <button
              type="button"
              onClick={() => toggleSection('phase')}
              className="w-full text-left flex items-center justify-between text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300 bg-gray-100 hover:bg-gray-200 -mx-6 px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <span>商談フェーズ</span>
              <svg
                className={`w-6 h-6 text-gray-700 transition-transform duration-200 ${expandedSections.phase ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {expandedSections.phase && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label">商談フェーズ</label>
                <select
                  value={formData.dealPhase || ''}
                  onChange={(e) => handleChange('dealPhase', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {dropdownSettings.dealPhase.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">フェーズ更新日</label>
                <input 
                  type="date" 
                  value={formData.phaseUpdateDate || ''} 
                  onChange={(e) => handleChange('phaseUpdateDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">確度ヨミ</label>
                <select
                  value={formData.rankEstimate || ''}
                  onChange={(e) => handleChange('rankEstimate', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {dropdownSettings.rankEstimate.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">確度変化</label>
                <select
                  value={formData.rankChange || ''}
                  onChange={(e) => handleChange('rankChange', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {dropdownSettings.rankChange.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">確度更新日</label>
                <input 
                  type="date" 
                  value={formData.rankUpdateDate || ''} 
                  onChange={(e) => handleChange('rankUpdateDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">確度</label>
                <select
                  value={formData.rank || 'D:10%'}
                  onChange={(e) => handleChange('rank', e.target.value as DealRank)}
                  className="input"
                >
                  {RANK_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            )}
          </section>

          {/* アクション管理セクション */}
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
                <label className="label">最終接触日</label>
                <input 
                  type="date" 
                  value={formData.lastContactDate || ''} 
                  onChange={(e) => handleChange('lastContactDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">アクション予定日</label>
                <input 
                  type="date" 
                  value={formData.actionScheduledDate || ''} 
                  onChange={(e) => handleChange('actionScheduledDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">次回アクション内容</label>
                <select
                  value={formData.nextActionContent || ''}
                  onChange={(e) => handleChange('nextActionContent', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {getDropdownOptions('nextActionContent').map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">回答期限</label>
                <input 
                  type="date" 
                  value={formData.responseDeadline || ''} 
                  onChange={(e) => handleChange('responseDeadline', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">対応済</label>
                <select
                  value={formData.actionCompleted || ''}
                  onChange={(e) => handleChange('actionCompleted', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {getDropdownOptions('nextActionCompleted').map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">顧客BANT情報</label>
                <textarea 
                  value={formData.customerBANTInfo || ''} 
                  onChange={(e) => handleChange('customerBANTInfo', e.target.value)}
                  className="input"
                  rows={3}
                />
              </div>
              <div>
                <label className="label">競合・自己対応情報</label>
                <textarea 
                  value={formData.competitorInfo || ''} 
                  onChange={(e) => handleChange('competitorInfo', e.target.value)}
                  className="input"
                  rows={3}
                />
              </div>
              <div>
                <label className="label">商談メモ</label>
                <textarea 
                  value={formData.dealMemo || ''} 
                  onChange={(e) => handleChange('dealMemo', e.target.value)}
                  className="input"
                  rows={4}
                />
              </div>
            </div>
            )}
          </section>

          {/* 商談結果セクション */}
          <section>
            <button
              type="button"
              onClick={() => toggleSection('result')}
              className="w-full text-left flex items-center justify-between text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300 bg-gray-100 hover:bg-gray-200 -mx-6 px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <span>商談結果</span>
              <svg
                className={`w-6 h-6 text-gray-700 transition-transform duration-200 ${expandedSections.result ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {expandedSections.result && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label">商談結果</label>
                <select
                  value={formData.result || ''}
                  onChange={(e) => handleChange('result', e.target.value as DealResult)}
                  className="input"
                >
                  {RESULT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">結果確定日（契約日）</label>
                <input 
                  type="date" 
                  value={formData.resultDate || ''} 
                  onChange={(e) => handleChange('resultDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">失注要因</label>
                <input 
                  type="text" 
                  value={formData.lostFactor || ''} 
                  onChange={(e) => handleChange('lostFactor', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">失注理由</label>
                <select
                  value={formData.lostReason || ''}
                  onChange={(e) => handleChange('lostReason', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  <option value="A.自己対応">A.自己対応</option>
                  <option value="B.競合決定">B.競合決定</option>
                  <option value="C.予算">C.予算</option>
                  <option value="D.時期">D.時期</option>
                  <option value="E.ニーズ訴求不足">E.ニーズ訴求不足</option>
                  <option value="F.(超)小規模店">F.(超)小規模店</option>
                  <option value="G.興味本位">G.興味本位</option>
                  <option value="H.ノーショー（音信不通）">H.ノーショー（音信不通）</option>
                  <option value="I.弊社対応不可">I.弊社対応不可</option>
                  <option value="J.その他">J.その他</option>
                </select>
              </div>
              <div>
                <label className="label">失注後の対応・改善策</label>
                <textarea 
                  value={formData.lostAfterAction || ''} 
                  onChange={(e) => handleChange('lostAfterAction', e.target.value)}
                  className="input"
                  rows={3}
                />
              </div>
              <div>
                <label className="label">ISへのFB</label>
                <textarea 
                  value={formData.feedbackToIS || ''} 
                  onChange={(e) => handleChange('feedbackToIS', e.target.value)}
                  className="input"
                  rows={3}
                />
              </div>
              <div>
                <label className="label">FB</label>
                <textarea 
                  value={formData.feedback || ''} 
                  onChange={(e) => handleChange('feedback', e.target.value)}
                  className="input"
                  rows={3}
                />
              </div>
            </div>
            )}
          </section>

          {/* フッター */}
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
    </>
  )
}
