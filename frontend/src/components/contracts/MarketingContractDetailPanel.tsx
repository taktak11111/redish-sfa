'use client'

import { useState, useEffect } from 'react'
import { Deal } from '@/types/sfa'
import { getDropdownOptions, DropdownOption } from '@/lib/dropdownSettings'

// 日付入力のクリックでピッカーを開くヘルパー
const openDatePicker = (e: React.MouseEvent<HTMLInputElement>) => {
  const input = e.target as HTMLInputElement
  if (input.showPicker) {
    input.showPicker()
  }
}

// スタイル定数
const inheritedInputClass = 'input bg-gray-100 cursor-default'
const editableInputClass = 'input'
const dateInputClass = 'input cursor-pointer'

// タブの種類（集客: 2タブのみ）
type TabType = 'contract' | 'payment'

// ワークフローステータス（集客: 2ステップ）
interface WorkflowStatus {
  contractSigned: boolean
  contractSignedDate?: string
  paymentConfirmed: boolean
  paymentConfirmedDate?: string
}

// 集客契約情報
interface MarketingContractFormData {
  // 1. 契約情報
  contractDate?: string
  contractStaff?: string
  customerId?: string
  contractId?: string
  // 2. 顧客情報
  businessType?: string
  entityType?: string
  representativeName?: string
  representativeNameKana?: string
  tel?: string
  mail?: string
  corporateName?: string
  corporateNameKana?: string
  // 3. 店舗情報
  storeNumber?: string
  storeName?: string
  // 4. 集客サービス費用
  initialFeeType?: '90000' | '180000' | 'custom' // 初期費用タイプ
  initialFee?: number // 初期費用
  marketingAmount?: number // 集客支援金額
  successFeeRate?: number // 成功報酬率（基本: 10%）
  successFee?: number // 成功報酬額（計算）
  customRate?: boolean // 個別交渉フラグ
  // 5. その他
  contractRemarks?: string
}

// 入金確認の情報
interface PaymentData {
  expectedDate?: string
  expectedAmount?: number
  depositAccount?: string
  status?: 'not_confirmed' | 'partial' | 'confirmed'
  confirmedDate?: string
  confirmedAmount?: number
  paymentHistory?: Array<{
    date: string
    amount: number
    source: string
    matchResult: 'auto' | 'manual'
    cleared: boolean
  }>
}

interface MarketingContractDetailPanelProps {
  contract: Deal
  onClose: () => void
  onSave: (updates: Partial<Deal>) => void
  isSaving: boolean
  saveState?: 'idle' | 'saving' | 'saved' | 'error'
  saveError?: string
  onDirty?: () => void
  workflowStatus?: WorkflowStatus
  onWorkflowUpdate?: (status: Partial<WorkflowStatus>) => void
}

export function MarketingContractDetailPanel({ 
  contract, 
  onClose, 
  onSave, 
  isSaving,
  saveState = 'idle',
  saveError,
  onDirty,
  workflowStatus: initialWorkflowStatus,
  onWorkflowUpdate 
}: MarketingContractDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('contract')
  const [formData, setFormData] = useState<Partial<Deal>>(contract)
  const [contractFormData, setContractFormData] = useState<MarketingContractFormData>({})
  const [paymentData, setPaymentData] = useState<PaymentData>({})
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>(
    initialWorkflowStatus || {
      contractSigned: false,
      paymentConfirmed: false,
    }
  )
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    contractInfo: true,
    customerInfo: false,
    storeInfo: false,
    serviceFee: true,
    otherInfo: false,
  })

  // ドロップダウン選択肢を取得
  const [staffOptions, setStaffOptions] = useState<DropdownOption[]>([])
  
  useEffect(() => {
    setStaffOptions(getDropdownOptions('dealStaffFS'))
  }, [])

  useEffect(() => {
    setFormData(contract)
    const stored = (contract as any)?.sourceSpecificData?.contractDetails?.marketing
    const storedForm: Partial<MarketingContractFormData> = stored?.contractFormData || {}
    setContractFormData(() => ({
      ...storedForm,
      contractDate: storedForm.contractDate ?? contract.resultDate,
      representativeName: storedForm.representativeName ?? contract.contactName,
      representativeNameKana: storedForm.representativeNameKana ?? contract.contactNameKana,
      tel: storedForm.tel ?? contract.phone,
      mail: storedForm.mail ?? contract.email,
      storeName: storedForm.storeName ?? contract.companyName,
      // 集客サービスのデフォルト料金
      initialFeeType: storedForm.initialFeeType ?? '90000',
      initialFee: storedForm.initialFee ?? 90000,
      successFeeRate: storedForm.successFeeRate ?? 10,
      successFee: storedForm.successFee ?? stored?.contractFormData?.successFee,
    }))
    if (stored?.paymentData) {
      setPaymentData(stored.paymentData)
    }
    if (stored?.workflowStatus) {
      setWorkflowStatus(stored.workflowStatus)
    }
  }, [contract])

  const handleContractFormChange = (field: keyof MarketingContractFormData, value: string | number | boolean | undefined) => {
    setContractFormData(prev => {
      const updated = { ...prev, [field]: value }
      // 初期費用タイプが変更されたら初期費用を更新
      if (field === 'initialFeeType') {
        if (value === '90000') updated.initialFee = 90000
        else if (value === '180000') updated.initialFee = 180000
        // customの場合は手入力
      }
      // 集客金額または成功報酬率が変更されたら成功報酬を再計算
      if (field === 'marketingAmount' || field === 'successFeeRate') {
        const marketingAmount = field === 'marketingAmount' ? (value as number) : (prev.marketingAmount || 0)
        const rate = field === 'successFeeRate' ? (value as number) : (prev.successFeeRate || 10)
        updated.successFee = Math.round(marketingAmount * rate / 100)
      }
      return updated
    })
    onDirty?.()
  }

  const handlePaymentChange = (field: keyof PaymentData, value: string | number | undefined) => {
    setPaymentData(prev => ({ ...prev, [field]: value }))
    onDirty?.()
  }

  const buildSourceSpecificDataUpdate = () => {
    const existing = (formData as any).sourceSpecificData || (contract as any).sourceSpecificData || {}
    const contractDetails = (existing.contractDetails && typeof existing.contractDetails === 'object') ? existing.contractDetails : {}
    return {
      ...existing,
      contractDetails: {
        ...contractDetails,
        marketing: {
          contractFormData,
          paymentData,
          workflowStatus,
          updatedAt: new Date().toISOString(),
        },
      },
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      sourceSpecificData: buildSourceSpecificDataUpdate(),
    })
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleWorkflowStatusChange = (field: keyof WorkflowStatus, value: boolean | string) => {
    const newStatus = { ...workflowStatus, [field]: value }
    setWorkflowStatus(newStatus)
    onWorkflowUpdate?.(newStatus)
  }

  // 顧客番号の自動採番
  const generateCustomerId = (businessType: string) => {
    const prefix = businessType === 'A:飲食' ? 'A' : 'B'
    const nextNumber = Math.floor(Math.random() * 999999) + 1
    return `${prefix}${String(nextNumber).padStart(6, '0')}`
  }

  const handleBusinessTypeChange = (value: string) => {
    handleContractFormChange('businessType', value)
    if (value && !contractFormData.customerId) {
      const newCustomerId = generateCustomerId(value)
      handleContractFormChange('customerId', newCustomerId)
    }
  }

  // タブのスタイル
  const getTabClass = (tab: TabType) => {
    const baseClass = 'px-4 py-2 text-sm font-medium rounded-t-lg transition-all'
    if (activeTab === tab) {
      return `${baseClass} bg-white text-primary-600 border-t-2 border-x border-primary-500`
    }
    return `${baseClass} bg-gray-100 text-gray-600 hover:bg-gray-200`
  }

  // ワークフローステップのスタイル
  const getStepClass = (completed: boolean, active: boolean) => {
    if (completed) return 'bg-green-500 text-white'
    if (active) return 'bg-primary-500 text-white animate-pulse'
    return 'bg-gray-200 text-gray-500'
  }

  const dealId = (contract as any).dealId || contract.id || ''

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
        className="fixed top-0 right-0 h-full bg-gray-50 shadow-2xl z-50 overflow-hidden flex flex-col"
        style={{ 
          width: 'min(900px, 70vw)',
          animation: 'slideInRight 0.3s ease-out',
        }}
      >
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              成約詳細（集客）
              <span className="ml-2 px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded">集客</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">{dealId} - {contract.contactName}様</p>
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

        {/* ワークフロー進捗（2ステップ） */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-center gap-4">
            {/* ステップ1: 契約締結 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getStepClass(workflowStatus.contractSigned, activeTab === 'contract' && !workflowStatus.contractSigned)}`}>
                {workflowStatus.contractSigned ? '✓' : '1'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">契約締結</span>
            </div>
            <div className={`w-16 h-1 ${workflowStatus.contractSigned ? 'bg-green-500' : 'bg-gray-200'}`} />
            {/* ステップ2: 入金確認 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getStepClass(workflowStatus.paymentConfirmed, activeTab === 'payment' && !workflowStatus.paymentConfirmed)}`}>
                {workflowStatus.paymentConfirmed ? '✓' : '2'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">入金確認</span>
            </div>
          </div>
        </div>

        {/* タブ（2タブ） */}
        <div className="bg-gray-100 px-6 pt-2 flex gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('contract')}
            className={getTabClass('contract')}
          >
            📄 契約管理（集客）
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payment')}
            className={getTabClass('payment')}
          >
            💰 入金確認
          </button>
        </div>

        {/* タブコンテンツ */}
        <div className="flex-1 overflow-y-auto bg-white">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* ===== タブ1: 契約管理（集客） ===== */}
            {activeTab === 'contract' && (
              <>
                {/* 成約基本情報（読取専用） */}
                <section className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h3 className="text-sm font-semibold text-orange-700 mb-3">成約基本情報（商談から継承）</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div><span className="text-gray-500">商談ID:</span> <span className="font-medium">{dealId}</span></div>
                    <div><span className="text-gray-500">サービス:</span> <span className="font-medium text-orange-600">{formData.service || '集客'}</span></div>
                    <div><span className="text-gray-500">ソース:</span> <span className="font-medium">{formData.leadSource || '-'}</span></div>
                    <div><span className="text-gray-500">顧客名:</span> <span className="font-medium">{formData.contactName || '-'}</span></div>
                    <div><span className="text-gray-500">担当FS:</span> <span className="font-medium">{(formData as any).dealStaffFS || formData.staffIS || '-'}</span></div>
                    <div><span className="text-gray-500">成約日:</span> <span className="font-medium">{formData.resultDate || '-'}</span></div>
                  </div>
                </section>

                {/* 1. 契約情報 */}
                <section>
                  <button type="button" onClick={() => toggleSection('contractInfo')} className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                    <span>1. 契約情報</span>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.contractInfo ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {expandedSections.contractInfo && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">契約日 <span className="text-xs text-gray-400">（成約日から継承）</span></label>
                        <input type="date" value={contractFormData.contractDate || ''} onClick={openDatePicker} onChange={(e) => handleContractFormChange('contractDate', e.target.value)} className={inheritedInputClass} readOnly={!!contract.resultDate} />
                      </div>
                      <div>
                        <label className="label">契約担当者</label>
                        <select value={contractFormData.contractStaff || ''} onChange={(e) => handleContractFormChange('contractStaff', e.target.value)} className={editableInputClass}>
                          <option value="">選択...</option>
                          {staffOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">顧客番号 <span className="text-xs text-gray-400">（事業種別選択で自動採番）</span></label>
                        <input type="text" value={contractFormData.customerId || ''} onChange={(e) => handleContractFormChange('customerId', e.target.value)} className={contractFormData.customerId ? inheritedInputClass : editableInputClass} placeholder="A000001 / B000001" readOnly={!!contractFormData.customerId} />
                      </div>
                      <div>
                        <label className="label">成約ID</label>
                        <input type="text" value={contractFormData.contractId || ''} onChange={(e) => handleContractFormChange('contractId', e.target.value)} className={editableInputClass} placeholder="MK0001" />
                      </div>
                    </div>
                  )}
                </section>

                {/* 2. 顧客情報 */}
                <section>
                  <button type="button" onClick={() => toggleSection('customerInfo')} className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                    <span>2. 顧客情報</span>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.customerInfo ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {expandedSections.customerInfo && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">事業種別 <span className="text-xs text-amber-600">（顧客番号自動採番）</span></label>
                        <select value={contractFormData.businessType || ''} onChange={(e) => handleBusinessTypeChange(e.target.value)} className={editableInputClass}>
                          <option value="">選択...</option>
                          <option value="A:飲食">A:飲食</option>
                          <option value="B:非飲食">B:非飲食</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">法人/個人</label>
                        <select value={contractFormData.entityType || ''} onChange={(e) => handleContractFormChange('entityType', e.target.value)} className={editableInputClass}>
                          <option value="">選択...</option>
                          <option value="個人">個人</option>
                          <option value="法人">法人</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">代表者氏名（漢字） <span className="text-xs text-gray-400">（商談から継承）</span></label>
                        <input type="text" value={contractFormData.representativeName || ''} onChange={(e) => handleContractFormChange('representativeName', e.target.value)} className={contract.contactName ? inheritedInputClass : editableInputClass} />
                      </div>
                      <div>
                        <label className="label">代表者氏名（ふりがな） <span className="text-xs text-gray-400">（商談から継承）</span></label>
                        <input type="text" value={contractFormData.representativeNameKana || ''} onChange={(e) => handleContractFormChange('representativeNameKana', e.target.value)} className={contract.contactNameKana ? inheritedInputClass : editableInputClass} />
                      </div>
                      <div>
                        <label className="label">TEL <span className="text-xs text-gray-400">（商談から継承）</span></label>
                        <input type="tel" value={contractFormData.tel || ''} onChange={(e) => handleContractFormChange('tel', e.target.value)} className={contract.phone ? inheritedInputClass : editableInputClass} />
                      </div>
                      <div>
                        <label className="label">mail <span className="text-xs text-gray-400">（商談から継承）</span></label>
                        <input type="email" value={contractFormData.mail || ''} onChange={(e) => handleContractFormChange('mail', e.target.value)} className={contract.email ? inheritedInputClass : editableInputClass} />
                      </div>
                    </div>
                  )}
                </section>

                {/* 3. 店舗情報 */}
                <section>
                  <button type="button" onClick={() => toggleSection('storeInfo')} className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                    <span>3. 店舗情報</span>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.storeInfo ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {expandedSections.storeInfo && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">店舗番号 <span className="text-xs text-gray-400">（顧客番号から自動生成）</span></label>
                        <input type="text" value={contractFormData.storeNumber || (contractFormData.customerId ? `${contractFormData.customerId}-01` : '')} className={inheritedInputClass} readOnly />
                      </div>
                      <div>
                        <label className="label">店舗名＝屋号 <span className="text-xs text-gray-400">（商談から継承）</span></label>
                        <input type="text" value={contractFormData.storeName || ''} onChange={(e) => handleContractFormChange('storeName', e.target.value)} className={contract.companyName ? inheritedInputClass : editableInputClass} />
                      </div>
                    </div>
                  )}
                </section>

                {/* 4. サービス費用（集客） */}
                <section>
                  <button type="button" onClick={() => toggleSection('serviceFee')} className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                    <span>4. サービス費用（集客）</span>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.serviceFee ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {expandedSections.serviceFee && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">初期費用タイプ</label>
                        <select value={contractFormData.initialFeeType || '90000'} onChange={(e) => handleContractFormChange('initialFeeType', e.target.value)} className={editableInputClass}>
                          <option value="90000">¥90,000（標準）</option>
                          <option value="180000">¥180,000（上位）</option>
                          <option value="custom">個別交渉</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">初期費用</label>
                        <input 
                          type="number" 
                          value={contractFormData.initialFee || ''} 
                          onChange={(e) => handleContractFormChange('initialFee', Number(e.target.value))} 
                          className={contractFormData.initialFeeType === 'custom' ? editableInputClass : inheritedInputClass} 
                          readOnly={contractFormData.initialFeeType !== 'custom'}
                        />
                      </div>
                      <div>
                        <label className="label">集客支援金額</label>
                        <input type="number" value={contractFormData.marketingAmount || ''} onChange={(e) => handleContractFormChange('marketingAmount', Number(e.target.value))} className={editableInputClass} placeholder="¥" />
                      </div>
                      <div>
                        <label className="label">成功報酬率 <span className="text-xs text-gray-400">（基本: 10%）</span></label>
                        <div className="flex items-center gap-2">
                          <input type="number" step="0.1" value={contractFormData.successFeeRate ?? 10} onChange={(e) => handleContractFormChange('successFeeRate', Number(e.target.value))} className={editableInputClass} disabled={!contractFormData.customRate} />
                          <span className="text-sm text-gray-500">%</span>
                          <label className="flex items-center gap-1 text-xs">
                            <input type="checkbox" checked={contractFormData.customRate || false} onChange={(e) => handleContractFormChange('customRate', e.target.checked)} className="h-3 w-3" />
                            個別交渉
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="label">成功報酬額 <span className="text-xs text-gray-400">（自動計算）</span></label>
                        <input type="number" value={contractFormData.successFee || 0} className={inheritedInputClass} readOnly />
                      </div>
                      <div className="col-span-2 bg-orange-50 rounded-lg p-3 border border-orange-200">
                        <div className="text-sm font-medium text-orange-800">
                          合計: ¥{((contractFormData.initialFee || 0) + (contractFormData.successFee || 0)).toLocaleString()}（初期費用 + 成功報酬）
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* 5. その他 */}
                <section>
                  <button type="button" onClick={() => toggleSection('otherInfo')} className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                    <span>5. その他</span>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.otherInfo ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {expandedSections.otherInfo && (
                    <div>
                      <label className="label">備考</label>
                      <textarea value={contractFormData.contractRemarks || ''} onChange={(e) => handleContractFormChange('contractRemarks', e.target.value)} className={editableInputClass} rows={4} />
                    </div>
                  )}
                </section>

                {/* 契約管理アクションボタン */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button type="button" className="btn-secondary flex-1">📄 業務委託契約書プレビュー</button>
                  <button type="button" className="btn-secondary flex-1">📤 契約書PDF生成</button>
                  <button type="button" onClick={() => handleWorkflowStatusChange('contractSigned', true)} className={`flex-1 ${workflowStatus.contractSigned ? 'btn-success' : 'btn-primary'}`}>
                    {workflowStatus.contractSigned ? '✅ 契約締結済み' : '✅ 契約締結済みにする'}
                  </button>
                </div>
              </>
            )}

            {/* ===== タブ2: 入金確認 ===== */}
            {activeTab === 'payment' && (
              <>
                {/* ステータス表示 */}
                <div className={`rounded-lg p-4 border-2 ${
                  paymentData.status === 'confirmed' ? 'bg-green-50 border-green-300' :
                  paymentData.status === 'partial' ? 'bg-amber-50 border-amber-300' :
                  'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">消込ステータス</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      paymentData.status === 'confirmed' ? 'bg-green-500 text-white' :
                      paymentData.status === 'partial' ? 'bg-amber-500 text-white' :
                      'bg-gray-400 text-white'
                    }`}>
                      {paymentData.status === 'confirmed' ? '✅ 消込完了' :
                       paymentData.status === 'partial' ? '⏳ 一部消込' :
                       '❌ 未消込'}
                    </span>
                  </div>
                </div>

                {/* 入金予定情報 */}
                <section>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">入金予定情報</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">入金期日</label>
                      <input type="date" value={paymentData.expectedDate || ''} onClick={openDatePicker} onChange={(e) => handlePaymentChange('expectedDate', e.target.value)} className={dateInputClass} />
                    </div>
                    <div>
                      <label className="label">入金予定額</label>
                      <input type="number" value={paymentData.expectedAmount || ''} onChange={(e) => handlePaymentChange('expectedAmount', Number(e.target.value))} className={editableInputClass} placeholder="¥" />
                    </div>
                    <div className="col-span-2">
                      <label className="label">振込先口座</label>
                      <input type="text" value={paymentData.depositAccount || ''} onChange={(e) => handlePaymentChange('depositAccount', e.target.value)} className={editableInputClass} placeholder="GMO振込先等" />
                    </div>
                  </div>
                </section>

                {/* 消込状況 */}
                <section>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">消込状況</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">消込日</label>
                      <input type="date" value={paymentData.confirmedDate || ''} onClick={openDatePicker} onChange={(e) => handlePaymentChange('confirmedDate', e.target.value)} className={dateInputClass} />
                    </div>
                    <div>
                      <label className="label">消込額</label>
                      <input type="number" value={paymentData.confirmedAmount || ''} onChange={(e) => handlePaymentChange('confirmedAmount', Number(e.target.value))} className={editableInputClass} placeholder="¥" />
                    </div>
                  </div>
                </section>

                {/* 入金履歴 */}
                <section>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">入金履歴（CSVインポート）</h3>
                  {paymentData.paymentHistory && paymentData.paymentHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-100"><tr><th className="px-3 py-2 text-left">入金日</th><th className="px-3 py-2 text-right">入金額</th><th className="px-3 py-2 text-left">入金元</th><th className="px-3 py-2 text-center">照合</th><th className="px-3 py-2 text-center">消込</th></tr></thead>
                        <tbody className="divide-y divide-gray-200">
                          {paymentData.paymentHistory.map((h, i) => (
                            <tr key={i}><td className="px-3 py-2">{h.date}</td><td className="px-3 py-2 text-right">¥{h.amount.toLocaleString()}</td><td className="px-3 py-2">{h.source}</td><td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs ${h.matchResult === 'auto' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{h.matchResult === 'auto' ? '自動' : '手動'}</span></td><td className="px-3 py-2 text-center">{h.cleared ? '✅' : '❌'}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>入金履歴がありません</p>
                      <p className="text-sm mt-1">CSVをインポートして自動消込を実行してください</p>
                    </div>
                  )}
                </section>

                {/* 入金確認アクションボタン */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button type="button" className="btn-secondary flex-1">📥 入金CSVインポート</button>
                  <button type="button" className="btn-secondary flex-1">🔄 自動消込実行</button>
                  <button type="button" className="btn-secondary flex-1">📧 入金督促</button>
                  <button type="button" onClick={() => { setPaymentData(prev => ({ ...prev, status: 'confirmed' })); handleWorkflowStatusChange('paymentConfirmed', true); }} className={`flex-1 ${workflowStatus.paymentConfirmed ? 'btn-success' : 'btn-primary'}`}>
                    {workflowStatus.paymentConfirmed ? '✅ 確認完了済み' : '✅ 入金確認完了'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* フッター */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary">閉じる</button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className={saveState === 'saved' ? 'btn-success' : 'btn-primary'}
            title={saveState === 'error' ? (saveError || '保存に失敗しました') : undefined}
          >
            {isSaving
              ? '保存中...'
              : saveState === 'saved'
                ? '✅ 保存済'
                : saveState === 'error'
                  ? '⚠️ 保存（要再試行）'
                  : '保存'}
          </button>
        </div>
      </div>
    </>
  )
}
