export type PresetKey = 'allTime' | 'today' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'fiscalYear' | 'thisYear'

export interface DateRange {
  start: Date
  end: Date
  preset: PresetKey | 'custom'
}

export interface DateRangeFilterProps {
  /** デフォルトで選択されるプリセット */
  defaultPreset?: PresetKey
  
  /** 外部から値を制御（制御コンポーネントモード） */
  value?: DateRange | null
  
  /** 表示するプリセット（省略時は全て表示） */
  presets?: PresetKey[]
  
  /** カスタム期間入力を表示するか */
  showCustomRange?: boolean
  
  /** 会計年度の開始月（1-12、日本は4） */
  fiscalYearStart?: number
  
  /** 期間変更時のコールバック（allTime選択時はnull） */
  onChange: (range: DateRange | null) => void
  
  /** ローディング状態（外部から制御） */
  disabled?: boolean
}

export interface PresetConfig {
  key: PresetKey
  label: string
  getRange: (fiscalYearStart: number) => { start: Date; end: Date }
}
