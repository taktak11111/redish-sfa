'use client'

import { useState, useEffect } from 'react'
import { DateRangeFilterProps, DateRange, PresetKey } from './types'
import { presetConfigs, getPresetRange } from './presets'

const DEFAULT_PRESETS: PresetKey[] = ['today', 'thisWeek', 'thisMonth', 'lastMonth', 'fiscalYear', 'allTime']

export function DateRangeFilter({
  defaultPreset = 'allTime',
  value,
  presets = DEFAULT_PRESETS,
  showCustomRange = true,
  fiscalYearStart = 4,
  onChange,
  disabled = false
}: DateRangeFilterProps) {
  // 制御コンポーネントモード: valueが渡されている場合はvalueに基づいてactivePresetを決定
  const getInitialPreset = (): PresetKey | 'custom' => {
    if (value === undefined) return defaultPreset
    if (value === null) return 'allTime'
    return value.preset || 'custom'
  }
  
  const [activePreset, setActivePreset] = useState<PresetKey | 'custom'>(getInitialPreset)
  const [customStart, setCustomStart] = useState<string>('')
  const [customEnd, setCustomEnd] = useState<string>('')
  const [showCustomPanel, setShowCustomPanel] = useState(false)

  // 外部から value が変わった時に activePreset を同期
  useEffect(() => {
    if (value === undefined) return
    if (value === null) {
      setActivePreset('allTime')
    } else if (value.preset) {
      setActivePreset(value.preset)
    }
  }, [value])

  // 初期値を設定（allTimeの場合はnullを返す）
  // ※制御コンポーネントモード（valueが渡されている）の場合はスキップ
  useEffect(() => {
    if (value !== undefined) return // 制御コンポーネントモードでは初期化しない
    if (defaultPreset === 'allTime') {
      onChange(null)
    } else if (defaultPreset) {
      const range = getPresetRange(defaultPreset, fiscalYearStart)
      onChange({ ...range, preset: defaultPreset })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePresetClick = (key: PresetKey) => {
    if (disabled) return
    setActivePreset(key)
    setShowCustomPanel(false)
    
    // allTimeの場合はnullを返す（期間フィルタなし）
    if (key === 'allTime') {
      onChange(null)
    } else {
      const range = getPresetRange(key, fiscalYearStart)
      onChange({ ...range, preset: key })
    }
  }

  const handleCustomApply = () => {
    if (!customStart || !customEnd || disabled) return
    
    const start = new Date(customStart)
    start.setHours(0, 0, 0, 0)
    const end = new Date(customEnd)
    end.setHours(23, 59, 59, 999)
    
    setActivePreset('custom')
    setShowCustomPanel(false)
    onChange({ start, end, preset: 'custom' })
  }

  const filteredPresets = presetConfigs.filter(p => presets.includes(p.key))

  // 現在の期間を表示用に取得
  const getCurrentRangeDisplay = (): string => {
    if (activePreset === 'custom' && customStart && customEnd) {
      return `${customStart} 〜 ${customEnd}`
    }
    const range = getPresetRange(activePreset as PresetKey, fiscalYearStart)
    const formatDate = (d: Date) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}/${month}/${day}`
    }
    return `${formatDate(range.start)} 〜 ${formatDate(range.end)}`
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* プリセットボタン */}
      <div className="flex gap-2">
        {filteredPresets.map(preset => (
          <button
            key={preset.key}
            onClick={() => handlePresetClick(preset.key)}
            disabled={disabled}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activePreset === preset.key
                ? 'bg-[#0083a0] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* カスタム期間 */}
      {showCustomRange && (
        <div className="relative">
          <button
            onClick={() => !disabled && setShowCustomPanel(!showCustomPanel)}
            disabled={disabled}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activePreset === 'custom'
                ? 'bg-[#0083a0] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {activePreset === 'custom' ? getCurrentRangeDisplay() : 'カスタム'}
          </button>

          {/* カスタム期間パネル */}
          {showCustomPanel && (
            <div className="absolute right-0 top-full mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[300px]">
              <h4 className="text-sm font-medium text-gray-900 mb-3">カスタム期間</h4>
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <label htmlFor="dateRangeFilterCustomStart" className="block text-xs text-gray-500 mb-1">
                    開始日
                  </label>
                  <input
                    id="dateRangeFilterCustomStart"
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0083a0]"
                  />
                </div>
                <span className="text-gray-400 mt-5">〜</span>
                <div className="flex-1">
                  <label htmlFor="dateRangeFilterCustomEnd" className="block text-xs text-gray-500 mb-1">
                    終了日
                  </label>
                  <input
                    id="dateRangeFilterCustomEnd"
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0083a0]"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <button
                  onClick={() => setShowCustomPanel(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCustomApply}
                  disabled={!customStart || !customEnd}
                  className="px-3 py-1.5 text-sm bg-[#0083a0] text-white rounded hover:bg-[#006b84] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  適用
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
