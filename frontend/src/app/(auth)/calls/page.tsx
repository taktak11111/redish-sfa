'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CallRecord, CallStatus, CallList, CallListCondition } from '@/types/sfa'
import { CallDetailPanel } from '@/components/calls/CallDetailPanel'
import { CallListCreateModal } from '@/components/calls/CallListCreateModal'
import { LeadRegisterModal, type LeadFormData } from '@/components/calls/LeadRegisterModal'
import { DateRangeFilter, DateRange } from '@redish/shared'
import { getDropdownOptions, refreshDropdownSettingsFromDB, type DropdownOption } from '@/lib/dropdownSettings'

const STATUS_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: '未架電', label: '未架電', color: 'badge-gray' },
  { value: '通電', label: '通電', color: 'badge-success' },
  { value: '不通', label: '不通', color: 'badge-warning' },
  { value: '未入力', label: '未入力', color: 'badge-gray' },
  { value: 'その他', label: 'その他', color: 'badge-gray' },
]

const LEAD_RESULT_OPTIONS: string[] = [
  '新規リード',
  'コンタクト試行中（折り返し含む）',
  '商談獲得',
  '失注（リサイクル対象外）',
  '失注（リサイクル対象 A-E付与）',
  '対象外（Disqualified）',
  '連絡不能（Unreachable）',
  '既存顧客（属性へ移行予定）',
  '未入力',
]

function getLocalDateString(date: Date = new Date()): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getLocalTimeString(date: Date = new Date()): string {
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

type SortDirection = 'asc' | 'desc'
type SortConfig = { key: string; direction: SortDirection } | null

function parseDateLike(value: string): Date | null {
  const trimmed = value.trim()
  const m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(trimmed)
  if (!m) return null
  const yyyy = Number(m[1])
  const mm = Number(m[2])
  const dd = Number(m[3])
  const d = new Date(yyyy, mm - 1, dd)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function normalizeDateStringToYmd(value?: string): string | null {
  if (!value) return null
  const trimmed = value.trim()
  const m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(trimmed)
  if (!m) return null
  const yyyy = m[1]
  const mm = String(Number(m[2])).padStart(2, '0')
  const dd = String(Number(m[3])).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatLinkedDateYYMMDD(value?: string): string {
  const ymd = normalizeDateStringToYmd(value)
  if (!ymd) return '-'
  const yy = ymd.slice(2, 4)
  const mm = ymd.slice(5, 7)
  const dd = ymd.slice(8, 10)
  return `${yy}${mm}${dd}`
}

/** 日付が今日かどうかを判定（架電リストの本日完了判定用） */
function isDateToday(dateString: string | undefined | null): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  const today = new Date()
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate()
}

function formatLeadSourceShort(value?: string): string {
  if (!value) return '-'
  if (value === 'TEMPOS') return 'TP'
  return value
}

function normalizeStatusIs(value?: string): string {
  if (!value) return ''
  return value.replace(/^[0-9A-Za-z]+[.．]\s*/u, '').trim()
}

function compareValues(a: unknown, b: unknown): number {
  if (a === null || a === undefined) return 1
  if (b === null || b === undefined) return -1

  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()

  const aStr = String(a)
  const bStr = String(b)
  return aStr.localeCompare(bStr, 'ja', { numeric: true, sensitivity: 'base' })
}

function SortIcons({ active }: { active?: SortDirection }) {
  const upActive = active === 'asc'
  const downActive = active === 'desc'
  const hasActive = !!active
  const activeClass = 'text-primary-700'
  const inactiveWhenActiveClass = 'text-gray-300'
  const neutralClass = 'text-gray-400'

  return (
    <span className="ml-2 inline-flex flex-col items-center justify-center leading-none">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={upActive ? activeClass : hasActive ? inactiveWhenActiveClass : neutralClass}
      >
        <path
          d="M7 14l5-5 5 5"
          stroke="currentColor"
          strokeWidth={upActive ? 3 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={downActive ? activeClass : hasActive ? inactiveWhenActiveClass : neutralClass}
      >
        <path
          d="M7 10l5 5 5-5"
          stroke="currentColor"
          strokeWidth={downActive ? 3 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

// 列幅の初期値（コンポーネント外に定義）
const INITIAL_COLUMN_WIDTHS: Record<string, number> = {
  // 状況（ファーストビュー）
  todayCallStatus: 70,
  status: 70,
  callStatusToday: 90,
  statusIS: 240,
  staffIS: 90,
  callCount: 80,
  quickActions: 280,

  linkedDate: 120,
  leadId: 120,
  companyName: 133,
  contactName: 120,
  contactNameKana: 120,
  industry: 120,
  phone: 140,
  openingDate: 120,
  contactPreferredDateTime: 100,
  allianceRemarks: 200,
}

export default function CallsPage() {
  // UI状態（SSR対策：初期値はデフォルト、useEffectで復元）
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterLeadResult, setFilterLeadResult] = useState<string>('all')
  const [filterLeadSource, setFilterLeadSource] = useState<string>('all')
  const [filterStaff, setFilterStaff] = useState<string>('all')
  const [filterTodayStatus, setFilterTodayStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<CallRecord | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  // フィルタの開閉状態（SSR対策：デフォルトtrue、useEffectで復元）
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true)
  const [isListMode, setIsListMode] = useState(false)
  const [isCallListPanelOpen, setIsCallListPanelOpen] = useState(false)
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set(['allianceRemarks'])) // デフォルトで連携元備考を非表示
  const [requiredInputModal, setRequiredInputModal] = useState<null | { leadId: string; title: string; message: string }>(null)
  const autoFixInProgressRef = useRef(false)
  const topAreaRef = useRef<HTMLDivElement | null>(null)
  const [topAreaHeightPx, setTopAreaHeightPx] = useState<number>(0)
  // 目標/稼働予定（手動設定）
  const [goalCallCount, setGoalCallCount] = useState<number | null>(null)
  const [goalDealCount, setGoalDealCount] = useState<number | null>(null)
  const [plannedWorkHours, setPlannedWorkHours] = useState<number | null>(null)
  const [settingsModal, setSettingsModal] = useState<null | { type: 'goalCallCount' | 'goalDealCount' | 'plannedWorkHours' | 'workMinutes' }>(null)
  const [workMsOffset, setWorkMsOffset] = useState<number>(0) // 架電稼働時間の手動補正（ミリ秒）
  const [settingsValue, setSettingsValue] = useState<string>('')
  // 架電稼働タイマー（手動 Start / Pause / End）
  const [callTimerState, setCallTimerState] = useState<{
    status: 'idle' | 'running' | 'paused' | 'ended'
    sessionId: string | null
    startedAtMs: number | null
    endedAtMs: number | null
    pausedAtMs: number | null
    pausedTotalMs: number
  }>({
    status: 'idle',
    sessionId: null,
    startedAtMs: null,
    endedAtMs: null,
    pausedAtMs: null,
    pausedTotalMs: 0,
  })
  // hydration mismatch対策: 初期描画で時刻依存値を作らない
  const [nowMs, setNowMs] = useState<number>(0)
  // 10分あたり架電数（通電以外）は「10分経過ごと」にのみ更新（リアルタイム更新しない）
  const [callsPer10MinNonConnectedSnapshot, setCallsPer10MinNonConnectedSnapshot] = useState<number | null>(null)
  const [callsPer10MinBlocksSnapshot, setCallsPer10MinBlocksSnapshot] = useState<number>(0)
  // 架電リスト機能（Phase 1）
  const [isCallListModalOpen, setIsCallListModalOpen] = useState(false)
  // リード個別登録モーダル
  const [isLeadRegisterModalOpen, setIsLeadRegisterModalOpen] = useState(false)
  const [isLeadRegistering, setIsLeadRegistering] = useState(false)
  const [currentCallList, setCurrentCallList] = useState<CallList | null>(null)
  const [showCallListOnly, setShowCallListOnly] = useState(false)
  const [callListTargetCount, setCallListTargetCount] = useState<number | ''>(100) // 架電リスト作成時の件数上限（デフォルト100件）
  const [callListView, setCallListView] = useState<'today' | 'previous'>('previous') // 架電リスト表示（本日/前回）
  const lastStaffForCallListRef = useRef<string | null>(null)
  const callListViewUserSetRef = useRef(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false) // 選択モード（チェックボックス表示）
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set()) // 選択されたリードID
  const [isListSettingsOpen, setIsListSettingsOpen] = useState(false) // リスト設定メニュー表示
  const [kpiDrilldown, setKpiDrilldown] = useState<null | 'called' | 'connected' | 'notConnected' | 'notCalled' | 'appointment' | 'connectedTalk60'>(null)
  // 担当者スコープ切替（SSR対策：デフォルト値、useEffectで復元）
  const [selectedStaffScope, setSelectedStaffScope] = useState<Set<string>>(new Set())
  const [isAllStaffScope, setIsAllStaffScope] = useState(true)
  // hydration mismatch対策: 初期描画は空→mount後にDB/LocalStorageへ追従
  const [staffOptions, setStaffOptions] = useState<DropdownOption[]>([])
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(INITIAL_COLUMN_WIDTHS)
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)
  const queryClient = useQueryClient()
  // 架電リストは「担当者1名」を基準にする（一覧フィルタの「すべて」とは独立）
  const staffForCallList = selectedStaffScope.size === 1 ? Array.from(selectedStaffScope)[0] : null
  const todayYmd = getLocalDateString()

  useEffect(() => {
    // hydration mismatch対策: mount後に現在時刻を確定
    setNowMs(Date.now())
  }, [])

  useEffect(() => {
    // 「上部エリア（ヘッダー+KPI）」の高さを計測し、テーブル領域のmax-heightへ反映する
    const el = topAreaRef.current
    if (!el) return

    const update = () => {
      const h = Math.max(0, Math.round(el.getBoundingClientRect().height))
      setTopAreaHeightPx(h)
    }

    update()
    let ro: ResizeObserver | null = null
    try {
      ro = new ResizeObserver(() => update())
      ro.observe(el)
    } catch {
      // noop
    }

    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      ro?.disconnect()
    }
  }, [isHeaderCollapsed])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('calls.hiddenColumns')
      if (!raw) {
        // localStorageがない場合はデフォルト値を保存
        window.localStorage.setItem('calls.hiddenColumns', JSON.stringify(['allianceRemarks']))
        return
      }
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        // 仕様変更で「固定列」が増減しても破綻しないよう、保存値はhideableColumnsでフィルタする
        const filtered = parsed.map(String).filter((k) => hideableColumns.has(k))
        // allianceRemarksがまだ含まれていない場合は追加（デフォルト非表示）
        if (!filtered.includes('allianceRemarks')) {
          filtered.push('allianceRemarks')
          window.localStorage.setItem('calls.hiddenColumns', JSON.stringify(filtered))
        }
        setHiddenColumns(new Set(filtered))
      }
    } catch {
      // noop
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem('calls.hiddenColumns', JSON.stringify(Array.from(hiddenColumns)))
    } catch {
      // noop
    }
  }, [hiddenColumns])

  useEffect(() => {
    // 担当者候補は settings のstaffIS（localStorage）に追従
    const handleStorageChange = () => {
      const newOptions = getDropdownOptions('staffIS')
      // 内容が同じなら更新しない（無限ループ防止）
      setStaffOptions((prev) => {
        const prevStr = JSON.stringify(prev)
        const newStr = JSON.stringify(newOptions)
        if (prevStr === newStr) return prev
        return newOptions
      })
    }
    // settingsページを開かなくても最新設定を反映
    // DBから設定を取得（既存のlocalStorage設定を上書きしない）
    void refreshDropdownSettingsFromDB().catch(err => {
      console.error('Failed to refresh dropdown settings from DB:', err)
      // エラー時は既存のlocalStorage設定を使用（既存動作を維持）
    }).finally(handleStorageChange)
    handleStorageChange()
    window.addEventListener('storage', handleStorageChange)
    // インターバルを30秒に延長（頻繁な更新は不要）
    const interval = window.setInterval(handleStorageChange, 30000)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.clearInterval(interval)
    }
  }, [])

  // UI状態の復元フラグ（復元完了まで保存を無効化）
  const [isUiStateRestored, setIsUiStateRestored] = useState(false)

  // staffOptionsが変わった時に、無効な担当者を除外する（復元完了後、1回だけ実行）
  const staffOptionsValidatedRef = useRef(false)
  useEffect(() => {
    // 復元完了前は何もしない
    if (!isUiStateRestored) return
    // 既に検証済みなら何もしない
    if (staffOptionsValidatedRef.current) return
    // staffOptionsがまだ空なら待機
    if (staffOptions.length === 0) return
    // 検証済みフラグを立てる
    staffOptionsValidatedRef.current = true

    // 以前の保存値が現状の候補に存在しない場合は「すべて」に戻す
    const valid = new Set(staffOptions.map((o) => o.value))
    const currentScope = Array.from(selectedStaffScope)
    const filtered = currentScope.filter((v) => valid.has(v))

    if (currentScope.length > 0 && filtered.length === 0) {
      setIsAllStaffScope(true)
      setSelectedStaffScope(new Set())
    } else if (filtered.length !== currentScope.length) {
      setSelectedStaffScope(new Set(filtered))
    }
  }, [isUiStateRestored, staffOptions, selectedStaffScope])

  // UI状態の復元（マウント時に1回のみ実行）
  useEffect(() => {
    try {
      // メインUI状態の復元
      const raw = window.localStorage.getItem('calls.uiState')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (typeof parsed.filterStatus === 'string') {
          setFilterStatus(parsed.filterStatus)
        }
        if (typeof parsed.filterLeadResult === 'string') {
          setFilterLeadResult(parsed.filterLeadResult)
        }
        if (parsed.sortConfig && typeof parsed.sortConfig === 'object') {
          setSortConfig(parsed.sortConfig)
        }
        if (typeof parsed.isHeaderCollapsed === 'boolean') {
          setIsHeaderCollapsed(parsed.isHeaderCollapsed)
        }
        if (parsed.columnWidths && typeof parsed.columnWidths === 'object') {
          // 復元時も列幅を制限（最大500px、最小20px）
          const sanitizedWidths: Record<string, number> = {}
          for (const [key, value] of Object.entries(parsed.columnWidths)) {
            if (typeof value === 'number') {
              sanitizedWidths[key] = Math.min(500, Math.max(20, value))
            }
          }
          setColumnWidths({ ...INITIAL_COLUMN_WIDTHS, ...sanitizedWidths })
        }
        // DateRangeの復元（preset含む）
        if (parsed.dateRange && typeof parsed.dateRange === 'object') {
          const start = parsed.dateRange.start ? new Date(parsed.dateRange.start) : null
          const end = parsed.dateRange.end ? new Date(parsed.dateRange.end) : null
          const preset = parsed.dateRange.preset || 'custom'
          if ((start && !isNaN(start.getTime())) || (end && !isNaN(end.getTime()))) {
            const startValid = start && !isNaN(start.getTime()) ? start : null
            const endValid = end && !isNaN(end.getTime()) ? end : null
            const startDate = startValid || endValid
            const endDate = endValid || startValid
            if (!startDate || !endDate) return
            setDateRange({
              start: startDate,
              end: endDate,
              preset,
            })
          }
        }
      }
      // 担当者スコープの復元
      const rawStaff = window.localStorage.getItem('calls.staffScope')
      if (rawStaff) {
        const parsedStaff = JSON.parse(rawStaff)
        const all = !!parsedStaff?.all
        const selected = Array.isArray(parsedStaff?.selected) ? parsedStaff.selected.map(String) : []
        setIsAllStaffScope(all || selected.length === 0)
        setSelectedStaffScope(new Set(selected))
      }
    } catch {
      // noop
    }
    // 復元完了フラグを立てる
    setIsUiStateRestored(true)
  }, [])

  // 担当者スコープ保存（復元完了後、かつ初回スキップ）
  const staffScopeSaveSkipRef = useRef(true)
  useEffect(() => {
    if (!isUiStateRestored) return
    // 復元完了直後の最初の呼び出しはスキップ（復元した値を上書きしないため）
    if (staffScopeSaveSkipRef.current) {
      staffScopeSaveSkipRef.current = false
      return
    }
    try {
      const saveData = { all: isAllStaffScope, selected: Array.from(selectedStaffScope) }
      window.localStorage.setItem('calls.staffScope', JSON.stringify(saveData))
    } catch {
      // noop
    }
  }, [isUiStateRestored, isAllStaffScope, selectedStaffScope])

  // UI状態の保存（変更時に自動保存、復元完了後のみ）
  useEffect(() => {
    if (!isUiStateRestored) return // 復元完了前は保存しない
    try {
      const saveData = {
        isHeaderCollapsed,
        sortConfig,
        columnWidths,
        filterStatus,
        filterLeadResult,
        filterLeadSource,
        filterStaff,
        filterTodayStatus,
        dateRange: dateRange ? {
          start: dateRange.start?.toISOString() ?? null,
          end: dateRange.end?.toISOString() ?? null,
          preset: dateRange.preset ?? 'custom',
        } : null,
      }
      window.localStorage.setItem('calls.uiState', JSON.stringify(saveData))
    } catch {
      // noop
    }
  }, [isUiStateRestored, isHeaderCollapsed, sortConfig, columnWidths, filterStatus, filterLeadResult, filterLeadSource, filterStaff, filterTodayStatus, dateRange])

  useEffect(() => {
    // 目標/稼働予定 復元
    try {
      const rawGoal = window.localStorage.getItem('calls.goalCallCount')
      if (rawGoal) {
        const n = Number(rawGoal)
        if (Number.isFinite(n) && n >= 0) setGoalCallCount(Math.floor(n))
      }
    } catch {
      // noop
    }
    try {
      const rawGoalDeal = window.localStorage.getItem('calls.goalDealCount')
      if (rawGoalDeal) {
        const n = Number(rawGoalDeal)
        if (Number.isFinite(n) && n >= 0) setGoalDealCount(Math.floor(n))
      }
    } catch {
      // noop
    }
    try {
      const rawHours = window.localStorage.getItem('calls.plannedWorkHours')
      if (rawHours) {
        const n = Number(rawHours)
        if (Number.isFinite(n) && n >= 0) setPlannedWorkHours(n)
      }
    } catch {
      // noop
    }
  }, [])

  useEffect(() => {
    try {
      if (goalCallCount === null) window.localStorage.removeItem('calls.goalCallCount')
      else window.localStorage.setItem('calls.goalCallCount', String(goalCallCount))
    } catch {
      // noop
    }
  }, [goalCallCount])

  useEffect(() => {
    try {
      if (goalDealCount === null) window.localStorage.removeItem('calls.goalDealCount')
      else window.localStorage.setItem('calls.goalDealCount', String(goalDealCount))
    } catch {
      // noop
    }
  }, [goalDealCount])

  useEffect(() => {
    try {
      if (plannedWorkHours === null) window.localStorage.removeItem('calls.plannedWorkHours')
      else window.localStorage.setItem('calls.plannedWorkHours', String(plannedWorkHours))
    } catch {
      // noop
    }
  }, [plannedWorkHours])

  useEffect(() => {
    // タイマー復元（リロード耐性）
    try {
      const raw = window.localStorage.getItem('calls.callTimerState')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return
      const next = {
        status: String((parsed as any).status || 'idle') as any,
        sessionId: typeof (parsed as any).sessionId === 'string' ? (parsed as any).sessionId : null,
        startedAtMs: typeof (parsed as any).startedAtMs === 'number' ? (parsed as any).startedAtMs : null,
        endedAtMs: typeof (parsed as any).endedAtMs === 'number' ? (parsed as any).endedAtMs : null,
        pausedAtMs: typeof (parsed as any).pausedAtMs === 'number' ? (parsed as any).pausedAtMs : null,
        pausedTotalMs: typeof (parsed as any).pausedTotalMs === 'number' ? (parsed as any).pausedTotalMs : 0,
      }
      setCallTimerState(next)
    } catch {
      // noop
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem('calls.callTimerState', JSON.stringify(callTimerState))
    } catch {
      // noop
    }
  }, [callTimerState])

  useEffect(() => {
    // running/paused中は表示更新（中断時間・合計時間も動く）
    if (callTimerState.status !== 'running' && callTimerState.status !== 'paused') return
    const id = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [callTimerState.status])

  const formatHhMmSs = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const hh = Math.floor(totalSeconds / 3600)
    const mm = Math.floor((totalSeconds % 3600) / 60)
    const ss = totalSeconds % 60
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  }

  const formatMinutes = (ms: number) => {
    const m = Math.max(0, Math.floor(ms / 60000))
    return `${m}分`
  }

  const formatValueWithUnit = (value: string, unit: string) => (
    <span className="inline-flex items-baseline">
      <span className="tabular-nums">{value}</span>
      <span className="ml-1 text-sm font-semibold text-gray-700">{unit}</span>
    </span>
  )

  const formatSignedMinutes = (minutes: number | null) => {
    if (minutes === null) return '-'
    const sign = minutes < 0 ? '-' : ''
    return `${sign}${Math.abs(minutes)}分`
  }

  const formatSignedHhMmSs = (ms: number | null) => {
    if (ms === null) return '-'
    const sign = ms < 0 ? '-' : ''
    return `${sign}${formatHhMmSs(Math.abs(ms))}`
  }

  const timerMetrics = useMemo(() => {
    const { status, startedAtMs, endedAtMs, pausedAtMs, pausedTotalMs } = callTimerState
    if (!startedAtMs || status === 'idle') {
      // タイマー未開始でも、手動補正がある場合はその値を使用
      return { totalMs: 0, pauseMs: 0, workMs: Math.max(0, workMsOffset) }
    }

    const endMs = status === 'ended' && endedAtMs ? endedAtMs : nowMs
    const totalMs = Math.max(0, endMs - startedAtMs)

    const pauseExtraMs =
      status === 'paused' && pausedAtMs ? Math.max(0, nowMs - pausedAtMs) : 0
    const pauseMs = Math.max(0, pausedTotalMs + pauseExtraMs)

    // 手動補正を加算（負の値も許容して補正できるようにする）
    const workMs = Math.max(0, totalMs - pauseMs + workMsOffset)
    return { totalMs, pauseMs, workMs }
  }, [callTimerState, nowMs, workMsOffset])

  const safePostJson = async (url: string, body: any) => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        // DB未適用など、運用上は致命にしない（UIは継続）
        const msg = await res.text().catch(() => '')
        console.warn('[calls] post failed:', url, res.status, msg)
      }
    } catch (e) {
      console.warn('[calls] post failed (network):', url, e)
    }
  }

  const generateUuidV4 = () => {
    const g: any = globalThis as any
    if (g?.crypto?.randomUUID) return g.crypto.randomUUID() as string
    // fallback: RFC4122 v4
    const bytes = new Uint8Array(16)
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  const computeTimerMetricsAt = (state: typeof callTimerState, now: number) => {
    if (!state.startedAtMs || state.status === 'idle') {
      return { totalMs: 0, pauseMs: 0, workMs: 0 }
    }
    const endMs = state.status === 'ended' && state.endedAtMs ? state.endedAtMs : now
    const totalMs = Math.max(0, endMs - state.startedAtMs)
    const pauseExtraMs = state.status === 'paused' && state.pausedAtMs ? Math.max(0, now - state.pausedAtMs) : 0
    const pauseMs = Math.max(0, state.pausedTotalMs + pauseExtraMs)
    const workMs = Math.max(0, totalMs - pauseMs)
    return { totalMs, pauseMs, workMs }
  }

  const getCurrentTargetsSnapshot = (overrides?: Partial<{ goalCallCount: number | null; goalDealCount: number | null; plannedWorkHours: number | null }>) => {
    const nextGoalCallCount = overrides?.goalCallCount !== undefined ? overrides.goalCallCount : goalCallCount
    const nextGoalDealCount = overrides?.goalDealCount !== undefined ? overrides.goalDealCount : goalDealCount
    const nextPlannedWorkHours = overrides?.plannedWorkHours !== undefined ? overrides.plannedWorkHours : plannedWorkHours
    return {
      targetDate: getLocalDateString(),
      goalCallCount: nextGoalCallCount,
      goalDealCount: nextGoalDealCount,
      // plannedWorkHoursは実際には分数として扱う
      plannedWorkMinutes: nextPlannedWorkHours === null ? null : Math.round(Math.max(0, nextPlannedWorkHours)),
    }
  }

  // 列の表示/非表示（個人カスタマイズ）
  // 方針: 「本日」より右のアクション系（本日/架電結果/リード状態/担当IS/架電回数/クイック）は基本固定。
  //       それ以外の“情報列”を中心にカスタム可能にする。
  const hideableColumns = new Set([
    // 左側の基本情報
    'linkedDate',
    'leadId',
    'companyName',
    'industry',
    'contactName',
    'contactNameKana',
    'phone',
    'contactPreferredDateTime',

    // 右側の情報（アクション以外）
    'openingDate',
    'allianceRemarks',
  ])

  const isColumnVisible = (key: string) => {
    // 非表示対象外（固定列）は常に表示
    if (!hideableColumns.has(key)) {
      return true
    }
    return !hiddenColumns.has(key)
  }

  const hideColumn = (key: string) => {
    if (!hideableColumns.has(key)) return
    setHiddenColumns(prev => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }

  const resetColumns = () => {
    try {
      // すべてのcalls関連のlocalStorageをクリア（リロード前に実行）
      window.localStorage.removeItem('calls.hiddenColumns')
      window.localStorage.removeItem('calls.uiState')
      window.localStorage.removeItem('calls.staffScope')
    } catch {
      // noop
    }
    // 強制リロードで確実に反映
    window.location.reload()
  }

  const toggleStaffScope = (staff: string) => {
    // 仕様: 架電リストは担当者ごとに作る（単一選択）
    // 一覧フィルタの「すべて」は独立。既に同じ担当者が選択されている場合は解除する。
    setSelectedStaffScope((prev) => {
      const next = new Set(prev)
      if (next.size === 1 && next.has(staff)) {
        return new Set()
      }
      return new Set([staff])
    })
  }

  useEffect(() => {
    // スコープで選ばれた担当者が候補に無い場合は自動除去
    // staffOptions が空の間は「読み込み中」とみなし、選択を消さない（戻ってきた直後のリセット防止）
    if (!staffOptions || staffOptions.length === 0) {
      return
    }

    const valid = new Set(staffOptions.map((o) => String(o.value)))
    setSelectedStaffScope((prev) => {
      const prevArr = Array.from(prev).map(String)
      const filtered = prevArr.filter((v) => valid.has(String(v)))
      if (filtered.length === prevArr.length) return prev

      const next = new Set(filtered)
      // 全て除去された場合は「すべて」に戻す
      if (prevArr.length > 0 && next.size === 0) {
        setIsAllStaffScope(true)
      }
      return next
    })
  }, [staffOptions])

  const visibleColumnsCount =
    [
      // 基本情報
      'linkedDate',
      'leadId',
      'companyName',
      'industry',
      'contactName',
      'contactNameKana',
      'phone',
      'contactPreferredDateTime',

      // アクション系（固定）
      'todayCallStatus',
      'status',
      'callStatusToday',
      'statusIS',
      'staffIS',
      'callCount',

      // 右側情報
      'openingDate',
      'allianceRemarks',
    ].filter(isColumnVisible).length + 1 // +1: クイックボタン（常時表示）

  // テーブル幅を動的に計算（table-layout: fixedを有効にするため）
  const tableWidth = useMemo(() => {
    let width = columnWidths.quickActions // クイックボタンは常時表示
    const columns: Array<keyof typeof columnWidths> = [
      'linkedDate', 'leadId', 'companyName', 'industry', 'contactName', 'contactNameKana',
      'phone', 'contactPreferredDateTime', 'staffIS', 'todayCallStatus', 'callCount',
      'callStatusToday', 'statusIS', 'openingDate', 'allianceRemarks'
    ]
    for (const col of columns) {
      if (!hiddenColumns.has(col)) {
        width += columnWidths[col] || 0
      }
    }
    return width
  }, [columnWidths, hiddenColumns])

  // 架電リスト取得
  const { data: callListsData } = useQuery({
    queryKey: ['call-lists', staffForCallList],
    queryFn: async () => {
      if (!staffForCallList) return { data: [] }

      const response = await fetch(`/api/call-lists?staffIS=${encodeURIComponent(staffForCallList)}&limit=50`)
      if (!response.ok) return { data: [] }
      return response.json()
    },
  })

  const callLists = (((callListsData as any)?.data || []) as CallList[]).slice()
  const todayCallList = staffForCallList ? callLists.find((l) => String(l.date || '') === todayYmd) : null
  const previousCallList = staffForCallList ? callLists.find((l) => String(l.date || '') < todayYmd) : null
  const isCallListStaffReady = !!staffForCallList

  // シンプルな全件取得（パフォーマンス最適化は後で段階的に導入）
  const { data, isLoading, error } = useQuery({
    queryKey: ['calls'],
    queryFn: async () => {
      const response = await fetch('/api/calls')
      if (!response.ok) throw new Error('Failed to fetch calls')
      return response.json()
    },
    staleTime: 30000, // 30秒間はキャッシュを使用
  })

  const updateMutation = useMutation({
    mutationFn: async ({ leadId, updates }: { leadId: string; updates: Partial<CallRecord> }) => {
      const response = await fetch('/api/calls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, ...updates }),
      })
      if (!response.ok) {
        let message = '保存に失敗しました'
        try {
          const body = await response.json()
          const details =
            typeof body?.error === 'string'
              ? body.error
              : typeof body?.details === 'string'
                ? body.details
                : null
          if (details) message = `${message}: ${details}`
        } catch {
          // noop
        }
        throw new Error(message)
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] })
    },
  })

  useEffect(() => {
    if (!resizingColumn) return

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX
      // 列幅に上限（500px）と下限（20px）を設定
      const newWidth = Math.min(500, Math.max(20, resizeStartWidth + diff))
      setColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: newWidth,
      }))
    }

    const handleMouseUp = () => {
      setResizingColumn(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [resizingColumn, resizeStartX, resizeStartWidth])

  // 架電リスト作成
  const createCallListMutation = useMutation({
    mutationFn: async ({
      conditions,
      name,
      isShared,
      staffIS,
    }: {
      conditions: CallListCondition
      name: string
      isShared: boolean
      staffIS?: string | null
    }) => {
      const response = await fetch('/api/call-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditions, name, isShared, staffIS }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '架電リストの作成に失敗しました')
      }
      return response.json()
    },
    onSuccess: (data) => {
      setCurrentCallList(data.data)
      setShowCallListOnly(true)
      queryClient.invalidateQueries({ queryKey: ['call-lists'] })
      // 担当ISなど、call_records側も更新されるため一覧をリフレッシュ
      queryClient.invalidateQueries({ queryKey: ['calls'] })
    },
  })

  const autoCreateCallListForStaff = async (staff: string, maxCount?: number) => {
    const today = getLocalDateString()
    const maxNoAnswer =
      (() => {
        try {
          const raw = window.localStorage.getItem('calls.noAnswerMaxCount')
          if (!raw) return 5
          const n = Number(raw)
          return Number.isFinite(n) && n > 0 ? Math.floor(n) : 5
        } catch {
          return 5
        }
      })()

    const conditions: any = {
      newLeads: true,
      callbackLeads: true,
      noConnectionLeads: true,
      maxNoConnectionCallCount: maxNoAnswer,
      preventDuplication: true, // 重複防止: 他担当者のリストに含まれるリードは除外
      isShared: false,
      maxCount: maxCount && maxCount > 0 ? maxCount : undefined, // 件数上限
    }

    const name = `${today}_${staff}_自動`
    const result = await createCallListMutation.mutateAsync({
      conditions,
      name,
      isShared: false,
      staffIS: staff,
    } as any)
    return result?.data as CallList | undefined
  }

  const handleCreateTodayList = async () => {
    // 担当者未選択チェック
    if (isAllStaffScope || selectedStaffScope.size === 0) {
      alert('担当者を選択してください。\n担当者フィルタから担当者を選択してから、リストを作成してください。')
      return
    }
    
    const staff = Array.from(selectedStaffScope)[0]
    // 1日1回制限（再作成は設定メニューから可能）
    const alreadyHasToday =
      !!todayCallList || (!!currentCallList && String(currentCallList.date || '') === todayYmd && callListView === 'today')
    if (alreadyHasToday) {
      alert('本日のリストは既に作成済みです。\n\n・リードを追加する場合は「+追加作成」を使用してください。\n・リストを作り直す場合は⚙️アイコンから「リスト再作成」を選択してください。')
      return
    }

    const maxCount = typeof callListTargetCount === 'number' && callListTargetCount > 0 ? callListTargetCount : undefined
    try {
      const list = await autoCreateCallListForStaff(staff, maxCount)
      if (list) {
        // 1. KPIとタイマーをリセット（新規リスト作成時はクリーンスタート）
        setCallTimerState({
          status: 'idle',
          sessionId: null,
          startedAtMs: null,
          endedAtMs: null,
          pausedAtMs: null,
          pausedTotalMs: 0,
        })
        setWorkMsOffset(0)
        // localStorageのタイマー状態もクリア
        try {
          window.localStorage.removeItem('calls.callTimerState')
        } catch { /* ignore */ }
        
        // 2. 目標値もリセット（新規リストは0からスタート）
        setGoalCallCount(null)
        setGoalDealCount(null)
        setPlannedWorkHours(null)
        try {
          window.localStorage.removeItem('calls.goalCallCount')
          window.localStorage.removeItem('calls.goalDealCount')
          window.localStorage.removeItem('calls.plannedWorkHours')
        } catch { /* ignore */ }
        
        // 3. 日付フィルタを「本日」に設定（新規リストは本日のデータのみ表示）
        setDateRange({ start: new Date(), end: new Date(), preset: 'today' })
        
        // 4. リストをセット
        setCurrentCallList(list)
        setShowCallListOnly(true) // 自動的にリスト表示モードに切り替え
        
        // 5. クエリを明示的に再取得し、todayCallListが更新されるまで待機
        await queryClient.refetchQueries({ queryKey: ['call-lists', staff] })
        
        // 6. 架電データも再取得（担当IS更新を反映）
        await queryClient.refetchQueries({ queryKey: ['calls'] })
        
        // 7. クエリ再取得後にビューを切り替え（useEffectがtodayCallListを正しく参照できる）
        setCallListView('today')
        
        // 8. 作成件数メッセージ
        const count = list.leadIds?.length || 0
        alert(`本日の架電リストを作成しました。\n\n対象リード数: ${count}件\n\n※ KPI・タイマー・目標値がリセットされました。`)
      } else {
        alert('架電リストの作成に失敗しました。対象リードが見つかりませんでした。')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '架電リストの作成に失敗しました'
      alert(message)
    }
  }

  // リスト再作成（上書き）- 設定メニューから呼び出し
  const handleRecreateList = async () => {
    // 担当者未選択チェック
    if (isAllStaffScope || selectedStaffScope.size === 0) {
      alert('担当者を選択してください。')
      return
    }
    
    const staff = Array.from(selectedStaffScope)[0]
    
    // 確認ダイアログ
    const confirmed = window.confirm(
      '⚠️ リストを再作成します。\n\n' +
      '・既存のリストは上書きされます\n' +
      '・KPI・タイマー・目標値がリセットされます\n' +
      '・進行中の架電データもリセットされます\n\n' +
      '本当に再作成しますか？'
    )
    if (!confirmed) return
    
    setIsListSettingsOpen(false) // メニューを閉じる
    
    const maxCount = typeof callListTargetCount === 'number' && callListTargetCount > 0 ? callListTargetCount : undefined
    try {
      const list = await autoCreateCallListForStaff(staff, maxCount)
      if (list) {
        // KPIとタイマーをリセット
        setCallTimerState({
          status: 'idle',
          sessionId: null,
          startedAtMs: null,
          endedAtMs: null,
          pausedAtMs: null,
          pausedTotalMs: 0,
        })
        setWorkMsOffset(0)
        try {
          window.localStorage.removeItem('calls.callTimerState')
        } catch { /* ignore */ }
        
        // 目標値もリセット
        setGoalCallCount(null)
        setGoalDealCount(null)
        setPlannedWorkHours(null)
        try {
          window.localStorage.removeItem('calls.goalCallCount')
          window.localStorage.removeItem('calls.goalDealCount')
          window.localStorage.removeItem('calls.plannedWorkHours')
        } catch { /* ignore */ }
        
        // 日付フィルタを「本日」に設定
        setDateRange({ start: new Date(), end: new Date(), preset: 'today' })
        
        // リストをセット
        setCurrentCallList(list)
        setShowCallListOnly(true)
        
        // クエリを再取得
        await queryClient.refetchQueries({ queryKey: ['call-lists', staff] })
        await queryClient.refetchQueries({ queryKey: ['calls'] })
        
        setCallListView('today')
        
        const count = list.leadIds?.length || 0
        alert(`リストを再作成しました。\n\n対象リード数: ${count}件\n\n※ KPI・タイマー・目標値がリセットされました。`)
      } else {
        alert('リストの再作成に失敗しました。対象リードが見つかりませんでした。')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'リストの再作成に失敗しました'
      alert(message)
    }
  }

  // リストクリア（本日のリストを削除）
  const handleClearList = async () => {
    if (!todayCallList) {
      alert('クリア対象のリストがありません。')
      return
    }
    
    const staff = staffForCallList
    
    // 確認ダイアログ
    const confirmed = window.confirm(
      '⚠️ 本日のリストをクリアします。\n\n' +
      '・リストが削除されます\n' +
      '・「新規作成」ボタンが再度有効になります\n\n' +
      '本当にクリアしますか？'
    )
    if (!confirmed) return
    
    setIsListSettingsOpen(false)
    
    try {
      const response = await fetch(`/api/call-lists?id=${todayCallList.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setCurrentCallList(null)
        setShowCallListOnly(false)
        
        // クエリを再取得
        if (staff) {
          await queryClient.refetchQueries({ queryKey: ['call-lists', staff] })
        }
        
        alert('リストをクリアしました。\n\n「新規作成」ボタンで新しいリストを作成できます。')
      } else {
        const error = await response.json()
        alert(error.error || 'クリアに失敗しました。')
      }
    } catch {
      alert('クリアに失敗しました。')
    }
  }

  // 既存リストにリードを追加
  const handleAddToList = async () => {
    if (callListView !== 'today') {
      alert('追加作成は本日のリストに対して実施してください。')
      return
    }
    
    if (isAllStaffScope || selectedStaffScope.size === 0) {
      alert('担当者を選択してください。')
      return
    }

    if (!todayCallList) {
      alert('追加対象の本日リストがありません。先に新規作成してください。')
      return
    }
    
    const addCount = typeof callListTargetCount === 'number' && callListTargetCount > 0 ? callListTargetCount : 50
    const staff = Array.from(selectedStaffScope)[0]
    
    try {
      // 既存のリードIDを除外して追加件数分を取得
      const response = await fetch('/api/call-lists/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callListId: todayCallList.id,
          existingLeadIds: todayCallList.leadIds,
          addCount,
          staffIS: staff,
        }),
      })
      
      if (response.ok) {
        const result = await response.json()
        const newList = result.data
        setCurrentCallList(newList)
        
        // クエリを再取得（call-lists + calls両方）
        await queryClient.refetchQueries({ queryKey: ['call-lists', staff] })
        await queryClient.refetchQueries({ queryKey: ['calls'] })
        
        const addedCount = newList.leadIds.length - todayCallList.leadIds.length
        alert(`${addedCount}件のリードを追加しました。\n\n合計: ${newList.leadIds.length}件`)
      } else {
        const error = await response.json()
        alert(error.error || '追加に失敗しました。')
      }
    } catch {
      alert('追加に失敗しました。')
    }
  }

  useEffect(() => {
    // 担当者を切り替えた時：本日があれば本日、なければ前回をデフォルト表示
    const staffChanged = lastStaffForCallListRef.current !== staffForCallList
    if (staffChanged) {
      lastStaffForCallListRef.current = staffForCallList
      callListViewUserSetRef.current = false
    }

    if (!staffForCallList) {
      setCallListView('previous')
      setCurrentCallList(null)
      setShowCallListOnly(false)
      return
    }

    // ユーザーが手動で切り替えた場合は自動切替しない
    if (callListViewUserSetRef.current) return

    if (todayCallList) setCallListView('today')
    else if (previousCallList) setCallListView('previous')
    else setCallListView('today')
  }, [staffForCallList, todayCallList?.id, previousCallList?.id])

  useEffect(() => {
    // 表示モード（本日/前回）に応じて currentCallList を切り替える
    if (!staffForCallList) {
      setCurrentCallList(null)
      setShowCallListOnly(false)
      return
    }
    const next = callListView === 'today' ? (todayCallList || null) : (previousCallList || null)
    setCurrentCallList(next)
    setShowCallListOnly(!!next)
    // 前回表示中は「追加作成」と「選択モード」を無効化する（誤操作防止）
    if (callListView !== 'today') {
      setIsSelectionMode(false)
      setSelectedLeadIds(new Set())
    }
  }, [callListView, staffForCallList, todayCallList, previousCallList])

  // リードソースの動的選択肢を生成（OMC, HOCT SYSTEM, TEMPOSを先頭に）
  const leadSourceOptions = useMemo(() => {
    const allRecords = data?.data as CallRecord[] || []
    const sources = new Set<string>()
    allRecords.forEach(r => {
      const val = String(r.leadSource || '').trim()
      if (val) sources.add(val)
    })
    // 優先順序: OMC, HOCT SYSTEM, TEMPOS、その後アルファベット順
    const priority = ['OMC', 'HOCT SYSTEM', 'TEMPOS']
    const prioritySources = priority.filter(p => sources.has(p))
    const otherSources = Array.from(sources).filter(s => !priority.includes(s)).sort()
    return [...prioritySources, ...otherSources]
  }, [data])

  // 担当者の動的選択肢を生成
  const staffFilterOptions = useMemo(() => {
    const allRecords = data?.data as CallRecord[] || []
    const staffSet = new Set<string>()
    allRecords.forEach(r => {
      const val = String(r.staffIS || '').trim()
      if (val) staffSet.add(val)
    })
    return Array.from(staffSet).sort()
  }, [data])

  // 「その他」の担当者リストを生成（田邊、沢田、金山以外）
  const otherStaffOptions = useMemo(() => {
    const mainStaffList = ['\u7530\u908a', '沢田', '金山'] // 田邊（U+7530 U+908A）
    return staffFilterOptions.filter(staff => !mainStaffList.includes(staff))
  }, [staffFilterOptions])

  const filteredRecords = (data?.data as CallRecord[] || []).filter(record => {
    // 共通フィルタ: ステータス + 検索（両モードで有効）
    const callResult = String(record.callStatusToday || record.resultContactStatus || '').trim()
    const normalizedStatusIs = normalizeStatusIs(String(record.statusIS || '').trim())
    let matchesStatus = filterStatus === 'all'
    if (filterStatus === '不通') {
      // 不通フィルタ: 不通、不通2、未通、未通電なども含める
      matchesStatus = /^(不通|未通)\d*$/.test(callResult) || callResult === '未通電'
    } else if (filterStatus === '通電') {
      matchesStatus = callResult === '通電'
    } else if (filterStatus === '未架電') {
      const isNewLead = normalizedStatusIs === '新規リード'
      matchesStatus = isNewLead && callResult === '未架電'
    } else if (filterStatus === '未入力') {
      // 架電結果が空欄のもの
      matchesStatus = callResult === ''
    } else if (filterStatus === 'その他') {
      // 通電/不通/未架電（新規リード）/未入力のいずれでもないもの
      const isNotsu = /^(不通|未通)\d*$/.test(callResult) || callResult === '未通電'
      const isTsuden = callResult === '通電'
      const isNewLeadMikaden = normalizedStatusIs === '新規リード' && callResult === '未架電'
      const isEmpty = callResult === ''
      matchesStatus = !isNotsu && !isTsuden && !isNewLeadMikaden && !isEmpty
    } else if (filterStatus !== 'all') {
      matchesStatus = record.status === filterStatus
    }

    // リード結果フィルタ（未入力対応）
    let matchesLeadResult = filterLeadResult === 'all'
    if (filterLeadResult === '未入力') {
      matchesLeadResult = normalizedStatusIs === ''
    } else if (filterLeadResult !== 'all') {
      matchesLeadResult = normalizedStatusIs === filterLeadResult
    }
    
    const matchesSearch = searchTerm === '' || 
      record.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.phone.includes(searchTerm) ||
      record.leadId.toLowerCase().includes(searchTerm.toLowerCase())
    
    // リードソースフィルタ（未入力対応）
    const leadSourceValue = String(record.leadSource || '').trim()
    let matchesLeadSource = filterLeadSource === 'all'
    if (filterLeadSource === '未入力') {
      matchesLeadSource = leadSourceValue === ''
    } else if (filterLeadSource !== 'all') {
      matchesLeadSource = leadSourceValue === filterLeadSource
    }
    
    // 担当者フィルタ（未入力対応・その他対応）
    const staffISValue = String(record.staffIS || '').trim()
    const mainStaffList = ['\u7530\u908a', '沢田', '金山'] // 田邊（U+7530 U+908A）
    let matchesStaff = filterStaff === 'all'
    if (filterStaff === '未入力') {
      matchesStaff = staffISValue === ''
    } else if (filterStaff === 'その他') {
      // 田邊/沢田/金山/未入力以外
      matchesStaff = staffISValue !== '' && !mainStaffList.includes(staffISValue)
    } else if (filterStaff !== 'all') {
      matchesStaff = staffISValue === filterStaff
    }
    
    // 本日完了/未了フィルタ
    // ★ endedAtが今日の日付の場合のみ「本日完了」として扱う（翌日リセット）
    let matchesTodayStatus = filterTodayStatus === 'all'
    if (filterTodayStatus === '本日完了') {
      matchesTodayStatus = record.todayCallStatus === '済' && isDateToday(record.endedAt)
    } else if (filterTodayStatus === '本日未了') {
      // 本日未了: todayCallStatusが未了（済以外）
      matchesTodayStatus = record.todayCallStatus !== '済' && record.todayCallStatus != null
    }
    
    // ★ リスト表示モード: リスト内 + 検索 + ステータス（期間フィルタは無視）
    if (showCallListOnly && currentCallList) {
      const isInList = currentCallList.leadIds.includes(record.leadId)
      return isInList && matchesStatus && matchesLeadResult && matchesSearch && matchesLeadSource && matchesStaff && matchesTodayStatus
    }

    // ★ 通常モード（分析用）: 期間フィルタ + 検索 + ステータス + 担当者
    // 期間フィルタ
    let matchesDateRange = true
    if (dateRange && record.linkedDate) {
      const recordDate = new Date(record.linkedDate)
      recordDate.setHours(0, 0, 0, 0)
      matchesDateRange = recordDate >= dateRange.start && recordDate <= dateRange.end
    }

    // 担当者スコープ（SSOT: staffIS）
    const staffValue = String(record.staffIS || '').trim()
    const matchesStaffScope =
      isAllStaffScope || selectedStaffScope.size === 0
        ? true
        : selectedStaffScope.has(staffValue)
    
    return (
      matchesStatus &&
      matchesLeadResult &&
      matchesSearch &&
      matchesDateRange &&
      matchesStaffScope &&
      matchesLeadSource &&
      matchesStaff &&
      matchesTodayStatus
    )
  })

  const sortedRecords = useMemo(() => {
    // ソート優先度を取得:
    // 0: 不通/完了
    // 1: 通電/完了
    // 2: 不通（未終了）
    // 3: 架電中または通電中（未終了）
    // 4: 未架電
    const getStatusPriority = (record: CallRecord): number => {
      const callResult = String(record.callStatusToday || record.resultContactStatus || '').trim()
      const isNoAnswer = /^不通\d*$/.test(callResult) || callResult === '不通'
      const isConnected = callResult === '通電'
      const isCompleted = record.todayCallStatus === '済'
      const isCalling = record.status === '架電中'

      // 1. 不通/完了
      if (isCompleted && isNoAnswer) return 0
      // 2. 通電/完了
      if (isCompleted && isConnected) return 1
      // 3. 不通（未終了）
      if (isNoAnswer && !isCompleted) return 2
      // 4. 架電中または通電中（未終了）
      if (isCalling || isConnected) return 3
      // 5. 未架電
      return 4
    }

    const withIndex = filteredRecords.map((record, idx) => ({ record, idx }))
    const isCallListMode = showCallListOnly && currentCallList

    withIndex.sort((a, b) => {
      if (isCallListMode) {
        // 本日/前回リストは優先度ロジックを維持
        const priorityA = getStatusPriority(a.record)
        const priorityB = getStatusPriority(b.record)
        if (priorityA !== priorityB) return priorityA - priorityB
      } else {
        // 通常時は連携日順（降順）で並べる
        const aDate = a.record.linkedDate ? parseDateLike(String(a.record.linkedDate)) : null
        const bDate = b.record.linkedDate ? parseDateLike(String(b.record.linkedDate)) : null
        const cmpDate = compareValues(aDate, bDate)
        if (cmpDate !== 0) return -cmpDate
      }

      // 同じ優先度/同じ日付内では、sortConfigによるソート
      if (sortConfig) {
        const { key, direction } = sortConfig
        const isDateKey = key === 'linkedDate' || key === 'nextActionDate' || key === 'lastCalledDate' || key === 'statusUpdateDate'
        const aValRaw = isDateKey
          ? ((a.record as any)[key] ? parseDateLike(String((a.record as any)[key])) : null)
          : (a.record as any)[key]
        const bValRaw = isDateKey
          ? ((b.record as any)[key] ? parseDateLike(String((b.record as any)[key])) : null)
          : (b.record as any)[key]

        const cmp = compareValues(aValRaw, bValRaw)
        if (cmp !== 0) return direction === 'asc' ? cmp : -cmp
      }

      return a.idx - b.idx
    })

    return withIndex.map(x => x.record)
  }, [filteredRecords, sortConfig, showCallListOnly, currentCallList])

  const kpi = useMemo(() => {
    const rows = filteredRecords

    const completed = rows.filter((r) => r.todayCallStatus === '済')
    const normalizeRecentResult = (value?: string): string => {
      const trimmed = String(value || '').trim()
      if (trimmed === '未通' || trimmed === '未通電') return '不通'
      return trimmed
    }
    const getCallResult = (r: CallRecord): string => normalizeRecentResult(r.resultContactStatus)
    const isConnected = (r: CallRecord) => getCallResult(r) === '通電'
    // 商談獲得判定: statusISが「商談獲得」または statusが「商談獲得」
    const isAppointment = (r: CallRecord) => {
      const status = String(r.status || '')
      const statusIS = String(r.statusIS || '')
      return status === '商談獲得' || statusIS.includes('商談獲得')
    }

    // 架電数 = call_countフィールドの合計（filteredRecords全体）
    // call_countは各リードの総架電回数を表すため、これを合計することで全体の架電数を算出
    const callCount = rows.reduce((sum, r) => {
      const count = Number(r.callCount) || 0
      return sum + count
    }, 0)
    
    // 不通回数を取得（通電以外の架電回数）
    // callStatusTodayから「不通X」形式をパース（当日の不通回数）
    const getTodayNoAnswerCount = (r: CallRecord): number => {
      const result = String(r.callStatusToday || '').trim()
      if (!result || result === '未架電') return 0
      const noAnswerMatch = /^不通(\d+)$/.exec(result)
      if (noAnswerMatch) return Math.max(1, Number(noAnswerMatch[1]))
      return 0
    }
    // 通電数/不通数/未架電数は result_contact_status を正とする
    const connectedCount = rows.filter((r) => getCallResult(r) === '通電').length
    const notConnectedCount = rows.filter((r) => getCallResult(r) === '不通').length
    const notCalledCount = rows.filter((r) => getCallResult(r) === '未架電').length
    // 商談獲得数 = filteredRecords全体でカウント（完了かどうかに関係なく）
    const appointmentCount = rows.filter(isAppointment).length

    // 不通回数合計 = callStatusTodayから直接パース（完了かどうかに関係なく）
    const nonConnectedCompletedCount = rows.reduce((sum, r) => sum + getTodayNoAnswerCount(r), 0)

    // 10分単位の評価（通電以外）にしたいが、DB保存の互換のため内部は「件/時」を保持しておく
    // 分子: 総架電数 - 通電数
    // 分母: 架電稼働時間 - 通電時間合計
    const baseWorkMs = timerMetrics.workMs > 0 ? timerMetrics.workMs : (() => {
      const startCandidates = completed
        .map((r) => {
          const s = r.callingStartedAt || r.connectedAt || r.endedAt
          if (!s) return null
          const t = new Date(s).getTime()
          return Number.isFinite(t) ? t : null
        })
        .filter((v): v is number => typeof v === 'number')
      const endCandidates = completed
        .map((r) => {
          const s = r.endedAt || r.connectedAt || r.callingStartedAt
          if (!s) return null
          const t = new Date(s).getTime()
          return Number.isFinite(t) ? t : null
        })
        .filter((v): v is number => typeof v === 'number')
      const startMs = startCandidates.length > 0 ? Math.min(...startCandidates) : null
      const endMs = endCandidates.length > 0 ? Math.max(...endCandidates) : null
      return startMs !== null && endMs !== null && endMs > startMs ? endMs - startMs : 0
    })()

    const connectedTimeMsSum = completed
      .filter(isConnected)
      .map((r) => {
        // 原則: 保存済みの会話時間（手動修正含む）を優先
        const sec = Number(r.lastConnectedDurationSeconds)
        if (Number.isFinite(sec) && sec > 0) return sec * 1000

        // フォールバック: connectedAt と endedAt が揃っている場合のみ差分で計算
        // ※ completed（todayCallStatus==='済'）にも関わらず endedAt が無いデータは、
        //    「現在時刻まで積算」すると非通電時間が0になりKPIが '-' になるため、0扱いにする
        if (r.connectedAt && r.endedAt) {
          const a = new Date(r.connectedAt).getTime()
          const b = new Date(r.endedAt).getTime()
          if (Number.isFinite(a) && Number.isFinite(b) && b > a) return b - a
        }
        return 0
      })
      .reduce((sum, ms) => sum + ms, 0)

    const cappedConnectedMs = Math.min(baseWorkMs, Math.max(0, connectedTimeMsSum))
    const nonConnectedWorkMs = Math.max(0, baseWorkMs - cappedConnectedMs)

    const callsPerHourNonConnected =
      nonConnectedWorkMs > 0 ? nonConnectedCompletedCount / (nonConnectedWorkMs / 3600000) : null

    // 1件あたりの秒数（通電以外）: 非通電稼働時間 / 不通回数合計（例: 不通3 は 3件としてカウント）
    const secondsPerNonConnectedCall =
      nonConnectedCompletedCount > 0 ? Math.max(0, nonConnectedWorkMs) / 1000 / nonConnectedCompletedCount : null

    const nonConnected10MinBlocks = Math.floor(nonConnectedWorkMs / (10 * 60 * 1000))

    const getConnectedDurationSeconds = (r: CallRecord) => {
      const sec = Number((r as any).lastConnectedDurationSeconds)
      if (Number.isFinite(sec) && sec > 0) return sec
      if (r.connectedAt && r.endedAt) {
        const a = new Date(String(r.connectedAt)).getTime()
        const b = new Date(String(r.endedAt)).getTime()
        if (Number.isFinite(a) && Number.isFinite(b) && b > a) return Math.max(0, Math.floor((b - a) / 1000))
      }
      return 0
    }

    // 平均通電会話時間は「1分以上の通電会話」のみを平均対象にする
    const connectedDurations = completed
      .filter(isConnected)
      .map(getConnectedDurationSeconds)
      .filter((n) => Number.isFinite(n) && n >= 60)
    const avgConnectedSeconds =
      connectedDurations.length > 0
        ? connectedDurations.reduce((sum, n) => sum + n, 0) / connectedDurations.length
        : null

    const connectedAppointmentRate =
      connectedCount > 0 ? appointmentCount / connectedCount : null

    const formatSecondsAsMmSs = (sec: number | null) => {
      if (sec === null) return '-'
      const s = Math.round(sec)
      const mm = Math.floor(s / 60)
      const ss = String(s % 60).padStart(2, '0')
      return `${mm}:${ss}`
    }

    return {
      callCount,
      connectedCount,
      notConnectedCount,
      notCalledCount,
      appointmentCount,
      callsPerHourNonConnected,
      secondsPerNonConnectedCall,
      nonConnected10MinBlocks,
      nonConnectedCompletedCount,
      avgConnectedSeconds,
      connectedAppointmentRate,
      formatSecondsAsMmSs,
    }
  }, [filteredRecords, timerMetrics.workMs])

  const getCallResult = (r: CallRecord): string => String(r.callStatusToday || r.resultContactStatus || '')
  const isConnected = (r: CallRecord) => getCallResult(r) === '通電'
  // 商談獲得判定: statusISが「商談獲得」または statusが「商談獲得」（KPI計算と同じ条件）
  const isAppointment = (r: CallRecord) => {
    const status = String(r.status || '')
    const statusIS = String(r.statusIS || '')
    return status === '商談獲得' || statusIS.includes('商談獲得')
  }
  const getConnectedDurationSeconds = (r: CallRecord) => {
    const sec = Number((r as any).lastConnectedDurationSeconds)
    if (Number.isFinite(sec) && sec > 0) return sec
    if (r.connectedAt && r.endedAt) {
      const a = new Date(String(r.connectedAt)).getTime()
      const b = new Date(String(r.endedAt)).getTime()
      if (Number.isFinite(a) && Number.isFinite(b) && b > a) return Math.max(0, Math.floor((b - a) / 1000))
    }
    return 0
  }

  const drilldownLabel = useMemo(() => {
    switch (kpiDrilldown) {
      case 'called':
        return '架電済（本日）'
      case 'connected':
        return '通電（本日）'
      case 'notConnected':
        return '不通（本日）'
      case 'notCalled':
        return '未架電（本日）'
      case 'appointment':
        return '商談獲得（本日）'
      case 'connectedTalk60':
        return '通電会話（1分以上 / 本日）'
      default:
        return null
    }
  }, [kpiDrilldown])

  const displayRecords = useMemo(() => {
    if (!kpiDrilldown) return sortedRecords
    const completed = sortedRecords.filter((r) => r.todayCallStatus === '済')
    // 架電数: callStatusTodayが空でない（架電を実施した）レコード
    if (kpiDrilldown === 'called') {
      return sortedRecords.filter((r) => {
        const result = String(r.callStatusToday || '').trim()
        return result && result !== '未架電'
      })
    }
    if (kpiDrilldown === 'connected') return sortedRecords.filter(isConnected)
    // 不通数: callStatusTodayが「不通」または「不通X」形式のレコード
    if (kpiDrilldown === 'notConnected') {
      return sortedRecords.filter((r) => {
        const result = String(r.callStatusToday || '').trim()
        return /^不通\d*$/.test(result)
      })
    }
    // 未架電: callStatusTodayが空または「未架電」のレコード
    if (kpiDrilldown === 'notCalled') {
      return sortedRecords.filter((r) => {
        const result = String(r.callStatusToday || '').trim()
        return !result || result === '未架電'
      })
    }
    // 商談獲得数は filteredRecords 全体でカウントしているので、ドリルダウンも全体対象
    if (kpiDrilldown === 'appointment') return sortedRecords.filter(isAppointment)
    // connectedTalk60
    return completed.filter((r) => isConnected(r) && getConnectedDurationSeconds(r) >= 60)
  }, [kpiDrilldown, sortedRecords])

  useEffect(() => {
    // 10分経過ごとにだけ更新（累積平均）
    // - blocks=0 の間は表示しない
    // - blocksが増えた時だけ更新（通電時間などの後追い更新で減るのを防ぐ）
    const blocks = kpi.nonConnected10MinBlocks
    if (callTimerState.status === 'idle') {
      setCallsPer10MinBlocksSnapshot(0)
      setCallsPer10MinNonConnectedSnapshot(null)
      return
    }
    if (blocks <= 0) return
    setCallsPer10MinBlocksSnapshot((prevBlocks) => {
      if (blocks <= prevBlocks) return prevBlocks
      // blocksが増えたタイミングで、累積件数/blocks を採用
      setCallsPer10MinNonConnectedSnapshot(kpi.nonConnectedCompletedCount / blocks)
      return blocks
    })
  }, [kpi.nonConnected10MinBlocks, kpi.nonConnectedCompletedCount, callTimerState.status])

  const callGoalGap = useMemo(() => {
    if (goalCallCount === null) return null
    return goalCallCount - kpi.callCount
  }, [goalCallCount, kpi.callCount])

  const dealGoalGap = useMemo(() => {
    if (goalDealCount === null) return null
    return goalDealCount - kpi.appointmentCount
  }, [goalDealCount, kpi.appointmentCount])

  const plannedWorkGapMs = useMemo(() => {
    if (plannedWorkHours === null) return null
    // plannedWorkHoursは実際には分数として扱う
    const plannedMs = Math.max(0, plannedWorkHours) * 60000
    return plannedMs - timerMetrics.workMs
  }, [plannedWorkHours, timerMetrics.workMs])

  const plannedWorkGapMinutes = useMemo(() => {
    if (plannedWorkHours === null) return null
    // plannedWorkHoursは実際には分数として扱う
    const plannedMinutes = Math.max(0, plannedWorkHours)
    const workMinutes = Math.floor(timerMetrics.workMs / 60000)
    return plannedMinutes - workMinutes
  }, [plannedWorkHours, timerMetrics.workMs])

  // 架電中の定義: 通電ボタンを押して（connectedAtあり）、終了していない（endedAtなし）場合のみ
  // 不通の場合は架電中ではない（開始→不通→次へ、の流れで終了ボタンは押さない）
  const isInProgress = (r: CallRecord) => !!r.connectedAt && !r.endedAt

  const getInProgressRecord = () => {
    // 原則: 「終了」されていない架電（架電中/通電）は同時に1件のみ
    const inProgressRecords = sortedRecords.filter(isInProgress)
    if (inProgressRecords.length === 0) return null
    if (inProgressRecords.length === 1) return inProgressRecords[0]

    // 複数ある場合は、タイムスタンプが最新のものを正とみなす
    const score = (r: CallRecord) => {
      const t =
        (r.connectedAt ? new Date(r.connectedAt).getTime() : 0) ||
        (r.callingStartedAt ? new Date(r.callingStartedAt).getTime() : 0)
      return Number.isFinite(t) ? t : 0
    }
    return inProgressRecords.reduce((best, cur) => (score(cur) > score(best) ? cur : best))
  }

  useEffect(() => {
    if (autoFixInProgressRef.current) return
    const inProgressRecords = sortedRecords.filter(isInProgress)
    if (inProgressRecords.length <= 1) return

    autoFixInProgressRef.current = true
    const canonical = getInProgressRecord()
    if (!canonical) return

    // 残骸（複数の架電中）を検出 - 確認ダイアログで実行/スキップを選択
    const extras = inProgressRecords.filter((r) => r.leadId !== canonical.leadId)
    
    // 確認ダイアログを表示（自動実行しない）
    const confirmed = confirm(
      `未終了の「架電中」が${inProgressRecords.length}件検出されました。\n\n` +
      `1件に統一しますか？\n\n` +
      `【残す対象】${canonical.leadId}\n` +
      `【リセット対象】${extras.map((r) => r.leadId).join(', ')}\n\n` +
      `※「キャンセル」を選択すると、リセットせずそのまま継続します。`
    )

    if (!confirmed) {
      // キャンセルの場合は何もしない（データを保持）
      return
    }

    // 「OK」の場合のみリセットを実行
    void (async () => {
      for (const extra of extras) {
        const rollback: Record<string, any> = {
          status: '未架電',
          todayCallStatus: extra.todayCallStatus ?? null,
          callStatusToday: null,
          resultContactStatus: null,
          callingStartedAt: null,
          connectedAt: null,
          endedAt: null,
          callingStaffIS: null,
          lastConnectedDurationSeconds: null,
        }
        try {
          await updateMutation.mutateAsync({ leadId: extra.leadId, updates: rollback as any })
        } catch {
          // noop（自動修復が失敗しても、ガードで同時進行は防げる）
        }
      }
    })()
  }, [sortedRecords])

  const scrollToLeadId = (leadId: string) => {
    const el = document.querySelector(`[data-lead-id="${leadId}"]`) as HTMLElement | null
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const warnIfInProgressExists = (nextAction: 'open' | 'start' | 'noAnswer' | 'connected' | 'end', target: CallRecord) => {
    const inProgress = getInProgressRecord()
    if (!inProgress) return false

    // 「終了」は、未終了の対象に対しては許可（むしろ促す）
    if (nextAction === 'end' && inProgress.leadId === target.leadId) return false

    const callResult = inProgress.callStatusToday || inProgress.resultContactStatus || ''
    const isNoAnswer = /^不通\d*$/.test(String(callResult).trim()) || callResult === '不通'
    const isConnected = callResult === '通電'

    // 他のリードへ進もうとしている場合
    if (inProgress.leadId !== target.leadId) {
      // 不通の場合は次のリードに進むことを許可（再度かけなおす可能性が高いため）
      if (isNoAnswer) {
        return false
      }
      // 通電または架電中（開始のみ）の場合は、終了が必要
      if (nextAction === 'start' && (isConnected || !isNoAnswer)) {
        const reason = isConnected ? '通電' : '架電中'
        setRequiredInputModal({
          leadId: target.leadId,
          title: '架電が未終了です',
          message: `別のリードで「${reason}（未終了）」が残っています。先にそのリードで「終了」を押してください。\n\n未終了リード: ${inProgress.leadId}`,
        })
        scrollToLeadId(inProgress.leadId)
        return true
      }
      // 通電の場合は終了を押さないと次のリードに進めない
      if (isConnected) {
        setRequiredInputModal({
          leadId: target.leadId,
          title: '通電が未終了です',
          message: `別のリードで「通電（未終了）」が残っています。先にそのリードで「終了」を押してください。\n\n未終了リード: ${inProgress.leadId}`,
        })
        scrollToLeadId(inProgress.leadId)
        return true
      }
      // その他の架電中状態（開始のみ押した状態など）は許可
      return false
    }

    // 同一リードでも、通電→終了未完了の状態で別操作に進むのを抑止
    if (isConnected && nextAction !== 'end') {
      setRequiredInputModal({
        leadId: target.leadId,
        title: '通電が未終了です',
        message: '通電後は「終了」を押して確定してください（未終了のまま次の操作に進めません）。',
      })
      return true
    }

    return false
  }

  const handleRowClick = (record: CallRecord) => {
    if (warnIfInProgressExists('open', record)) return
    setSelectedRecord(record)
    setIsPanelOpen(true)
  }

  const handlePanelClose = () => {
    setIsPanelOpen(false)
    setSelectedRecord(null)
  }

  const handlePanelSave = async (updates: Partial<CallRecord>) => {
    if (!selectedRecord) return

    // 詳細保存は「終了確定」ではない（終了は手動ボタン）
    await updateMutation.mutateAsync({ leadId: selectedRecord.leadId, updates })
  }

  const handleQuickCallStart = async (record: CallRecord, e?: React.MouseEvent) => {
    e?.stopPropagation()

    // 目標設定とタイマー開始のチェック
    const missingTargets: string[] = []
    if (goalCallCount === null) missingTargets.push('目標架電数')
    if (goalDealCount === null) missingTargets.push('目標商談獲得数')
    if (plannedWorkHours === null) missingTargets.push('稼働予定時間')

    const isTimerStarted = callTimerState.status === 'running' || callTimerState.status === 'paused'

    if (missingTargets.length > 0 || !isTimerStarted) {
      const messages: string[] = []
      if (missingTargets.length > 0) {
        messages.push(`【目標未設定】${missingTargets.join('、')}`)
      }
      if (!isTimerStarted) {
        messages.push('【タイマー未開始】架電セッションの「開始」ボタンを押してください')
      }
      setRequiredInputModal({
        leadId: record.leadId,
        title: '架電を開始できません',
        message: `架電を開始する前に、以下を設定してください：\n\n${messages.join('\n')}\n\n※ 目標設定は「目標架電数」「目標商談獲得数」「稼働予定時間」ボタンから入力できます。`,
      })
      return
    }

    if (warnIfInProgressExists('start', record)) return
    const nowIso = new Date().toISOString()
    const updates: Partial<CallRecord> = {
      status: '架電中',
      callingStartedAt: nowIso,
      callingStaffIS: record.staffIS || record.callingStaffIS || '',
      // 2回目以降の架電に備え、「架電中」になった瞬間は未了へ戻す
      todayCallStatus: '未了',
    }
    await updateMutation.mutateAsync({ leadId: record.leadId, updates })
  }

  const handleQuickNoAnswer = async (record: CallRecord, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (warnIfInProgressExists('noAnswer', record)) return
    // 不通は「自動終了しない」：不通1/不通2…として累積し、手動で終了ボタンを押す
    // 架電回数（call_count）+ 1 を不通回数として使用（履歴件数と同期）
    const nextCount = (record.callCount || 0) + 1
    const nextLabel = `不通${nextCount}`

    const now = new Date()
    const nowIso = now.toISOString()
    const nowDate = getLocalDateString(now)
    const nowTime = getLocalTimeString(now)

    // 履歴を即時に追加（架電回数は履歴件数から再計算される）
    try {
      await fetch('/api/call-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: record.leadId,
          callDate: nowDate,
          callTime: nowTime,
          staffIS: record.staffIS || record.callingStaffIS || '',
          status: nextLabel,
          duration: null,
          memo: '',
        }),
      })
    } catch {
      // noop（本体更新を優先）
    }

    const updates: Partial<CallRecord> = {
      status: '不通',
      callStatusToday: nextLabel as any,
      resultContactStatus: nextLabel,
      lastCalledDate: nowDate,
      // 進行中情報は維持
      callingStartedAt: record.callingStartedAt || nowIso,
      callingStaffIS: record.staffIS || record.callingStaffIS || '',
      todayCallStatus: '未了',
    }
    await updateMutation.mutateAsync({ leadId: record.leadId, updates })
  }

  const handleQuickConnected = async (record: CallRecord, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (warnIfInProgressExists('connected', record)) return
    const nowIso = new Date().toISOString()
    const updates: Partial<CallRecord> = {
      status: '架電中',
      callStatusToday: '通電',
      resultContactStatus: '通電',
      connectedAt: nowIso,
      callingStaffIS: record.staffIS || record.callingStaffIS || '',
      todayCallStatus: record.todayCallStatus || '未了',
    }

    // パネルを即時に開けるようにローカルも更新しておく
    setSelectedRecord({ ...record, ...updates })
    setIsPanelOpen(true)

    await updateMutation.mutateAsync({ leadId: record.leadId, updates })
  }

  const handleQuickClear = async (record: CallRecord, e?: React.MouseEvent) => {
    e?.stopPropagation()
    // 「済」になっているものは詳細画面でクリアする必要がある
    if (record.todayCallStatus === '済') {
      setRequiredInputModal({
        leadId: record.leadId,
        title: 'クリアできません',
        message: '完了（済）のリードは詳細画面からクリアしてください。詳細画面の「クリア」ボタンで全データをリセットできます。',
      })
      return
    }
    if (!confirm('この行の架電状態をクリアしますか？（本日の架電履歴も削除され、架電回数が減ります）')) return

    // 本日分の架電履歴を削除（過去日付は残す）
    const today = getLocalDateString()
    try {
      const res = await fetch(`/api/call-history?leadId=${encodeURIComponent(String(record.leadId))}`)
      if (res.ok) {
        const body = await res.json()
        const rows: Array<{ id?: string; callDate?: string }> = Array.isArray(body?.data) ? body.data : []
        // 本日分の履歴をすべて削除
        const todayHistories = rows.filter(h => h.callDate === today && h.id)
        for (const h of todayHistories) {
          await fetch(`/api/call-history/${h.id}`, { method: 'DELETE' })
        }
      }
    } catch {
      // 履歴の削除に失敗しても、本体のクリアは続行
    }

    const updates: Record<string, any> = {
      status: '未架電',
      // 未確定の架電アクション状態をクリア
      callingStartedAt: null,
      connectedAt: null,
      endedAt: null,
      callingStaffIS: null,
      lastConnectedDurationSeconds: null,
      // 結果選択もクリア（未架電に戻す）
      callStatusToday: null,
      resultContactStatus: null,
      // todayCallStatusもnullにリセット（KPIカードから除外）
      todayCallStatus: null,
    }
    await updateMutation.mutateAsync({ leadId: record.leadId, updates: updates as any })
  }

  const scrollToNextLead = (_currentLeadId: string) => {
    // 終了後、ソートが適用されるため、次の架電対象（完了以外の最初のリード）にスクロール
    // 少し待ってからスクロール（状態更新とソートが完了するのを待つ）
    setTimeout(() => {
      // 完了以外の最初のリードを探す
      const nextTarget = displayRecords.find(r => r.todayCallStatus !== '済')
      if (nextTarget?.leadId) {
        const el = document.querySelector(`[data-lead-id="${nextTarget.leadId}"]`) as HTMLElement | null
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
      }
      // 見つからない場合はテーブルヘッダーの位置にスクロール
      const tableHeader = document.querySelector('thead') as HTMLElement | null
      tableHeader?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleQuickEnd = async (record: CallRecord, e?: React.MouseEvent, prevSnapshot?: CallRecord) => {
    e?.stopPropagation()
    if (warnIfInProgressExists('end', record)) return

    // 架電結果が未入力の場合は終了できない
    const callResult = record.callStatusToday || record.resultContactStatus || ''
    const isNoAnswer = /^不通\d+$/.test(String(callResult))
    if (!callResult || callResult === '未架電') {
      setRequiredInputModal({
        leadId: record.leadId,
        title: 'まだ終了できません',
        message: 'まず「不通」または「通電」を選択してください（通電の場合は詳細入力→保存が必要です）。',
      })
      return
    }

    // 通電の場合は必須入力をチェック（未入力なら促す）
    const isConnected = callResult === '通電'
    if (isConnected) {
      const missing: string[] = []
      if (!String(record.statusIS || '').trim()) missing.push('リード状態')
      // 会話メモは任意入力（必須ではない）

      if (missing.length > 0) {
        setSelectedRecord(record)
        setIsPanelOpen(true)
        setRequiredInputModal({
          leadId: record.leadId,
          title: '必須入力が未完了です',
          message: `通電の場合は以下を入力して保存してください：${missing.join(' / ')}`,
        })
        return
      }
    }

    const now = new Date()
    const nowIso = now.toISOString()
    const nowDate = getLocalDateString(now)
    const nowTime = getLocalTimeString(now)

    const nextLeadId = record.leadId
    const prev = prevSnapshot ?? record
    // 終了時に履歴を追加（call_countは履歴件数から更新される）
    // - 不通はボタン押下時点で履歴登録済みのため、ここでは追加しない（重複カウント防止）
    let durationSeconds: number | null = null
    if (isConnected && record.connectedAt) {
      const connectedAtMs = new Date(record.connectedAt as string).getTime()
      durationSeconds = Math.max(0, Math.floor((now.getTime() - connectedAtMs) / 1000))
    }

    let createdHistoryId: string | null = null
    if (isConnected) {
      try {
        const res = await fetch('/api/call-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: record.leadId,
            callDate: nowDate,
            callTime: nowTime,
            staffIS: record.staffIS || record.callingStaffIS || '',
            status: '通話できた',
            result: callResult,
            duration: durationSeconds,
            memo: record.conversationMemo || '',
          }),
        })
        if (res.ok) {
          const body = await res.json()
          createdHistoryId = body?.data?.id ?? null
        }
      } catch {
        // 履歴の失敗は致命ではないため、終了の本体更新を優先
      }
    }

    const updates: Partial<CallRecord> = {
      // 架電中解除（終了で確定）
      status: '未架電',
      todayCallStatus: '済',
      callStatusToday: callResult as any,
      resultContactStatus: isNoAnswer ? '不通' : callResult,
      endedAt: nowIso,
      lastCalledDate: nowDate,
      ...(durationSeconds !== null ? { lastConnectedDurationSeconds: durationSeconds } : {}),
    }

    await updateMutation.mutateAsync({ leadId: record.leadId, updates })
    // 詳細パネルが開いていたら閉じる（次へ移動の妨げを防ぐ）
    setIsPanelOpen(false)
    setSelectedRecord(null)
    // 次のリードへ移動（スクロール）
    scrollToNextLead(nextLeadId)
  }

  const handleResizeStart = (columnKey: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingColumn(columnKey)
    setResizeStartX(e.clientX)
    setResizeStartWidth(columnWidths[columnKey] || 120)
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <p className="text-red-600">データの取得に失敗しました。再度お試しください。</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={topAreaRef}>
      <div
        className={`sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm ${isHeaderCollapsed ? 'pb-2' : 'pb-4'}`}
      >
        <div className={`flex items-start justify-between ${isHeaderCollapsed ? 'mb-2' : 'mb-4'}`}>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-gray-900">架電管理</h1>
            {!isHeaderCollapsed && (
              <p className="text-sm text-gray-500">リードへの架電状況を管理します</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white shadow-sm">
              <span className="text-sm font-medium text-gray-700">担当者フィルタ</span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAllStaffScope}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setIsAllStaffScope(checked)
                  }}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">すべて</span>
              </label>
              <span className="text-xs text-gray-400">|</span>
              {staffOptions.map((opt) => {
                const v = String(opt.value)
                const checked = selectedStaffScope.has(v)
                return (
                  <label key={v} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleStaffScope(v)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsHeaderCollapsed(prev => {
                  const next = !prev
                  if (next) {
                    // 架電モードON時: フィルタをデフォルトにリセット（担当者スコープは維持）
                    setIsListMode(false)
                    setFilterStatus('all')
                    setFilterLeadResult('all')
                    setFilterLeadSource('all')
                    setFilterTodayStatus('all')
                    setSearchTerm('')
                    setDateRange(null)
                  }
                  return next
                })
              }}
              className={`px-4 py-2 text-sm font-medium border rounded-md shadow-sm ${
                isHeaderCollapsed
                  ? 'text-white bg-primary-600 border-primary-600 hover:bg-primary-700'
                  : 'text-primary-700 bg-primary-50 border-primary-100 hover:bg-primary-100'
              }`}
            >
              {isHeaderCollapsed ? '架電モードON' : '架電モードOFF'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsListMode(prev => {
                  const next = !prev
                  if (next) {
                    setIsHeaderCollapsed(false)
                    setShowCallListOnly(false)
                    setIsSelectionMode(false)
                    setSelectedLeadIds(new Set())
                  }
                  return next
                })
              }}
              className={`px-4 py-2 text-sm font-medium border rounded-md shadow-sm ${
                isListMode
                  ? 'text-white bg-primary-600 border-primary-600 hover:bg-primary-700'
                  : 'text-primary-700 bg-primary-50 border-primary-100 hover:bg-primary-100'
              }`}
            >
              {isListMode ? 'リストモードON' : 'リストモードOFF'}
            </button>
            <button
              type="button"
              onClick={resetColumns}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
            >
              列表示リセット
            </button>
          </div>
        </div>

        {!isHeaderCollapsed && (
          <>
            {/* フィルター行 */}
            <div className="card p-4 mb-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 justify-end lg:justify-start">
                  {/* リスト表示モード中は期間フィルタを無効化（グレーアウト） */}
                  <div 
                    className={showCallListOnly && currentCallList ? 'opacity-50 pointer-events-none' : ''}
                    title={showCallListOnly && currentCallList ? 'リスト表示モード中は期間フィルタは無効です' : undefined}
                  >
                    <DateRangeFilter
                      value={dateRange}
                      onChange={setDateRange}
                      fiscalYearStart={7}
                    />
                  </div>
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    表示: <span className="font-semibold text-gray-900">{sortedRecords.length}</span> 件
                  </span>
                </div>

                {/* 検索/フィルタ（縦幅削減のため右横に集約） */}
                <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap gap-2 lg:justify-end lg:items-center">
                  <div className="sm:w-[160px] lg:w-[160px]">
                    <input
                      type="text"
                      placeholder="会社名、電話番号..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input w-full text-sm"
                    />
                  </div>
                  <div className="sm:w-28 lg:w-28">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="input w-full text-sm"
                      aria-label="ステータスフィルター"
                    >
                      <option value="all">ステータス</option>
                      {STATUS_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:w-36 lg:w-36">
                    <select
                      value={filterLeadResult}
                      onChange={(e) => setFilterLeadResult(e.target.value)}
                      className="input w-full text-sm"
                      aria-label="リード結果フィルター"
                    >
                      <option value="all">リード結果</option>
                      {LEAD_RESULT_OPTIONS.map(option => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:w-28 lg:w-28">
                    <select
                      value={filterLeadSource}
                      onChange={(e) => setFilterLeadSource(e.target.value)}
                      className="input w-full text-sm"
                      aria-label="リードソースフィルター"
                    >
                      <option value="all">リードソース</option>
                      {leadSourceOptions.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                      <option value="未入力">未入力</option>
                    </select>
                  </div>
                  <div className="sm:w-24 lg:w-24">
                    <select
                      value={filterStaff}
                      onChange={(e) => setFilterStaff(e.target.value)}
                      className="input w-full text-sm"
                      aria-label="担当者フィルター"
                    >
                      <option value="all">担当者</option>
                      <option value={'\u7530\u908a'}>{'\u7530\u908a'}</option>
                      <option value="沢田">沢田</option>
                      <option value="金山">金山</option>
                      <option value="その他">その他（全員）</option>
                      <option value="未入力">未入力</option>
                    </select>
                  </div>
                  <div className="sm:w-28 lg:w-28">
                    <select
                      value={filterTodayStatus}
                      onChange={(e) => setFilterTodayStatus(e.target.value)}
                      className="input w-full text-sm"
                      aria-label="本日完了/未了フィルター"
                    >
                      <option value="all">本日状態</option>
                      <option value="本日完了">本日完了</option>
                      <option value="本日未了">本日未了</option>
                    </select>
                  </div>
                  {/* フィルタリセットボタン */}
                  <button
                    type="button"
                    onClick={() => {
                      setFilterStatus('all')
                      setFilterLeadResult('all')
                      setFilterLeadSource('all')
                      setFilterStaff('all')
                      setFilterTodayStatus('all')
                      setSearchTerm('')
                      setDateRange(null)
                    }}
                    className="p-1.5 text-gray-600 bg-gray-200 border border-gray-300 rounded shadow hover:bg-gray-300 hover:text-gray-800 hover:shadow-md active:shadow-inner transition-all"
                    title="フィルタをリセット"
                    aria-label="フィルタをリセット"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

          </>
        )}
      </div>

      {/* 架電リスト機能（Phase 1） */}
      {!isListMode && isCallListPanelOpen && (
        <div className={`card p-4 ${isHeaderCollapsed ? 'mt-4' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">架電リスト</span>
                {/* 3状態ボタン: 選択中=濃青背景白文字, アクティブ=白背景青文字青枠hover青薄背景, 非アクティブ=グレー背景薄文字 */}
                <div className="inline-flex rounded-md overflow-hidden gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      callListViewUserSetRef.current = true
                      setCallListView('today')
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
                      callListView === 'today'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-primary-600 border-2 border-primary-300 hover:bg-primary-50 hover:border-primary-400'
                    }`}
                  >
                    本日
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      callListViewUserSetRef.current = true
                      setCallListView('previous')
                    }}
                    disabled={!previousCallList}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
                      !previousCallList
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : callListView === 'previous'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-primary-600 border-2 border-primary-300 hover:bg-primary-50 hover:border-primary-400'
                    }`}
                    title="前回（直近の過去リスト）を表示"
                  >
                    前回
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={callListTargetCount}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === '') {
                      setCallListTargetCount('')
                    } else {
                      const num = parseInt(val, 10)
                      if (!isNaN(num) && num >= 0) {
                        setCallListTargetCount(num)
                      }
                    }
                  }}
                  className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-md text-center"
                  placeholder="件数"
                  min={0}
                />
                <span className="text-sm text-gray-600">件</span>
              </div>
              <button
                onClick={handleCreateTodayList}
                disabled={!!todayCallList}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  todayCallList
                    ? 'text-white bg-gray-400 cursor-not-allowed opacity-70'
                    : 'text-white bg-primary-600 hover:bg-primary-700'
                }`}
                title={
                  todayCallList
                    ? '本日のリストは作成済みです（追加は「+追加作成」、作り直しは⚙️から）'
                    : isCallListStaffReady
                      ? '本日の架電リストを作成します'
                      : '担当者フィルタの「すべて」を外し、担当者を1名選択してください'
                }
              >
                新規作成
              </button>
              <button
                onClick={() => {
                  if (!isCallListStaffReady) {
                    alert('担当者を1名選択してください。（担当者フィルタの「すべて」を外して選択してください）')
                    return
                  }
                  if (callListView !== 'today') {
                    alert('追加作成は本日のリストで実施してください。（本日タブに切り替えてください）')
                    return
                  }
                  if (!todayCallList) {
                    alert('追加対象の本日リストがありません。先に新規作成してください。')
                    return
                  }
                  handleAddToList()
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  isCallListStaffReady && callListView === 'today' && todayCallList
                    ? 'text-white bg-green-600 hover:bg-green-700'
                    : 'text-white bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-70'
                }`}
                title={
                  !isCallListStaffReady
                    ? '担当者を1名選択してください'
                    : callListView === 'today'
                      ? '本日のリストにリードを追加します'
                      : '本日のタブでのみ利用できます'
                }
              >
                +追加作成
              </button>
              <button
                onClick={async () => {
                  if (!isCallListStaffReady) {
                    alert('担当者を1名選択してください。（担当者フィルタの「すべて」を外して選択してください）')
                    return
                  }
                  if (callListView !== 'today') {
                    alert('リスト選択は本日のリストでのみ利用できます。（本日タブに切り替えてください）')
                    return
                  }
                  if (!currentCallList) {
                    alert('対象のリストがありません。先に新規作成してください。')
                    return
                  }
                  if (isSelectionMode) {
                    // 非表示モード → 選択されたリードを除外
                    if (selectedLeadIds.size > 0) {
                      try {
                        const response = await fetch('/api/call-lists', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id: currentCallList.id,
                            removeLeadIds: Array.from(selectedLeadIds),
                          }),
                        })
                        if (response.ok) {
                          const result = await response.json()
                          // リストを更新
                          setCurrentCallList({
                            ...currentCallList,
                            leadIds: result.leadIds || [],
                          })
                          alert(`${selectedLeadIds.size}件のリードを架電リストから除外しました。`)
                        } else {
                          alert('除外に失敗しました。')
                        }
                      } catch {
                        alert('除外に失敗しました。')
                      }
                    }
                    // 選択をクリアして通常モードに戻る
                    setSelectedLeadIds(new Set())
                    setIsSelectionMode(false)
                  } else {
                    // 通常モード → 選択モードに切り替え
                    setIsSelectionMode(true)
                  }
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  isCallListStaffReady && callListView === 'today' && currentCallList
                    ? isSelectionMode
                      ? 'text-white bg-red-600 hover:bg-red-700'
                      : 'text-white bg-gray-500 hover:bg-gray-600'
                  : 'text-white bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-70'
                }`}
                title={
                  !isCallListStaffReady
                    ? '担当者を1名選択してください'
                    : callListView === 'today'
                      ? 'リードを選択して非表示（除外）できます'
                      : '本日のタブでのみ利用できます'
                }
              >
                {isSelectionMode ? `非表示 (${selectedLeadIds.size}件)` : 'リスト選択'}
              </button>
              {!isCallListStaffReady && (
                <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                  架電リスト機能は担当者を1名選択してください
                </span>
              )}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showCallListOnly}
                  onChange={(e) => setShowCallListOnly(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">
                  {callListView === 'today' ? '本日の架電リストのみ表示' : '前回リストのみ表示'}
                </span>
              </label>
              {currentCallList && (
                <span className="text-xs text-gray-500">
                  リスト名: {currentCallList.name} | 作成日: {currentCallList.date}
                </span>
              )}
            </div>
            {currentCallList && (
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600">
                  {callListView === 'today' ? '本日の架電リスト' : '前回リスト'}: {currentCallList.leadIds.length}件
                </div>
                {/* 設定アイコン（リスト再作成等） */}
                <div className="relative">
                  <button
                    onClick={() => setIsListSettingsOpen(!isListSettingsOpen)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    title="リスト設定"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  {isListSettingsOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsListSettingsOpen(false)}
                      />
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                        <button
                          onClick={handleRecreateList}
                          disabled={!isCallListStaffReady}
                          className={`w-full px-4 py-2 text-left text-sm border-b border-gray-100 ${
                            isCallListStaffReady
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          🔄 リスト再作成（上書き）
                        </button>
                        <button
                          onClick={handleClearList}
                          disabled={!todayCallList}
                          className={`w-full px-4 py-2 text-left text-sm ${
                            todayCallList
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          🗑️ リストクリア
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 架電タイマー（常時表示 / Close範囲外） */}
      {!isListMode && (
        <div className="mt-4">
          <div className="card p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
              {!isListMode && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
                    onClick={() => {
                      setSettingsModal({ type: 'goalCallCount' })
                      setSettingsValue(goalCallCount === null ? '' : String(goalCallCount))
                    }}
                  >
                    目標架電数
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
                    onClick={() => {
                      setSettingsModal({ type: 'goalDealCount' })
                      setSettingsValue(goalDealCount === null ? '' : String(goalDealCount))
                    }}
                  >
                    目標商談獲得数
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
                    onClick={() => {
                      setSettingsModal({ type: 'plannedWorkHours' })
                      setSettingsValue(plannedWorkHours === null ? '' : String(plannedWorkHours))
                    }}
                  >
                    稼働予定時間
                  </button>
                  {(goalCallCount !== null || goalDealCount !== null || plannedWorkHours !== null) && (
                    <button
                      type="button"
                      className="px-2 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
                      onClick={() => {
                        setGoalCallCount(null)
                        setGoalDealCount(null)
                        setPlannedWorkHours(null)
                        try {
                          window.localStorage.removeItem('calls.goalCallCount')
                          window.localStorage.removeItem('calls.goalDealCount')
                          window.localStorage.removeItem('calls.plannedWorkHours')
                        } catch { /* ignore */ }
                      }}
                      title="目標架電数・目標商談獲得数・稼働予定時間をすべてクリア"
                    >
                      クリア
                    </button>
                  )}
                  {!isListMode && (
                    <>
                      <button
                        type="button"
                        className="px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-100 rounded-md hover:bg-primary-100 shadow-sm ml-12"
                        onClick={() => {
                          setIsCallListPanelOpen(prev => !prev)
                        }}
                      >
                        本日リスト作成
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-100 rounded-md hover:bg-green-100 shadow-sm ml-2"
                        onClick={() => setIsLeadRegisterModalOpen(true)}
                      >
                        リスト登録
                      </button>
                    </>
                  )}
                </div>
              )}
              {!isListMode && (
                <div className="flex items-center gap-2 ml-24">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    const now = Date.now()
                    const sessionId = generateUuidV4()
                    const sessionDate = getLocalDateString()

                    // 10分指標は新セッション開始でリセット
                    setCallsPer10MinBlocksSnapshot(0)
                    setCallsPer10MinNonConnectedSnapshot(null)

                    setCallTimerState({
                      status: 'running',
                      sessionId,
                      startedAtMs: Date.now(),
                      endedAtMs: null,
                      pausedAtMs: null,
                      pausedTotalMs: 0,
                    })
                    setNowMs(now)

                    void safePostJson('/api/call-ops/events', {
                      sessionId,
                      sessionDate,
                      eventType: 'start',
                      payload: {
                        startedAtMs: now,
                        targets: getCurrentTargetsSnapshot(),
                      },
                    })
                  }}
                  disabled={callTimerState.status === 'running'}
                >
                  開始
                </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  const now = Date.now()
                  const sessionDate = getLocalDateString()
                  const state = callTimerState
                  const sessionId = state.sessionId
                  if (!sessionId) return

                  if (state.status === 'running') {
                    setCallTimerState({ ...state, status: 'paused', pausedAtMs: now })
                    void safePostJson('/api/call-ops/events', {
                      sessionId,
                      sessionDate,
                      eventType: 'pause',
                      payload: {
                        pausedAtMs: now,
                        targets: getCurrentTargetsSnapshot(),
                      },
                    })
                  } else if (state.status === 'paused') {
                    const added = state.pausedAtMs ? Math.max(0, now - state.pausedAtMs) : 0
                    setCallTimerState({
                      ...state,
                      status: 'running',
                      pausedAtMs: null,
                      pausedTotalMs: state.pausedTotalMs + added,
                    })
                    void safePostJson('/api/call-ops/events', {
                      sessionId,
                      sessionDate,
                      eventType: 'resume',
                      payload: {
                        resumedAtMs: now,
                        addedPauseMs: added,
                        targets: getCurrentTargetsSnapshot(),
                      },
                    })
                  }
                  setNowMs(now)
                }}
                disabled={callTimerState.status === 'idle' || callTimerState.status === 'ended'}
              >
                {callTimerState.status === 'paused' ? '再開' : '中断'}
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  const now = Date.now()
                  const sessionDate = getLocalDateString()
                  const state = callTimerState
                  const sessionId = state.sessionId
                  if (sessionId) {
                    const normalized = {
                      ...state,
                      endedAtMs: now,
                      pausedTotalMs:
                        state.status === 'paused' && state.pausedAtMs
                          ? state.pausedTotalMs + Math.max(0, now - state.pausedAtMs)
                          : state.pausedTotalMs,
                      pausedAtMs: null,
                      status: 'ended' as const,
                    }
                    const metrics = computeTimerMetricsAt(normalized as any, now)

                    const targets = getCurrentTargetsSnapshot()
                    const filters = {
                      filterStatus,
                      showCallListOnly,
                      callListName: currentCallList?.name ?? null,
                      callListDate: currentCallList?.date ?? null,
                      dateRange: dateRange
                        ? {
                            start: dateRange.start.toISOString(),
                            end: dateRange.end.toISOString(),
                          }
                        : null,
                      searchTerm,
                    }

                    void safePostJson('/api/call-ops/events', {
                      sessionId,
                      sessionDate,
                      eventType: 'end',
                      payload: {
                        endedAtMs: now,
                        metrics,
                        targets,
                        kpi: {
                          callCount: kpi.callCount,
                          connectedCount: kpi.connectedCount,
                          appointmentCount: kpi.appointmentCount,
                          callsPerHourNonConnected: kpi.callsPerHourNonConnected,
                          avgConnectedSeconds: kpi.avgConnectedSeconds,
                          connectedAppointmentRate: kpi.connectedAppointmentRate,
                        },
                      },
                    })

                    void safePostJson('/api/call-ops/sessions', {
                      sessionId,
                      sessionDate,
                      startedAt: state.startedAtMs ? new Date(state.startedAtMs).toISOString() : null,
                      endedAt: new Date(now).toISOString(),
                      totalMs: metrics.totalMs,
                      pauseMs: metrics.pauseMs,
                      workMs: metrics.workMs,
                      goalCallCount: targets.goalCallCount,
                      goalDealCount: targets.goalDealCount,
                      plannedWorkMinutes: targets.plannedWorkMinutes,
                      kpiCallCount: kpi.callCount,
                      kpiConnectedCount: kpi.connectedCount,
                      kpiAppointmentCount: kpi.appointmentCount,
                      kpiCallsPerHourNonConnected: kpi.callsPerHourNonConnected,
                      kpiAvgConnectedSeconds: kpi.avgConnectedSeconds === null ? null : Math.round(kpi.avgConnectedSeconds),
                      kpiConnectedAppointmentRate: kpi.connectedAppointmentRate,
                      filters,
                    })

                    setCallTimerState(normalized as any)
                    setNowMs(now)
                    return
                  }

                  setCallTimerState((prev) => ({
                    ...prev,
                    status: 'ended',
                    endedAtMs: now,
                    pausedTotalMs:
                      prev.status === 'paused' && prev.pausedAtMs
                        ? prev.pausedTotalMs + Math.max(0, now - prev.pausedAtMs)
                        : prev.pausedTotalMs,
                    pausedAtMs: null,
                  }))
                  setNowMs(now)
                }}
                disabled={callTimerState.status === 'idle' || callTimerState.status === 'ended'}
              >
                終了
              </button>
              <button
                type="button"
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  setCallTimerState({
                    status: 'idle',
                    sessionId: null,
                    startedAtMs: null,
                    endedAtMs: null,
                    pausedAtMs: null,
                    pausedTotalMs: 0,
                  })
                  setNowMs(Date.now())
                  setCallsPer10MinBlocksSnapshot(0)
                  setCallsPer10MinNonConnectedSnapshot(null)
                }}
                disabled={callTimerState.status === 'idle'}
              >
                リセット
              </button>
              {!isListMode && (
                <>
                  {plannedWorkHours !== null && (
                    <span className="text-xs text-gray-500">
                      ｜ 予定稼働: <span className="tabular-nums">{plannedWorkHours}</span>分
                    </span>
                  )}
                </>
              )}
                </div>
              )}
            </div>
            {!isListMode && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                  <div className="text-xs text-gray-500">開始時間</div>
                  <div className="mt-1 text-lg font-bold text-gray-900 tabular-nums">
                    {callTimerState.startedAtMs ? getLocalTimeString(new Date(callTimerState.startedAtMs)) : '-'}
                  </div>
                </div>
                <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                  <div className="text-xs text-gray-500">終了時間</div>
                  <div className="mt-1 text-lg font-bold text-gray-900 tabular-nums">
                    {callTimerState.endedAtMs ? getLocalTimeString(new Date(callTimerState.endedAtMs)) : '-'}
                  </div>
                </div>
                <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                  <div className="text-xs text-gray-500">合計時間</div>
                  <div className="mt-1 text-lg font-bold text-gray-900 tabular-nums">{formatHhMmSs(timerMetrics.totalMs)}</div>
                </div>
                <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                  <div className="text-xs text-gray-500">架電稼働時間</div>
                  <div className="mt-1 text-lg font-bold text-gray-900 tabular-nums">{formatHhMmSs(timerMetrics.workMs)}</div>
                </div>
                <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                  <div className="text-xs text-gray-500">中断時間</div>
                  <div className="mt-1 text-lg font-bold text-gray-900 tabular-nums">{formatHhMmSs(timerMetrics.pauseMs)}</div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* KPI（常時表示 / Close範囲外） */}
      <div className="mt-4">
        {/* カスタム幅: 架電数/リスト +20%, 通電商談獲得率 -15%, 平均通電会話時間 -15% */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-[1.2fr_1fr_1fr_0.85fr_1fr_1fr_0.85fr] gap-3">
          {/* 架電数／架電リスト（+20%幅） */}
          <button
            type="button"
            onClick={() => setKpiDrilldown((prev) => (prev === 'called' ? null : 'called'))}
            className={`card p-4 pt-7 border-l-4 border-primary-200 relative text-left hover:-translate-y-0.5 hover:shadow-lg transition-all duration-150 ${
              kpiDrilldown === 'called' ? 'ring-2 ring-primary-200' : ''
            }`}
            aria-label="架電済（本日）のリード一覧を表示"
          >
            <div className="absolute right-2 top-2 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 border border-primary-100">
              架電量
            </div>
            <div className="text-xs text-gray-500 h-4">架電数／架電リスト</div>
            <div className="mt-1 flex items-end justify-between gap-2 h-14">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900 tabular-nums">{kpi.callCount}</span>
                <span className="text-lg text-gray-400 mx-1">/</span>
                <span className="text-2xl font-bold text-gray-900 tabular-nums">{sortedRecords.length}</span>
              </div>
              <div className="text-right leading-tight">
                <div className="text-sm font-semibold text-cyan-600 tabular-nums">目標: {goalCallCount === null ? '-' : goalCallCount}</div>
                <div className="text-sm font-bold tabular-nums text-gray-600">
                  GAP: {callGoalGap === null ? '-' : callGoalGap}
                </div>
              </div>
            </div>
          </button>
          {/* 不通数・通電数・未架電の3列カード */}
          <div className="card p-4 pt-7">
            <div className="text-xs text-gray-500 h-4">架電状況</div>
            <div className="mt-1 flex items-center justify-between gap-2 h-14">
              {/* 不通数 */}
              <button
                type="button"
                onClick={() => setKpiDrilldown((prev) => (prev === 'notConnected' ? null : 'notConnected'))}
                className={`flex-1 text-center py-1 px-2 rounded transition-all duration-150 hover:bg-gray-100 ${
                  kpiDrilldown === 'notConnected' ? 'ring-2 ring-blue-300 bg-blue-50' : ''
                }`}
                aria-label="不通（本日）のリード一覧を表示"
              >
                <div className="text-[10px] text-gray-500">不通</div>
                <div className="text-lg font-bold text-blue-600 tabular-nums">{kpi.notConnectedCount}</div>
              </button>
              {/* 通電数 */}
              <button
                type="button"
                onClick={() => setKpiDrilldown((prev) => (prev === 'connected' ? null : 'connected'))}
                className={`flex-1 text-center py-1 px-2 rounded transition-all duration-150 hover:bg-gray-100 ${
                  kpiDrilldown === 'connected' ? 'ring-2 ring-green-300 bg-green-50' : ''
                }`}
                aria-label="通電（本日）のリード一覧を表示"
              >
                <div className="text-[10px] text-gray-500">通電</div>
                <div className="text-lg font-bold text-green-600 tabular-nums">{kpi.connectedCount}</div>
              </button>
              {/* 未架電 */}
              <button
                type="button"
                onClick={() => setKpiDrilldown((prev) => (prev === 'notCalled' ? null : 'notCalled'))}
                className={`flex-1 text-center py-1 px-2 rounded transition-all duration-150 hover:bg-gray-100 ${
                  kpiDrilldown === 'notCalled' ? 'ring-2 ring-gray-300 bg-gray-100' : ''
                }`}
                aria-label="未架電（本日）のリード一覧を表示"
              >
                <div className="text-[10px] text-gray-500">未架電</div>
                <div className="text-lg font-bold text-gray-600 tabular-nums">{kpi.notCalledCount}</div>
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setKpiDrilldown((prev) => (prev === 'appointment' ? null : 'appointment'))}
            className={`card p-4 pt-7 border-l-4 border-primary-200 relative text-left hover:-translate-y-0.5 hover:shadow-lg transition-all duration-150 ${
              kpiDrilldown === 'appointment' ? 'ring-2 ring-primary-200' : ''
            }`}
            aria-label="商談獲得（本日）のリード一覧を表示"
          >
            <div className="absolute right-2 top-2 rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-semibold text-pink-700 border border-pink-100">
              結果・実績
            </div>
            <div className="text-xs text-gray-500 h-4">商談獲得数</div>
            <div className="mt-1 flex items-end justify-between gap-2 h-14">
              <div className="text-2xl font-bold text-gray-900 tabular-nums">{kpi.appointmentCount}</div>
              <div className="text-right leading-tight">
                <div className="text-sm font-semibold text-cyan-600 tabular-nums">目標: {goalDealCount === null ? '-' : goalDealCount}</div>
                <div className="text-sm font-bold tabular-nums text-gray-600">
                  GAP: {dealGoalGap === null ? '-' : dealGoalGap}
                </div>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setKpiDrilldown((prev) => (prev === 'connected' ? null : 'connected'))}
            className={`card p-4 pt-7 relative text-left hover:-translate-y-0.5 hover:shadow-lg transition-all duration-150 ${
              kpiDrilldown === 'connected' ? 'ring-2 ring-primary-200' : ''
            }`}
            aria-label="通電（本日）のリード一覧を表示"
          >
            <div className="absolute right-2 top-2 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 border border-primary-100">
              架電質
            </div>
            <div className="text-xs text-gray-500 h-4">通電商談獲得率</div>
            <div className="mt-1 text-2xl font-bold text-gray-900 tabular-nums h-14 flex items-end">
              {kpi.connectedAppointmentRate === null
                ? '-'
                : formatValueWithUnit(String((kpi.connectedAppointmentRate * 100).toFixed(1)), '％')}
            </div>
          </button>
          <div className="card p-4 pt-7 border-l-4 border-primary-200 relative">
            <div className="absolute right-2 top-2 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 border border-primary-100">
              架電量
            </div>
            <div className="text-xs text-gray-500 h-4">架電稼働時間（ダブルクリックで編集）</div>
            <div
              className="mt-1 flex items-end justify-between gap-2 cursor-pointer h-14"
              onDoubleClick={() => {
                const currentMinutes = Math.max(0, Math.floor(timerMetrics.workMs / 60000))
                setSettingsModal({ type: 'workMinutes' })
                setSettingsValue(String(currentMinutes))
              }}
              title="ダブルクリックで架電稼働時間を修正"
            >
              <div className="text-2xl font-bold text-gray-900 tabular-nums">
                {formatValueWithUnit(String(Math.max(0, Math.floor(timerMetrics.workMs / 60000))), '分')}
              </div>
              <div className="text-right leading-tight">
                <div className="text-sm font-semibold text-cyan-600 tabular-nums">
                  目標:{' '}
                  {plannedWorkHours === null ? '-' : `${Math.round(Math.max(0, plannedWorkHours))}分`}
                </div>
                <div className="text-sm font-bold tabular-nums text-gray-600">
                  GAP: {formatSignedMinutes(plannedWorkGapMinutes)}
                </div>
              </div>
            </div>
          </div>
          <div className="card p-4 pt-7 relative">
            <div className="absolute right-2 top-2 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 border border-primary-100">
              架電効率
            </div>
            <div className="text-xs text-gray-500 h-4">1件あたり秒数（通電以外）</div>
            <div className="mt-1 text-2xl font-bold text-gray-900 tabular-nums h-14 flex items-end">
              {kpi.secondsPerNonConnectedCall === null
                ? '-'
                : formatValueWithUnit(String(Math.round(kpi.secondsPerNonConnectedCall)), '秒/件')}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setKpiDrilldown((prev) => (prev === 'connectedTalk60' ? null : 'connectedTalk60'))}
            className={`card p-4 pt-7 relative text-left hover:-translate-y-0.5 hover:shadow-lg transition-all duration-150 ${
              kpiDrilldown === 'connectedTalk60' ? 'ring-2 ring-primary-200' : ''
            }`}
            aria-label="通電会話（1分以上 / 本日）のリード一覧を表示"
          >
            <div className="absolute right-2 top-2 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 border border-primary-100">
              架電効率
            </div>
            <div className="text-xs text-gray-500 h-4">平均通電会話時間</div>
            <div className="mt-1 text-2xl font-bold text-gray-900 tabular-nums h-14 flex items-end">{kpi.formatSecondsAsMmSs(kpi.avgConnectedSeconds)}</div>
          </button>
        </div>
      </div>

      {kpiDrilldown && drilldownLabel && (
        <div className="mt-3 flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2">
          <div className="text-sm text-gray-700">
            表示中: <span className="font-semibold">{drilldownLabel}</span>
          </div>
          <button
            type="button"
            onClick={() => setKpiDrilldown(null)}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 underline"
          >
            解除
          </button>
        </div>
      )}

      </div>
      <div className="mt-6">
        <div className="card overflow-hidden">
          <div
            className="overflow-x-auto overflow-y-auto"
            style={{
              maxHeight: topAreaHeightPx > 0 ? `calc(100vh - ${topAreaHeightPx}px - 24px)` : 'calc(100vh - 240px)',
            }}
          >
            <table className="divide-y divide-gray-200" style={{ tableLayout: 'fixed', width: tableWidth }}>
              <colgroup>
                {isSelectionMode && <col style={{ width: 40 }} />}
                {isColumnVisible('linkedDate') && <col style={{ width: columnWidths.linkedDate }} />}
                {isColumnVisible('leadId') && <col style={{ width: columnWidths.leadId }} />}
                {isColumnVisible('companyName') && <col style={{ width: columnWidths.companyName }} />}
                {isColumnVisible('industry') && <col style={{ width: columnWidths.industry }} />}
                {isColumnVisible('contactName') && <col style={{ width: columnWidths.contactName }} />}
                {isColumnVisible('contactNameKana') && <col style={{ width: columnWidths.contactNameKana }} />}
                {isColumnVisible('phone') && <col style={{ width: columnWidths.phone }} />}
                {isColumnVisible('contactPreferredDateTime') && <col style={{ width: columnWidths.contactPreferredDateTime }} />}
                {isColumnVisible('staffIS') && <col style={{ width: columnWidths.staffIS }} />}
                {isColumnVisible('todayCallStatus') && <col style={{ width: columnWidths.todayCallStatus }} />}
                {isColumnVisible('callCount') && <col style={{ width: columnWidths.callCount }} />}
                {isColumnVisible('callStatusToday') && <col style={{ width: columnWidths.callStatusToday }} />}
                {isColumnVisible('statusIS') && <col style={{ width: columnWidths.statusIS }} />}
                {isColumnVisible('openingDate') && <col style={{ width: columnWidths.openingDate }} />}
                {isColumnVisible('allianceRemarks') && <col style={{ width: columnWidths.allianceRemarks }} />}
                <col style={{ width: columnWidths.quickActions }} />
              </colgroup>
              <thead className="bg-gray-100 sticky top-0 z-20 shadow-sm">
                <tr>
                  {/* 選択モード時のチェックボックス列 */}
                  {isSelectionMode && (
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                      <input
                        type="checkbox"
                        checked={!!(currentCallList && selectedLeadIds.size === currentCallList.leadIds.length && currentCallList.leadIds.length > 0)}
                        onChange={(e) => {
                          if (e.target.checked && currentCallList) {
                            setSelectedLeadIds(new Set(currentCallList.leadIds))
                          } else {
                            setSelectedLeadIds(new Set())
                          }
                        }}
                        className="rounded"
                        title="全選択/全解除"
                      />
                    </th>
                  )}
                  {isColumnVisible('linkedDate') && (
                  <th
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.linkedDate, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="連携日でソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'linkedDate'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'linkedDate', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('linkedDate')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>連携日</span>
                      <SortIcons active={sortConfig?.key === 'linkedDate' ? sortConfig.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('linkedDate', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  {isColumnVisible('leadId') && (
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.leadId, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="リードIDでソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'leadId'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'leadId', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('leadId')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>リードID</span>
                      <SortIcons active={sortConfig?.key === 'leadId' ? sortConfig.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('leadId', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  {isColumnVisible('companyName') && (
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.companyName, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="会社名でソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'companyName'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'companyName', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('companyName')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>会社名</span>
                      <SortIcons active={sortConfig?.key === 'companyName' ? sortConfig.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('companyName', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  {isColumnVisible('industry') && (
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.industry, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="業種でソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'industry'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'industry', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('industry')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>業種</span>
                      <SortIcons active={sortConfig?.key === 'industry' ? sortConfig?.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('industry', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  {isColumnVisible('contactName') && (
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.contactName, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="氏名でソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'contactName'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'contactName', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('contactName')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>氏名</span>
                      <SortIcons active={sortConfig?.key === 'contactName' ? sortConfig.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('contactName', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  {isColumnVisible('contactNameKana') && (
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.contactNameKana, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="ふりがなでソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'contactNameKana'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'contactNameKana', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('contactNameKana')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>ふりがな</span>
                      <SortIcons active={sortConfig?.key === 'contactNameKana' ? sortConfig.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('contactNameKana', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  {isColumnVisible('phone') && (
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none"
                    style={{ width: columnWidths.phone, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="電話番号でソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'phone'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'phone', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('phone')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>電話番号</span>
                      <SortIcons active={sortConfig?.key === 'phone' ? sortConfig.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('phone', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  {isColumnVisible('contactPreferredDateTime') && (
                  <th
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.contactPreferredDateTime, minWidth: 20, maxWidth: 150 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="連絡希望日時でソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'contactPreferredDateTime'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'contactPreferredDateTime', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('contactPreferredDateTime')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>連絡希望日時</span>
                      <SortIcons active={sortConfig?.key === 'contactPreferredDateTime' ? sortConfig?.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('contactPreferredDateTime', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  {/* 連絡希望日時の右に区切り線（視認性向上） */}
                  {/* 担当IS - 本日の左に配置 */}
                  {isColumnVisible('staffIS') && (
                  <th
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.staffIS, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="担当ISでソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'staffIS'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'staffIS', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('staffIS')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>担当IS</span>
                      <SortIcons active={sortConfig?.key === 'staffIS' ? sortConfig.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('staffIS', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  {isColumnVisible('todayCallStatus') && (
                  <th
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.todayCallStatus, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="本日でソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'todayCallStatus'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'todayCallStatus', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('todayCallStatus')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>本日</span>
                      <SortIcons active={sortConfig?.key === 'todayCallStatus' ? sortConfig.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('todayCallStatus', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  {/* 架電回数 - 架電中の位置に配置 */}
                  {isColumnVisible('callCount') && (
                  <th
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.callCount, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="架電回数でソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'callCount'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'callCount', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('callCount')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>架電回数</span>
                      <SortIcons active={sortConfig?.key === 'callCount' ? sortConfig.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('callCount', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  {isColumnVisible('callStatusToday') && (
                  <th
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.callStatusToday, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="架電結果でソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'callStatusToday'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'callStatusToday', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('callStatusToday')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>架電結果</span>
                      <SortIcons active={sortConfig?.key === 'callStatusToday' ? sortConfig.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('callStatusToday', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  {isColumnVisible('statusIS') && (
                  <th
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.statusIS, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="リード状態でソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'statusIS'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'statusIS', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('statusIS')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>リード状態</span>
                      <SortIcons active={sortConfig?.key === 'statusIS' ? sortConfig.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('statusIS', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  {/* 架電中列は削除 - 以下はコメントアウト */}
                  {false && isColumnVisible('status') && (
                  <th
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.status, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="架電中でソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'status'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'status', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('status')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>架電中</span>
                      <SortIcons active={sortConfig?.key === 'status' ? sortConfig?.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('status', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  {/* 旧callCount位置 - 削除済み（上に移動） */}
                  {false && isColumnVisible('callCount') && (
                  <th
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.callCount, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="架電回数でソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'callCount'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'callCount', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('callCount')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>架電回数</span>
                      <SortIcons active={sortConfig?.key === 'callCount' ? sortConfig?.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('callCount', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  {/* NOTE: 業種カラムが重複していたため非表示（thead/tbodyの列ズレ防止） */}
                  {false && ( <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.industry, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="業種でソート"
                      onClick={() => {
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'industry'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'industry', direction: nextDirection }
                        })
                      }}
                    >
                      <span>業種</span>
                      <SortIcons active={sortConfig?.key === 'industry' ? sortConfig?.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('industry', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th> )}
                  {isColumnVisible('openingDate') && (
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                    style={{ width: columnWidths.openingDate, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="開業時期でソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'openingDate'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'openingDate', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('openingDate')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>開業時期</span>
                      <SortIcons active={sortConfig?.key === 'openingDate' ? sortConfig.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('openingDate', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  {/* NOTE: 連絡希望日時は「電話番号の横」へ移動 */}
                  {false && isColumnVisible('contactPreferredDateTime') && (
                    <th
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none border-r border-gray-400"
                      style={{ width: columnWidths.contactPreferredDateTime, minWidth: 20 }}
                    >
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                        aria-label="連絡希望日時でソート"
                        onClick={(e) => {
                          if ((e as any).detail > 1) return
                          setSortConfig(prev => {
                            const isSame = prev?.key === 'contactPreferredDateTime'
                            const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                            return { key: 'contactPreferredDateTime', direction: nextDirection }
                          })
                        }}
                        onDoubleClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          hideColumn('contactPreferredDateTime')
                        }}
                        title="ダブルクリックで非表示"
                      >
                        <span>連絡希望日時</span>
                        <SortIcons active={sortConfig?.key === 'contactPreferredDateTime' ? sortConfig?.direction : undefined} />
                      </button>
                      <div
                        className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                        onMouseDown={(e) => handleResizeStart('contactPreferredDateTime', e)}
                        style={{ transform: 'translateX(50%)' }}
                      />
                    </th>
                  )}
                  {isColumnVisible('allianceRemarks') && (
                  <th 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none"
                    style={{ width: columnWidths.allianceRemarks, minWidth: 20 }}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full select-none cursor-pointer hover:bg-gray-50"
                      aria-label="連携元備考でソート"
                      onClick={(e) => {
                        if ((e as any).detail > 1) return
                        setSortConfig(prev => {
                          const isSame = prev?.key === 'allianceRemarks'
                          const nextDirection: SortDirection = isSame && prev?.direction === 'asc' ? 'desc' : 'asc'
                          return { key: 'allianceRemarks', direction: nextDirection }
                        })
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hideColumn('allianceRemarks')
                      }}
                      title="ダブルクリックで非表示"
                    >
                      <span>連携元備考</span>
                      <SortIcons active={sortConfig?.key === 'allianceRemarks' ? sortConfig.direction : undefined} />
                    </button>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('allianceRemarks', e)}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  </th>
                  )}
                  <th
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative select-none sticky right-0 z-30 bg-gray-100 border-l border-gray-300"
                    style={{ width: columnWidths.quickActions, minWidth: 180 }}
                  >
                    クイックボタン
                    <div
                      className="absolute left-0 top-0 bottom-0 w-6 cursor-col-resize z-20"
                      onMouseDown={(e) => handleResizeStart('quickActions', e)}
                      style={{ transform: 'translateX(-50%)' }}
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={`loading-${i}`}>
                      {isSelectionMode && <td className="px-2 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-4"></div></td>}
                      {[...Array(visibleColumnsCount)].map((_, j) => (
                        <td key={`loading-${i}-${j}`} className="px-4 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumnsCount + (isSelectionMode ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                      架電データがありません
                    </td>
                  </tr>
                ) : (
                  displayRecords.map((record, index) => (
                    <tr 
                      key={record.leadId || `call-${index}`}
                      data-lead-id={record.leadId}
                      onClick={() => handleRowClick(record)}
                      className={[
                        'cursor-pointer',
                        (() => {
                          const callResult = String(record.callStatusToday || record.resultContactStatus || '').trim()
                          const isConnected = callResult === '通電'
                          const isNoAnswer = /^不通\d*$/.test(callResult) || callResult === '不通'
                          
                          // 通電（完了/未完了問わず）は薄いターコイズブルー
                          if (isConnected) return 'bg-cyan-50 hover:bg-cyan-100'
                          // 完了で不通は薄いグレー
                          if (record.todayCallStatus === '済' && isNoAnswer) return 'bg-gray-50 opacity-80 hover:opacity-100'
                          // 完了（その他）は薄いグレー
                          if (record.todayCallStatus === '済') return 'bg-gray-50 opacity-80 hover:opacity-100'
                          // 不通（未終了）は薄いブルー
                          if (isNoAnswer) return 'bg-blue-50 hover:bg-blue-100'
                          // 架電中（開始のみ）は薄いグリーン
                          if (record.status === '架電中') return 'bg-green-50 hover:bg-green-100'
                          return 'hover:bg-gray-50'
                        })(),
                        isSelectionMode && selectedLeadIds.has(record.leadId) ? 'bg-red-50' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      {/* 選択モード時のチェックボックス列 */}
                      {isSelectionMode && (
                        <td className="px-2 py-4 text-center w-10" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedLeadIds.has(record.leadId)}
                            onChange={(e) => {
                              const newSet = new Set(selectedLeadIds)
                              if (e.target.checked) {
                                newSet.add(record.leadId)
                              } else {
                                newSet.delete(record.leadId)
                              }
                              setSelectedLeadIds(newSet)
                            }}
                            className="rounded"
                          />
                        </td>
                      )}
                      {isColumnVisible('linkedDate') && (
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap truncate" style={{ width: columnWidths.linkedDate, minWidth: 20 }} title={formatLinkedDateYYMMDD(record.linkedDate)}>
                          {formatLinkedDateYYMMDD(record.linkedDate)}
                        </td>
                      )}
                      {isColumnVisible('leadId') && (
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap truncate" style={{ width: columnWidths.leadId, minWidth: 20 }} title={record.leadId}>
                          {record.leadId}
                        </td>
                      )}
                      {isColumnVisible('companyName') && (
                        <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap truncate" style={{ width: columnWidths.companyName, minWidth: 20 }} title={record.companyName}>
                          {record.companyName}
                        </td>
                      )}
                      {isColumnVisible('industry') && (
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap truncate" style={{ width: columnWidths.industry, minWidth: 20 }} title={record.industry || '-'}>
                          {record.industry || '-'}
                        </td>
                      )}
                      {isColumnVisible('contactName') && (
                        <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap" style={{ width: columnWidths.contactName, minWidth: 20 }} title={record.contactName}>
                          {record.contactName}
                        </td>
                      )}
                      {isColumnVisible('contactNameKana') && (
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap truncate" style={{ width: columnWidths.contactNameKana, minWidth: 20 }} title={record.contactNameKana || '-'}>
                          {record.contactNameKana || '-'}
                        </td>
                      )}
                      {isColumnVisible('phone') && (
                        <td
                          className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap"
                          style={{ width: columnWidths.phone, minWidth: 20 }}
                          title={record.phone || ''}
                        >
                          {record.phone}
                        </td>
                      )}
                      {isColumnVisible('contactPreferredDateTime') && (
                        <td
                          className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap truncate border-r border-gray-300"
                          style={{ width: columnWidths.contactPreferredDateTime, minWidth: 20, maxWidth: 150 }}
                          title={record.contactPreferredDateTime || ''}
                        >
                          {record.contactPreferredDateTime || '-'}
                        </td>
                      )}
                      {/* 担当IS - 本日の左に配置 */}
                      {isColumnVisible('staffIS') && (
                        <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap truncate" style={{ width: columnWidths.staffIS, minWidth: 20 }} title={record.staffIS || '-'}>
                          {record.staffIS || '-'}
                        </td>
                      )}
                      {isColumnVisible('todayCallStatus') && (
                        <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap truncate" style={{ width: columnWidths.todayCallStatus, minWidth: 20 }}>
                          {record.todayCallStatus === '済' && isDateToday(record.endedAt) ? '完了' : '-'}
                        </td>
                      )}
                      {/* 架電回数 - 架電中の位置に配置 */}
                      {isColumnVisible('callCount') && (
                        <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap truncate" style={{ width: columnWidths.callCount, minWidth: 20 }}>
                          {(() => {
                            const count = record.callCount ?? 0
                            const callResult = String(record.callStatusToday || record.resultContactStatus || '').trim()
                            const isConnected = callResult === '通電'
                            const sec = Number((record as any).lastConnectedDurationSeconds)
                            const fallbackSec =
                              record.connectedAt && record.endedAt
                                ? Math.max(
                                    0,
                                    Math.floor(
                                      (new Date(String(record.endedAt)).getTime() - new Date(String(record.connectedAt)).getTime()) /
                                        1000
                                    )
                                  )
                                : 0
                            const durationSec = Number.isFinite(sec) && sec > 0 ? sec : fallbackSec
                            const minutes = durationSec > 0 ? Math.round(durationSec / 60) : 0
                            return (
                              <span className="inline-flex items-center gap-2">
                                <span className="tabular-nums">{count}</span>
                                {isConnected && minutes > 0 && (
                                  <span className="text-xs text-gray-500 tabular-nums">({minutes}分)</span>
                                )}
                              </span>
                            )
                          })()}
                        </td>
                      )}
                      {isColumnVisible('callStatusToday') && (
                        <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap truncate" style={{ width: columnWidths.callStatusToday, minWidth: 20 }}>
                          {(() => {
                            const statusIsText = String(record.statusIS || '').trim()
                            const isDisqualified =
                              statusIsText.startsWith('05a.') ||
                              statusIsText.includes('Disqualified') ||
                              (statusIsText.includes('対象外') && !statusIsText.includes('失注') && !statusIsText.includes('リサイクル対象外'))
                            if (isDisqualified) return 'ー'
                            return record.callStatusToday || record.resultContactStatus || (record.status === '架電中' ? '架電中' : '未架電')
                          })()}
                        </td>
                      )}
                      {isColumnVisible('statusIS') && (
                        <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap truncate" style={{ width: columnWidths.statusIS, minWidth: 20 }} title={record.statusIS || '-'}>
                          {record.statusIS || '-'}
                        </td>
                      )}
                      {/* 架電中列は削除 */}
                      {false && isColumnVisible('status') && (
                        <td className="px-4 py-4 text-sm" style={{ width: columnWidths.status, minWidth: 20 }}>
                          {record.status === '架電中' ? (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                              架電中
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      )}
                      {isColumnVisible('openingDate') && (
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap truncate" style={{ width: columnWidths.openingDate, minWidth: 20 }} title={record.openingDate || '-'}>
                          {record.openingDate || '-'}
                        </td>
                      )}
                      {/* NOTE: 連絡希望日時は「電話番号の横」へ移動 */}
                      {false && isColumnVisible('contactPreferredDateTime') && (
                        <td className="px-4 py-4 text-sm text-gray-500" style={{ width: columnWidths.contactPreferredDateTime, minWidth: 20 }}>
                          {record.contactPreferredDateTime || '-'}
                        </td>
                      )}
                      {isColumnVisible('allianceRemarks') && (
                        <td 
                          className="px-4 py-4 text-sm text-gray-500" 
                          style={{ 
                            width: columnWidths.allianceRemarks, 
                            minWidth: 20, 
                            maxWidth: columnWidths.allianceRemarks,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={record.allianceRemarks || '-'}
                        >
                          {record.allianceRemarks || '-'}
                        </td>
                      )}
                      <td
                        className="px-4 py-3 sticky right-0 z-10 bg-white border-l border-gray-200"
                        style={{ width: columnWidths.quickActions, minWidth: 180 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-nowrap gap-2 justify-center">
                          {(() => {
                            const isCalling = record.status === '架電中'
                            const callResult = record.callStatusToday || record.resultContactStatus || ''
                            const isConnected = callResult === '通電'
                            // 商談獲得のリードは論理的に終了状態として扱う
                            const statusIS = String(record.statusIS || '')
                            const isAppointment = statusIS.includes('商談獲得')
                            const isEnded = record.todayCallStatus === '済' || isAppointment
                            const hasNoAnswerAttempt = /^不通\d+$/.test(String(callResult).trim())

                            const base = 'px-2 py-1 text-xs rounded transition-colors whitespace-nowrap shrink-0'
                            const grayInactive = `${base} bg-gray-100 text-gray-800 hover:bg-gray-200`
                            const grayActive = `${base} bg-gray-900 text-white hover:bg-gray-800`
                            const grayMedium = `${base} bg-gray-400 text-white hover:bg-gray-500`
                            const primaryInactive = `${base} bg-primary-100 text-primary-800 border border-primary-200 hover:bg-primary-200`
                            const primaryActive = `${base} bg-primary-600 text-white hover:bg-primary-700`
                            const clearBtn = `${base} px-1.5 min-w-6 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`
                            const connectedInactiveLight = `${base} bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-300`
                            const connectedInactiveAfterNoAnswer = `${base} bg-gray-300 text-gray-900 border border-gray-400 hover:bg-gray-400`
                            const connectedInactive = hasNoAnswerAttempt ? connectedInactiveAfterNoAnswer : connectedInactiveLight

                            return (
                              <>
                          <button
                            type="button"
                            className={isCalling && !isEnded ? grayActive : grayInactive}
                            onClick={(e) => handleQuickCallStart(record, e)}
                          >
                            開始
                          </button>
                          <button
                            type="button"
                            className={hasNoAnswerAttempt ? grayMedium : grayInactive}
                            onClick={(e) => handleQuickNoAnswer(record, e)}
                          >
                            不通
                          </button>
                          <button
                            type="button"
                            className={isConnected ? primaryActive : connectedInactive}
                            onClick={(e) => handleQuickConnected(record, e)}
                          >
                            通電
                          </button>
                          {/* NOTE: クイックは「架電アクション状態遷移」に寄せる方針のため、アポは一旦外す（詳細で実施） */}
                          {false && (
                            <button
                              type="button"
                              className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700"
                              onClick={async (e) => {
                                e.stopPropagation()
                                const nowDate = getLocalDateString()
                                await updateMutation.mutateAsync({
                                  leadId: record.leadId,
                                  updates: {
                                    status: '03.アポイント獲得済',
                                    appointmentDate: nowDate,
                                    todayCallStatus: '済',
                                  },
                                })
                              }}
                            >
                              アポ
                            </button>
                          )}
                          <button
                            type="button"
                            className={isEnded ? grayActive : grayInactive}
                            onClick={(e) => handleQuickEnd(record, e)}
                          >
                            終了
                          </button>
                          <button
                            type="button"
                            className={clearBtn}
                            onClick={(e) => handleQuickClear(record, e)}
                            title="軽いクリア（架電中/通電のみ）"
                            aria-label="軽いクリア"
                          >
                            C
                          </button>
                              </>
                            )
                          })()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {requiredInputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-lg border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="text-sm font-semibold text-gray-900">{requiredInputModal.title}</div>
            </div>
            <div className="px-5 py-4">
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{requiredInputModal.message}</div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => setRequiredInputModal(null)}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {settingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-lg border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="text-sm font-semibold text-gray-900">
                {settingsModal.type === 'goalCallCount'
                  ? '目標架電数の設定'
                  : settingsModal.type === 'goalDealCount'
                    ? '目標商談獲得数の設定'
                    : settingsModal.type === 'workMinutes'
                      ? '架電稼働時間（分）の修正'
                      : '稼働予定時間（分）の設定'}
              </div>
            </div>
            <div className="px-5 py-4">
              <label className="block text-sm text-gray-700 mb-2">
                {settingsModal.type === 'goalCallCount'
                  ? '目標架電数'
                  : settingsModal.type === 'goalDealCount'
                    ? '目標商談獲得数'
                    : settingsModal.type === 'workMinutes'
                      ? '架電稼働時間（分）'
                      : '稼働予定時間（分）'}
              </label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={settingsValue}
                onChange={(e) => setSettingsValue(e.target.value)}
                className="input w-full"
                placeholder={
                  settingsModal.type === 'plannedWorkHours'
                    ? '例: 360（分）'
                    : settingsModal.type === 'goalDealCount'
                      ? '例: 10'
                      : '例: 120'
                }
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => setSettingsModal(null)}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                  onClick={() => {
                    const raw = String(settingsValue || '').trim()
                    const n = raw === '' ? null : Number(raw)
                    if (raw !== '' && (!Number.isFinite(n) || (n as number) < 0)) {
                      alert('0以上の数値を入力してください')
                      return
                    }
                    // 架電稼働時間の修正の場合
                    if (settingsModal.type === 'workMinutes') {
                      if (n !== null) {
                        const targetMs = Math.floor(n as number) * 60000
                        // 現在のタイマー計算値（オフセットなし）を取得
                        const { status, startedAtMs, endedAtMs, pausedAtMs, pausedTotalMs } = callTimerState
                        let currentWorkMsWithoutOffset = 0
                        if (startedAtMs && status !== 'idle') {
                          const endMs = status === 'ended' && endedAtMs ? endedAtMs : nowMs
                          const totalMs = Math.max(0, endMs - startedAtMs)
                          const pauseExtraMs = status === 'paused' && pausedAtMs ? Math.max(0, nowMs - pausedAtMs) : 0
                          const pauseMs = Math.max(0, pausedTotalMs + pauseExtraMs)
                          currentWorkMsWithoutOffset = Math.max(0, totalMs - pauseMs)
                        }
                        // 新しいオフセット = 目標値 - 現在値（オフセットなし）
                        setWorkMsOffset(targetMs - currentWorkMsWithoutOffset)
                      } else {
                        setWorkMsOffset(0)
                      }
                      setSettingsModal(null)
                      return
                    }

                    const nextGoalCallCount =
                      settingsModal.type === 'goalCallCount' ? (n === null ? null : Math.floor(n as number)) : goalCallCount
                    const nextGoalDealCount =
                      settingsModal.type === 'goalDealCount' ? (n === null ? null : Math.floor(n as number)) : goalDealCount
                    const nextPlannedWorkHours =
                      settingsModal.type === 'plannedWorkHours' ? (n === null ? null : Math.floor(n as number)) : plannedWorkHours

                    setGoalCallCount(nextGoalCallCount)
                    setGoalDealCount(nextGoalDealCount)
                    setPlannedWorkHours(nextPlannedWorkHours)

                    // DBへ履歴保存（失敗してもUIは継続）
                    void safePostJson('/api/call-ops/targets', getCurrentTargetsSnapshot({
                      goalCallCount: nextGoalCallCount,
                      goalDealCount: nextGoalDealCount,
                      plannedWorkHours: nextPlannedWorkHours,
                    }))
                    setSettingsModal(null)
                  }}
                >
                  保存
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                空欄で保存すると未設定に戻ります。
              </div>
            </div>
          </div>
        </div>
      )}

      {isPanelOpen && selectedRecord && (
        <CallDetailPanel
          record={selectedRecord}
          onClose={handlePanelClose}
          onSave={handlePanelSave}
          isSaving={updateMutation.isPending}
        />
      )}

      {/* 架電リスト作成モーダル（Phase 1） */}
      <CallListCreateModal
        isOpen={isCallListModalOpen}
        onClose={() => setIsCallListModalOpen(false)}
        onCreate={async (conditions, name, isShared, staffIS) => {
          await createCallListMutation.mutateAsync({ conditions, name, isShared, staffIS })
        }}
      />

      {/* リード個別登録モーダル */}
      <LeadRegisterModal
        isOpen={isLeadRegisterModalOpen}
        onClose={() => setIsLeadRegisterModalOpen(false)}
        isSubmitting={isLeadRegistering}
        onSubmit={async (formData: LeadFormData) => {
          setIsLeadRegistering(true)
          try {
            const response = await fetch('/api/calls', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                leadId: formData.leadId,
                leadSource: formData.leadSource,
                companyName: formData.companyName,
                contactName: formData.contactName,
                contactNameKana: formData.contactNameKana,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                industry: formData.industry,
                openingDateOriginal: formData.openingDateOriginal,
                contactPreferredDateTime: formData.contactPreferredDateTime,
                allianceRemarks: formData.allianceRemarks,
                linkedDate: new Date().toISOString().split('T')[0],
                status: '未架電',
              }),
            })
            if (!response.ok) {
              const error = await response.json()
              throw new Error(error.details || error.error || '登録に失敗しました')
            }
            // 成功したらデータを再取得
            await queryClient.invalidateQueries({ queryKey: ['calls'] })
            alert('リードを登録しました')
          } finally {
            setIsLeadRegistering(false)
          }
        }}
      />
    </div>
  )
}







