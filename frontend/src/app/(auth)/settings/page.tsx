'use client'

import { useState, useEffect } from 'react'
import { DropdownSettings, DropdownOption, DEFAULT_SETTINGS } from '@/lib/dropdownSettings'


export default function SettingsPage() {
  const [settings, setSettings] = useState<DropdownSettings | null>(null)
  const [originalSettings, setOriginalSettings] = useState<DropdownSettings | null>(null)
  const [activeSection, setActiveSection] = useState<string>('call')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // ローカルストレージから設定を読み込む
    const saved = localStorage.getItem('sfa-dropdown-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings(parsed)
        setOriginalSettings(parsed)
      } catch (e) {
        console.error('Failed to load settings:', e)
        setSettings(DEFAULT_SETTINGS)
        setOriginalSettings(DEFAULT_SETTINGS)
      }
    } else {
      setSettings(DEFAULT_SETTINGS)
      setOriginalSettings(DEFAULT_SETTINGS)
    }
  }, [])

  // 設定が読み込まれるまで表示しない
  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!settings) return
    localStorage.setItem('sfa-dropdown-settings', JSON.stringify(settings))
    setOriginalSettings(settings)
    // 同じウィンドウ内の他のコンポーネントに通知
    window.dispatchEvent(new Event('storage'))
    setIsEditing(false)
    alert('設定を保存しました')
  }

  const handleCancel = () => {
    if (originalSettings) {
      setSettings(originalSettings)
    }
    setIsEditing(false)
  }

  const addOption = (field: keyof DropdownSettings, option: DropdownOption) => {
    setSettings(prev => ({
      ...prev,
      [field]: [...prev[field], option],
    }))
  }

  const removeOption = (field: keyof DropdownSettings, index: number) => {
    setSettings(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const updateOption = (field: keyof DropdownSettings, index: number, option: DropdownOption) => {
    setSettings(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? option : item),
    }))
  }

  const sections = [
    {
      id: 'call',
      title: '架電管理',
      fields: [
        { key: 'staffIS', label: '担当IS' },
        { key: 'statusIS', label: 'ISステータス' },
        { key: 'cannotContactReason', label: '対応不可/失注理由' },
        { key: 'recyclePriority', label: 'リサイクル優先度' },
        { key: 'resultContactStatus', label: '結果/コンタクト状況' },
      ],
    },
    {
      id: 'action',
      title: 'アクション管理',
      fields: [
        { key: 'actionOutsideCall', label: '架電外アクション' },
        { key: 'nextActionContent', label: 'ネクストアクション内容' },
        { key: 'nextActionSupplement', label: 'ネクストアクション補足' },
        { key: 'nextActionCompleted', label: '実施' },
      ],
    },
    {
      id: 'deal',
      title: '商談情報',
      fields: [
        { key: 'dealStaffFS', label: '商談担当FS' },
        { key: 'dealResult', label: '商談結果' },
        { key: 'lostReasonFS', label: '失注理由（FS→IS）' },
      ],
    },
    {
      id: 'dealManagement',
      title: '商談管理',
      fields: [
        { key: 'dealPhase', label: '商談フェーズ' },
        { key: 'rankEstimate', label: '確度ヨミ' },
        { key: 'rankChange', label: '確度変化' },
      ],
    },
  ]

  return (
    <div>
      {/* 固定ヘッダー */}
      <div className="sticky top-0 z-10 bg-white pb-4 border-b border-gray-200 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">設定</h1>
            <p className="mt-1 text-sm text-gray-500">ドロップダウンの選択項目を管理します</p>
          </div>
          {/* アクションボタン */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    setSettings(DEFAULT_SETTINGS)
                    setOriginalSettings(DEFAULT_SETTINGS)
                    localStorage.removeItem('sfa-dropdown-settings')
                    window.dispatchEvent(new Event('storage'))
                    setIsEditing(false)
                    alert('設定をリセットしました')
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  リセット
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#0083a0' }}
                >
                  保存
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setSettings(DEFAULT_SETTINGS)
                    setOriginalSettings(DEFAULT_SETTINGS)
                    localStorage.removeItem('sfa-dropdown-settings')
                    window.dispatchEvent(new Event('storage'))
                    alert('設定をリセットしました')
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  リセット
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#0083a0' }}
                >
                  編集
                </button>
              </>
            )}
          </div>
        </div>

        {/* セクションタブ */}
        <div className="bg-white">
          <nav className="flex -mb-px">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === section.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={activeSection === section.id ? { borderBottomColor: '#0083a0' } : {}}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="mt-6">
        <div className="card">
          <div className="p-6">
          {sections.map((section) => (
            <div key={section.id} className={activeSection === section.id ? '' : 'hidden'}>
              <div className="space-y-6">
                {section.fields.map((field) => (
                  <div key={field.key} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">{field.label}</h3>
                    <div className="space-y-2">
                      {(settings[field.key as keyof DropdownSettings] || []).map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <input
                                type="text"
                                value={option.value}
                                onChange={(e) => updateOption(
                                  field.key as keyof DropdownSettings,
                                  index,
                                  { ...option, value: e.target.value }
                                )}
                                className="flex-1 input text-sm"
                                placeholder="値"
                              />
                              <input
                                type="text"
                                value={option.label}
                                onChange={(e) => updateOption(
                                  field.key as keyof DropdownSettings,
                                  index,
                                  { ...option, label: e.target.value }
                                )}
                                className="flex-1 input text-sm"
                                placeholder="表示名"
                              />
                              <button
                                onClick={() => removeOption(field.key as keyof DropdownSettings, index)}
                                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                削除
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="flex-1 px-3 py-2 text-sm bg-gray-50 rounded border border-gray-200 text-gray-700">
                                {option.value}
                              </div>
                              <div className="flex-1 px-3 py-2 text-sm bg-gray-50 rounded border border-gray-200 text-gray-700">
                                {option.label}
                              </div>
                              <div className="w-16"></div>
                            </>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <button
                          onClick={() => addOption(field.key as keyof DropdownSettings, { value: '', label: '' })}
                          className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                          + 項目を追加
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  )
}
