import { PresetConfig, PresetKey } from './types'

// 今日の開始（00:00:00）
function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// 今日の終了（23:59:59）
function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

// 週の開始（月曜）
function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // 月曜を週の開始とする
  d.setDate(diff)
  return startOfDay(d)
}

// 週の終了（日曜）
function endOfWeek(date: Date): Date {
  const start = startOfWeek(date)
  const d = new Date(start)
  d.setDate(d.getDate() + 6)
  return endOfDay(d)
}

// 月の開始
function startOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  return startOfDay(d)
}

// 月の終了
function endOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return endOfDay(d)
}

// 会計年度の開始
function startOfFiscalYear(date: Date, fiscalYearStart: number): Date {
  const year = date.getMonth() + 1 >= fiscalYearStart ? date.getFullYear() : date.getFullYear() - 1
  return startOfDay(new Date(year, fiscalYearStart - 1, 1))
}

// 会計年度の終了
function endOfFiscalYear(date: Date, fiscalYearStart: number): Date {
  const start = startOfFiscalYear(date, fiscalYearStart)
  const endYear = start.getFullYear() + 1
  const endMonth = fiscalYearStart - 1
  return endOfDay(new Date(endYear, endMonth, 0))
}

export const presetConfigs: PresetConfig[] = [
  {
    key: 'today',
    label: '本日',
    getRange: () => {
      const today = new Date()
      return { start: startOfDay(today), end: endOfDay(today) }
    }
  },
  {
    key: 'thisWeek',
    label: '今週',
    getRange: () => {
      const today = new Date()
      return { start: startOfWeek(today), end: endOfWeek(today) }
    }
  },
  {
    key: 'thisMonth',
    label: '今月',
    getRange: () => {
      const today = new Date()
      return { start: startOfMonth(today), end: endOfMonth(today) }
    }
  },
  {
    key: 'lastMonth',
    label: '前月',
    getRange: () => {
      const today = new Date()
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
    }
  },
  {
    key: 'thisYear',
    label: '今年',
    getRange: () => {
      const today = new Date()
      const year = today.getFullYear()
      return { start: startOfDay(new Date(year, 0, 1)), end: endOfDay(new Date(year, 11, 31)) }
    }
  },
  {
    key: 'fiscalYear',
    label: '今年度',
    getRange: (fiscalYearStart: number) => {
      const today = new Date()
      return { start: startOfFiscalYear(today, fiscalYearStart), end: endOfFiscalYear(today, fiscalYearStart) }
    }
  },
  {
    key: 'allTime',
    label: '全期間',
    getRange: () => {
      // 全期間は特別扱い（実際にはnullを返す想定だが、フォールバック用）
      return { start: new Date(2000, 0, 1), end: new Date(2100, 11, 31) }
    }
  }
]

export function getPresetConfig(key: PresetKey): PresetConfig | undefined {
  return presetConfigs.find(p => p.key === key)
}

export function getPresetRange(key: PresetKey, fiscalYearStart: number = 4): { start: Date; end: Date } {
  const config = getPresetConfig(key)
  if (!config) {
    const today = new Date()
    return { start: startOfMonth(today), end: endOfMonth(today) }
  }
  return config.getRange(fiscalYearStart)
}
