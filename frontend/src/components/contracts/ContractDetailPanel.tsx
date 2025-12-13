'use client'

import { useState, useEffect } from 'react'
import { Deal } from '@/types/sfa'

interface ContractDetailPanelProps {
  contract: Deal
  onClose: () => void
  onSave: (updates: Partial<Deal>) => void
  isSaving: boolean
}

export function ContractDetailPanel({ contract, onClose, onSave, isSaving }: ContractDetailPanelProps) {
  const [formData, setFormData] = useState<Partial<Deal>>(contract)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    alliance: true,
    contract: true,
  })

  useEffect(() => {
    setFormData(contract)
  }, [contract])

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
            <h2 className="text-xl font-bold text-gray-900">成約詳細</h2>
            <p className="text-sm text-gray-500 mt-1">{contract.id}</p>
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
                <input type="text" value={formData.service || ''} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="label">カテゴリ</label>
                <input type="text" value={formData.category || ''} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="label">リードソース</label>
                <input type="text" value={formData.leadSource || ''} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="label">連携日</label>
                <input type="text" value={formData.linkedDate || ''} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="label">業種</label>
                <input type="text" value={formData.industry || ''} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="label">会社名/店舗名</label>
                <input type="text" value={formData.companyName || ''} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="label">氏名</label>
                <input type="text" value={formData.contactName || ''} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="label">ふりがな</label>
                <input type="text" value={formData.contactNameKana || ''} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="label">電話番号</label>
                <input type="text" value={formData.phone || ''} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="label">メールアドレス</label>
                <input type="text" value={formData.email || ''} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="label">住所／エリア</label>
                <input type="text" value={formData.address || ''} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="label">開業時期</label>
                <input type="text" value={formData.openingDate || ''} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="label">連絡希望日時</label>
                <input type="text" value={formData.contactPreferredDateTime || ''} disabled className="input bg-gray-50" />
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
                  disabled
                  className="input bg-gray-50"
                  rows={3}
                />
              </div>
              <div>
                <label className="label">OMC追加情報①</label>
                <input 
                  type="text" 
                  value={formData.omcAdditionalInfo1 || ''} 
                  disabled
                  className="input bg-gray-50"
                />
              </div>
              <div>
                <label className="label">⓶自己資金</label>
                <input 
                  type="text" 
                  value={formData.omcSelfFunds || ''} 
                  disabled
                  className="input bg-gray-50"
                />
              </div>
              <div>
                <label className="label">⓷物件状況</label>
                <input 
                  type="text" 
                  value={formData.omcPropertyStatus || ''} 
                  disabled
                  className="input bg-gray-50"
                />
              </div>
              <div>
                <label className="label">Amazon税理士有無</label>
                <input 
                  type="text" 
                  value={formData.amazonTaxAccountant || ''} 
                  disabled
                  className="input bg-gray-50"
                />
              </div>
              <div>
                <label className="label">Meetsmoreリンク</label>
                <input 
                  type="text" 
                  value={formData.meetsmoreLink || ''} 
                  disabled
                  className="input bg-gray-50"
                />
              </div>
              <div>
                <label className="label">Makuakeリンク</label>
                <input 
                  type="text" 
                  value={formData.makuakeLink || ''} 
                  disabled
                  className="input bg-gray-50"
                />
              </div>
              <div>
                <label className="label">架電メモ</label>
                <textarea 
                  value={formData.conversationMemo || ''} 
                  disabled
                  className="input bg-gray-50"
                  rows={4}
                />
              </div>
            </div>
            )}
          </section>

          {/* 成約情報セクション */}
          <section>
            <button
              type="button"
              onClick={() => toggleSection('contract')}
              className="w-full text-left flex items-center justify-between text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300 bg-gray-100 hover:bg-gray-200 -mx-6 px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <span>成約情報</span>
              <svg
                className={`w-6 h-6 text-gray-700 transition-transform duration-200 ${expandedSections.contract ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {expandedSections.contract && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label">担当</label>
                <input 
                  type="text" 
                  value={formData.staffIS || ''} 
                  disabled
                  className="input bg-gray-50"
                />
              </div>
              <div>
                <label className="label">商談実施日</label>
                <input 
                  type="date" 
                  value={formData.dealExecutionDate || ''} 
                  disabled
                  className="input bg-gray-50"
                />
              </div>
              <div>
                <label className="label">商談動画</label>
                <input 
                  type="text" 
                  value={formData.videoLink || ''} 
                  disabled
                  className="input bg-gray-50"
                />
              </div>
              <div>
                <label className="label">商談メモ</label>
                <textarea 
                  value={formData.dealMemo || ''} 
                  disabled
                  className="input bg-gray-50"
                  rows={4}
                />
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
                <label className="label">商談結果</label>
                <input 
                  type="text" 
                  value={formData.result || ''} 
                  disabled
                  className="input bg-gray-50"
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
              閉じる
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






