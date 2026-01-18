'use client'

import { useState } from 'react'

interface LeadRegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: LeadFormData) => Promise<void>
  isSubmitting?: boolean
}

export interface LeadFormData {
  leadId: string
  leadSource: string
  companyName: string
  contactName: string
  contactNameKana: string
  phone: string
  email: string
  address: string
  industry: string
  openingDateOriginal: string
  contactPreferredDateTime: string
  allianceRemarks: string
}

const LEAD_SOURCES = [
  'TEMPOS',
  'OMC',
  'Meetsmore',
  'Makuake',
  'REDISH',
  'Amazon',
  'USEN',
  'freee',
  'HOCT SYSTEM',
  'S.H.N',
]

const LEAD_SOURCE_PREFIXES: Record<string, string> = {
  TEMPOS: 'TM',
  OMC: 'OC',
  Meetsmore: 'MT',
  Makuake: 'MK',
  REDISH: 'RD',
  Amazon: 'AB',
  USEN: 'US',
  freee: 'FR',
  'HOCT SYSTEM': 'HS',
  'S.H.N': 'SH',
}

export function LeadRegisterModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: LeadRegisterModalProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    leadId: '',
    leadSource: 'REDISH',
    companyName: '',
    contactName: '',
    contactNameKana: '',
    phone: '',
    email: '',
    address: '',
    industry: '',
    openingDateOriginal: '',
    contactPreferredDateTime: '',
    allianceRemarks: '',
  })
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // バリデーション
    if (!formData.leadId.trim()) {
      setError('リードIDは必須です')
      return
    }
    if (!formData.phone.trim()) {
      setError('電話番号は必須です')
      return
    }
    if (!formData.contactName.trim() && !formData.companyName.trim()) {
      setError('会社名または氏名は必須です')
      return
    }

    // リードIDの形式チェック
    const prefix = LEAD_SOURCE_PREFIXES[formData.leadSource] || 'RD'
    const idPattern = new RegExp(`^${prefix}\\d{4}$`)
    if (!idPattern.test(formData.leadId)) {
      setError(`リードIDは ${prefix}XXXX の形式で入力してください（例: ${prefix}0001）`)
      return
    }

    try {
      await onSubmit(formData)
      // 成功したらフォームをリセット
      setFormData({
        leadId: '',
        leadSource: 'REDISH',
        companyName: '',
        contactName: '',
        contactNameKana: '',
        phone: '',
        email: '',
        address: '',
        industry: '',
        openingDateOriginal: '',
        contactPreferredDateTime: '',
        allianceRemarks: '',
      })
      onClose()
    } catch (err: any) {
      setError(err.message || '登録に失敗しました')
    }
  }

  const prefix = LEAD_SOURCE_PREFIXES[formData.leadSource] || 'RD'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* オーバーレイ */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* モーダル */}
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              リード個別登録
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {error && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {/* リードソース */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  リードソース <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.leadSource}
                  onChange={(e) => handleChange('leadSource', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  {LEAD_SOURCES.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              {/* リードID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  リードID <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-2">形式: {prefix}XXXX</span>
                </label>
                <input
                  type="text"
                  value={formData.leadId}
                  onChange={(e) => handleChange('leadId', e.target.value.toUpperCase())}
                  placeholder={`例: ${prefix}0001`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 会社名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    会社名/店舗名
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* 業種 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    業種
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 氏名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleChange('contactName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* ふりがな */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ふりがな
                  </label>
                  <input
                    type="text"
                    value={formData.contactNameKana}
                    onChange={(e) => handleChange('contactNameKana', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* 電話番号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="例: 090-1234-5678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* 住所 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  住所
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 開業時期 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    開業時期
                  </label>
                  <input
                    type="text"
                    value={formData.openingDateOriginal}
                    onChange={(e) => handleChange('openingDateOriginal', e.target.value)}
                    placeholder="例: 2025年4月"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* 連絡希望日時 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    連絡希望日時
                  </label>
                  <input
                    type="text"
                    value={formData.contactPreferredDateTime}
                    onChange={(e) => handleChange('contactPreferredDateTime', e.target.value)}
                    placeholder="例: 平日14時以降"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* 連携元備考 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  連携元備考
                </label>
                <textarea
                  value={formData.allianceRemarks}
                  onChange={(e) => handleChange('allianceRemarks', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* フッター */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? '登録中...' : '登録'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
