'use client'

import { useState, useEffect } from 'react'
import { Deal, DealRank, DealResult } from '@/types/sfa'
import { getDropdownOptions, refreshDropdownSettingsFromDB } from '@/lib/dropdownSettings'

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
  const [formData, setFormData] = useState<Partial<Deal>>(deal)
  const [isEditing, setIsEditing] = useState(true) // 右列（商談中・商談後）の編集モード
  const [isEditingLeft, setIsEditingLeft] = useState(false) // 左列（商談前情報）の編集モード（デフォルト読み取り専用）
  const [isSaved, setIsSaved] = useState(false) // 保存済みフラグ
  const [show2ndHistory, setShow2ndHistory] = useState(false) // 2回目商談履歴表示
  const [show3rdHistory, setShow3rdHistory] = useState(false) // 3回目商談履歴表示
  const [show2ndAction, setShow2ndAction] = useState(false) // 2回目アクション履歴表示
  const [showStartWarning, setShowStartWarning] = useState(false) // 開始警告モーダル
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(null) // リアルタイム経過時間（秒）
  // 業務フロー順に展開/折畳を設定
  // 左列（商談前）: 基本情報・IS引継・連携元 = 展開、その他 = 折畳
  // 右列（商談中/後）: 商談情報・商談最終結果 = 展開、その他 = 折畳
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    // 左列: 商談前情報（すべて展開）
    basicEssential: true,   // 基本情報（必須）- 展開
    isHandover: true,       // IS引き継ぎ情報 - 展開
    sourceInfo: true,       // 連携元情報 - 展開
    basicOther: true,       // その他詳細 - 展開
    // 右列: 商談中・商談後
    dealInfo: true,         // 商談情報 - 展開
    dealRecord: false,      // 商談記録 - 折畳
    dealHistory: false,     // 商談結果履歴 - 折畳
    action: false,          // アクション管理 - 折畳
    result: true,           // 商談最終結果 - 展開
    selfAssessment: false,  // 商談自己採点 - 折畳
    learning: false,        // 改善・学習記録 - 折畳
  })
  const [dropdownSettings, setDropdownSettings] = useState({
    staffIS: getDropdownOptions('staffIS'),
    dealStaffFS: getDropdownOptions('dealStaffFS'),
    dealResult: getDropdownOptions('dealResult'),
    lostReasonFS: getDropdownOptions('lostReasonFS'),
    dealPhase: getDropdownOptions('dealPhase'),
    rankEstimate: getDropdownOptions('rankEstimate'),
    rankChange: getDropdownOptions('rankChange'),
    meetingStatus: getDropdownOptions('meetingStatus'),
    needTemperature: getDropdownOptions('needTemperature'),
    contractReason: getDropdownOptions('contractReason'),
    feedbackToIS: getDropdownOptions('feedbackToIS'),
    bantBudget: getDropdownOptions('bantBudget'),
    bantAuthority: getDropdownOptions('bantAuthority'),
    bantTimeline: getDropdownOptions('bantTimeline'),
    competitorStatus: getDropdownOptions('competitorStatus'),
    selfHandlingStatus: getDropdownOptions('selfHandlingStatus'),
    nextActionContent: getDropdownOptions('nextActionContent'),
  })

  useEffect(() => {
    setFormData(deal)
    // 商談結果が設定されている場合は結果セクションを自動展開
    if (deal.result) {
      setExpandedSections(prev => ({ ...prev, result: true }))
    }
    // 新しいレコードを開いた時は右列を編集モードに、左列は読み取り専用に
    setIsEditing(true)
    setIsEditingLeft(false)
    setIsSaved(false)
  }, [deal])

  // DBから設定を取得（初回読み込み時のみ、既存のlocalStorage設定を上書きしない）
  useEffect(() => {
    refreshDropdownSettingsFromDB().catch(err => {
      console.error('Failed to refresh dropdown settings from DB:', err)
      // エラー時は既存のlocalStorage設定を使用（既存動作を維持）
    })
  }, [])

  // 商談時間のリアルタイム計測
  useEffect(() => {
    // Boolean型変換（DBから文字列やnullで返ってくる可能性があるため）
    const isStarted = formData.dealStarted === true || (formData.dealStarted as any) === 'true' || (formData.dealStarted as any) === 1
    const isEnded = formData.dealEnded === true || (formData.dealEnded as any) === 'true' || (formData.dealEnded as any) === 1
    const startedAt = formData.dealStartedAt
    
    // 終了済みの場合は保存された値を表示（分→秒に変換）
    if (isEnded && formData.dealDurationMinutes != null) {
      setElapsedSeconds(formData.dealDurationMinutes * 60)
      return
    }
    // 開始済み・未終了の場合はリアルタイム計測
    if (isStarted && !isEnded && startedAt) {
      const updateElapsed = () => {
        const startTime = new Date(startedAt).getTime()
        const now = Date.now()
        const seconds = Math.floor((now - startTime) / 1000)
        setElapsedSeconds(seconds)
      }
      updateElapsed() // 初回実行
      const interval = setInterval(updateElapsed, 1000) // 1秒ごとに更新
      return () => clearInterval(interval)
    }
    // 未開始の場合はnull
    setElapsedSeconds(null)
  }, [formData.dealStarted, formData.dealEnded, formData.dealStartedAt, formData.dealDurationMinutes])

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
        meetingStatus: getDropdownOptions('meetingStatus'),
        needTemperature: getDropdownOptions('needTemperature'),
        contractReason: getDropdownOptions('contractReason'),
        feedbackToIS: getDropdownOptions('feedbackToIS'),
        bantBudget: getDropdownOptions('bantBudget'),
        bantAuthority: getDropdownOptions('bantAuthority'),
        bantTimeline: getDropdownOptions('bantTimeline'),
        competitorStatus: getDropdownOptions('competitorStatus'),
        selfHandlingStatus: getDropdownOptions('selfHandlingStatus'),
        nextActionContent: getDropdownOptions('nextActionContent'),
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

  // 商談中・商談後フィールドの編集前にチェック（開始されていなければ警告）
  const rightColumnFields: (keyof Deal)[] = [
    'dealExecutionStatus', 'bantBudget', 'bantAuthority', 'bantNeed', 'bantTimeline', 'bantMemo',
    'competitorStatus', 'selfHandlingStatus', 'competitorMemo', 'dealMemo',
    'dealPhase1', 'phaseUpdateDate1', 'rankEstimate1', 'dealMemo1',
    'dealPhase2', 'phaseUpdateDate2', 'rankEstimate2', 'dealMemo2',
    'dealPhase3', 'phaseUpdateDate3', 'rankEstimate3', 'dealMemo3',
    'lastContactDate', 'actionScheduledDate', 'nextActionContent', 'responseDeadline', 'actionCompleted', 'actionMemo',
    'actionHistoryDate', 'actionHistoryContent', 'actionHistoryMemo',
    'finalResult', 'resultDate', 'resultMemo', 'contractReason', 'contractMemo',
    'lostReason', 'feedbackToIS', 'lostMemo', 'learningRecord'
  ]

  const handleRightColumnChange = (field: keyof Deal, value: string | number | undefined) => {
    // 開始されていない場合は警告を表示
    if (!formData.dealStarted && rightColumnFields.includes(field)) {
      setShowStartWarning(true)
      return
    }
    handleChange(field, value)
  }

  // 商談を開始する
  const handleStartDeal = () => {
    const now = new Date().toISOString()
    const updates = { 
      dealStarted: true, 
      dealEnded: false,
      dealStartedAt: now,
      dealDurationMinutes: undefined,
      dealExecutionStatus: '実施済'
    }
    setFormData(prev => ({ ...prev, ...updates }))
    onSave(updates)
    setShowStartWarning(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await Promise.resolve(onSave(formData))
      // 保存成功時は保存済み状態に遷移
      setIsSaved(true)
      setIsEditing(false)
    } catch (err) {
      console.error('保存エラー:', err)
    }
  }

  // 入力内容をクリア（元の値に戻す）
  // 右列（商談中・商談後）のフィールドのみクリア
  const handleClear = () => {
    if (!confirm('商談中・商談後の入力内容を元に戻しますか？')) return
    setFormData(prev => ({
      ...prev,
      // 商談情報
      appointmentDate: deal.appointmentDate,
      dealSetupDate: deal.dealSetupDate,
      dealTime: deal.dealTime,
      dealStaffFS: deal.dealStaffFS,
      dealExecutionDate: deal.dealExecutionDate,
      videoLink: deal.videoLink,
      // 商談記録
      rank: deal.rank,
      dealPhase: deal.dealPhase,
      rankEstimate: deal.rankEstimate,
      rankChange: deal.rankChange,
      phaseUpdateDate: deal.phaseUpdateDate,
      rankUpdateDate: deal.rankUpdateDate,
      customerBANTInfo: deal.customerBANTInfo,
      competitorInfo: deal.competitorInfo,
      dealMemo: deal.dealMemo,
      // アクション管理
      lastContactDate: deal.lastContactDate,
      actionScheduledDate: deal.actionScheduledDate,
      nextActionContent: deal.nextActionContent,
      responseDeadline: deal.responseDeadline,
      // 商談結果
      result: deal.result,
      resultDate: deal.resultDate,
      lostFactor: deal.lostFactor,
      lostReason: deal.lostReason,
      lostAfterAction: deal.lostAfterAction,
      feedbackToIS: deal.feedbackToIS,
      feedback: deal.feedback,
    }))
  }

  // 左列（商談前情報）のフィールドをクリア
  const handleClearLeft = () => {
    if (!confirm('商談前情報の入力内容を元に戻しますか？')) return
    setFormData(prev => ({
      ...prev,
      // 基本情報
      companyName: deal.companyName,
      contactName: deal.contactName,
      phone: deal.phone,
      service: deal.service,
      category: deal.category,
      leadSource: deal.leadSource,
      staffIS: deal.staffIS,
      // IS引き継ぎ情報
      conversationMemo: deal.conversationMemo,
      // 連携元情報
      linkedDate: deal.linkedDate,
      allianceRemarks: deal.allianceRemarks,
      omcAdditionalInfo1: deal.omcAdditionalInfo1,
      omcSelfFunds: deal.omcSelfFunds,
      omcPropertyStatus: deal.omcPropertyStatus,
      amazonTaxAccountant: deal.amazonTaxAccountant,
      meetsmoreLink: deal.meetsmoreLink,
      makuakeLink: deal.makuakeLink,
      // その他詳細
      leadId: deal.leadId,
      contactNameKana: deal.contactNameKana,
      email: deal.email,
      address: deal.address,
      industry: deal.industry,
      openingDate: deal.openingDate,
      contactPreferredDateTime: deal.contactPreferredDateTime,
    }))
    setIsEditingLeft(false)
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
          width: 'min(900px, 70vw)',
          animation: 'slideInRight 0.3s ease-out',
        }}
      >
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">商談詳細</h2>
            <p className="text-sm text-gray-500 mt-1">{deal.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={!isEditing}
              className={[
                'px-3 py-1.5 text-sm font-medium rounded-md border transition-colors',
                isEditing
                  ? 'text-gray-700 border-gray-300 hover:bg-gray-100'
                  : 'text-gray-400 border-gray-200 cursor-not-allowed',
              ].join(' ')}
            >
              クリア
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isEditing}
              className={[
                'px-3 py-1.5 text-sm font-medium rounded-md border transition-colors',
                isEditing
                  ? 'text-blue-600 border-blue-300 bg-blue-50'
                  : 'text-gray-700 border-gray-300 hover:bg-gray-100',
              ].join(' ')}
            >
              {isEditing ? '編集中' : '編集'}
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

        <form onSubmit={handleSubmit} className="p-4">
          {/* 2列レイアウト */}
          <div className="flex gap-4">
            {/* ===== 左列: 商談前情報（参照エリア） ===== */}
            <div className={`flex-1 space-y-3 min-w-0 bg-gray-100 p-3 rounded-lg ${!isEditingLeft ? '[&_input]:bg-gray-100 [&_textarea]:bg-gray-100 [&_select]:bg-gray-100 [&_input]:text-gray-900 [&_textarea]:text-gray-900 [&_select]:text-gray-900 [&_input]:cursor-default [&_textarea]:cursor-default [&_select]:cursor-default [&_select]:appearance-none' : ''}`}>
              <div className="sticky top-[86px] z-20 flex items-center justify-between bg-gray-600 px-3 py-2 rounded border border-gray-700">
                <h3 className="text-lg font-bold text-white">📋 商談前情報</h3>
                <button
                  type="button"
                  onClick={() => setIsEditingLeft(!isEditingLeft)}
                  className={`p-1 rounded transition-colors ${isEditingLeft ? 'bg-white/20 text-yellow-300' : 'hover:bg-white/10 text-white/80'}`}
                  title={isEditingLeft ? '編集中（クリックで終了）' : '編集'}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
              {/* 👤 顧客基本情報 */}
              <section className="bg-gray-50 border border-gray-300 rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection('basicEssential')}
                  className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-800 px-3 py-2 hover:bg-gray-50 rounded-t-lg"
                >
                  <span>👤 顧客基本情報</span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.basicEssential ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {expandedSections.basicEssential && (
                <fieldset disabled={!isEditingLeft} className="px-3 pb-3 grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="label text-xs">会社名/店舗名</label>
                    <input type="text" value={formData.companyName || ''} onChange={(e) => handleChange('companyName', e.target.value)} className="input text-sm py-1.5" />
                  </div>
                  <div>
                    <label className="label text-xs">氏名</label>
                    <input type="text" value={formData.contactName || ''} onChange={(e) => handleChange('contactName', e.target.value)} className="input text-sm py-1.5" />
                  </div>
                  <div>
                    <label className="label text-xs">ふりがな</label>
                    <input type="text" value={formData.contactNameKana || ''} onChange={(e) => handleChange('contactNameKana', e.target.value)} className="input text-sm py-1.5" />
                  </div>
                  <div>
                    <label className="label text-xs">電話番号</label>
                    <input type="tel" value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} className="input text-sm py-1.5" />
                  </div>
                  <div>
                    <label className="label text-xs">メール</label>
                    <input type="email" value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} className="input text-sm py-1.5" />
                  </div>
                  <div className="col-span-2">
                    <label className="label text-xs">住所／エリア</label>
                    <input type="text" value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} className="input text-sm py-1.5" />
                  </div>
                  <div>
                    <label className="label text-xs">業種</label>
                    <input type="text" value={formData.industry || ''} onChange={(e) => handleChange('industry', e.target.value)} className="input text-sm py-1.5" />
                  </div>
                  <div>
                    <label className="label text-xs">開業時期</label>
                    <input type="text" value={formData.openingDate || ''} onChange={(e) => handleChange('openingDate', e.target.value)} className="input text-sm py-1.5" />
                  </div>
                </fieldset>
                )}
              </section>

              {/* 📦 リード・サービス情報 */}
              <section className="bg-gray-50 border border-gray-300 rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection('sourceInfo')}
                  className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-800 px-3 py-2 hover:bg-gray-50 rounded-t-lg"
                >
                  <span>📦 リード・サービス情報</span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.sourceInfo ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {expandedSections.sourceInfo && (
                <fieldset disabled={!isEditingLeft} className="px-3 pb-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="label text-xs">サービス</label>
                    <select value={formData.service || ''} onChange={(e) => handleChange('service', e.target.value)} className="input text-sm py-1.5">
                      <option value="">選択</option>
                      <option value="RO:開業（融資）">RO:開業</option>
                      <option value="RT:税務">RT:税務</option>
                      <option value="RA:補助金">RA:補助金</option>
                      <option value="RB:融資（借り換え）">RB:借換</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">カテゴリ</label>
                    <select value={formData.category || ''} onChange={(e) => handleChange('category', e.target.value)} className="input text-sm py-1.5">
                      <option value="">選択</option>
                      <option value="A:飲食">A:飲食</option>
                      <option value="B:非飲食">B:非飲食</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">リードソース</label>
                    <input type="text" value={formData.leadSource || ''} disabled className="input text-sm py-1.5 bg-gray-50" />
                  </div>
                  <div>
                    <label className="label text-xs">連携日</label>
                    <input type="date" value={formData.linkedDate || ''} onChange={(e) => handleChange('linkedDate', e.target.value)} className="input text-sm py-1.5" />
                  </div>
                  <div className="col-span-2">
                    <label className="label text-xs">連携元備考</label>
                    <textarea value={formData.allianceRemarks || ''} onChange={(e) => handleChange('allianceRemarks', e.target.value)} className="input text-sm" rows={2} />
                  </div>
                  {/* リードソース別の追加項目 */}
                  {formData.leadSource === 'OMC' && (
                    <>
                      <div>
                        <label className="label text-xs">OMC追加情報①</label>
                        <input type="text" value={formData.omcAdditionalInfo1 || ''} onChange={(e) => handleChange('omcAdditionalInfo1', e.target.value)} className="input text-sm py-1.5" />
                      </div>
                      <div>
                        <label className="label text-xs">⓶自己資金</label>
                        <input type="text" value={formData.omcSelfFunds || ''} onChange={(e) => handleChange('omcSelfFunds', e.target.value)} className="input text-sm py-1.5" />
                      </div>
                      <div className="col-span-2">
                        <label className="label text-xs">③物件状況</label>
                        <input type="text" value={formData.omcPropertyStatus || ''} onChange={(e) => handleChange('omcPropertyStatus', e.target.value)} className="input text-sm py-1.5" />
                      </div>
                    </>
                  )}
                  {formData.leadSource === 'Amazon' && (
                    <div className="col-span-2">
                      <label className="label text-xs">Amazon税理士有無</label>
                      <input type="text" value={formData.amazonTaxAccountant || ''} onChange={(e) => handleChange('amazonTaxAccountant', e.target.value)} className="input text-sm py-1.5" />
                    </div>
                  )}
                  {formData.leadSource === 'Meetsmore' && (
                    <>
                      <div>
                        <label className="label text-xs">Meetsmoreリンク</label>
                        <input type="text" value={formData.meetsmoreLink || ''} onChange={(e) => handleChange('meetsmoreLink', e.target.value)} className="input text-sm py-1.5" />
                      </div>
                      <div>
                        <label className="label text-xs">Meetsmore法人・個人</label>
                        <input type="text" value={(formData as any).meetsmoreEntityType || ''} onChange={(e) => handleChange('meetsmoreEntityType' as any, e.target.value)} className="input text-sm py-1.5" />
                      </div>
                    </>
                  )}
                  {formData.leadSource === 'Makuake' && (
                    <>
                      <div>
                        <label className="label text-xs">MakuakePJT page</label>
                        <input type="text" value={formData.makuakeLink || ''} onChange={(e) => handleChange('makuakeLink', e.target.value)} className="input text-sm py-1.5" />
                      </div>
                      <div>
                        <label className="label text-xs">Makuake実行者page</label>
                        <input type="text" value={(formData as any).makuakeExecutorPage || ''} onChange={(e) => handleChange('makuakeExecutorPage' as any, e.target.value)} className="input text-sm py-1.5" />
                      </div>
                    </>
                  )}
                  {!['OMC', 'Amazon', 'Meetsmore', 'Makuake'].includes(formData.leadSource || '') && formData.leadSource && (
                    <div className="col-span-2 text-sm text-gray-500">
                      このリードソース（{formData.leadSource}）には、個別の連携項目はありません。
                    </div>
                  )}
                </fieldset>
                )}
              </section>

              {/* 💬 IS引き継ぎ情報 */}
              <section className="bg-gray-50 border border-gray-300 rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection('isHandover')}
                  className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-800 px-3 py-2 hover:bg-gray-50 rounded-t-lg"
                >
                  <span>💬 IS引き継ぎ情報</span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.isHandover ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {expandedSections.isHandover && (
                <fieldset disabled={!isEditingLeft} className="px-3 pb-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label text-xs">担当IS</label>
                      <select value={formData.staffIS || ''} onChange={(e) => handleChange('staffIS', e.target.value)} className="input text-sm py-1.5">
                        <option value="">選択</option>
                        {dropdownSettings.staffIS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label text-xs">ISステータス</label>
                      <input type="text" value={formData.statusIS || '-'} disabled className="input text-sm py-1.5 bg-gray-100 text-gray-700" />
                    </div>
                    <div>
                      <label className="label text-xs">ステータス更新日</label>
                      <input type="text" value={formData.statusUpdateDate || '-'} disabled className="input text-sm py-1.5 bg-gray-100 text-gray-700" />
                    </div>
                    <div>
                      <label className="label text-xs">商談獲得日</label>
                      <input type="text" value={formData.appointmentDate || '-'} disabled className="input text-sm py-1.5 bg-gray-100 text-gray-700" />
                    </div>
                    <div className="col-span-2">
                      <label className="label text-xs">ニーズ温度（IS判定）</label>
                      <input 
                        type="text" 
                        value={
                          formData.needTemperature === 'A' ? 'A: 期限あり・困り大' :
                          formData.needTemperature === 'B' ? 'B: 条件次第・検討' :
                          formData.needTemperature === 'C' ? 'C: 情報収集・低温' :
                          formData.needTemperature || '-'
                        } 
                        disabled 
                        className="input text-sm py-1.5 bg-gray-100 text-gray-700" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label text-xs">会話メモ（ISからの申し送り）</label>
                    <textarea value={formData.conversationMemo || ''} onChange={(e) => handleChange('conversationMemo', e.target.value)} className="input text-sm" rows={5} placeholder="架電時のヒアリング内容、顧客の状況・ニーズなど" />
                  </div>
                </fieldset>
                )}
              </section>

              {/* その他詳細（折畳） */}
              <section className="bg-gray-50 border border-gray-300 rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection('basicOther')}
                  className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-500 px-3 py-2 hover:bg-gray-50 rounded-t-lg"
                >
                  <span>🧾 その他詳細</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.basicOther ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {expandedSections.basicOther && (
                <fieldset disabled={!isEditingLeft} className="px-3 pb-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="label text-xs">商談ID</label>
                    <input type="text" value={formData.id || ''} disabled className="input text-sm py-1.5 bg-gray-50" />
                  </div>
                  <div>
                    <label className="label text-xs">リードID</label>
                    <input type="text" value={formData.leadId || ''} disabled className="input text-sm py-1.5 bg-gray-50" />
                  </div>
                  <div className="col-span-2">
                    <label className="label text-xs">連絡希望日時</label>
                    <input type="text" value={formData.contactPreferredDateTime || ''} onChange={(e) => handleChange('contactPreferredDateTime', e.target.value)} className="input text-sm py-1.5" />
                  </div>
                </fieldset>
                )}
              </section>
              </div>
            </div>

            {/* ===== 右列: 商談中・商談後情報（入力エリア） ===== */}
            <div className="flex-1 space-y-3 min-w-0 bg-gray-100 p-3 rounded-lg border border-cyan-300 relative">
              <div className="sticky top-[86px] z-20 flex items-center justify-between px-3 py-2 rounded border shadow-sm" style={{ backgroundColor: '#00627b', borderColor: '#004d5f' }}>
                <h3 className="text-lg font-bold text-white">📝 商談中・商談後</h3>
                {!formData.dealStarted && !formData.dealEnded && (
                  <button
                    type="button"
                    onClick={handleStartDeal}
                    className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                  >
                    ▶ 開始
                  </button>
                )}
                {formData.dealStarted && !formData.dealEnded && (
                  <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">商談中</span>
                )}
                {formData.dealEnded && (
                  <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-200 rounded">終了</span>
                )}
              </div>
              
              {/* 商談情報 */}
              <section className="bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleSection('dealInfo')}
                  className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-800 px-3 py-2 hover:bg-gray-50 rounded-t-lg"
                >
                  <span>📅 商談情報 <span className="text-xs font-normal text-gray-500 ml-2">{deal?.id} {deal?.companyName}</span></span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.dealInfo ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {expandedSections.dealInfo && (
                <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="label text-xs">商談設定日</label>
                    <input type="date" value={formData.dealSetupDate || ''} onChange={(e) => handleChange('dealSetupDate', e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker()} className={`input text-sm py-1.5 cursor-pointer ${!formData.dealSetupDate ? 'border-red-500 border-2' : ''}`} />
                  </div>
                  <div>
                    <label className="label text-xs">商談時間</label>
                    <select value={formData.dealTime || ''} onChange={(e) => handleChange('dealTime', e.target.value)} className={`input text-sm py-1.5 ${!formData.dealTime ? 'border-red-500 border-2' : ''}`}>
                      <option value="">選択</option>
                      <option value="08:00">08:00</option>
                      <option value="08:30">08:30</option>
                      <option value="09:00">09:00</option>
                      <option value="09:30">09:30</option>
                      <option value="10:00">10:00</option>
                      <option value="10:30">10:30</option>
                      <option value="11:00">11:00</option>
                      <option value="11:30">11:30</option>
                      <option value="12:00">12:00</option>
                      <option value="12:30">12:30</option>
                      <option value="13:00">13:00</option>
                      <option value="13:30">13:30</option>
                      <option value="14:00">14:00</option>
                      <option value="14:30">14:30</option>
                      <option value="15:00">15:00</option>
                      <option value="15:30">15:30</option>
                      <option value="16:00">16:00</option>
                      <option value="16:30">16:30</option>
                      <option value="17:00">17:00</option>
                      <option value="17:30">17:30</option>
                      <option value="18:00">18:00</option>
                      <option value="18:30">18:30</option>
                      <option value="19:00">19:00</option>
                      <option value="19:30">19:30</option>
                      <option value="20:00">20:00</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">商談実施日</label>
                    <input type="date" value={formData.dealExecutionDate || ''} onChange={(e) => handleChange('dealExecutionDate', e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker()} className="input text-sm py-1.5 cursor-pointer" />
                  </div>
                  <div>
                    <label className="label text-xs">商談担当FS</label>
                    <select value={formData.dealStaffFS || ''} onChange={(e) => handleChange('dealStaffFS', e.target.value)} className="input text-sm py-1.5">
                      <option value="">選択</option>
                      {dropdownSettings.dealStaffFS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                )}
              </section>

              {/* 商談最終結果（折畳） */}
              <section className="bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleSection('result')}
                  className={`w-full text-left flex items-center justify-between text-base font-semibold px-3 py-2 rounded-t-lg bg-yellow-50 hover:bg-yellow-100 ${formData.finalResult ? 'text-orange-700' : 'text-gray-700'}`}
                >
                  <span>🏁 商談最終結果</span>
                  <svg className={`w-4 h-4 transition-transform ${expandedSections.result ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {expandedSections.result && (
                <div className="px-3 pb-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label text-xs">結果</label>
                      <select value={formData.finalResult || ''} onChange={(e) => {
                        handleChange('finalResult', e.target.value)
                        // 成約（即決）選択時は結果日に商談実施日を自動入力
                        if (e.target.value === '成約（即決）') {
                          handleChange('resultDate', formData.dealExecutionDate || '')
                        }
                      }} className="input text-sm py-1.5">
                        <option value="">選択</option>
                        {dropdownSettings.dealResult.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label text-xs">結果日</label>
                      <input type="date" value={formData.resultDate || ''} onChange={(e) => handleChange('resultDate', e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker()} className="input text-sm py-1.5 cursor-pointer" />
                    </div>
                  </div>
                  {/* 成約時のみ表示 */}
                  {(formData.finalResult === '成約' || formData.finalResult === '成約（即決）') && (
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-xs font-semibold text-green-600 mb-2">【成約情報】</p>
                    <div>
                      <label className="label text-xs">成約要因</label>
                      <select value={formData.contractReason || ''} onChange={(e) => handleChange('contractReason', e.target.value)} className="input text-sm py-1.5">
                        <option value="">選択</option>
                        {dropdownSettings.contractReason.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label text-xs">成約メモ</label>
                      <textarea value={formData.contractMemo || ''} onChange={(e) => handleChange('contractMemo', e.target.value)} className="input text-sm" rows={2} placeholder="成約に関するメモ" />
                    </div>
                  </div>
                  )}

                  {/* 失注時のみ表示 */}
                  {formData.finalResult === '失注' && (
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-xs font-semibold text-red-600 mb-2">【失注情報】</p>
                    <div>
                      <label className="label text-xs">失注理由</label>
                      <select value={formData.lostReason || ''} onChange={(e) => handleChange('lostReason', e.target.value)} className="input text-sm py-1.5">
                        <option value="">選択</option>
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
                      <label className="label text-xs">失注メモ</label>
                      <textarea value={formData.lostMemo || ''} onChange={(e) => handleChange('lostMemo', e.target.value)} className="input text-sm" rows={2} placeholder="失注に関するメモ" />
                    </div>
                    <div>
                      <label className="label text-xs">ISへのフィードバック</label>
                      <select value={formData.feedbackToIS || ''} onChange={(e) => handleChange('feedbackToIS', e.target.value)} className="input text-sm py-1.5">
                        <option value="">選択</option>
                        {dropdownSettings.feedbackToIS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label text-xs">フィードバック（詳細）</label>
                      <textarea value={formData.feedback || ''} onChange={(e) => handleChange('feedback', e.target.value)} className="input text-sm" rows={2} />
                    </div>
                  </div>
                  )}
                </div>
                )}
              </section>

              {/* 商談結果履歴（折畳） - 成約（即決）時はグレーアウト */}
              <section className={`bg-white border-2 border-gray-300 rounded-lg shadow-sm ${formData.finalResult === '成約（即決）' ? 'opacity-50' : ''}`}>
                <button
                  type="button"
                  onClick={() => toggleSection('dealHistory')}
                  className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-700 px-3 py-2 bg-yellow-50 hover:bg-yellow-100 rounded-t-lg"
                >
                  <span>📊 商談結果履歴{formData.finalResult === '成約（即決）' && <span className="text-xs text-gray-500 ml-2">（即決のため入力不要）</span>}</span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.dealHistory ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {expandedSections.dealHistory && (
                <div className={`px-3 pb-3 space-y-3 ${formData.finalResult === '成約（即決）' ? 'pointer-events-none' : ''}`}>
                  {/* 1回目 */}
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-700 mb-2">【1回目】</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="label text-xs">商談フェーズ</label>
                        <select value={formData.dealPhase1 || '検討中'} onChange={(e) => {
                          handleChange('dealPhase1', e.target.value)
                          if (e.target.value === '契約準備') {
                            handleChange('rankEstimate1', 'A80%')
                          }
                        }} className="input text-sm py-1.5">
                          {dropdownSettings.dealPhase.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label text-xs">更新日</label>
                        <input type="date" value={formData.phaseUpdateDate1 || ''} onChange={(e) => handleChange('phaseUpdateDate1', e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker()} className="input py-0.5 px-1 text-[10px] cursor-pointer" />
                      </div>
                      <div>
                        <label className="label text-xs">確度ヨミ</label>
                        <select value={formData.rankEstimate1 || ''} onChange={(e) => handleChange('rankEstimate1', e.target.value)} className="input text-sm py-1.5">
                          <option value="">選択</option>
                          {dropdownSettings.rankEstimate.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="label text-xs">商談・確度メモ（1回目）</label>
                      <textarea value={formData.dealMemo1 || ''} onChange={(e) => handleChange('dealMemo1', e.target.value)} className="input text-sm" rows={2} placeholder="1回目商談の記録・確度ヨミ理由" />
                    </div>
                    {/* 2回目追加ボタン */}
                    {!show2ndHistory && (
                    <button
                      type="button"
                      onClick={() => setShow2ndHistory(true)}
                      className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                    >
                      <span>＋</span> 2回目を追加
                    </button>
                    )}
                  </div>

                  {/* 2回目（＋ボタンで表示） */}
                  {show2ndHistory && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-700 mb-2">【2回目】</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="label text-xs">商談フェーズ</label>
                        <select value={formData.dealPhase2 || '検討中'} onChange={(e) => {
                          handleChange('dealPhase2', e.target.value)
                          if (e.target.value === '契約準備') {
                            handleChange('rankEstimate2', 'A80%')
                          }
                        }} className="input text-sm py-1.5">
                          {dropdownSettings.dealPhase.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label text-xs">更新日</label>
                        <input type="date" value={formData.phaseUpdateDate2 || ''} onChange={(e) => handleChange('phaseUpdateDate2', e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker()} className="input py-0.5 px-1 text-[10px] cursor-pointer" />
                      </div>
                      <div>
                        <label className="label text-xs">確度ヨミ</label>
                        <select value={formData.rankEstimate2 || ''} onChange={(e) => handleChange('rankEstimate2', e.target.value)} className="input text-sm py-1.5">
                          <option value="">選択</option>
                          {dropdownSettings.rankEstimate.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="label text-xs">商談・確度メモ（2回目）</label>
                      <textarea value={formData.dealMemo2 || ''} onChange={(e) => handleChange('dealMemo2', e.target.value)} className="input text-sm" rows={2} placeholder="2回目商談の記録・確度ヨミ理由" />
                    </div>
                    {/* 3回目追加ボタン */}
                    {!show3rdHistory && (
                    <button
                      type="button"
                      onClick={() => setShow3rdHistory(true)}
                      className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                    >
                      <span>＋</span> 3回目を追加
                    </button>
                    )}
                  </div>
                  )}

                  {/* 3回目（＋ボタンで表示） */}
                  {show3rdHistory && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-700 mb-2">【3回目】</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="label text-xs">商談フェーズ</label>
                        <select value={formData.dealPhase3 || '検討中'} onChange={(e) => {
                          handleChange('dealPhase3', e.target.value)
                          if (e.target.value === '契約準備') {
                            handleChange('rankEstimate3', 'A80%')
                          }
                        }} className="input text-sm py-1.5">
                          {dropdownSettings.dealPhase.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label text-xs">更新日</label>
                        <input type="date" value={formData.phaseUpdateDate3 || ''} onChange={(e) => handleChange('phaseUpdateDate3', e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker()} className="input py-0.5 px-1 text-[10px] cursor-pointer" />
                      </div>
                      <div>
                        <label className="label text-xs">確度ヨミ</label>
                        <select value={formData.rankEstimate3 || ''} onChange={(e) => handleChange('rankEstimate3', e.target.value)} className="input text-sm py-1.5">
                          <option value="">選択</option>
                          {dropdownSettings.rankEstimate.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="label text-xs">商談・確度メモ（3回目）</label>
                      <textarea value={formData.dealMemo3 || ''} onChange={(e) => handleChange('dealMemo3', e.target.value)} className="input text-sm" rows={2} placeholder="3回目商談の記録・確度ヨミ理由" />
                    </div>
                  </div>
                  )}
                </div>
                )}
              </section>

              {/* 商談記録 */}
              <section className="bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-t-lg">
                  <button
                    type="button"
                    onClick={() => toggleSection('dealRecord')}
                    className="flex-1 text-left flex items-center text-base font-semibold text-gray-800"
                  >
                    <span>📝 商談記録</span>
                  </button>
                  {/* 開始/終了ボタン */}
                  <div className="flex items-center gap-2 mr-2">
                    {formData.dealEnded ? (
                      <button
                        type="button"
                        onClick={() => {
                          // 終了状態をリセットして開始前に戻す
                          const updates = { 
                            dealStarted: false, 
                            dealEnded: false,
                            dealStartedAt: undefined,
                            dealDurationMinutes: undefined
                          }
                          setFormData(prev => ({ ...prev, ...updates }))
                          onSave(updates)
                        }}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                      >
                        終了
                      </button>
                    ) : formData.dealStarted ? (
                      <button
                        type="button"
                        onClick={() => {
                          // 経過時間を計算（分）
                          let durationMinutes: number | undefined = undefined
                          if (formData.dealStartedAt) {
                            const startTime = new Date(formData.dealStartedAt).getTime()
                            const endTime = Date.now()
                            durationMinutes = Math.round((endTime - startTime) / (1000 * 60))
                          }
                          const updates = { 
                            dealEnded: true,
                            dealDurationMinutes: durationMinutes
                          }
                          setFormData(prev => ({ ...prev, ...updates }))
                          onSave(updates)
                        }}
                        className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded hover:bg-orange-100"
                      >
                        終了
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date().toISOString()
                          const updates = { 
                            dealStarted: true, 
                            dealEnded: false,
                            dealStartedAt: now,
                            dealDurationMinutes: undefined,
                            dealExecutionStatus: '実施済'
                          }
                          setFormData(prev => ({ ...prev, ...updates }))
                          onSave(updates)
                        }}
                        className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                      >
                        開始
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSection('dealRecord')}
                    className="p-1"
                  >
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.dealRecord ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>
                {expandedSections.dealRecord && (
                <div className="px-3 pb-3 space-y-3">
                  {/* 商談実施状況 & 商談時間 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label text-xs">商談実施状況</label>
                      <select value={formData.dealExecutionStatus || '実施前'} onChange={(e) => handleChange('dealExecutionStatus', e.target.value)} className="input text-sm py-1.5">
                        {dropdownSettings.meetingStatus.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label text-xs">商談時間（分）</label>
                      {formData.dealStarted && !formData.dealEnded ? (
                        // 計測中: リアルタイム表示（編集不可）
                        <div className="input text-sm py-1.5 bg-blue-50 flex items-center">
                          <span className="text-blue-600 font-medium">
                            {elapsedSeconds != null ? `${Math.floor(elapsedSeconds / 60)}分${String(elapsedSeconds % 60).padStart(2, '0')}秒` : '-'}
                            <span className="ml-1 text-xs text-blue-500">計測中</span>
                          </span>
                        </div>
                      ) : (
                        // 終了後または未開始: 編集可能
                        <input
                          type="number"
                          min="0"
                          value={formData.dealDurationMinutes ?? ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                            handleChange('dealDurationMinutes', value)
                            if (value != null) {
                              setElapsedSeconds(value * 60)
                            } else {
                              setElapsedSeconds(null)
                            }
                          }}
                          placeholder="分数を入力"
                          className="input text-sm py-1.5"
                        />
                      )}
                    </div>
                  </div>

                  {/* BANT情報 */}
                  <div className="border-t pt-3">
                    <div className="border-l-4 border-blue-400 pl-2 mb-2">
                      <p className="text-sm font-semibold text-gray-700">BANT情報</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label text-xs">B:予算</label>
                        <select value={formData.bantBudget || ''} onChange={(e) => handleChange('bantBudget', e.target.value)} className="input text-sm py-1.5">
                          <option value="">選択</option>
                          {dropdownSettings.bantBudget.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label text-xs">A:決裁権</label>
                        <select value={formData.bantAuthority || ''} onChange={(e) => handleChange('bantAuthority', e.target.value)} className="input text-sm py-1.5">
                          <option value="">選択</option>
                          {dropdownSettings.bantAuthority.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label text-xs">N:ニーズ温度</label>
                        <select 
                          value={formData.bantNeed || ''} 
                          onChange={(e) => handleChange('bantNeed', e.target.value)} 
                          className="input text-sm py-1.5"
                          title={
                            formData.bantNeed === 'A' ? '期限が具体＋放置コスト具体。次アクションが期限付きで決まる。' :
                            formData.bantNeed === 'B' ? '課題はあるが優先度や条件次第。比較検討・社内検討など段取りはある。' :
                            formData.bantNeed === 'C' ? '期限がない/薄い。放置コストが出ない。情報収集中心。' : ''
                          }
                        >
                          <option value="">選択</option>
                          {dropdownSettings.needTemperature.map(option => (
                            <option key={option.value} value={option.value} title={option.label}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label text-xs">T:導入時期</label>
                        <select value={formData.bantTimeline || ''} onChange={(e) => handleChange('bantTimeline', e.target.value)} className="input text-sm py-1.5">
                          <option value="">選択</option>
                          {dropdownSettings.bantTimeline.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="label text-xs">BANT補足メモ</label>
                      <textarea value={formData.bantMemo || ''} onChange={(e) => handleChange('bantMemo', e.target.value)} className="input text-sm" rows={2} placeholder="BANT情報の補足" />
                    </div>
                  </div>

                  {/* 競合・自己対応状況 */}
                  <div className="border-t pt-3">
                    <div className="border-l-4 border-orange-400 pl-2 mb-2">
                      <p className="text-sm font-semibold text-gray-700">競合・自己対応状況</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label text-xs">競合状況</label>
                        <select value={formData.competitorStatus || ''} onChange={(e) => handleChange('competitorStatus', e.target.value)} className="input text-sm py-1.5">
                          <option value="">選択</option>
                          {dropdownSettings.competitorStatus.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label text-xs">自己対応状況</label>
                        <select value={formData.selfHandlingStatus || ''} onChange={(e) => handleChange('selfHandlingStatus', e.target.value)} className="input text-sm py-1.5">
                          <option value="">選択</option>
                          {dropdownSettings.selfHandlingStatus.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="label text-xs">競合・自己対応メモ</label>
                      <textarea value={formData.competitorMemo || ''} onChange={(e) => handleChange('competitorMemo', e.target.value)} className="input text-sm" rows={2} placeholder="競合・自己対応の詳細" />
                    </div>
                  </div>

                  {/* 商談メモ */}
                  <div className="border-t pt-3">
                    <label className="label text-xs">商談メモ</label>
                    <textarea value={formData.dealMemo || ''} onChange={(e) => handleChange('dealMemo', e.target.value)} className="input text-sm" rows={4} placeholder="商談中の記録・気づき" />
                  </div>

                </div>
                )}
              </section>

              {/* アクション管理 */}
              <section className="bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleSection('action')}
                  className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-800 px-3 py-2 hover:bg-gray-50 rounded-t-lg"
                >
                  <span>🎯 アクション管理</span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.action ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {expandedSections.action && (
                <div className="px-3 pb-3 space-y-2">
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-700 mb-2">【現在のアクション】</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label text-xs">最終接触日</label>
                        <input type="date" value={formData.lastContactDate || formData.dealExecutionDate || ''} onChange={(e) => handleChange('lastContactDate', e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker()} className="input text-sm py-1.5 cursor-pointer" />
                      </div>
                      <div>
                        <label className="label text-xs">アクション予定日</label>
                        <input type="date" value={formData.actionScheduledDate || ''} onChange={(e) => handleChange('actionScheduledDate', e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker()} className="input text-sm py-1.5 cursor-pointer" />
                      </div>
                      <div>
                        <label className="label text-xs">次回アクション内容</label>
                        <select value={formData.nextActionContent || ''} onChange={(e) => handleChange('nextActionContent', e.target.value)} className="input text-sm py-1.5">
                          <option value="">選択</option>
                          {dropdownSettings.nextActionContent.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label text-xs">回答期限</label>
                        <input type="date" value={formData.responseDeadline || ''} onChange={(e) => handleChange('responseDeadline', e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker()} className="input text-sm py-1.5 cursor-pointer" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="label text-xs">アクションメモ</label>
                      <textarea value={formData.actionMemo || ''} onChange={(e) => handleChange('actionMemo', e.target.value)} className="input text-sm" rows={2} placeholder="アクションに関するメモ" />
                    </div>
                    {/* アクション履歴追加ボタン */}
                    {!show2ndAction && (
                    <button
                      type="button"
                      onClick={() => setShow2ndAction(true)}
                      className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                    >
                      <span>＋</span> アクション履歴を追加
                    </button>
                    )}
                  </div>

                  {/* アクション履歴（＋ボタンで表示） */}
                  {show2ndAction && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-700 mb-2">【アクション履歴】</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label text-xs">接触日</label>
                        <input type="date" value={formData.actionHistoryDate || ''} onChange={(e) => handleChange('actionHistoryDate', e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker()} className="input text-sm py-1.5 cursor-pointer" />
                      </div>
                      <div>
                        <label className="label text-xs">アクション内容</label>
                        <select value={formData.actionHistoryContent || ''} onChange={(e) => handleChange('actionHistoryContent', e.target.value)} className="input text-sm py-1.5">
                          <option value="">選択</option>
                          <option value="回答確認">回答確認</option>
                          {getDropdownOptions('nextActionContent').map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="label text-xs">履歴メモ</label>
                      <textarea value={formData.actionHistoryMemo || ''} onChange={(e) => handleChange('actionHistoryMemo', e.target.value)} className="input text-sm" rows={2} placeholder="アクション履歴に関するメモ" />
                    </div>
                  </div>
                  )}
                </div>
                )}
              </section>

              {/* 商談自己採点 */}
              <section className="bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleSection('selfAssessment')}
                  className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-700 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-t-lg"
                >
                  <span>📊 商談自己採点</span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.selfAssessment ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {expandedSections.selfAssessment && (
                <div className="px-3 pb-3 space-y-3">
                  {/* ニーズ温度（商談後） - Q1-Q7の前に配置 */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <label className="label text-xs font-semibold text-amber-800 mb-2 block">
                      🌡️ ニーズ温度（商談後）<span className="text-red-500 ml-1">必須</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'A', label: '期限あり・困り大', tooltip: '期限が具体＋放置コスト具体（工数/遅れ/ミス）。次アクションが期限付きで決まる。' },
                        { value: 'B', label: '条件次第・検討', tooltip: '課題はあるが優先度や条件次第。比較検討・社内検討・見積確認など段取りはある。' },
                        { value: 'C', label: '情報収集・低温', tooltip: '期限がない/薄い。放置コストが出ない。情報収集中心で次アクションが曖昧。' },
                      ].map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleChange('bantNeed', option.value)}
                          title={option.tooltip}
                          className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                            formData.bantNeed === option.value
                              ? option.value === 'A' ? 'bg-red-100 border-red-400 text-red-800'
                              : option.value === 'B' ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
                              : 'bg-blue-100 border-blue-400 text-blue-800'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="block text-lg font-bold mb-1">{option.value}</span>
                          <span className="block text-[10px] leading-tight">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 合計スコア表示 */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-600 mb-1">合計スコア</p>
                    <p className="text-3xl font-bold text-blue-700">
                      {(() => {
                        const q1 = formData.selfQ1 ?? 0
                        const q2 = formData.selfQ2 ?? 0
                        const q3 = formData.selfQ3 ?? 0
                        const q4 = formData.selfQ4 ?? 0
                        const q5 = formData.selfQ5 ?? 0
                        const q6 = formData.selfQ6 ?? 0
                        const q7 = formData.selfQ7 ?? 0
                        const raw = (q1/2)*10 + (q2/2)*15 + (q3/2)*20 + (q4/2)*15 + (q5/2)*10 + (q6/2)*20 + (q7/2)*10
                        return Math.round(raw)
                      })()}
                      <span className="text-lg font-normal text-gray-500"> / 100点</span>
                    </p>
                  </div>

                  {/* Q1: ゴール合意 */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-700">Q1. ゴール合意（導入）</p>
                      <span className="text-xs text-gray-500">配点: 10点</span>
                    </div>
                    <select 
                      value={formData.selfQ1 ?? ''} 
                      onChange={(e) => handleChange('selfQ1', e.target.value ? Number(e.target.value) : undefined)} 
                      className="input text-sm py-1.5 w-full"
                    >
                      <option value="">選択してください</option>
                      <option value="0">0: ゴール合意なし</option>
                      <option value="1">1: ゴール提示はしたが合意が弱い</option>
                      <option value="2">2: ゴール・進め方・時間配分まで合意</option>
                    </select>
                  </div>

                  {/* Q2: 現状と課題の特定 */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-700">Q2. 現状と課題の特定（Problem）</p>
                      <span className="text-xs text-gray-500">配点: 15点</span>
                    </div>
                    <select 
                      value={formData.selfQ2 ?? ''} 
                      onChange={(e) => handleChange('selfQ2', e.target.value ? Number(e.target.value) : undefined)} 
                      className="input text-sm py-1.5 w-full"
                    >
                      <option value="">選択してください</option>
                      <option value="0">0: 課題が曖昧</option>
                      <option value="1">1: 課題は出たが優先度/原因が曖昧</option>
                      <option value="2">2: 課題が具体で、相手の言葉で言語化できた</option>
                    </select>
                  </div>

                  {/* Q3: 放置コストの具体化 */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-700">Q3. 放置コストの具体化（Implication）</p>
                      <span className="text-xs text-gray-500">配点: 20点</span>
                    </div>
                    <select 
                      value={formData.selfQ3 ?? ''} 
                      onChange={(e) => handleChange('selfQ3', e.target.value ? Number(e.target.value) : undefined)} 
                      className="input text-sm py-1.5 w-full"
                    >
                      <option value="">選択してください</option>
                      <option value="0">0: 放置コストを取れていない</option>
                      <option value="1">1: 取れたが定量/具体が弱い</option>
                      <option value="2">2: 時間/ミス/遅延/リスク等で具体化できた</option>
                    </select>
                  </div>

                  {/* Q4: 比較軸の提示 */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-700">Q4. 比較軸の提示（選定基準を握る）</p>
                      <span className="text-xs text-gray-500">配点: 15点</span>
                    </div>
                    <select 
                      value={formData.selfQ4 ?? ''} 
                      onChange={(e) => handleChange('selfQ4', e.target.value ? Number(e.target.value) : undefined)} 
                      className="input text-sm py-1.5 w-full"
                    >
                      <option value="">選択してください</option>
                      <option value="0">0: 比較軸提示なし</option>
                      <option value="1">1: 提示したが相手の優先順位が不明</option>
                      <option value="2">2: 相手の優先順位に沿って比較軸を整理できた</option>
                    </select>
                  </div>

                  {/* Q5: 不安解除 */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-700">Q5. 不安解除（導入/運用の懸念つぶし）</p>
                      <span className="text-xs text-gray-500">配点: 10点</span>
                    </div>
                    <select 
                      value={formData.selfQ5 ?? ''} 
                      onChange={(e) => handleChange('selfQ5', e.target.value ? Number(e.target.value) : undefined)} 
                      className="input text-sm py-1.5 w-full"
                    >
                      <option value="">選択してください</option>
                      <option value="0">0: 不安要素を拾えない/放置</option>
                      <option value="1">1: 拾ったが解消が弱い</option>
                      <option value="2">2: 懸念→回答→確認（解消したか）まで実施</option>
                    </select>
                  </div>

                  {/* Q6: 次アクション確約 */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-700">Q6. 次アクション確約（クロージング）</p>
                      <span className="text-xs text-gray-500">配点: 20点</span>
                    </div>
                    <select 
                      value={formData.selfQ6 ?? ''} 
                      onChange={(e) => handleChange('selfQ6', e.target.value ? Number(e.target.value) : undefined)} 
                      className="input text-sm py-1.5 w-full"
                    >
                      <option value="">選択してください</option>
                      <option value="0">0: 次が曖昧（検討しますで終了）</option>
                      <option value="1">1: 次は決めたが期限/宿題/判断者が不足</option>
                      <option value="2">2: 期限・宿題・判断者まで確定</option>
                    </select>
                  </div>

                  {/* Q7: 商材別質問 */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-700">
                        Q7. {formData.service?.includes('税務') || formData.service?.includes('RT') ? '内製化（自分でやる）への対処' : '成功条件・リスク・提出負荷の具体化'}
                      </p>
                      <span className="text-xs text-gray-500">配点: 10点</span>
                    </div>
                    <select 
                      value={formData.selfQ7 ?? ''} 
                      onChange={(e) => handleChange('selfQ7', e.target.value ? Number(e.target.value) : undefined)} 
                      className="input text-sm py-1.5 w-full"
                    >
                      <option value="">選択してください</option>
                      {formData.service?.includes('税務') || formData.service?.includes('RT') ? (
                        <>
                          <option value="0">0: 触れていない</option>
                          <option value="1">1: 触れたが弱い</option>
                          <option value="2">2: 工数/リスクで判断基準を置き換えられた</option>
                        </>
                      ) : (
                        <>
                          <option value="0">0: ふわっと説明</option>
                          <option value="1">1: 一部説明</option>
                          <option value="2">2: 条件/リスク/資料と手間/期限まで具体化</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* 商談評価サマリー - 入力完了後に表示 */}
                  {formData.bantNeed && formData.selfQ1 !== undefined && formData.selfQ6 !== undefined && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-lg p-4">
                    <p className="text-sm font-bold text-emerald-800 mb-3">📋 商談評価サマリー</p>
                    <div className="space-y-2 text-sm">
                      {/* ニーズ温度 */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 w-24">ニーズ温度:</span>
                        <span className={`font-bold ${
                          formData.bantNeed === 'A' ? 'text-red-600' :
                          formData.bantNeed === 'B' ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          {formData.bantNeed}
                          （{formData.bantNeed === 'A' ? '期限あり・困り大' :
                             formData.bantNeed === 'B' ? '条件次第・検討' : '情報収集・低温'}）
                        </span>
                      </div>
                      {/* 自己採点 */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 w-24">自己採点:</span>
                        {(() => {
                          const q1 = formData.selfQ1 ?? 0
                          const q2 = formData.selfQ2 ?? 0
                          const q3 = formData.selfQ3 ?? 0
                          const q4 = formData.selfQ4 ?? 0
                          const q5 = formData.selfQ5 ?? 0
                          const q6 = formData.selfQ6 ?? 0
                          const q7 = formData.selfQ7 ?? 0
                          const score = Math.round((q1/2)*10 + (q2/2)*15 + (q3/2)*20 + (q4/2)*15 + (q5/2)*10 + (q6/2)*20 + (q7/2)*10)
                          const passLine = formData.bantNeed === 'A' ? 80 : formData.bantNeed === 'B' ? 75 : 70
                          const isPassed = score >= passLine
                          return (
                            <span className={`font-bold ${isPassed ? 'text-emerald-600' : 'text-orange-600'}`}>
                              {score}点
                              <span className="text-xs font-normal text-gray-500 ml-1">
                                （{formData.bantNeed}の合格ライン{passLine}点{isPassed ? '達成' : '未達'}）
                              </span>
                            </span>
                          )
                        })()}
                      </div>
                      {/* 次回改善テーマ */}
                      {formData.improvementTheme && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 w-24">改善テーマ:</span>
                        <span className="font-bold text-purple-600">{formData.improvementTheme}</span>
                      </div>
                      )}
                      {/* 推奨アクション */}
                      <div className="mt-3 pt-2 border-t border-emerald-200">
                        <span className="text-gray-600 text-xs">💡 推奨アクション:</span>
                        <p className="text-sm font-medium text-gray-800 mt-1">
                          {(() => {
                            const scores = [
                              { key: 'Q1', score: formData.selfQ1 ?? -1, action: '次回は冒頭でゴール・進め方・時間配分を必ず合意する' },
                              { key: 'Q2', score: formData.selfQ2 ?? -1, action: '次回は課題を相手の言葉で言語化して確認する' },
                              { key: 'Q3', score: formData.selfQ3 ?? -1, action: '次回は「工数（h/月）」を必ず数字で取る' },
                              { key: 'Q4', score: formData.selfQ4 ?? -1, action: '次回は相手の優先順位を確認してから比較軸を整理する' },
                              { key: 'Q5', score: formData.selfQ5 ?? -1, action: '次回は懸念→回答→確認（解消したか）まで実施する' },
                              { key: 'Q6', score: formData.selfQ6 ?? -1, action: '次回は期限・宿題・判断者を必ず確定させる' },
                            ].filter(s => s.score >= 0)
                            if (scores.length === 0) return '採点を完了してください'
                            const minScore = Math.min(...scores.map(s => s.score))
                            const lowestItem = scores.find(s => s.score === minScore)
                            return lowestItem?.action || '全項目で改善の余地があります'
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                  )}

                  <div className="border-t border-gray-200 pt-3">
                    {/* 次回改善テーマ */}
                    <div className="mb-3">
                      <label className="label text-xs">次回改善テーマ（必須）</label>
                      <select 
                        value={formData.improvementTheme || ''} 
                        onChange={(e) => handleChange('improvementTheme', e.target.value)} 
                        className="input text-sm py-1.5 w-full"
                      >
                        <option value="">選択してください</option>
                        <option value="ゴール合意">ゴール合意</option>
                        <option value="課題特定">課題特定</option>
                        <option value="放置コスト">放置コスト</option>
                        <option value="比較軸提示">比較軸提示</option>
                        <option value="不安解除">不安解除</option>
                        <option value="次アクション">次アクション</option>
                        {(formData.service?.includes('税務') || formData.service?.includes('RT')) && (
                          <option value="内製化対策">内製化対策</option>
                        )}
                        {(formData.service?.includes('開業') || formData.service?.includes('RO') || formData.service?.includes('融資') || formData.service?.includes('RB')) && (
                          <option value="成功条件の具体化">成功条件の具体化</option>
                        )}
                      </select>
                      {/* 最低スコア項目のハイライト提案 */}
                      {(() => {
                        const scores = [
                          { key: 'ゴール合意', score: formData.selfQ1 ?? -1 },
                          { key: '課題特定', score: formData.selfQ2 ?? -1 },
                          { key: '放置コスト', score: formData.selfQ3 ?? -1 },
                          { key: '比較軸提示', score: formData.selfQ4 ?? -1 },
                          { key: '不安解除', score: formData.selfQ5 ?? -1 },
                          { key: '次アクション', score: formData.selfQ6 ?? -1 },
                        ].filter(s => s.score >= 0)
                        if (scores.length === 0) return null
                        const minScore = Math.min(...scores.map(s => s.score))
                        const lowestItems = scores.filter(s => s.score === minScore).map(s => s.key)
                        if (minScore === 2) return null
                        return (
                          <p className="text-xs text-blue-600 mt-1">
                            💡 推奨: {lowestItems.join('、')}（スコアが低い項目）
                          </p>
                        )
                      })()}
                    </div>

                    {/* 振り返りメモ */}
                    <div>
                      <label className="label text-xs">振り返りメモ（任意・200文字まで）</label>
                      <textarea 
                        value={formData.reflectionMemo || ''} 
                        onChange={(e) => {
                          if (e.target.value.length <= 200) {
                            handleChange('reflectionMemo', e.target.value)
                          }
                        }} 
                        className="input text-sm" 
                        rows={3} 
                        placeholder="商談の振り返りや次回への改善点" 
                      />
                      <p className="text-xs text-gray-400 text-right mt-1">{(formData.reflectionMemo || '').length}/200文字</p>
                    </div>
                  </div>
                </div>
                )}
              </section>

              {/* 改善・学習記録（折畳） */}
              <section className="bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleSection('learning')}
                  className="w-full text-left flex items-center justify-between text-base font-semibold text-gray-700 px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-t-lg"
                >
                  <span>📚 改善・学習記録</span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections.learning ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {expandedSections.learning && (
                <div className="px-3 pb-3 space-y-3">
                  {/* 動画リンク */}
                  <div>
                    <label className="label text-xs">動画リンク</label>
                    <input type="text" value={formData.videoLink || ''} onChange={(e) => handleChange('videoLink', e.target.value)} className="input text-sm py-1.5" placeholder="https://..." />
                  </div>
                  {/* カテゴリ */}
                  <div>
                    <label className="label text-xs">カテゴリ</label>
                    <select value={formData.learningRecordCategory || ''} onChange={(e) => handleChange('learningRecordCategory', e.target.value)} className="input text-sm py-1.5">
                      <option value="">選択</option>
                      <option value="成功パターン">成功パターン</option>
                      <option value="改善点">改善点</option>
                      <option value="学んだこと">学んだこと</option>
                      <option value="次回への課題">次回への課題</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  {/* 記録内容 */}
                  <div>
                    <label className="label text-xs">記録内容</label>
                    <textarea value={formData.learningRecord || ''} onChange={(e) => handleChange('learningRecord', e.target.value)} className="input text-sm" rows={4} placeholder="商談での気づき、改善点、成功パターンなど" />
                  </div>
                </div>
                )}
              </section>

            </div>
          </div>

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
              disabled={isSaving || !isEditing}
              className="btn-primary"
            >
              {isSaving ? '保存中...' : isSaved && !isEditing ? '保存済' : '保存'}
            </button>
            {isSaved && !isEditing && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
              >
                閉じる
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 開始警告モーダル */}
      {showStartWarning && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowStartWarning(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">⚠️ 商談を開始してください</h3>
              <p className="text-sm text-gray-600 mb-6">
                商談中・商談後の情報を入力するには、<br />
                先に「開始」ボタンを押してください。
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setShowStartWarning(false)}
                  className="btn-secondary"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleStartDeal}
                  className="btn-primary"
                >
                  開始する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}







