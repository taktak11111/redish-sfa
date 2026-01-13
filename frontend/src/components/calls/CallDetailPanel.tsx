'use client'

import { useState, useEffect } from 'react'
import { CallRecord, CallStatus, CallHistory, CallHistoryStatus } from '@/types/sfa'
import { getDropdownOptions } from '@/lib/dropdownSettings'
import { CallHistoryModal } from './CallHistoryModal'

function getLocalDateString(date: Date = new Date()): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function tryShowPicker(el: HTMLInputElement) {
  try {
    ;(el as any).showPicker?.()
  } catch {
    // NotAllowedError などは無視（ブラウザ/環境差）
  }
}

// 進捗（架電管理ステータス）は「クイックボタン（開始/不通/通電/終了）」で運用する前提のため、
// 詳細画面での手動変更は行わない（混乱防止）。表示上は主に「未架電 / 架電中」を扱う。
const STATUS_OPTIONS: { value: CallStatus; label: string }[] = [
  { value: '未架電', label: '未架電' },
  { value: '架電中', label: '架電中' },
]

const DEAL_TIME_OPTIONS: string[] = (() => {
  const out: string[] = []
  for (let h = 8; h <= 20; h += 1) {
    const hh = String(h).padStart(2, '0')
    out.push(`${hh}:00`)
    if (h !== 20) out.push(`${hh}:30`)
  }
  return out
})()

interface CallDetailPanelProps {
  record: CallRecord
  onClose: () => void
  onSave: (updates: Partial<CallRecord>) => void | Promise<void>
  isSaving: boolean
}

export function CallDetailPanel({ record, onClose, onSave, isSaving }: CallDetailPanelProps) {
  const [formData, setFormData] = useState<Partial<CallRecord>>(record)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState<boolean>(record.todayCallStatus === '済')
  const [isEditing, setIsEditing] = useState<boolean>(!(record.todayCallStatus === '済'))
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: false,
    alliance: true,
    call: true,
    // 「ネクストアクション以降」はデフォルトで折りたたむ（縦長防止）
    activity: false,
    callHistory: true,
    action: false,
    deal: false,
    exception: false,
  })
  const [showRecyclePriorityModal, setShowRecyclePriorityModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [editingHistory, setEditingHistory] = useState<CallHistory | null>(null)
  const [showNextActionModal, setShowNextActionModal] = useState(false)
  const [showImprovementModal, setShowImprovementModal] = useState(false)
  const [dropdownSettings, setDropdownSettings] = useState({
    staffIS: getDropdownOptions('staffIS'),
    statusIS: getDropdownOptions('statusIS'),
    cannotContactReason: getDropdownOptions('cannotContactReason'),
    customerType: getDropdownOptions('customerType'),
    disqualifyReason: getDropdownOptions('disqualifyReason'),
    unreachableReason: getDropdownOptions('unreachableReason'),
    lostReasonPrimary: getDropdownOptions('lostReasonPrimary'),
    lostReasonCustomerSub: getDropdownOptions('lostReasonCustomerSub'),
    lostReasonCompanySub: getDropdownOptions('lostReasonCompanySub'),
    lostReasonCompetitorSub: getDropdownOptions('lostReasonCompetitorSub'),
    lostReasonSelfSub: getDropdownOptions('lostReasonSelfSub'),
    lostReasonOtherSub: getDropdownOptions('lostReasonOtherSub'),
    lostReasonMemoTemplates: getDropdownOptions('lostReasonMemoTemplates'),
    recyclePriority: getDropdownOptions('recyclePriority'),
    resultContactStatus: getDropdownOptions('resultContactStatus'),
    actionOutsideCall: getDropdownOptions('actionOutsideCall'),
    nextActionContent: getDropdownOptions('nextActionContent'),
    dealStaffFS: getDropdownOptions('dealStaffFS'),
    dealResult: getDropdownOptions('dealResult'),
    lostReasonFS: getDropdownOptions('lostReasonFS'),
    openingPeriod: getDropdownOptions('openingPeriod'),
    improvementCategory: getDropdownOptions('improvementCategory'),
  })

  useEffect(() => {
    // 顧客区分は通常「見込み客（=リード顧客）」で運用。未入力の場合のみ表示上のデフォルトを入れる。
    setFormData({
      ...record,
      customerType: String(record.customerType || '').trim() ? record.customerType : '見込み客',
      // ステータス更新日は未入力なら「本日」をデフォルト表示（変更は可能）
      statusUpdateDate: String(record.statusUpdateDate || '').trim()
        ? record.statusUpdateDate
        : getLocalDateString(),
      // 直近架電日は未入力なら「本日」をデフォルト表示（変更は可能）
      lastCalledDate: String(record.lastCalledDate || '').trim()
        ? record.lastCalledDate
        : getLocalDateString(),
    })
    setIsSaved(record.todayCallStatus === '済')
    setIsEditing(!(record.todayCallStatus === '済'))
    // 行クリックで詳細を開いた時は、基本情報はデフォルトで閉じる
    setExpandedSections(prev => ({ ...prev, basic: false }))
  }, [record])

  useEffect(() => {
    const handleStorageChange = () => {
      setDropdownSettings({
        staffIS: getDropdownOptions('staffIS'),
        statusIS: getDropdownOptions('statusIS'),
        cannotContactReason: getDropdownOptions('cannotContactReason'),
        customerType: getDropdownOptions('customerType'),
        disqualifyReason: getDropdownOptions('disqualifyReason'),
        unreachableReason: getDropdownOptions('unreachableReason'),
        lostReasonPrimary: getDropdownOptions('lostReasonPrimary'),
        lostReasonCustomerSub: getDropdownOptions('lostReasonCustomerSub'),
        lostReasonCompanySub: getDropdownOptions('lostReasonCompanySub'),
        lostReasonCompetitorSub: getDropdownOptions('lostReasonCompetitorSub'),
        lostReasonSelfSub: getDropdownOptions('lostReasonSelfSub'),
        lostReasonOtherSub: getDropdownOptions('lostReasonOtherSub'),
        lostReasonMemoTemplates: getDropdownOptions('lostReasonMemoTemplates'),
        recyclePriority: getDropdownOptions('recyclePriority'),
        resultContactStatus: getDropdownOptions('resultContactStatus'),
        actionOutsideCall: getDropdownOptions('actionOutsideCall'),
        nextActionContent: getDropdownOptions('nextActionContent'),
        dealStaffFS: getDropdownOptions('dealStaffFS'),
        dealResult: getDropdownOptions('dealResult'),
        lostReasonFS: getDropdownOptions('lostReasonFS'),
        openingPeriod: getDropdownOptions('openingPeriod'),
        improvementCategory: getDropdownOptions('improvementCategory'),
      })
    }
    
    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(handleStorageChange, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const headerDisplayName =
    String(record.contactName || '').trim() ||
    String(record.contactNameKana || '').trim() ||
    String(record.companyName || '').trim() ||
    ''

  const statusIsValue = String(formData.statusIS || '')
  const rawStatusIsText = statusIsValue.trim()

  // NOTE:
  // - 現在の値が settings の候補に存在しない場合、UI上は「未選択」に見えるため、
  //   可変入力が勝手に出る事故を防ぐため「未選択扱い」にする。
  const isStatusIsOptionValid =
    !!rawStatusIsText &&
    (dropdownSettings.statusIS || []).some((o) => String(o.value).trim() === rawStatusIsText)
  const statusIsText = isStatusIsOptionValid ? rawStatusIsText : ''
  const isDev = process.env.NODE_ENV !== 'production'

  // NOTE: settings側のvalueが変更されても検出できるよう「番号プレフィックス + 文言」を併用（ただし有効値のみ）
  // NOTE: 「失注（リサイクル対象外）」等の文言に含まれる「対象外」で誤判定しない
  const isDisqualified =
    !!statusIsText &&
    (statusIsText.startsWith('05a.') || statusIsText.includes('Disqualified') || (statusIsText.includes('対象外') && !statusIsText.includes('失注') && !statusIsText.includes('リサイクル'))) &&
    !statusIsText.includes('失注') &&
    !statusIsText.includes('リサイクル対象外')
  const isUnreachable = !!statusIsText && (statusIsText.startsWith('05b.') || statusIsText.includes('連絡不能') || statusIsText.includes('Unreachable'))
  const isNurturing = !!statusIsText && (statusIsText.startsWith('06.') || statusIsText.includes('ナーチャリング'))
  const isContacting = !!statusIsText && (statusIsText.startsWith('02.') || statusIsText.includes('コンタクト試行中'))
  const isAppointment =
    !!statusIsText && (statusIsText.startsWith('03.') || statusIsText.includes('アポイント') || statusIsText.includes('商談獲得'))
  const isLostNonRecycle = !!statusIsText && (statusIsText.startsWith('04.') || statusIsText.includes('ナーチャリング対象外'))
  const isLostRecycle = !!statusIsText && statusIsText.includes('失注') && statusIsText.includes('リサイクル対象') && !statusIsText.includes('リサイクル対象外')
  const isLost = !!statusIsText && (statusIsText.includes('失注') || isLostNonRecycle)
  const isLegacyRecyclePriority = ['高', '中', '低'].includes(String(formData.recyclePriority || '').trim())
  const isLegacyCannotContact =
    statusIsValue.startsWith('05.') && !statusIsValue.startsWith('05a.') && !statusIsValue.startsWith('05b.')
  const showCannotContactLegacy = isLegacyCannotContact || !!String(formData.cannotContactReason || '').trim()
  const showLostBlock = isLost || isNurturing
  const hasActionInputs =
    !!String(formData.actionOutsideCall || '').trim() ||
    !!String(formData.nextActionDate || '').trim() ||
    !!String(formData.nextActionContent || '').trim() ||
    !!String(formData.nextActionSupplement || '').trim() ||
    !!String(formData.nextActionCompleted || '').trim()
  const showActionBlock = isContacting || isNurturing || hasActionInputs
  const hasDealInputs =
    !!String(formData.appointmentDate || '').trim() ||
    !!String(formData.dealSetupDate || '').trim() ||
    !!String(formData.dealTime || '').trim() ||
    !!String(formData.dealStaffFS || '').trim() ||
    !!String(formData.dealResult || '').trim() ||
    !!String(formData.lostReasonFS || '').trim()

  const selectedLostPrimary = String(formData.lostReasonPrimary || '')
  const showLostCustomerSub = selectedLostPrimary === '顧客要因'
  const showLostCompanySub = selectedLostPrimary === '自社要因'
  const showLostCompetitorSub = selectedLostPrimary === '競合要因'
  const showLostSelfSub = selectedLostPrimary === '自己対応'
  const showLostOtherSub = selectedLostPrimary === 'その他'

  const leadSourceValue = String(formData.leadSource || '')
  const showAllianceOMC = leadSourceValue === 'OMC'
  const showAllianceAmazon = leadSourceValue === 'Amazon'
  const showAllianceMeetsmore = leadSourceValue === 'Meetsmore'
  const showAllianceMakuake = leadSourceValue === 'Makuake'
  const hasAllianceSpecificFields =
    showAllianceOMC || showAllianceAmazon || showAllianceMeetsmore || showAllianceMakuake

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // CallRecord の任意フィールドを柔軟に更新できるユーティリティ
  const handleChange = <K extends keyof CallRecord>(field: K, value: CallRecord[K]) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }
      
      // ISステータスが変更されたら、ISステータス連動の追加入力項目をクリア
      if (field === 'statusIS' && prev.statusIS !== value) {
        // 失注関連
        next.lostReasonPrimary = undefined
        next.lostReasonCustomerSub = undefined
        next.lostReasonCompanySub = undefined
        next.lostReasonCompetitorSub = undefined
        next.lostReasonSelfSub = undefined
        next.lostReasonOtherSub = undefined
        // 商談獲得関連：商談獲得ステータスの場合はデフォルト値を設定
        const isAppointmentStatus = String(value || '').includes('商談獲得')
        if (isAppointmentStatus) {
          const today = getLocalDateString()
          if (!prev.appointmentDate) next.appointmentDate = today
          if (!prev.dealSetupDate) next.dealSetupDate = today
        }
        next.dealTime = undefined
        next.dealStaffFS = undefined
        // ナーチャリング関連
        next.recyclePriority = undefined
        // ネクストアクション関連（日付以外）
        next.nextActionContent = undefined
        // 対象外/連絡不能関連
        next.disqualifyReason = undefined
        next.unreachableReason = undefined
      }
      
      return next
    })
  }

  const handleClearTodayInputs = async () => {
    if (!confirm('本日の入力（履歴以外）をクリアしますか？\n※本日分の架電履歴は最新1件のみ削除し、回数を1回戻します（過去日付の履歴は残します）。')) return
    setSaveError(null)

    // 本日分の履歴を最新1件だけ削除（過去日付は残す）
    // - call_count / last_called_date は API 側で再計算される
    try {
      const today = getLocalDateString()
      const res = await fetch(`/api/call-history?leadId=${encodeURIComponent(String(record.leadId))}`)
      if (res.ok) {
        const body = await res.json()
        const rows: Array<{ id?: string; callDate?: string }> = Array.isArray(body?.data) ? body.data : []
        const latestToday = rows.find(r => r.callDate === today && r.id)
        if (latestToday?.id) {
          await fetch(`/api/call-history?id=${encodeURIComponent(latestToday.id)}`, { method: 'DELETE' })
        }
      }
    } catch {
      // 履歴の削除に失敗しても、本体のクリアは続行（運用上は後追いで修正可能）
    }

    // 「履歴以外の本日入力分」を初期化
    // - todayCallStatus: 未了に戻す
    // - 架電アクション状態（架電中/通電/終了）をクリア
    // - 直近結果（本日）をクリア
    const updates: Record<string, any> = {
      status: '未架電',
      todayCallStatus: '未了',
      callStatusToday: null,
      resultContactStatus: null,
      // リード状況（ISステータス）もクリア（本日入力分）
      statusIS: null,
      statusUpdateDate: null,
      cannotContactReason: null,
      recyclePriority: null,
      // 会話メモ等（本日入力分）
      conversationMemo: null,
      actionOutsideCall: null,
      nextActionDate: null,
      nextActionContent: null,
      nextActionSupplement: null,
      nextActionCompleted: null,
      callingStartedAt: null,
      connectedAt: null,
      endedAt: null,
      callingStaffIS: null,
      lastConnectedDurationSeconds: null,
    }

    try {
      await Promise.resolve(onSave(updates as any))
      setIsSaved(false)
      setIsEditing(true)
      setFormData(prev => ({
        ...prev,
        status: '未架電' as any,
        todayCallStatus: '未了' as any,
        statusIS: undefined,
        statusUpdateDate: undefined,
        cannotContactReason: undefined,
        recyclePriority: undefined,
        conversationMemo: undefined,
        actionOutsideCall: undefined,
        nextActionDate: undefined,
        nextActionContent: undefined,
        nextActionSupplement: undefined,
        nextActionCompleted: undefined,
        callStatusToday: undefined,
        resultContactStatus: undefined,
        callingStartedAt: undefined,
        connectedAt: undefined,
        endedAt: undefined,
        callingStaffIS: undefined,
        lastConnectedDurationSeconds: undefined,
      }))
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'クリアに失敗しました（原因不明）'
      setSaveError(message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    const missing: string[] = []

    // 基本必須項目
    if (!String(formData.staffIS || '').trim()) missing.push('担当IS')
    if (!String(formData.status || '').trim()) missing.push('架電進捗')
    if (!String(formData.statusIS || '').trim()) missing.push('ISステータス')
    if (!String(formData.statusUpdateDate || '').trim()) missing.push('ステータス更新日')

    // クイック要件（通電時は必須入力を促す）
    const callResult = String(formData.callStatusToday || formData.resultContactStatus || '')
    const isConnected = callResult === '通電'
    if (isConnected) {
      if (!String(formData.statusIS || '').trim()) missing.push('リードステータス')
      // 会話メモは任意入力（必須ではない）
    }

    // 案A: ISステータスに応じた必須入力
    if (isNurturing) {
      if (!String(formData.recyclePriority || '').trim()) missing.push('ナーチャリング優先度（A〜E）')
      if (!String(formData.nextActionDate || '').trim()) missing.push('次回連絡日')
      if (!String(formData.nextActionContent || '').trim()) missing.push('次回連絡内容')
    }

    if (isContacting) {
      if (!String(formData.nextActionDate || '').trim()) missing.push('次回連絡日')
      if (!String(formData.nextActionContent || '').trim()) missing.push('次回連絡内容')
    }

    if (isAppointment) {
      if (!String(formData.appointmentDate || '').trim()) missing.push('商談獲得日')
      if (!String(formData.dealSetupDate || '').trim()) missing.push('商談設定日')
      if (!String(formData.dealTime || '').trim()) missing.push('商談時間')
      if (!String(formData.dealStaffFS || '').trim()) missing.push('商談予定者（商談担当FS）')
    }

    if (isDisqualified) {
      if (!String(formData.disqualifyReason || '').trim()) missing.push('対象外理由')
    }

    if (isUnreachable) {
      if (!String(formData.unreachableReason || '').trim()) missing.push('連絡不能理由')
    }

    if (isLostNonRecycle) {
      if (!String(formData.lostReasonPrimary || '').trim()) missing.push('失注主因')
      if (showLostCustomerSub && !String(formData.lostReasonCustomerSub || '').trim()) {
        missing.push('失注サブ理由（顧客要因）')
      }
      if (showLostCompanySub && !String(formData.lostReasonCompanySub || '').trim()) {
        missing.push('失注サブ理由（自社要因）')
      }
      if (showLostCompetitorSub && !String(formData.lostReasonCompetitorSub || '').trim()) {
        missing.push('失注サブ理由（競合要因）')
      }
      if (showLostSelfSub && !String(formData.lostReasonSelfSub || '').trim()) {
        missing.push('失注サブ理由（自己対応）')
      }
      if (showLostOtherSub && !String(formData.lostReasonOtherSub || '').trim()) {
        missing.push('失注サブ理由（その他）')
      }
    }

    // 失注（リサイクル対象）の場合はリサイクル優先度が必須
    if (isLostRecycle) {
      if (!String(formData.lostReasonPrimary || '').trim()) missing.push('失注主因')
      if (showLostCustomerSub && !String(formData.lostReasonCustomerSub || '').trim()) {
        missing.push('失注サブ理由（顧客要因）')
      }
      if (showLostCompanySub && !String(formData.lostReasonCompanySub || '').trim()) {
        missing.push('失注サブ理由（自社要因）')
      }
      if (showLostCompetitorSub && !String(formData.lostReasonCompetitorSub || '').trim()) {
        missing.push('失注サブ理由（競合要因）')
      }
      if (showLostSelfSub && !String(formData.lostReasonSelfSub || '').trim()) {
        missing.push('失注サブ理由（自己対応）')
      }
      if (showLostOtherSub && !String(formData.lostReasonOtherSub || '').trim()) {
        missing.push('失注サブ理由（その他）')
      }
      if (!String(formData.recyclePriority || '').trim()) {
        missing.push('リサイクル優先度（A〜E）')
      }
    }

    if (missing.length > 0) {
      setSaveError(`保存できません：${missing.join(' / ')} を入力してください。`)
      setExpandedSections(prev => ({
        ...prev,
        call: true,
        activity: prev.activity || isNurturing,
        action: prev.action || isNurturing || isContacting,
        deal: prev.deal || isAppointment,
      }))
      return
    }

    try {
      await Promise.resolve(onSave(formData))
      // UI上の状態遷移（要望）:
      // - 編集中 → 保存済
      // - ヘッダーの「編集中」→「編集」
      setIsSaved(true)
      setIsEditing(false)
      setFormData(prev => ({ ...prev, todayCallStatus: '済' as any }))
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : '保存に失敗しました（原因不明）'
      setSaveError(message)
    }
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
          width: 'min(720px, 60vw)',
          animation: 'slideInRight 0.3s ease-out',
        }}
      >
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">架電詳細</h2>
            <p className="text-sm text-gray-500 mt-1">
              {record.leadId}
              {headerDisplayName ? ` ｜ ${headerDisplayName}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleClearTodayInputs()}
              disabled={isSaving}
              className={[
                'px-3 py-2 text-sm font-medium rounded-md border',
                isSaving ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' : 'border-gray-300 bg-white hover:bg-gray-50',
              ].join(' ')}
            >
              クリア
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isEditing}
              className={[
                'px-3 py-2 text-sm font-medium rounded-md border',
                isEditing
                  ? 'border-primary-300 bg-primary-50 text-primary-800 cursor-default'
                  : 'border-gray-300 bg-white hover:bg-gray-50',
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
            <div className={['space-y-4', isEditing ? '' : 'pointer-events-none'].filter(Boolean).join(' ')}>
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

              {/* NOTE: 連携元備考は「連携元情報」セクションへ移動 */}
              {false && (
                <div>
                  <label className="label">連携元備考</label>
                  <textarea
                    value={formData.allianceRemarks || ''}
                    onChange={(e) => handleChange('allianceRemarks', e.target.value)}
                    className="input"
                    rows={3}
                  />
                </div>
              )}
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
            <div className={['grid grid-cols-1 gap-4', isEditing ? '' : 'pointer-events-none'].filter(Boolean).join(' ')}>
              {/* 連携元備考（自由記入）: セクション最上部 */}
              <div>
                <label className="label">連携元備考（自由記入）</label>
                <textarea
                  value={formData.allianceRemarks || ''}
                  onChange={(e) => handleChange('allianceRemarks', e.target.value)}
                  className="input"
                  rows={3}
                />
              </div>

              {/* リードソース別: 連携項目の出し分け */}
              {showAllianceOMC && (
                <>
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
                </>
              )}

              {showAllianceAmazon && (
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

              {showAllianceMeetsmore && (
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

              {showAllianceMakuake && (
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

              {!hasAllianceSpecificFields && (
                <div className="text-sm text-gray-500">
                  このリードソース（{leadSourceValue || '未設定'}）には、個別の連携項目はありません。
                </div>
              )}
            </div>
            )}
          </section>

          <section>
            <button
              type="button"
              onClick={() => toggleSection('call')}
              className="w-full text-left flex items-center justify-between text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300 bg-gray-100 hover:bg-gray-200 -mx-6 px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <span>IS対応ステータス</span>
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
            <div className={['grid grid-cols-1 gap-4', isEditing ? '' : 'pointer-events-none'].filter(Boolean).join(' ')}>
              <div className="text-sm font-semibold text-gray-900">リードステータス（IS）</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">担当IS<span className="text-red-500 text-xs ml-0.5">*</span></label>
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
                  <label className="label">架電進捗<span className="text-red-500 text-xs ml-0.5">*</span></label>
                  <div className="input bg-gray-50 text-gray-700 cursor-default">
                    {String(formData.status || '未架電')}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    クイックボタンで自動管理します（手入力不要）。
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">ISステータス<span className="text-red-500 text-xs ml-0.5">*</span></label>
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
                  <label className="label">ステータス更新日<span className="text-red-500 text-xs ml-0.5">*</span></label>
                  <input
                    type="date"
                    value={formData.statusUpdateDate || ''}
                    onChange={(e) => handleChange('statusUpdateDate', e.target.value)}
                    onFocus={(e) => tryShowPicker(e.currentTarget)}
                    onClick={(e) => tryShowPicker(e.currentTarget)}
                    className="input"
                  />
                </div>
              </div>
              <div className="rounded-lg border-2 border-blue-300 bg-blue-50/50 p-4 shadow-sm">
                <div className="text-sm font-semibold text-blue-800 mb-2">追加入力項目（ISステータス連動）</div>
                {isDev && !statusIsText && rawStatusIsText && (
                  <div className="mb-2 text-xs text-gray-500">
                    開発用メモ：現在のISステータス値（{rawStatusIsText}）が設定に存在しないため、未選択として扱います（再選択してください）。
                  </div>
                )}
                {!statusIsText && (
                  <div className="text-sm text-gray-500">
                    ISステータスを選択すると、ここに追加入力項目が表示されます。
                  </div>
                )}

                {statusIsText && isNurturing && (
                  <div className="mb-3 text-sm text-gray-600">
                    このISステータス：ナーチャリング優先度＋次回連絡入力
                  </div>
                )}
                {statusIsText && !isNurturing && isContacting && (
                  <div className="mb-3 text-sm text-gray-600">
                    このISステータス：次回連絡入力（折返し/再架電など）
                  </div>
                )}
                {statusIsText && isAppointment && (
                  <div className="mb-3 text-sm text-gray-600">
                    このISステータス：商談獲得入力（商談獲得日/商談設定日/商談時間/商談予定者）
                  </div>
                )}
                {statusIsText && isDisqualified && (
                  <div className="mb-3 text-sm text-gray-600">
                    このISステータス：対象外理由を入力
                  </div>
                )}
                {statusIsText && isUnreachable && (
                  <div className="mb-3 text-sm text-gray-600">
                    このISステータス：連絡不能理由を入力
                  </div>
                )}
                {statusIsText && !isNurturing && !isContacting && !isAppointment && !isDisqualified && !isUnreachable && isLost && (
                  <div className="mb-3 text-sm text-gray-600">
                    このISステータス：失注理由を入力
                  </div>
                )}

                {isNurturing && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <label className="block text-sm font-medium text-gray-700">ナーチャリング優先度（A〜E）<span className="text-red-500 text-xs ml-0.5">*</span></label>
                        <button
                          type="button"
                          onClick={() => setShowRecyclePriorityModal(true)}
                          className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors cursor-pointer"
                          title="ナーチャリング優先度の定義を表示"
                        >
                          <span className="text-xs text-gray-600 font-bold">?</span>
                        </button>
                      </div>
                      <select
                        aria-label="ナーチャリング優先度（A〜E）"
                        value={formData.recyclePriority || ''}
                        onChange={(e) => handleChange('recyclePriority', e.target.value)}
                        className="input"
                      >
                        <option value="">選択してください</option>
                        {/* 旧値（高/中/低）は「表示のみ」：新規選択肢からは除外 */}
                        {isLegacyRecyclePriority && (
                          <option value={String(formData.recyclePriority)} disabled>
                            {String(formData.recyclePriority)}（旧：表示のみ）
                          </option>
                        )}
                        {dropdownSettings.recyclePriority
                          .filter((option) => !['高', '中', '低'].includes(String(option.value).trim()))
                          .map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div />
                  </div>
                )}

                {(isContacting || isNurturing) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="label">次回連絡日</label>
                      <input
                        type="date"
                        value={formData.nextActionDate || ''}
                        onChange={(e) => handleChange('nextActionDate', e.target.value)}
                        onFocus={(e) => tryShowPicker(e.currentTarget)}
                        onClick={(e) => tryShowPicker(e.currentTarget)}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">次回連絡内容<span className="text-red-500 text-xs ml-0.5">*</span></label>
                      <select
                        aria-label="次回連絡内容"
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
                  </div>
                )}

                {isAppointment && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="label">商談獲得日<span className="text-red-500 text-xs ml-0.5">*</span></label>
                      <input
                        type="date"
                        value={formData.appointmentDate || getLocalDateString()}
                        onChange={(e) => handleChange('appointmentDate', e.target.value)}
                        onFocus={(e) => tryShowPicker(e.currentTarget)}
                        onClick={(e) => tryShowPicker(e.currentTarget)}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">商談設定日<span className="text-red-500 text-xs ml-0.5">*</span></label>
                      <input
                        type="date"
                        value={formData.dealSetupDate || ''}
                        onChange={(e) => handleChange('dealSetupDate', e.target.value)}
                        onFocus={(e) => tryShowPicker(e.currentTarget)}
                        onClick={(e) => tryShowPicker(e.currentTarget)}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">商談時間</label>
                      <select
                        aria-label="商談時間"
                        value={formData.dealTime || ''}
                        onChange={(e) => handleChange('dealTime', e.target.value)}
                        className="input"
                      >
                        <option value="">選択してください</option>
                        {DEAL_TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">商談予定者（商談担当FS）<span className="text-red-500 text-xs ml-0.5">*</span></label>
                      <select
                        aria-label="商談担当FS"
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
                  </div>
                )}

                {isLost && (
                  <div className="mt-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="label">失注主因<span className="text-red-500 text-xs ml-0.5">*</span></label>
                        <select
                          aria-label="失注主因"
                          value={formData.lostReasonPrimary || ''}
                          onChange={(e) => handleChange('lostReasonPrimary', e.target.value)}
                          className="input"
                        >
                          <option value="">選択してください</option>
                          {dropdownSettings.lostReasonPrimary.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {showLostCustomerSub && (
                        <div>
                          <label className="label">失注サブ理由（顧客要因）<span className="text-red-500 text-xs ml-0.5">*</span></label>
                          <select
                            aria-label="失注サブ理由（顧客要因）"
                            value={formData.lostReasonCustomerSub || ''}
                            onChange={(e) => handleChange('lostReasonCustomerSub', e.target.value)}
                            className="input"
                          >
                            <option value="">選択してください</option>
                            {dropdownSettings.lostReasonCustomerSub.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {showLostCompanySub && (
                        <div>
                          <label className="label">失注サブ理由（自社要因）<span className="text-red-500 text-xs ml-0.5">*</span></label>
                          <select
                            aria-label="失注サブ理由（自社要因）"
                            value={formData.lostReasonCompanySub || ''}
                            onChange={(e) => handleChange('lostReasonCompanySub', e.target.value)}
                            className="input"
                          >
                            <option value="">選択してください</option>
                            {dropdownSettings.lostReasonCompanySub.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {showLostCompetitorSub && (
                        <div>
                          <label className="label">失注サブ理由（競合要因）<span className="text-red-500 text-xs ml-0.5">*</span></label>
                          <select
                            aria-label="失注サブ理由（競合要因）"
                            value={formData.lostReasonCompetitorSub || ''}
                            onChange={(e) => {
                              const v = e.target.value
                              handleChange('lostReasonCompetitorSub', v)
                              if (v && /^他税理士:/.test(String(v))) {
                                const base = String(formData.conversationMemo || '').trim()
                                const next = base ? `${base}\n${v}` : String(v)
                                handleChange('conversationMemo', next)
                              }
                            }}
                            className="input"
                          >
                            <option value="">選択してください</option>
                            {dropdownSettings.lostReasonCompetitorSub.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {showLostSelfSub && (
                        <div>
                          <label className="label">失注サブ理由（自己対応）<span className="text-red-500 text-xs ml-0.5">*</span></label>
                          <select
                            aria-label="失注サブ理由（自己対応）"
                            value={formData.lostReasonSelfSub || ''}
                            onChange={(e) => handleChange('lostReasonSelfSub', e.target.value)}
                            className="input"
                          >
                            <option value="">選択してください</option>
                            {dropdownSettings.lostReasonSelfSub.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {showLostOtherSub && (
                        <div>
                          <label className="label">失注サブ理由（その他）<span className="text-red-500 text-xs ml-0.5">*</span></label>
                          <select
                            aria-label="失注サブ理由（その他）"
                            value={formData.lostReasonOtherSub || ''}
                            onChange={(e) => handleChange('lostReasonOtherSub', e.target.value)}
                            className="input"
                          >
                            <option value="">選択してください</option>
                            {dropdownSettings.lostReasonOtherSub.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {isLostRecycle && (
                        <div>
                          <label className="label">リサイクル優先度（A〜E）<span className="text-red-500 text-xs ml-0.5">*</span></label>
                          <select
                            aria-label="リサイクル優先度"
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
                      )}
                    </div>
                  </div>
                )}

                {isDisqualified && (
                  <div className="mt-4">
                    <div>
                      <label className="label">対象外（Disqualified）理由<span className="text-red-500 text-xs ml-0.5">*</span></label>
                      <select
                        aria-label="対象外理由"
                        value={formData.disqualifyReason || ''}
                        onChange={(e) => handleChange('disqualifyReason', e.target.value)}
                        className="input"
                      >
                        <option value="">選択してください</option>
                        {dropdownSettings.disqualifyReason.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {isUnreachable && (
                  <div className="mt-4">
                    <div>
                      <label className="label">連絡不能（Unreachable）理由<span className="text-red-500 text-xs ml-0.5">*</span></label>
                      <select
                        aria-label="連絡不能理由"
                        value={formData.unreachableReason || ''}
                        onChange={(e) => handleChange('unreachableReason', e.target.value)}
                        className="input"
                      >
                        <option value="">選択してください</option>
                        {dropdownSettings.unreachableReason.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {(statusIsText && !isContacting && !isNurturing && !isAppointment && !isDisqualified && !isUnreachable && !isLost) && (
                  <div className="text-sm text-gray-500 mt-3">
                    このISステータス：追加入力不要（必要に応じて下の項目を入力）
                  </div>
                )}
              </div>

              {/* 架電メモ（全ISステータス共通） */}
              <div className="mt-4">
                <label className="label">架電メモ・その他記録</label>
                <textarea
                  value={formData.conversationMemo || ''}
                  onChange={(e) => handleChange('conversationMemo', e.target.value)}
                  className="input"
                  rows={4}
                  placeholder="通話内容、顧客の反応などを記入"
                />
              </div>

              {/* ネクストアクション・改善学習記録ボタン */}
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNextActionModal(true)}
                  className="flex-1 px-4 py-2 bg-blue-50 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  📋 ネクストアクション
                  {(formData.nextActionDate || formData.nextActionSupplement) && (
                    <span className="ml-2 text-xs bg-blue-200 px-2 py-0.5 rounded">入力あり</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowImprovementModal(true)}
                  className="flex-1 px-4 py-2 bg-green-50 border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                >
                  📝 改善・学習記録
                  {formData.actionOutsideCall && (
                    <span className="ml-2 text-xs bg-green-200 px-2 py-0.5 rounded">入力あり</span>
                  )}
                </button>
              </div>

              {showCannotContactLegacy && (
                <div>
                  <label className="label">対象外/連絡不能 理由（旧）</label>
                  <select
                    aria-label="対象外/連絡不能 理由（旧）"
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
              )}

              {showLostBlock && !isLost && (
                <div className="pt-3 mt-2 border-t border-gray-200">
                  <div className="text-sm font-semibold text-gray-900 mb-2">失注/クローズ理由（参考）</div>
                  {!formData.lostReasonPrimary && (
                    <div className="text-xs text-gray-500 mb-2">
                      将来の失注に備えて入力可能です（任意）。
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="label">失注主因<span className="text-red-500 text-xs ml-0.5">*</span></label>
                      <select
                        aria-label="失注主因"
                        value={formData.lostReasonPrimary || ''}
                        onChange={(e) => handleChange('lostReasonPrimary', e.target.value)}
                        className="input"
                      >
                        <option value="">選択してください</option>
                        {dropdownSettings.lostReasonPrimary.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                  {showLostCustomerSub && (
                    <div>
                      <label className="label">失注サブ理由（顧客要因）<span className="text-red-500 text-xs ml-0.5">*</span></label>
                      <select
                        aria-label="失注サブ理由（顧客要因）"
                        value={formData.lostReasonCustomerSub || ''}
                        onChange={(e) => handleChange('lostReasonCustomerSub', e.target.value)}
                        className="input"
                      >
                        <option value="">選択してください</option>
                        {dropdownSettings.lostReasonCustomerSub.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {showLostCompanySub && (
                    <div>
                      <label className="label">失注サブ理由（自社要因）<span className="text-red-500 text-xs ml-0.5">*</span></label>
                      <select
                        aria-label="失注サブ理由（自社要因）"
                        value={formData.lostReasonCompanySub || ''}
                        onChange={(e) => handleChange('lostReasonCompanySub', e.target.value)}
                        className="input"
                      >
                        <option value="">選択してください</option>
                        {dropdownSettings.lostReasonCompanySub.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {showLostCompetitorSub && (
                    <div>
                      <label className="label">失注サブ理由（競合要因）<span className="text-red-500 text-xs ml-0.5">*</span></label>
                      <select
                        aria-label="失注サブ理由（競合要因）"
                        value={formData.lostReasonCompetitorSub || ''}
                        onChange={(e) => {
                          const v = e.target.value
                          handleChange('lostReasonCompetitorSub', v)
                          // 旧「備忘テンプレ」の選択肢を統合：選択したら架電メモへ追記
                          if (v && /^他税理士:/.test(String(v))) {
                            const base = String(formData.conversationMemo || '').trim()
                            const next = base ? `${base}\n${v}` : String(v)
                            handleChange('conversationMemo', next)
                          }
                        }}
                        className="input"
                      >
                        <option value="">選択してください</option>
                        {dropdownSettings.lostReasonCompetitorSub.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {false && (
                        <div className="mt-4">
                          <label className="label">競合要因（備忘テンプレ）</label>
                          <select
                            aria-label="競合要因（備忘テンプレ）"
                            value={formData.lostReasonMemoTemplate || ''}
                            onChange={(e) => {
                              const v = e.target.value
                              handleChange('lostReasonMemoTemplate', v)
                              if (v) {
                                const base = String(formData.conversationMemo || '').trim()
                                const next = base ? `${base}\n${v}` : v
                                handleChange('conversationMemo', next)
                              }
                            }}
                            className="input"
                          >
                            <option value="">選択してください</option>
                            {dropdownSettings.lostReasonMemoTemplates.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div className="mt-1 text-xs text-gray-500">選択すると架電メモに追記されます</div>
                        </div>
                      )}
                    </div>
                  )}
                  {showLostSelfSub && (
                    <div>
                      <label className="label">失注サブ理由（自己対応）<span className="text-red-500 text-xs ml-0.5">*</span></label>
                      <select
                        aria-label="失注サブ理由（自己対応）"
                        value={formData.lostReasonSelfSub || ''}
                        onChange={(e) => handleChange('lostReasonSelfSub', e.target.value)}
                        className="input"
                      >
                        <option value="">選択してください</option>
                        {dropdownSettings.lostReasonSelfSub.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {showLostOtherSub && (
                    <div>
                      <label className="label">失注サブ理由（その他）<span className="text-red-500 text-xs ml-0.5">*</span></label>
                      <select
                        aria-label="失注サブ理由（その他）"
                        value={formData.lostReasonOtherSub || ''}
                        onChange={(e) => handleChange('lostReasonOtherSub', e.target.value)}
                        className="input"
                      >
                        <option value="">選択してください</option>
                        {dropdownSettings.lostReasonOtherSub.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {isLostRecycle && (
                    <div>
                      <label className="label">リサイクル優先度（A〜E）<span className="text-red-500 text-xs ml-0.5">*</span></label>
                      <select
                        aria-label="リサイクル優先度"
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
                  )}

                  {false && (
                    <div>
                      <label className="label">備忘テンプレ</label>
                      <select
                        aria-label="備忘テンプレ"
                        value={formData.lostReasonMemoTemplate || ''}
                        onChange={(e) => {
                          const v = e.target.value
                          handleChange('lostReasonMemoTemplate', v)
                          if (v) {
                            const base = String(formData.conversationMemo || '').trim()
                            const next = base ? `${base}\n${v}` : v
                            handleChange('conversationMemo', next)
                          }
                        }}
                        className="input"
                      >
                        <option value="">選択してください</option>
                        {dropdownSettings.lostReasonMemoTemplates.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="mt-1 text-xs text-gray-500">選択すると架電メモに追記されます</div>
                    </div>
                  )}
                  </div>
                </div>
              )}

              {/* NOTE: B（活動履歴）/E（例外）は専用セクションへ移動 */}
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
              <div className="text-xs text-gray-500 mb-2">
                2回目以降の架電記録
              </div>
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
              <span>ネクストアクション確認</span>
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
            <>
            <div className="text-xs text-gray-500 mb-3">
              ネクストアクションボタンで入力した内容のサマリーです。
            </div>
            {/* ネクストアクション サマリー表示 */}
            {(formData.nextActionDate || formData.nextActionContent) ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-medium text-gray-700">
                        📅 {formData.nextActionDate || '日付未設定'}
                      </span>
                      {formData.nextActionContent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {formData.nextActionContent}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {formData.nextActionCompleted === '必須' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          ☑ 必須
                        </span>
                      )}
                      {formData.nextActionSupplement === '重要' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          ☑ 重要
                        </span>
                      )}
                    </div>
                    {formData.nextActionSupplement && formData.nextActionSupplement !== '重要' && (
                      <div className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                        {formData.nextActionSupplement}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNextActionModal(true)}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  >
                    編集
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">ネクストアクションが未設定です</p>
                <button
                  type="button"
                  onClick={() => setShowNextActionModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  + ネクストアクションを設定
                </button>
              </div>
            )}
            </>
            )}
          </section>

          <section>
            <button
              type="button"
              onClick={() => toggleSection('deal')}
              className="w-full text-left flex items-center justify-between text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300 bg-gray-100 hover:bg-gray-200 -mx-6 px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <span>IS結果確認</span>
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
            <>
            <div className="text-sm text-gray-500 mb-3">
              確認用（補助）セクションです。必須の商談入力は上の「次に入力（ISステータス連動）」に表示されます。
            </div>
            {!(isAppointment || hasDealInputs) ? (
              <div className="text-sm text-gray-500">
                必要に応じて入力します（通常は空のままでOK）。
              </div>
            ) : (
            <div className={['grid grid-cols-1 gap-4', isEditing ? '' : 'pointer-events-none'].filter(Boolean).join(' ')}>
              <div>
                <label className="label">商談結果</label>
                <select
                  aria-label="商談結果"
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
                  aria-label="失注理由（FS→IS）"
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
            </>
            )}
          </section>

          <section>
            <button
              type="button"
              onClick={() => toggleSection('activity')}
              className="w-full text-left flex items-center justify-between text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300 bg-gray-100 hover:bg-gray-200 -mx-6 px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <span>IS活動履歴確認</span>
              <svg
                className={`w-6 h-6 text-gray-700 transition-transform duration-200 ${expandedSections.activity ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {expandedSections.activity && (
              <div className={['grid grid-cols-1 gap-4', isEditing ? '' : 'pointer-events-none'].filter(Boolean).join(' ')}>
                <div className="text-sm text-gray-500">
                  確認用（表示のみ）です。入力は不要です。
                </div>
                <div>
                  <label className="label">直近架電結果（表示のみ）</label>
                  <div className="input bg-gray-50 text-gray-700 cursor-default">
                    {String(formData.resultContactStatus || '').trim() ? String(formData.resultContactStatus) : '未設定'}
                  </div>
                </div>
                <div>
                  <label className="label">直近架電日（表示のみ）</label>
                  <div className="input bg-gray-50 text-gray-700 cursor-default">
                    {String(formData.lastCalledDate || '').trim() ? String(formData.lastCalledDate) : '未設定'}
                  </div>
                </div>
                <div>
                  <label className="label">架電数カウント（表示のみ）</label>
                  <div className="input bg-gray-50 text-gray-700 cursor-default">
                    {String(typeof formData.callCount === 'number' ? formData.callCount : 0)}
                  </div>
                </div>
                <div>
                  <label className="label">通電会話時間（分）</label>
                  {isEditing ? (
                    <input
                      type="number"
                      aria-label="通電会話時間（分）"
                      value={(() => {
                        const sec = Number(formData.lastConnectedDurationSeconds)
                        if (!Number.isFinite(sec) || sec <= 0) return ''
                        // 30秒以上は切り上げ、29秒以下は切り捨て
                        return Math.floor((sec + 30) / 60)
                      })()}
                      onChange={(e) => {
                        const val = e.target.value.trim()
                        // 分を秒に変換して保存
                        handleChange('lastConnectedDurationSeconds', val === '' ? undefined : Number(val) * 60)
                      }}
                      placeholder="例: 5"
                      min={0}
                      className="input"
                    />
                  ) : (
                    <div className="input bg-gray-50 text-gray-700 cursor-default">
                      {(() => {
                        const sec = Number(formData.lastConnectedDurationSeconds)
                        if (!Number.isFinite(sec) || sec <= 0) return '未設定'
                        // 30秒以上は切り上げ、29秒以下は切り捨て
                        const minutes = Math.floor((sec + 30) / 60)
                        return `${minutes}分`
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          <section>
            <button
              type="button"
              onClick={() => toggleSection('exception')}
              className="w-full text-left flex items-center justify-between text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-300 bg-gray-100 hover:bg-gray-200 -mx-6 px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <span>例外（顧客属性修正）</span>
              <svg
                className={`w-6 h-6 text-gray-700 transition-transform duration-200 ${expandedSections.exception ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {expandedSections.exception && (
              <div className={['grid grid-cols-1 gap-4', isEditing ? '' : 'pointer-events-none'].filter(Boolean).join(' ')}>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    顧客属性修正（既存顧客や解約顧客がリードに入っていた場合）
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    確認用（例外）です。通常は入力不要です。
                  </div>
                  <div className="mt-2">
                    <label className="label">顧客区分（属性）</label>
                    <select
                      aria-label="顧客区分（属性）"
                      value={formData.customerType || ''}
                      onChange={(e) => handleChange('customerType', e.target.value)}
                      className="input"
                    >
                      <option value="">選択してください</option>
                      {dropdownSettings.customerType.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="mt-1 text-xs text-gray-500">
                      通常は「見込み客（リード顧客）」で運用。混入が判明した場合のみ修正してください。
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
            {saveError && (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {saveError}
              </div>
            )}
            <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSaving || (isSaved && !isEditing)}
              className="btn-primary"
            >
              {isSaving ? '保存中...' : isSaved && !isEditing ? '保存済' : '保存'}
            </button>
            {isSaved && !isEditing && (
              <button
                type="button"
                onClick={onClose}
                className="ml-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
              >
                閉じる
              </button>
            )}
            </div>
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
                <h2 className="text-xl font-bold text-gray-900">ナーチャリング優先度（A〜E）の定義</h2>
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

      {/* ネクストアクションモーダル */}
      {showNextActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 min-h-[480px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">📋 ネクストアクション</h3>
              <button
                type="button"
                onClick={() => setShowNextActionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-5">
              {/* リード顧客情報（自動表示） */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-500">リード顧客ID</div>
                  <div className="text-sm font-medium text-gray-900">{record.leadId || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">顧客名</div>
                  <div className="text-sm font-medium text-gray-900">
                    {record.contactName || record.companyName || '-'}
                  </div>
                </div>
              </div>
              <div>
                <label className="label">ネクストアクション日</label>
                <input
                  type="date"
                  value={formData.nextActionDate || ''}
                  onChange={(e) => handleChange('nextActionDate', e.target.value)}
                  onFocus={(e) => tryShowPicker(e.currentTarget)}
                  onClick={(e) => tryShowPicker(e.currentTarget)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">アクションカテゴリー</label>
                <select
                  aria-label="アクションカテゴリー"
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
              <div className="flex gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.nextActionCompleted === '必須'}
                    onChange={(e) => handleChange('nextActionCompleted', e.target.checked ? '必須' : '')}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">必須</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.nextActionSupplement === '重要'}
                    onChange={(e) => handleChange('nextActionSupplement', e.target.checked ? '重要' : '')}
                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">重要</span>
                </label>
              </div>
              <div>
                <label className="label">アクション内容</label>
                <textarea
                  value={(formData.nextActionSupplement !== '重要' ? formData.nextActionSupplement : '') || ''}
                  onChange={(e) => handleChange('nextActionSupplement', e.target.value)}
                  className="input"
                  rows={4}
                  placeholder="具体的なアクション内容を記入"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowNextActionModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => setShowNextActionModal(false)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 改善・学習記録モーダル */}
      {showImprovementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 min-h-[520px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">📝 改善・学習記録</h3>
              <button
                type="button"
                onClick={() => setShowImprovementModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-5">
              {/* リード顧客情報（自動表示） */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-500">リード顧客ID</div>
                  <div className="text-sm font-medium text-gray-900">{record.leadId || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">顧客名</div>
                  <div className="text-sm font-medium text-gray-900">
                    {record.contactName || record.companyName || '-'}
                  </div>
                </div>
              </div>
              <div>
                <label className="label">記録日</label>
                <input
                  type="date"
                  value={formData.statusUpdateDate || getLocalDateString()}
                  onChange={(e) => handleChange('statusUpdateDate', e.target.value)}
                  onFocus={(e) => tryShowPicker(e.currentTarget)}
                  onClick={(e) => tryShowPicker(e.currentTarget)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">タイトル</label>
                <input
                  type="text"
                  value={formData.callbackPreferredDate || ''}
                  onChange={(e) => handleChange('callbackPreferredDate', e.target.value)}
                  className="input"
                  placeholder="学びや改善点のタイトル"
                />
              </div>
              <div>
                <label className="label">改善・学習カテゴリ</label>
                <select
                  aria-label="改善・学習カテゴリ"
                  value={formData.callbackPreferredTime || ''}
                  onChange={(e) => handleChange('callbackPreferredTime', e.target.value)}
                  className="input"
                >
                  <option value="">選択してください</option>
                  {(dropdownSettings.improvementCategory || []).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">改善・学習内容</label>
                <textarea
                  value={formData.actionOutsideCall || ''}
                  onChange={(e) => handleChange('actionOutsideCall', e.target.value)}
                  className="input"
                  rows={5}
                  placeholder="今回の架電で学んだこと、改善点などを記入"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowImprovementModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => setShowImprovementModal(false)}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}







