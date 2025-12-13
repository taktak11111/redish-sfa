'use client'

import { useState, useEffect } from 'react'
import { DropdownSettings, DropdownOption, DEFAULT_SETTINGS } from '@/lib/dropdownSettings'

// スプレッドシート連携設定の型
interface SpreadsheetConfig {
  spreadsheetId: string
  sheetName: string
  columnMappings: ColumnMapping[]
  lastImportedAt?: string
}

interface ColumnMapping {
  spreadsheetColumn: string // スプレッドシートの列名（A, B, C...）
  spreadsheetHeader: string // スプレッドシートのヘッダー名
  targetField: string // call_recordsのフィールド名
}

// マッピング可能なフィールド一覧
const MAPPABLE_FIELDS = [
  { key: 'leadSource', label: 'リードソース', required: false },
  { key: 'linkedDate', label: '連携日', required: false },
  { key: 'industry', label: '業種', required: false },
  { key: 'companyName', label: '会社名/店舗名', required: true },
  { key: 'contactName', label: '氏名', required: true },
  { key: 'contactNameKana', label: 'ふりがな', required: false },
  { key: 'phone', label: '電話番号', required: true },
  { key: 'email', label: 'メールアドレス', required: false },
  { key: 'address', label: '住所/エリア', required: false },
  { key: 'openingDate', label: '開業時期', required: false },
  { key: 'contactPreferredDateTime', label: '連絡希望日時', required: false },
  { key: 'allianceRemarks', label: '連携元備考', required: false },
  { key: 'omcAdditionalInfo1', label: 'OMC追加情報①', required: false },
  { key: 'omcSelfFunds', label: '自己資金', required: false },
  { key: 'omcPropertyStatus', label: '物件状況', required: false },
  { key: 'amazonTaxAccountant', label: 'Amazon税理士有無', required: false },
  { key: 'meetsmoreLink', label: 'Meetsmoreリンク', required: false },
  { key: 'meetsmoreEntityType', label: 'Meetsmore法人・個人', required: false },
  { key: 'makuakePjtPage', label: 'MakuakePJT page', required: false },
  { key: 'makuakeExecutorPage', label: 'Makuake実行者page', required: false },
]

const DEFAULT_SPREADSHEET_CONFIG: SpreadsheetConfig = {
  spreadsheetId: '',
  sheetName: '',
  columnMappings: [],
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<DropdownSettings | null>(null)
  const [originalSettings, setOriginalSettings] = useState<DropdownSettings | null>(null)
  const [activeSection, setActiveSection] = useState<string>('call')
  const [isEditing, setIsEditing] = useState(false)
  
  // スプレッドシート連携用のstate
  const [spreadsheetConfig, setSpreadsheetConfig] = useState<SpreadsheetConfig>(DEFAULT_SPREADSHEET_CONFIG)
  const [spreadsheetHeaders, setSpreadsheetHeaders] = useState<string[]>([])
  const [isLoadingHeaders, setIsLoadingHeaders] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null)
  
  // ファイルアップロード用のstate
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState<'spreadsheet' | 'file'>('spreadsheet')

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
    
    // スプレッドシート設定を読み込む
    const savedSpreadsheet = localStorage.getItem('sfa-spreadsheet-config')
    if (savedSpreadsheet) {
      try {
        setSpreadsheetConfig(JSON.parse(savedSpreadsheet))
      } catch (e) {
        console.error('Failed to load spreadsheet config:', e)
      }
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
    setSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [field]: [...prev[field], option],
      }
    })
  }

  const removeOption = (field: keyof DropdownSettings, index: number) => {
    setSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }
    })
  }

  const updateOption = (field: keyof DropdownSettings, index: number, option: DropdownOption) => {
    setSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [field]: prev[field].map((item, i) => i === index ? option : item),
      }
    })
  }

  // スプレッドシートのヘッダーを取得
  const fetchSpreadsheetHeaders = async () => {
    if (!spreadsheetConfig.spreadsheetId) {
      alert('スプレッドシートIDを入力してください')
      return
    }
    
    setIsLoadingHeaders(true)
    try {
      const params = new URLSearchParams({
        spreadsheetId: spreadsheetConfig.spreadsheetId,
        sheetName: spreadsheetConfig.sheetName || 'Sheet1',
        action: 'headers',
      })
      
      const response = await fetch(`/api/spreadsheet?${params}`)
      const result = await response.json()
      
      if (result.error) {
        alert(`エラー: ${result.error}`)
        return
      }
      
      setSpreadsheetHeaders(result.headers || [])
      
      // 自動マッピング（ヘッダー名が一致するものを自動で設定）
      const autoMappings: ColumnMapping[] = result.headers.map((header: string, index: number) => {
        const columnLetter = String.fromCharCode(65 + index) // A, B, C...
        const matchedField = MAPPABLE_FIELDS.find(
          f => f.label === header || f.key.toLowerCase() === header.toLowerCase()
        )
        return {
          spreadsheetColumn: columnLetter,
          spreadsheetHeader: header,
          targetField: matchedField?.key || '',
        }
      })
      
      setSpreadsheetConfig(prev => ({
        ...prev,
        columnMappings: autoMappings,
      }))
      
    } catch (error) {
      console.error('Failed to fetch headers:', error)
      alert('ヘッダーの取得に失敗しました')
    } finally {
      setIsLoadingHeaders(false)
    }
  }

  // スプレッドシート設定を保存
  const saveSpreadsheetConfig = () => {
    localStorage.setItem('sfa-spreadsheet-config', JSON.stringify(spreadsheetConfig))
    alert('スプレッドシート設定を保存しました')
  }

  // マッピングを更新
  const updateMapping = (index: number, targetField: string) => {
    setSpreadsheetConfig(prev => ({
      ...prev,
      columnMappings: prev.columnMappings.map((m, i) =>
        i === index ? { ...m, targetField } : m
      ),
    }))
  }

  // CSVファイルをパース
  const parseCSVFile = (csvText: string): string[][] => {
    const rows: string[][] = []
    const lines = csvText.split(/\r?\n/)
    
    for (const line of lines) {
      if (line.trim() === '') continue
      
      const cells: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"'
            i++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          cells.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      cells.push(current.trim())
      rows.push(cells)
    }
    
    return rows
  }

  // ファイルを読み込んでヘッダーを取得
  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('CSVファイルを選択してください')
      return
    }
    
    setUploadedFile(file)
    setIsUploading(true)
    
    try {
      const text = await file.text()
      const rows = parseCSVFile(text)
      
      if (rows.length === 0) {
        alert('ファイルにデータがありません')
        return
      }
      
      const headers = rows[0]
      setSpreadsheetHeaders(headers)
      
      // 自動マッピング
      const autoMappings: ColumnMapping[] = headers.map((header: string, index: number) => {
        const columnLetter = String.fromCharCode(65 + index) // A, B, C...
        const matchedField = MAPPABLE_FIELDS.find(
          f => f.label === header || f.key.toLowerCase() === header.toLowerCase()
        )
        return {
          spreadsheetColumn: columnLetter,
          spreadsheetHeader: header,
          targetField: matchedField?.key || '',
        }
      })
      
      setSpreadsheetConfig(prev => ({
        ...prev,
        columnMappings: autoMappings,
      }))
      
      setUploadMode('file')
      
    } catch (error) {
      console.error('File read failed:', error)
      alert('ファイルの読み込みに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }

  // データをインポート
  const importData = async () => {
    const requiredFields = MAPPABLE_FIELDS.filter(f => f.required).map(f => f.key)
    const mappedRequiredFields = spreadsheetConfig.columnMappings
      .filter(m => requiredFields.includes(m.targetField))
      .map(m => m.targetField)
    
    const missingRequired = requiredFields.filter(f => !mappedRequiredFields.includes(f))
    if (missingRequired.length > 0) {
      const missingLabels = missingRequired
        .map(key => MAPPABLE_FIELDS.find(f => f.key === key)?.label)
        .join(', ')
      alert(`必須項目がマッピングされていません: ${missingLabels}`)
      return
    }
    
    if (!confirm('データをインポートしますか？\n既存のリードIDと重複するデータは更新されます。')) {
      return
    }
    
    setIsImporting(true)
    setImportResult(null)
    
    try {
      let response: Response
      
      if (uploadMode === 'file' && uploadedFile) {
        // ファイルアップロードの場合
        const formData = new FormData()
        formData.append('file', uploadedFile)
        formData.append('columnMappings', JSON.stringify(spreadsheetConfig.columnMappings.filter(m => m.targetField)))
        
        response = await fetch('/api/spreadsheet/upload', {
          method: 'POST',
          body: formData,
        })
      } else {
        // Google Sheetsの場合
        if (!spreadsheetConfig.spreadsheetId) {
          alert('スプレッドシートIDを入力してください')
          return
        }
        
        response = await fetch('/api/spreadsheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spreadsheetId: spreadsheetConfig.spreadsheetId,
            sheetName: spreadsheetConfig.sheetName || 'Sheet1',
            columnMappings: spreadsheetConfig.columnMappings.filter(m => m.targetField),
          }),
        })
      }
      
      const result = await response.json()
      
      if (result.error) {
        alert(`エラー: ${result.error}`)
        return
      }
      
      setImportResult({
        success: result.imported || 0,
        failed: result.failed || 0,
        errors: result.errors || [],
      })
      
      // 最終インポート日時を更新
      const updatedConfig = {
        ...spreadsheetConfig,
        lastImportedAt: new Date().toISOString(),
      }
      setSpreadsheetConfig(updatedConfig)
      localStorage.setItem('sfa-spreadsheet-config', JSON.stringify(updatedConfig))
      
    } catch (error) {
      console.error('Import failed:', error)
      alert('インポートに失敗しました')
    } finally {
      setIsImporting(false)
    }
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
    {
      id: 'spreadsheet',
      title: 'スプレッドシート連携',
      fields: [],
    },
  ]

  return (
    <div>
      {/* 固定ヘッダー */}
      <div className="sticky top-0 z-10 bg-white pb-4 border-b border-gray-200 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">設定</h1>
            <p className="mt-1 text-sm text-gray-500">
              {activeSection === 'spreadsheet' 
                ? 'アライアンス先スプレッドシートからのデータ取り込み設定'
                : 'ドロップダウンの選択項目を管理します'
              }
            </p>
          </div>
          {/* アクションボタン（ドロップダウン設定用） */}
          {activeSection !== 'spreadsheet' && (
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
          )}
        </div>

        {/* セクションタブ */}
        <div className="bg-white">
          <nav className="flex -mb-px overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeSection === section.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={activeSection === section.id ? { borderBottomColor: '#0083a0', color: '#0083a0' } : {}}
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
            {/* ドロップダウン設定セクション */}
            {sections.filter(s => s.id !== 'spreadsheet').map((section) => (
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
            
            {/* スプレッドシート連携セクション */}
            <div className={activeSection === 'spreadsheet' ? '' : 'hidden'}>
              <div className="space-y-6">
                {/* インポート方法選択 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">インポート方法</h3>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="spreadsheet"
                        checked={uploadMode === 'spreadsheet'}
                        onChange={() => {
                          setUploadMode('spreadsheet')
                          setUploadedFile(null)
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Googleスプレッドシート</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="file"
                        checked={uploadMode === 'file'}
                        onChange={() => {
                          setUploadMode('file')
                          setSpreadsheetConfig(prev => ({ ...prev, spreadsheetId: '' }))
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">CSVファイル</span>
                    </label>
                  </div>
                </div>

                {/* CSVファイルアップロード */}
                {uploadMode === 'file' && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">CSVファイルアップロード</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CSVファイルを選択 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleFileUpload(file)
                            }
                          }}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                          aria-label="CSVファイルを選択"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          1行目がヘッダー行として認識されます。Excelから「CSV UTF-8（コンマ区切り）」形式で保存してください。
                        </p>
                        {uploadedFile && (
                          <p className="mt-2 text-sm text-green-600">
                            ✓ {uploadedFile.name} を読み込みました
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* スプレッドシートID設定 */}
                {uploadMode === 'spreadsheet' && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">スプレッドシート設定</h3>
                    <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        スプレッドシートID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={spreadsheetConfig.spreadsheetId}
                        onChange={(e) => setSpreadsheetConfig(prev => ({ ...prev, spreadsheetId: e.target.value }))}
                        className="w-full input text-sm"
                        placeholder="例: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        スプレッドシートのURLから取得できます: https://docs.google.com/spreadsheets/d/<strong>ここがID</strong>/edit
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        シート名
                      </label>
                      <input
                        type="text"
                        value={spreadsheetConfig.sheetName}
                        onChange={(e) => setSpreadsheetConfig(prev => ({ ...prev, sheetName: e.target.value }))}
                        className="w-full input text-sm"
                        placeholder="Sheet1（空の場合は最初のシート）"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={fetchSpreadsheetHeaders}
                        disabled={isLoadingHeaders || !spreadsheetConfig.spreadsheetId}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                        style={{ backgroundColor: '#0083a0' }}
                      >
                        {isLoadingHeaders ? '読み込み中...' : 'ヘッダーを取得'}
                      </button>
                      <button
                        onClick={saveSpreadsheetConfig}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        設定を保存
                      </button>
                    </div>
                    </div>
                  </div>
                )}

                {/* カラムマッピング */}
                {spreadsheetConfig.columnMappings.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">カラムマッピング</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      スプレッドシートの各列をどのフィールドにマッピングするか設定してください。
                      <span className="text-red-500">*</span> は必須項目です。
                    </p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 pb-2 border-b">
                        <div>列</div>
                        <div>スプレッドシートのヘッダー</div>
                        <div>マッピング先フィールド</div>
                      </div>
                      {spreadsheetConfig.columnMappings.map((mapping, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2 items-center">
                          <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-center">
                            {mapping.spreadsheetColumn}
                          </div>
                          <div className="text-sm text-gray-700 truncate" title={mapping.spreadsheetHeader}>
                            {mapping.spreadsheetHeader}
                          </div>
                          <select
                            value={mapping.targetField}
                            onChange={(e) => updateMapping(index, e.target.value)}
                            className="input text-sm"
                            aria-label={`${mapping.spreadsheetHeader}列のマッピング先`}
                          >
                            <option value="">-- マッピングしない --</option>
                            {MAPPABLE_FIELDS.map((field) => (
                              <option key={field.key} value={field.key}>
                                {field.label}{field.required ? ' *' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* インポート実行 */}
                {spreadsheetConfig.columnMappings.length > 0 && (uploadMode === 'file' || spreadsheetConfig.spreadsheetId) && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">データインポート</h3>
                    <div className="space-y-4">
                      {spreadsheetConfig.lastImportedAt && (
                        <p className="text-sm text-gray-500">
                          最終インポート: {new Date(spreadsheetConfig.lastImportedAt).toLocaleString('ja-JP')}
                        </p>
                      )}
                      <button
                        onClick={importData}
                        disabled={isImporting}
                        className="px-6 py-3 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                        style={{ backgroundColor: '#0083a0' }}
                      >
                        {isImporting ? 'インポート中...' : 'データをインポート'}
                      </button>
                      
                      {importResult && (
                        <div className={`p-4 rounded-lg ${importResult.failed > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
                          <p className="text-sm font-medium">
                            インポート完了: {importResult.success}件成功
                            {importResult.failed > 0 && `, ${importResult.failed}件失敗`}
                          </p>
                          {importResult.errors.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-600 mb-1">エラー詳細:</p>
                              <ul className="text-xs text-red-600 list-disc list-inside max-h-32 overflow-y-auto">
                                {importResult.errors.slice(0, 10).map((err, i) => (
                                  <li key={i}>{err}</li>
                                ))}
                                {importResult.errors.length > 10 && (
                                  <li>...他 {importResult.errors.length - 10} 件</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 使い方ガイド */}
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">📖 使い方</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">📊 Googleスプレッドシートの場合:</p>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside ml-2">
                        <li>アライアンス先と共有しているスプレッドシートのIDを入力</li>
                        <li>「ヘッダーを取得」ボタンでスプレッドシートの列構成を読み込み</li>
                        <li>各列をどのフィールドにマッピングするか選択</li>
                        <li>「設定を保存」で設定を保存</li>
                        <li>「データをインポート」でリードデータを取り込み</li>
                      </ol>
                      <p className="mt-2 text-xs text-blue-600 ml-2">
                        ※ スプレッドシートは「リンクを知っている全員が閲覧可能」に設定されている必要があります
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">📁 CSVファイルの場合:</p>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside ml-2">
                        <li>CSVファイルを選択（1行目がヘッダー行として認識されます）</li>
                        <li>自動的にヘッダーが読み込まれ、マッピングが設定されます</li>
                        <li>必要に応じてマッピングを調整</li>
                        <li>「データをインポート」でリードデータを取り込み</li>
                      </ol>
                      <p className="mt-2 text-xs text-blue-600 ml-2">
                        ※ Excelから「CSV UTF-8（コンマ区切り）」形式で保存してください
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}






