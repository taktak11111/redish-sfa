'use client'

import { useState, useEffect } from 'react'
import { Deal } from '@/types/sfa'
import { getDropdownOptions, DropdownOption } from '@/lib/dropdownSettings'
import { previewContract, generateContract, convertFormToContractData, downloadPdf } from '@/lib/contracts'
import { ContractPdfPreviewModal } from './ContractPdfPreviewModal'

// タブの種類
type TabType = 'contract' | 'bankDocument' | 'payment'

// 日付入力のクリックでピッカーを開くヘルパー
const openDatePicker = (e: React.MouseEvent<HTMLInputElement>) => {
  const input = e.target as HTMLInputElement
  if (input.showPicker) {
    input.showPicker()
  }
}

// 商談から引き継いだフィールド用の入力スタイル（グレー背景）
const inheritedInputClass = 'input bg-gray-100 cursor-default'
const editableInputClass = 'input'
const dateInputClass = 'input cursor-pointer'
const inheritedDateInputClass = 'input bg-gray-100 cursor-pointer'

// ワークフローステータス
interface WorkflowStatus {
  contractSigned: boolean
  contractSignedDate?: string
  paymentDocCompleted: boolean
  paymentDocCompletedDate?: string
  paymentDocStatus?: 'not_requested' | 'requested' | 'defective' | 'completed'
  paymentConfirmed: boolean
  paymentConfirmedDate?: string
}

// 契約情報の追加フィールド
interface ContractFormData {
  // 1. 契約情報
  contractDate?: string
  contractStaff?: string
  customerId?: string
  contractId?: string
  // 2. 顧客情報
  businessType?: string // 事業種別（飲食/非飲食）
  entityType?: string // 法人/個人
  representativeName?: string // 代表者氏名（漢字）
  representativeNameKana?: string // 代表者氏名（ふりがな）
  tel?: string
  mail?: string
  storeCount?: number // 店舗数
  corporateName?: string // 法人名（漢字）
  corporateNameKana?: string // 法人名（ふりがな）
  registrationDate?: string // 登記日
  fiscalMonth?: number // 決算月
  capital?: number // 資本金
  // 3. 店舗情報
  storeNumber?: string
  storeName?: string // 店舗名＝屋号
  openingYear?: string // 開業初年度
  openingAddress?: string // 開業届申請住所
  employeeCount?: number // 従業員数
  // 4. サービス費用
  initialFee?: number // 初期導入費用
  monthlyBookkeepingFee?: number // 月額記帳代行料
  taxReturnFee?: number // 確定申告代行料
  receiptInputMonths?: number // 証憑入力代行月数
  receiptInputFee?: number // 証憑入力代行料
  // 5. 付加サービス
  openingDocService?: boolean // 開業書類代行要否
  freeeIntegration?: boolean // 人事労務freee導入同意
  // 6. 請求関連
  monthlyStartMonth?: string // 月額発生月
  firstPaymentDate?: string // 初回請求支払日
  taxReturnPaymentDate?: string // 確定申告料支払日
  fiscalYear?: string // 申告受注決算年度
  specialPayment?: string // 特殊支払い（分割）
  // 7. 契約期日
  renewalDate?: string // 契約更新日
  cancellationDeadline?: string // 解約申し入れ期日
  finalDeadline?: string // 最終対応期限
  // 8. その他
  contractRemarks?: string // 備考
}

// 口座振替書類の情報
interface BankDocumentData {
  requestDate?: string // 依頼日
  requestMethod?: string // 依頼方法
  requestEmail?: string // 依頼先メールアドレス
  receivedDate?: string // 受領日
  receivedMethod?: string // 受領方法
  status?: 'not_requested' | 'requested' | 'defective' | 'completed'
  defectContent?: string // 不備内容
  reRequestDate?: string // 再依頼日
  defectMemo?: string // 対応メモ
  bankName?: string // 金融機関名
  branchName?: string // 支店名
  accountType?: string // 口座種別
  accountNumber?: string // 口座番号
  accountHolder?: string // 口座名義
}

// 入金確認の情報
interface PaymentData {
  expectedDate?: string // 初回入金期日
  expectedAmount?: number // 入金予定額
  depositAccount?: string // 振込先口座
  status?: 'not_confirmed' | 'partial' | 'confirmed'
  confirmedDate?: string // 消込日
  confirmedAmount?: number // 消込額
  paymentHistory?: Array<{
    date: string
    amount: number
    source: string
    matchResult: 'auto' | 'manual'
    cleared: boolean
  }>
}

interface ContractDetailPanelProps {
  contract: Deal
  onClose: () => void
  onSave: (updates: Partial<Deal>) => void
  isSaving: boolean
  workflowStatus?: WorkflowStatus
  onWorkflowUpdate?: (status: Partial<WorkflowStatus>) => void
}

export function ContractDetailPanel({ 
  contract, 
  onClose, 
  onSave, 
  isSaving,
  workflowStatus: initialWorkflowStatus,
  onWorkflowUpdate 
}: ContractDetailPanelProps) {
  const currentYear = new Date().getFullYear()
  const [activeTab, setActiveTab] = useState<TabType>('contract')
  const [formData, setFormData] = useState<Partial<Deal>>(contract)
  const [contractFormData, setContractFormData] = useState<ContractFormData>({})
  const [bankDocumentData, setBankDocumentData] = useState<BankDocumentData>({})
  const [paymentData, setPaymentData] = useState<PaymentData>({})
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>(
    initialWorkflowStatus || {
      contractSigned: false,
      paymentDocCompleted: false,
      paymentConfirmed: false,
    }
  )
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    contractInfo: true,
    customerInfo: false,
    storeInfo: false,
    serviceFee: false,
    additionalService: false,
    billingInfo: false,
    contractPeriod: false,
    otherInfo: false,
  })

  // 契約書プレビュー関連の状態
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string>()
  const [pdfBase64Redish, setPdfBase64Redish] = useState<string>()
  const [pdfBase64Crosspoint, setPdfBase64Crosspoint] = useState<string>()
  const [isGenerating, setIsGenerating] = useState(false)
  
  // バリデーションエラー状態
  const [validationErrors, setValidationErrors] = useState<Set<keyof ContractFormData>>(new Set())

  // ドロップダウン選択肢を取得
  const [staffOptions, setStaffOptions] = useState<DropdownOption[]>([])
  
  useEffect(() => {
    // ドロップダウン設定を読み込み
    setStaffOptions(getDropdownOptions('contractStaff'))
  }, [])

  // 契約日から自動計算（契約更新日、解約申入期日、最終対応期限）
  const calculateContractDates = (contractDate: string) => {
    if (!contractDate) return {}
    
    const date = new Date(contractDate)
    
    // 契約更新日 = 契約日 + 1年
    const renewalDate = new Date(date)
    renewalDate.setFullYear(renewalDate.getFullYear() + 1)
    
    // 解約申入期日 = 契約更新日 - 3ヶ月
    const cancellationDeadline = new Date(renewalDate)
    cancellationDeadline.setMonth(cancellationDeadline.getMonth() - 3)
    
    // 最終対応期限 = 契約更新日 - 2ヶ月
    const finalDeadline = new Date(renewalDate)
    finalDeadline.setMonth(finalDeadline.getMonth() - 2)
    
    const formatDate = (d: Date) => d.toISOString().split('T')[0]
    
    return {
      renewalDate: formatDate(renewalDate),
      cancellationDeadline: formatDate(cancellationDeadline),
      finalDeadline: formatDate(finalDeadline),
    }
  }

  // 必須フィールドの定義（契約書に必要なデータ）
  const requiredFields: { field: keyof ContractFormData; label: string; condition?: () => boolean }[] = [
    { field: 'contractDate', label: '契約日' },
    { field: 'businessType', label: '事業種別' },
    { field: 'entityType', label: '法人/個人' },
    { field: 'representativeName', label: '代表者氏名（漢字）' },
    { field: 'representativeNameKana', label: '代表者氏名（ふりがな）' },
    { field: 'tel', label: 'TEL' },
    { field: 'mail', label: 'mail' },
    { field: 'corporateName', label: '法人名（漢字）', condition: () => contractFormData.entityType === '法人' },
    { field: 'openingAddress', label: '住所' },
    { field: 'initialFee', label: '初期導入費用' },
    { field: 'monthlyBookkeepingFee', label: '月額記帳代行費' },
    { field: 'taxReturnFee', label: '確定申告代行費' },
  ]

  // バリデーション関数
  const validateContractData = (): { isValid: boolean; errors: Set<keyof ContractFormData>; messages: string[] } => {
    const errors = new Set<keyof ContractFormData>()
    const messages: string[] = []
    
    for (const { field, label, condition } of requiredFields) {
      // 条件付き必須フィールドの場合、条件を確認
      if (condition && !condition()) continue
      
      const value = contractFormData[field]
      const isEmpty = value === undefined || value === null || value === '' || 
        (typeof value === 'number' && isNaN(value))
      
      if (isEmpty) {
        errors.add(field)
        messages.push(label)
      }
    }
    
    return {
      isValid: errors.size === 0,
      errors,
      messages,
    }
  }

  // 入力フィールドのエラースタイル
  const getInputClassName = (field: keyof ContractFormData, baseClass: string) => {
    if (validationErrors.has(field)) {
      return `${baseClass} ring-2 ring-red-500 border-red-500`
    }
    return baseClass
  }

  useEffect(() => {
    setFormData(contract)
    
    // 契約日から自動計算
    const calculatedDates = calculateContractDates(contract.resultDate || '')

    // 契約担当者のデフォルト（商談担当者）
    const defaultContractStaff = contract.dealStaffFS || contract.staffIS || ''
    
    // 契約情報の初期値を設定（商談から引き継ぐフィールド + デフォルト値 + 自動計算）
    setContractFormData(prev => ({
      ...prev,
      // 1. 契約情報
      contractDate: contract.resultDate,
      contractStaff: prev.contractStaff ?? (defaultContractStaff || undefined),
      
      // 2. 顧客情報（SFA連動）
      businessType: prev.businessType ?? (contract.category || 'A:飲食'),
      entityType: prev.entityType ?? '個人',
      representativeName: contract.contactName,
      representativeNameKana: contract.contactNameKana,
      tel: contract.phone,
      mail: contract.email,
      corporateName: contract.companyName,
      
      // 3. 店舗情報（SFA連動）
      storeName: contract.companyName,
      openingAddress: contract.address,
      openingYear: prev.openingYear ?? String(currentYear),
      employeeCount: prev.employeeCount ?? 1,
      
      // 4. サービス費用（デフォルト値）
      initialFee: prev.initialFee ?? 50000,
      monthlyBookkeepingFee: prev.monthlyBookkeepingFee ?? 10000,
      taxReturnFee: prev.taxReturnFee ?? 100000,

      // 顧客情報のデフォルト
      storeCount: prev.storeCount ?? 1,

      // 6. 請求関連（デフォルト）
      fiscalYear: prev.fiscalYear ?? String(currentYear),
      
      // 7. 契約期日（自動計算）
      ...calculatedDates,
    }))
    // 口座振替書類のメールアドレス初期値
    setBankDocumentData(prev => ({
      ...prev,
      requestEmail: contract.email,
    }))
  }, [contract])

  // 顧客番号の自動採番（スプレッドシートから最大値取得→+1）
  const [isGeneratingCustomerId, setIsGeneratingCustomerId] = useState(false)
  
  const generateCustomerId = async (businessType: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/contracts/customer-id?businessType=${encodeURIComponent(businessType)}`)
      const result = await response.json()
      
      if (result.success) {
        return result.data.customerId
      } else {
        console.error('顧客番号取得エラー:', result.error)
        alert(`顧客番号の取得に失敗しました: ${result.error}`)
        return null
      }
    } catch (error) {
      console.error('顧客番号取得エラー:', error)
      alert('顧客番号の取得に失敗しました')
      return null
    }
  }

  // 事業種別変更時に顧客番号を自動採番
  const handleBusinessTypeChange = async (value: string) => {
    handleContractFormChange('businessType', value)
    if (value && !contractFormData.customerId) {
      setIsGeneratingCustomerId(true)
      const newCustomerId = await generateCustomerId(value)
      if (newCustomerId) {
        handleContractFormChange('customerId', newCustomerId)
      }
      setIsGeneratingCustomerId(false)
    }
  }

  const handleChange = (field: keyof Deal, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleContractFormChange = (field: keyof ContractFormData, value: string | number | boolean | undefined) => {
    setContractFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // 契約日変更時に契約期日を自動計算
      if (field === 'contractDate' && typeof value === 'string') {
        const calculatedDates = calculateContractDates(value)
        return { ...updated, ...calculatedDates }
      }
      
      // 証憑入力代行月数変更時に証憑入力代行費を自動計算（¥10,000/月）
      if (field === 'receiptInputMonths' && typeof value === 'number') {
        return { ...updated, receiptInputFee: value * 10000 }
      }
      
      return updated
    })
  }

  const handleBankDocumentChange = (field: keyof BankDocumentData, value: string | undefined) => {
    setBankDocumentData(prev => ({ ...prev, [field]: value }))
  }

  const handlePaymentChange = (field: keyof PaymentData, value: string | number | undefined) => {
    setPaymentData(prev => ({ ...prev, [field]: value }))
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

  const handleWorkflowStatusChange = (field: keyof WorkflowStatus, value: boolean | string) => {
    const newStatus = { ...workflowStatus, [field]: value }
    setWorkflowStatus(newStatus)
    onWorkflowUpdate?.(newStatus)
  }

  // 契約書プレビューを生成
  const handlePreviewContract = async () => {
    // バリデーション実行
    const { isValid, errors, messages } = validateContractData()
    setValidationErrors(errors)
    
    if (!isValid) {
      alert(`⚠️ 契約書作成に必要な情報が不足しています:\n\n・${messages.join('\n・')}\n\n上記の項目を入力してください。`)
      // エラーのあるセクションを開く
      setExpandedSections(prev => ({
        ...prev,
        contractInfo: errors.has('contractDate'),
        customerInfo: errors.has('businessType') || errors.has('entityType') || errors.has('representativeName') || 
                     errors.has('representativeNameKana') || errors.has('tel') || errors.has('mail') || errors.has('corporateName'),
        storeInfo: errors.has('openingAddress'),
        serviceFee: errors.has('initialFee') || errors.has('monthlyBookkeepingFee') || errors.has('taxReturnFee'),
      }))
      return
    }
    
    setIsPreviewModalOpen(true)
    setIsPreviewLoading(true)
    setPreviewError(undefined)
    setPdfBase64Redish(undefined)
    setPdfBase64Crosspoint(undefined)

    try {
      // フォームデータをAPI用の型に変換
      const contractData = convertFormToContractData(contractFormData)

      // REDISHとクロスポイントの両方のプレビューを並行生成
      const [redishResult, crosspointResult] = await Promise.all([
        previewContract(contractData, 'REDISH'),
        previewContract(contractData, 'クロスポイント'),
      ])

      if (redishResult.success && redishResult.pdfBase64) {
        setPdfBase64Redish(redishResult.pdfBase64)
      }
      if (crosspointResult.success && crosspointResult.pdfBase64) {
        setPdfBase64Crosspoint(crosspointResult.pdfBase64)
      }

      // どちらかが失敗した場合はエラーを表示
      if (!redishResult.success && !crosspointResult.success) {
        setPreviewError(redishResult.error || crosspointResult.error || 'プレビュー生成に失敗しました')
      }
    } catch (error) {
      console.error('Preview generation error:', error)
      setPreviewError(error instanceof Error ? error.message : 'プレビュー生成に失敗しました')
    } finally {
      setIsPreviewLoading(false)
    }
  }

  // 契約書PDFを生成してダウンロード
  const handleGenerateContract = async () => {
    // バリデーション実行
    const { isValid, errors, messages } = validateContractData()
    setValidationErrors(errors)
    
    if (!isValid) {
      alert(`⚠️ 契約書作成に必要な情報が不足しています:\n\n・${messages.join('\n・')}\n\n上記の項目を入力してください。`)
      setIsPreviewModalOpen(false)
      // エラーのあるセクションを開く
      setExpandedSections(prev => ({
        ...prev,
        contractInfo: errors.has('contractDate'),
        customerInfo: errors.has('businessType') || errors.has('entityType') || errors.has('representativeName') || 
                     errors.has('representativeNameKana') || errors.has('tel') || errors.has('mail') || errors.has('corporateName'),
        storeInfo: errors.has('openingAddress'),
        serviceFee: errors.has('initialFee') || errors.has('monthlyBookkeepingFee') || errors.has('taxReturnFee'),
      }))
      return
    }
    
    setIsGenerating(true)

    try {
      const contractData = convertFormToContractData(contractFormData)
      const contractTitle = `税務契約書_${contractFormData.representativeName || contract.contactName}_${contractFormData.contractDate || new Date().toISOString().split('T')[0]}`

      const result = await generateContract(contractData, contractTitle)

      if (result.success && result.pdfBase64) {
        // REDISHとクロスポイントの両方をダウンロード
        if (result.pdfBase64.redish) {
          downloadPdf(result.pdfBase64.redish, `${contractTitle}_REDISH.pdf`)
        }
        if (result.pdfBase64.crosspoint) {
          // 少し遅延を入れて連続ダウンロードを避ける
          setTimeout(() => {
            downloadPdf(result.pdfBase64!.crosspoint!, `${contractTitle}_クロスポイント.pdf`)
          }, 500)
        }
        alert('契約書PDFのダウンロードを開始しました。\n\n・REDISH契約書\n・クロスポイント税理士法人契約書')
        setIsPreviewModalOpen(false)
      } else {
        alert(`契約書生成に失敗しました: ${result.error}`)
      }
    } catch (error) {
      console.error('Contract generation error:', error)
      alert(`契約書生成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setIsGenerating(false)
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
      
      {/* サイドパネル（幅を広げる） */}
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
            <h2 className="text-xl font-bold text-gray-900">成約・契約関連詳細</h2>
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

        {/* ワークフロー進捗 */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-center gap-2">
            {/* ステップ1: 契約締結 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getStepClass(workflowStatus.contractSigned, activeTab === 'contract' && !workflowStatus.contractSigned)}`}>
                {workflowStatus.contractSigned ? '✓' : '1'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">契約締結</span>
            </div>
            <div className={`w-12 h-1 ${workflowStatus.contractSigned ? 'bg-green-500' : 'bg-gray-200'}`} />
            {/* ステップ2: 書類入手 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getStepClass(workflowStatus.paymentDocCompleted, activeTab === 'bankDocument' && !workflowStatus.paymentDocCompleted)}`}>
                {workflowStatus.paymentDocCompleted ? '✓' : '2'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">書類入手</span>
            </div>
            <div className={`w-12 h-1 ${workflowStatus.paymentDocCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
            {/* ステップ3: 入金確認 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getStepClass(workflowStatus.paymentConfirmed, activeTab === 'payment' && !workflowStatus.paymentConfirmed)}`}>
                {workflowStatus.paymentConfirmed ? '✓' : '3'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">入金確認</span>
            </div>
          </div>
        </div>

        {/* タブ */}
        <div className="bg-gray-100 px-6 pt-2 flex gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('contract')}
            className={getTabClass('contract')}
          >
            📄 契約管理
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bankDocument')}
            className={getTabClass('bankDocument')}
          >
            📋 口座振替書類
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
            
            {/* ===== タブ1: 契約管理 ===== */}
            {activeTab === 'contract' && (
              <>
                {/* 成約基本情報（読取専用） */}
                <section className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">成約基本情報（商談から継承）</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div><span className="text-gray-500">商談ID:</span> <span className="font-medium">{dealId}</span></div>
                    <div><span className="text-gray-500">サービス:</span> <span className="font-medium">{formData.service || '-'}</span></div>
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
                        <label className="label">契約日 <span className="text-xs text-gray-400">（成約日から継承）</span> <span className="text-red-500">*</span></label>
                        <input type="date" value={contractFormData.contractDate || ''} onClick={openDatePicker} onChange={(e) => handleContractFormChange('contractDate', e.target.value)} className={getInputClassName('contractDate', inheritedDateInputClass)} readOnly={!!contract.resultDate} />
                      </div>
                      <div>
                        <label className="label">契約担当者</label>
                        <select value={contractFormData.contractStaff || ''} onChange={(e) => handleContractFormChange('contractStaff', e.target.value)} className={editableInputClass}>
                          <option value="">選択...</option>
                          {/* デフォルト（商談担当者）が設定候補に無い場合でも表示できるようにする */}
                          {(contract.dealStaffFS || contract.staffIS) && !staffOptions.some(o => o.value === (contract.dealStaffFS || contract.staffIS)) && (
                            <option value={contract.dealStaffFS || contract.staffIS}>{contract.dealStaffFS || contract.staffIS}</option>
                          )}
                          {staffOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">顧客番号 <span className="text-xs text-gray-400">（事業種別選択で自動採番）</span></label>
                        <div className="relative">
                          <input type="text" value={isGeneratingCustomerId ? '取得中...' : (contractFormData.customerId || '')} onChange={(e) => handleContractFormChange('customerId', e.target.value)} className={contractFormData.customerId ? inheritedInputClass : editableInputClass} placeholder="A000001 / B000001" readOnly={!!contractFormData.customerId || isGeneratingCustomerId} />
                          {isGeneratingCustomerId && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <svg className="animate-spin h-4 w-4 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="label">成約ID</label>
                        <input type="text" value={contractFormData.contractId || ''} onChange={(e) => handleContractFormChange('contractId', e.target.value)} className={editableInputClass} placeholder="CN0001" />
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
                        <label className="label">事業種別 <span className="text-xs text-amber-600">（顧客番号自動採番）</span> <span className="text-red-500">*</span></label>
                        <select value={contractFormData.businessType || ''} onChange={(e) => { void handleBusinessTypeChange(e.target.value) }} className={getInputClassName('businessType', editableInputClass)}>
                          <option value="">選択...</option>
                          <option value="A:飲食">A:飲食</option>
                          <option value="B:非飲食">B:非飲食</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">法人/個人 <span className="text-red-500">*</span></label>
                        <select value={contractFormData.entityType || ''} onChange={(e) => handleContractFormChange('entityType', e.target.value)} className={getInputClassName('entityType', editableInputClass)}>
                          <option value="">選択...</option>
                          <option value="個人">個人</option>
                          <option value="法人">法人</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">代表者氏名（漢字） <span className="text-xs text-gray-400">（商談から継承）</span> <span className="text-red-500">*</span></label>
                        <input type="text" value={contractFormData.representativeName || ''} onChange={(e) => handleContractFormChange('representativeName', e.target.value)} className={getInputClassName('representativeName', contract.contactName ? inheritedInputClass : editableInputClass)} />
                      </div>
                      <div>
                        <label className="label">代表者氏名（ふりがな） <span className="text-xs text-gray-400">（商談から継承）</span> <span className="text-red-500">*</span></label>
                        <input type="text" value={contractFormData.representativeNameKana || ''} onChange={(e) => handleContractFormChange('representativeNameKana', e.target.value)} className={getInputClassName('representativeNameKana', contract.contactNameKana ? inheritedInputClass : editableInputClass)} />
                      </div>
                      <div>
                        <label className="label">TEL <span className="text-xs text-gray-400">（商談から継承）</span> <span className="text-red-500">*</span></label>
                        <input type="tel" value={contractFormData.tel || ''} onChange={(e) => handleContractFormChange('tel', e.target.value)} className={getInputClassName('tel', contract.phone ? inheritedInputClass : editableInputClass)} />
                      </div>
                      <div>
                        <label className="label">mail <span className="text-xs text-gray-400">（商談から継承）</span> <span className="text-red-500">*</span></label>
                        <input type="email" value={contractFormData.mail || ''} onChange={(e) => handleContractFormChange('mail', e.target.value)} className={getInputClassName('mail', contract.email ? inheritedInputClass : editableInputClass)} />
                      </div>
                      <div>
                        <label className="label">店舗数</label>
                        <input type="number" value={contractFormData.storeCount || ''} onChange={(e) => handleContractFormChange('storeCount', Number(e.target.value))} className={editableInputClass} />
                      </div>
                      <div>
                        <label className="label">法人名（漢字） {contractFormData.entityType === '法人' && <span className="text-red-500">*</span>}</label>
                        <input type="text" value={contractFormData.corporateName || ''} onChange={(e) => handleContractFormChange('corporateName', e.target.value)} className={getInputClassName('corporateName', editableInputClass)} />
                      </div>
                      <div>
                        <label className="label">法人名（ふりがな）</label>
                        <input type="text" value={contractFormData.corporateNameKana || ''} onChange={(e) => handleContractFormChange('corporateNameKana', e.target.value)} className={editableInputClass} />
                      </div>
                      <div>
                        <label className="label">登記日</label>
                        <input type="date" value={contractFormData.registrationDate || ''} onClick={openDatePicker} onChange={(e) => handleContractFormChange('registrationDate', e.target.value)} className={dateInputClass} />
                      </div>
                      <div>
                        <label className="label">決算月</label>
                        <select value={contractFormData.fiscalMonth || ''} onChange={(e) => handleContractFormChange('fiscalMonth', Number(e.target.value))} className={editableInputClass}>
                          <option value="">選択...</option>
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                            <option key={m} value={m}>{m}月</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">資本金（万円）</label>
                        <input type="number" value={contractFormData.capital || ''} onChange={(e) => handleContractFormChange('capital', Number(e.target.value))} className={editableInputClass} placeholder="例: 300" />
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
                        <input type="text" value={contractFormData.storeNumber || (contractFormData.customerId ? `${contractFormData.customerId}-01` : '')} onChange={(e) => handleContractFormChange('storeNumber', e.target.value)} className={inheritedInputClass} readOnly />
                      </div>
                      <div>
                        <label className="label">店舗名＝屋号 <span className="text-xs text-gray-400">（商談から継承）</span></label>
                        <input type="text" value={contractFormData.storeName || ''} onChange={(e) => handleContractFormChange('storeName', e.target.value)} className={contract.companyName ? inheritedInputClass : editableInputClass} />
                      </div>
                      <div>
                        <label className="label">開業初年度</label>
                        <input type="text" value={contractFormData.openingYear || ''} onChange={(e) => handleContractFormChange('openingYear', e.target.value)} className={editableInputClass} placeholder={`例: ${currentYear}`} />
                      </div>
                      <div>
                        <label className="label">従業員数</label>
                        <input type="number" value={contractFormData.employeeCount || ''} onChange={(e) => handleContractFormChange('employeeCount', Number(e.target.value))} className={editableInputClass} />
                      </div>
                      <div className="col-span-2">
                        <label className="label">開業届申請住所 <span className="text-red-500">*</span></label>
                        <input type="text" value={contractFormData.openingAddress || ''} onChange={(e) => handleContractFormChange('openingAddress', e.target.value)} className={getInputClassName('openingAddress', editableInputClass)} />
                      </div>
                    </div>
                  )}
                </section>

                {/* 4. サービス費用（税務） */}
                <section>
                  <button type="button" onClick={() => toggleSection('serviceFee')} className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                    <span>4. サービス費用（税務）</span>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.serviceFee ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {expandedSections.serviceFee && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">初期導入費用 <span className="text-xs text-gray-400">（基本: ¥50,000）</span> <span className="text-red-500">*</span></label>
                        <input type="number" value={contractFormData.initialFee ?? 50000} onChange={(e) => handleContractFormChange('initialFee', Number(e.target.value))} className={getInputClassName('initialFee', editableInputClass)} />
                      </div>
                      <div>
                        <label className="label">月額記帳代行料 <span className="text-xs text-gray-400">（基本: ¥10,000）</span> <span className="text-red-500">*</span></label>
                        <input type="number" value={contractFormData.monthlyBookkeepingFee ?? 10000} onChange={(e) => handleContractFormChange('monthlyBookkeepingFee', Number(e.target.value))} className={getInputClassName('monthlyBookkeepingFee', editableInputClass)} />
                      </div>
                      <div>
                        <label className="label">確定申告代行料 <span className="text-xs text-gray-400">（基本: ¥100,000）</span> <span className="text-red-500">*</span></label>
                        <input type="number" value={contractFormData.taxReturnFee ?? 100000} onChange={(e) => handleContractFormChange('taxReturnFee', Number(e.target.value))} className={getInputClassName('taxReturnFee', editableInputClass)} />
                      </div>
                      <div>
                        <label className="label">証憑入力代行月数</label>
                        <input type="number" value={contractFormData.receiptInputMonths || ''} onChange={(e) => handleContractFormChange('receiptInputMonths', Number(e.target.value))} className={editableInputClass} placeholder="0" />
                      </div>
                      <div>
                        <label className="label">証憑入力代行料 <span className="text-xs text-gray-400">（月数 × ¥10,000）</span></label>
                        <input type="number" value={contractFormData.receiptInputFee ?? ((contractFormData.receiptInputMonths || 0) * 10000)} onChange={(e) => handleContractFormChange('receiptInputFee', Number(e.target.value))} className={inheritedInputClass} readOnly />
                      </div>
                      <div className="col-span-2 bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-sm font-medium text-blue-800">
                          {(() => {
                            const subtotalExclTax =
                              (contractFormData.initialFee ?? 50000) +
                              (contractFormData.taxReturnFee ?? 100000) +
                              ((contractFormData.receiptInputMonths || 0) * 10000)
                            const taxRate = 0.1
                            const tax = Math.round(subtotalExclTax * taxRate)
                            const subtotalInclTax = subtotalExclTax + tax
                            return (
                              <>
                                合計（税込）: ¥{subtotalInclTax.toLocaleString()}（税抜 ¥{subtotalExclTax.toLocaleString()} / 消費税10% ¥{tax.toLocaleString()}） + 月額 ¥{(contractFormData.monthlyBookkeepingFee ?? 10000).toLocaleString()}/月
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* 5. 付加サービス */}
                <section>
                  <button type="button" onClick={() => toggleSection('additionalService')} className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                    <span>5. 付加サービス</span>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.additionalService ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {expandedSections.additionalService && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2"><input type="checkbox" checked={contractFormData.openingDocService || false} onChange={(e) => handleContractFormChange('openingDocService', e.target.checked)} className="h-4 w-4" /><label className="label mb-0">開業書類代行要否</label></div>
                      <div className="flex items-center gap-2"><input type="checkbox" checked={contractFormData.freeeIntegration || false} onChange={(e) => handleContractFormChange('freeeIntegration', e.target.checked)} className="h-4 w-4" /><label className="label mb-0">人事労務freee導入同意</label></div>
                    </div>
                  )}
                </section>

                {/* 6. 請求関連 */}
                <section>
                  <button type="button" onClick={() => toggleSection('billingInfo')} className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                    <span>6. 請求関連</span>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.billingInfo ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {expandedSections.billingInfo && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">月額発生月</label>
                        <input type="month" value={contractFormData.monthlyStartMonth || ''} onClick={openDatePicker} onChange={(e) => handleContractFormChange('monthlyStartMonth', e.target.value)} className={dateInputClass} />
                      </div>
                      <div>
                        <label className="label">初回請求支払日</label>
                        <input type="date" value={contractFormData.firstPaymentDate || ''} onClick={openDatePicker} onChange={(e) => handleContractFormChange('firstPaymentDate', e.target.value)} className={dateInputClass} />
                      </div>
                      <div>
                        <label className="label">確定申告料支払日</label>
                        <input type="text" value={contractFormData.taxReturnPaymentDate || ''} onChange={(e) => handleContractFormChange('taxReturnPaymentDate', e.target.value)} className={editableInputClass} placeholder="例：4月" />
                      </div>
                      <div>
                        <label className="label">申告受注決算年度</label>
                        <select value={contractFormData.fiscalYear || ''} onChange={(e) => handleContractFormChange('fiscalYear', e.target.value)} className={editableInputClass}>
                          <option value="">選択...</option>
                          {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map(y => (
                            <option key={y} value={y}>{y}年度</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="label">特殊支払い（分割）</label>
                        <input type="text" value={contractFormData.specialPayment || ''} onChange={(e) => handleContractFormChange('specialPayment', e.target.value)} className={editableInputClass} placeholder="分割払いの場合はここに記載" />
                      </div>
                    </div>
                  )}
                </section>

                {/* 7. 契約期日 */}
                <section>
                  <button type="button" onClick={() => toggleSection('contractPeriod')} className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                    <span>7. 契約期日</span>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.contractPeriod ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {expandedSections.contractPeriod && (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="label">契約更新日</label>
                        <input type="date" value={contractFormData.renewalDate || ''} onClick={openDatePicker} onChange={(e) => handleContractFormChange('renewalDate', e.target.value)} className={dateInputClass} />
                      </div>
                      <div>
                        <label className="label">解約申し入れ期日</label>
                        <input type="date" value={contractFormData.cancellationDeadline || ''} onClick={openDatePicker} onChange={(e) => handleContractFormChange('cancellationDeadline', e.target.value)} className={dateInputClass} />
                      </div>
                      <div>
                        <label className="label">最終対応期限</label>
                        <input type="date" value={contractFormData.finalDeadline || ''} onClick={openDatePicker} onChange={(e) => handleContractFormChange('finalDeadline', e.target.value)} className={dateInputClass} />
                      </div>
                    </div>
                  )}
                </section>

                {/* 8. その他 */}
                <section>
                  <button type="button" onClick={() => toggleSection('otherInfo')} className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                    <span>8. その他</span>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.otherInfo ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {expandedSections.otherInfo && (
                    <div><label className="label">備考</label><textarea value={contractFormData.contractRemarks || ''} onChange={(e) => handleContractFormChange('contractRemarks', e.target.value)} className="input" rows={4} /></div>
                  )}
                </section>

                {/* 契約管理アクションボタン */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={handlePreviewContract}
                    className="btn-secondary flex-1"
                  >
                    📄 契約書プレビュー
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      // プレビュー後に生成する場合はモーダルを開く
                      if (pdfBase64Redish || pdfBase64Crosspoint) {
                        handleGenerateContract()
                      } else {
                        // プレビューがない場合は先にプレビューを生成
                        handlePreviewContract()
                      }
                    }}
                    disabled={isGenerating}
                    className="btn-secondary flex-1"
                  >
                    {isGenerating ? '⏳ 生成中...' : '📤 契約書PDF生成'}
                  </button>
                  <button type="button" onClick={() => handleWorkflowStatusChange('contractSigned', true)} className={`flex-1 ${workflowStatus.contractSigned ? 'btn-success' : 'btn-primary'}`}>
                    {workflowStatus.contractSigned ? '✅ 契約締結済み' : '✅ 契約締結済みにする'}
                  </button>
                </div>
              </>
            )}

            {/* ===== タブ2: 口座振替書類 ===== */}
            {activeTab === 'bankDocument' && (
              <>
                {/* ステータス表示 */}
                <div className={`rounded-lg p-4 border-2 ${
                  bankDocumentData.status === 'completed' ? 'bg-green-50 border-green-300' :
                  bankDocumentData.status === 'defective' ? 'bg-amber-50 border-amber-300' :
                  bankDocumentData.status === 'requested' ? 'bg-blue-50 border-blue-300' :
                  'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">現在のステータス</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      bankDocumentData.status === 'completed' ? 'bg-green-500 text-white' :
                      bankDocumentData.status === 'defective' ? 'bg-amber-500 text-white' :
                      bankDocumentData.status === 'requested' ? 'bg-blue-500 text-white' :
                      'bg-gray-400 text-white'
                    }`}>
                      {bankDocumentData.status === 'completed' ? '✅ 入手完了' :
                       bankDocumentData.status === 'defective' ? '⚠️ 不備対応中' :
                       bankDocumentData.status === 'requested' ? '📤 依頼済み' :
                       '📝 未依頼'}
                    </span>
                  </div>
                </div>

                {/* 依頼状況 */}
                <section>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">依頼状況</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">依頼日</label>
                      <input type="date" value={bankDocumentData.requestDate || ''} onClick={openDatePicker} onChange={(e) => handleBankDocumentChange('requestDate', e.target.value)} className={dateInputClass} />
                    </div>
                    <div>
                      <label className="label">依頼方法</label>
                      <select value={bankDocumentData.requestMethod || ''} onChange={(e) => handleBankDocumentChange('requestMethod', e.target.value)} className={editableInputClass}>
                        <option value="">選択...</option>
                        <option value="メール">メール</option>
                        <option value="郵送">郵送</option>
                        <option value="FAX">FAX</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="label">依頼先メールアドレス <span className="text-xs text-gray-400">（商談から継承）</span></label>
                      <input type="email" value={bankDocumentData.requestEmail || ''} onChange={(e) => handleBankDocumentChange('requestEmail', e.target.value)} className={contract.email ? inheritedInputClass : editableInputClass} />
                    </div>
                  </div>
                </section>

                {/* 書類受領状況 */}
                <section>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">書類受領状況</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">受領日</label>
                      <input type="date" value={bankDocumentData.receivedDate || ''} onClick={openDatePicker} onChange={(e) => handleBankDocumentChange('receivedDate', e.target.value)} className={dateInputClass} />
                    </div>
                    <div>
                      <label className="label">受領方法</label>
                      <select value={bankDocumentData.receivedMethod || ''} onChange={(e) => handleBankDocumentChange('receivedMethod', e.target.value)} className={editableInputClass}>
                        <option value="">選択...</option>
                        <option value="メール">メール</option>
                        <option value="郵送">郵送</option>
                        <option value="FAX">FAX</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* 不備対応 */}
                <section>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">不備対応</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="label">不備内容</label>
                      <textarea value={bankDocumentData.defectContent || ''} onChange={(e) => handleBankDocumentChange('defectContent', e.target.value)} className={editableInputClass} rows={2} placeholder="不備がある場合は内容を記載" />
                    </div>
                    <div>
                      <label className="label">再依頼日</label>
                      <input type="date" value={bankDocumentData.reRequestDate || ''} onClick={openDatePicker} onChange={(e) => handleBankDocumentChange('reRequestDate', e.target.value)} className={dateInputClass} />
                    </div>
                    <div>
                      <label className="label">対応メモ</label>
                      <input type="text" value={bankDocumentData.defectMemo || ''} onChange={(e) => handleBankDocumentChange('defectMemo', e.target.value)} className={editableInputClass} />
                    </div>
                  </div>
                </section>

                {/* 口座情報（確認用） */}
                <section>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">口座情報（確認用）</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">金融機関名</label>
                      <input type="text" value={bankDocumentData.bankName || ''} onChange={(e) => handleBankDocumentChange('bankName', e.target.value)} className={editableInputClass} />
                    </div>
                    <div>
                      <label className="label">支店名</label>
                      <input type="text" value={bankDocumentData.branchName || ''} onChange={(e) => handleBankDocumentChange('branchName', e.target.value)} className={editableInputClass} />
                    </div>
                    <div>
                      <label className="label">口座種別</label>
                      <select value={bankDocumentData.accountType || ''} onChange={(e) => handleBankDocumentChange('accountType', e.target.value)} className={editableInputClass}>
                        <option value="">選択...</option>
                        <option value="普通">普通</option>
                        <option value="当座">当座</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">口座番号</label>
                      <input type="text" value={bankDocumentData.accountNumber || ''} onChange={(e) => handleBankDocumentChange('accountNumber', e.target.value)} className={editableInputClass} />
                    </div>
                    <div className="col-span-2">
                      <label className="label">口座名義 <span className="text-xs text-amber-600">（自動消込の照合キー）</span></label>
                      <input type="text" value={bankDocumentData.accountHolder || ''} onChange={(e) => handleBankDocumentChange('accountHolder', e.target.value)} className={editableInputClass} placeholder="カタカナで入力" />
                    </div>
                  </div>
                </section>

                {/* 口座振替書類アクションボタン */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={() => setBankDocumentData(prev => ({ ...prev, status: 'requested' }))} className="btn-secondary flex-1">📝 依頼済みにする</button>
                  <button type="button" onClick={() => setBankDocumentData(prev => ({ ...prev, status: 'defective' }))} className="btn-secondary flex-1">🔄 不備対応中にする</button>
                  <button type="button" onClick={() => { setBankDocumentData(prev => ({ ...prev, status: 'completed' })); handleWorkflowStatusChange('paymentDocCompleted', true); }} className={`flex-1 ${workflowStatus.paymentDocCompleted ? 'btn-success' : 'btn-primary'}`}>
                    {workflowStatus.paymentDocCompleted ? '✅ 入手完了済み' : '✅ 書類入手完了'}
                  </button>
                </div>
              </>
            )}

            {/* ===== タブ3: 入金確認 ===== */}
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
                      <label className="label">初回入金期日</label>
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
          <button type="button" onClick={handleSubmit} disabled={isSaving} className="btn-primary">{isSaving ? '保存中...' : '保存'}</button>
        </div>
      </div>

      {/* 契約書プレビューモーダル */}
      <ContractPdfPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        pdfBase64Redish={pdfBase64Redish}
        pdfBase64Crosspoint={pdfBase64Crosspoint}
        isLoading={isPreviewLoading}
        error={previewError}
        onGenerate={handleGenerateContract}
        isGenerating={isGenerating}
      />
    </>
  )
}







