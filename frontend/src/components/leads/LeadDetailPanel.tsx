'use client'

import { useState, useEffect } from 'react'
import { CallRecord } from '@/types/sfa'
import { getDropdownOptions } from '@/lib/dropdownSettings'

interface LeadDetailPanelProps {
  record: CallRecord
  onClose: () => void
  onSave: (updates: Partial<CallRecord>) => void
  isSaving: boolean
}

export function LeadDetailPanel({ record, onClose, onSave, isSaving }: LeadDetailPanelProps) {
  const [formData, setFormData] = useState<Partial<CallRecord>>(record)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    sourceSpecific: true, // リードソース別情報はデフォルト開き
  })
  const [dropdownSettings, setDropdownSettings] = useState({
    openingPeriod: getDropdownOptions('openingPeriod'),
  })

  useEffect(() => {
    setFormData(record)
  }, [record])

  useEffect(() => {
    const handleStorageChange = () => {
      setDropdownSettings({
        openingPeriod: getDropdownOptions('openingPeriod'),
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

  const handleChange = <K extends keyof CallRecord>(field: K, value: CallRecord[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
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
          width: 'min(720px, 60vw)',
          animation: 'slideInRight 0.3s ease-out',
        }}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">リード詳細</h2>
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
            <div className="space-y-4">
              {/* 2列表示: リードID | リードソース */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">リードID</label>
                  <input type="text" value={formData.leadId || ''} disabled className="input bg-gray-50" />
                </div>
                <div>
                  <label className="label">リードソース</label>
                  <input type="text" value={formData.leadSource || ''} disabled className="input bg-gray-50" />
                </div>
              </div>

              {/* 1列表示: 連携日 */}
              <div>
                <label className="label">連携日</label>
                <input 
                  type="date" 
                  value={formData.linkedDate || ''} 
                  onChange={(e) => handleChange('linkedDate', e.target.value)}
                  className="input"
                />
              </div>

              {/* 2列表示: 業種 | 会社名/店舗名 */}
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {/* 2列表示: 氏名 | ふりがな */}
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {/* 2列表示: 電話番号 | メールアドレス */}
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {/* 1列表示: 住所／エリア */}
              <div>
                <label className="label">住所／エリア</label>
                <input 
                  type="text" 
                  value={formData.address || ''} 
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="input"
                />
              </div>

              {/* 1列表示: 開業時期（連携元） */}
              <div>
                <label className="label">開業時期（連携元）</label>
                <input 
                  type="text" 
                  value={formData.openingDateOriginal || ''} 
                  disabled 
                  className="input bg-gray-50 text-gray-600"
                  placeholder="連携元からの入力なし"
                />
              </div>

              {/* 1列表示: 連絡希望日時 */}
              <div>
                <label className="label">連絡希望日時</label>
                <input 
                  type="text" 
                  value={formData.contactPreferredDateTime || ''} 
                  onChange={(e) => handleChange('contactPreferredDateTime', e.target.value)}
                  className="input"
                />
              </div>

              {/* 1列表示: 連携元備考 */}
              <div>
                <label className="label">連携元備考</label>
                <textarea 
                  value={formData.allianceRemarks || ''} 
                  onChange={(e) => handleChange('allianceRemarks', e.target.value)}
                  className="input"
                  rows={3}
                />
              </div>
            </div>
            )}
          </section>

          <section>
            <button
              type="button"
              onClick={() => toggleSection('sourceSpecific')}
              className="w-full text-left flex items-center justify-between text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300 bg-gray-100 hover:bg-gray-200 -mx-6 px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span>リードソース別情報</span>
                <span className="text-sm font-normal text-gray-500">({formData.leadSource || '不明'})</span>
              </div>
              <svg
                className={`w-6 h-6 text-gray-700 transition-transform duration-200 ${expandedSections.sourceSpecific ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {expandedSections.sourceSpecific && (
            <div className="grid grid-cols-1 gap-4">
              {/* OMC固有情報 */}
              {formData.leadSource === 'OMC' && (
                <>
                  <div>
                    <label className="label">OMC情報①自己資金</label>
                    <input 
                      type="text" 
                      value={formData.omcAdditionalInfo1 || ''} 
                      onChange={(e) => handleChange('omcAdditionalInfo1', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">OMC情報②借入希望額</label>
                    <input 
                      type="text" 
                      value={formData.omcSelfFunds || ''} 
                      onChange={(e) => handleChange('omcSelfFunds', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">OMC情報③物件状況</label>
                    <input 
                      type="text" 
                      value={formData.omcPropertyStatus || ''} 
                      onChange={(e) => handleChange('omcPropertyStatus', e.target.value)}
                      className="input"
                    />
                  </div>
                </>
              )}
              {/* Amazon固有情報 */}
              {formData.leadSource === 'Amazon' && (
                <div>
                  <label className="label">Amazon税理士有無</label>
                  <input 
                    type="text" 
                    value={formData.amazonTaxAccountant || ''} 
                    onChange={(e) => handleChange('amazonTaxAccountant', e.target.value)}
                    className="input"
                  />
                </div>
              )}
              {/* Meetsmore固有情報 */}
              {formData.leadSource === 'Meetsmore' && (
                <>
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
                </>
              )}
              {/* Makuake固有情報 */}
              {formData.leadSource === 'Makuake' && (
                <>
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
                </>
              )}
              {/* その他のソース（TEMPOS, REDISH等）には固有情報なし */}
              {(formData.leadSource === 'TEMPOS' || formData.leadSource === 'REDISH' || !formData.leadSource) && (
                <p className="text-sm text-gray-500">このリードソースには固有の追加情報はありません。</p>
              )}
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
    </>
  )
}
