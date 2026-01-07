'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DropdownSettings, DropdownOption, DEFAULT_SETTINGS } from '@/lib/dropdownSettings'
import { createClient } from '@/lib/supabase/client'

// スプレッドシート連携設定の型
interface SpreadsheetConfig {
  spreadsheetId: string
  sheetName: string
  sheetGid?: string  // シートgid（URLから取得可能。空の場合は自動検出）
  headerRow: number  // ヘッダー行（1-indexed）
  columnMappings: ColumnMapping[]
  lastImportedAt?: string
  lastSavedAt?: string  // 最終保存日時
}

// 保存済みスプレッドシート設定の型
interface SavedSpreadsheetConfig extends SpreadsheetConfig {
  id: string           // ユニークID
  name: string         // 表示名（例: TEMPOS, OMC）
  leadSourcePrefix: string  // リードソースのプレフィックス
  createdAt: string    // 作成日時
}

interface ColumnMapping {
  spreadsheetColumn: string // スプレッドシートの列名（A, B, C...）
  spreadsheetHeader: string // スプレッドシートのヘッダー名
  sampleData?: string // サンプルデータ（ヘッダー行の次の行の値）
  targetField: string // call_recordsのフィールド名
}

// インデックスから列名を生成（A, B, ..., Z, AA, AB, ..., AZ, BA, ...）
function getColumnLetter(index: number): string {
  let result = ''
  let n = index
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result
    n = Math.floor(n / 26) - 1
  }
  return result
}

// カメルケースをスネークケースに変換（データベースフィールド名用）
function camelToSnake(camel: string): string {
  // API側のFIELD_TO_SNAKEマッピングと一致させる
  const FIELD_TO_SNAKE: Record<string, string> = {
    leadId: 'lead_id',
    leadSource: 'lead_source',
    linkedDate: 'linked_date',
    industry: 'industry',
    companyName: 'company_name',
    contactName: 'contact_name',
    contactNameKana: 'contact_name_kana',
    phone: 'phone',
    email: 'email',
    address: 'address',
    openingDate: 'opening_date',
    contactPreferredDateTime: 'contact_preferred_datetime',
    allianceRemarks: 'alliance_remarks',
    omcAdditionalInfo1: 'omc_additional_info1',
    omcSelfFunds: 'omc_self_funds',
    omcPropertyStatus: 'omc_property_status',
    amazonTaxAccountant: 'amazon_tax_accountant',
    meetsmoreLink: 'meetsmore_link',
    meetsmoreEntityType: 'meetsmore_entity_type',
    makuakePjtPage: 'makuake_pjt_page',
    makuakeExecutorPage: 'makuake_executor_page',
  }
  
  // マッピングがあればそれを使用、なければ自動変換
  if (FIELD_TO_SNAKE[camel]) {
    return FIELD_TO_SNAKE[camel]
  }
  
  // 自動変換（フォールバック）
  return camel.replace(/([A-Z])/g, '_$1').toLowerCase()
}

// マッピング可能なフィールド一覧
const MAPPABLE_FIELDS = [
  { key: 'leadSource', label: 'リードソース', required: false },
  { key: 'linkedDate', label: '連携日', required: false },
  { key: 'industry', label: '業種', required: false },
  { key: 'companyName', label: '会社名/店舗名', required: false },
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
  sheetGid: '',  // 空の場合はシート名から自動検出
  headerRow: 0,  // 0 = 未設定（プレースホルダーで1を表示）
  columnMappings: [],
}

// マッピング推定関数（ヘッダー名とサンプルデータから最適なフィールドを推定）
function findBestMatch(header: string, sample: string): { key: string; label: string; required: boolean } | undefined {
  const headerLower = header.toLowerCase().trim()
  const sampleLower = sample.toLowerCase().trim()
  
  // 完全一致チェック
  for (const field of MAPPABLE_FIELDS) {
    if (field.label === header || field.key.toLowerCase() === headerLower) {
      return field
    }
  }
  
  // 部分一致チェック（ヘッダー名に含まれるキーワード）
  const keywordMatches: Array<{ field: typeof MAPPABLE_FIELDS[0]; score: number }> = []
  
  for (const field of MAPPABLE_FIELDS) {
    let score = 0
    const fieldLabelLower = field.label.toLowerCase()
    const fieldKeyLower = field.key.toLowerCase()
    
    // よくあるヘッダー名のパターンマッチング
    const patterns: Record<string, string[]> = {
      companyName: ['会社', '店舗', '企業', '法人', 'company', 'store', 'shop', '店名', '店舗名'],
      contactName: ['氏名', '名前', 'name', '姓名', 'お名前', '担当者名'],
      contactNameKana: ['ふりがな', 'フリガナ', 'カナ', 'kana', 'phonetic'],
      phone: ['電話', 'tel', 'phone', '携帯', 'mobile', '電話番号', '連絡先'],
      email: ['メール', 'mail', 'email', 'e-mail', 'アドレス'],
      address: ['住所', 'address', 'アドレス', '所在地', 'エリア', '地域'],
      openingDate: ['開業', 'オープン', 'open', '開店', '開業時期', '開業日'],
      industry: ['業種', '業界', 'industry', 'ジャンル', 'カテゴリ'],
      leadSource: ['リード', 'lead', 'ソース', 'source', '獲得', '獲得チャネル'],
      linkedDate: ['連携', 'linked', '日付', 'date', '連携日', '取得日'],
      contactPreferredDateTime: ['希望', 'preferred', '連絡', 'contact', '希望日時'],
      allianceRemarks: ['備考', 'remarks', 'メモ', 'memo', 'note', 'コメント', '連携元備考'],
    }
    
    // パターンマッチング
    if (patterns[field.key]) {
      for (const pattern of patterns[field.key]) {
        if (headerLower.includes(pattern)) {
          score += 10
          break
        }
      }
    }
    
    // ラベル名の部分一致
    if (headerLower.includes(fieldLabelLower) || fieldLabelLower.includes(headerLower)) {
      score += 5
    }
    
    // サンプルデータからの推定
    if (sampleLower) {
      // メールアドレスの検出
      if (field.key === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sample)) {
        score += 20
      }
      // 電話番号の検出（数字とハイフン）
      if (field.key === 'phone' && /[\d-]+/.test(sample) && sample.length >= 10) {
        score += 15
      }
      // 日付の検出
      if ((field.key === 'openingDate' || field.key === 'linkedDate') && /\d{4}[\/\-年]\d{1,2}[\/\-月]/.test(sample)) {
        score += 15
      }
      // 住所の検出（都道府県名など）
      if (field.key === 'address' && /[都道府県市区町村]/.test(sample)) {
        score += 10
      }
    }
    
    if (score > 0) {
      keywordMatches.push({ field, score })
    }
  }
  
  // スコアが高い順にソートして、最もマッチするものを返す
  if (keywordMatches.length > 0) {
    keywordMatches.sort((a, b) => b.score - a.score)
    return keywordMatches[0].field
  }
  
  return undefined
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<DropdownSettings | null>(null)
  const [originalSettings, setOriginalSettings] = useState<DropdownSettings | null>(null)
  const [activeSection, setActiveSection] = useState<string>('call')
  const [spreadsheetSubTab, setSpreadsheetSubTab] = useState<'settings' | 'list' | 'columns' | 'data'>('settings')
  const [showUnmappedColumns, setShowUnmappedColumns] = useState(false)
  const [expandedSheets, setExpandedSheets] = useState<Set<string>>(new Set())
  const [isEditing, setIsEditing] = useState(false)
  
  // NextAuthセッションを取得
  const { data: session, status: sessionStatus } = useSession()
  
  // スプレッドシート連携用のstate
  const [spreadsheetConfig, setSpreadsheetConfig] = useState<SpreadsheetConfig>(DEFAULT_SPREADSHEET_CONFIG)
  const [spreadsheetHeaders, setSpreadsheetHeaders] = useState<string[]>([])
  const [isLoadingHeaders, setIsLoadingHeaders] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importingConfigId, setImportingConfigId] = useState<string | null>(null) // 取得中の設定ID
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null)
  const [lastImportResults, setLastImportResults] = useState<Record<string, { success: number; failed: number; time: string }>>({}) // 各設定の最終取得結果
  
  // ファイルアップロード用のstate
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState<'spreadsheet' | 'file'>('spreadsheet')
  
  // 設定の保存状態
  const [isConfigSaved, setIsConfigSaved] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  
  // ヘッダー取得済み状態
  const [isHeadersFetched, setIsHeadersFetched] = useState(false)
  
  // マッピング確定状態
  const [isMappingConfirmed, setIsMappingConfirmed] = useState(false)
  
  // 保存済みスプレッドシート設定の一覧
  const [savedConfigs, setSavedConfigs] = useState<SavedSpreadsheetConfig[]>([])
  const [isTableMissing, setIsTableMissing] = useState(false)
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null)
  const [newConfigName, setNewConfigName] = useState('')
  const [newLeadSourcePrefix, setNewLeadSourcePrefix] = useState('')
  
  // マッピング結果表示用のモーダル
  const [viewingMappingConfig, setViewingMappingConfig] = useState<SavedSpreadsheetConfig | null>(null)
  
  // 連携データ表示用のstate
  const [importedRecords, setImportedRecords] = useState<any[]>([])
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)
  const [recordsFilter, setRecordsFilter] = useState<string>('all') // リードソースでフィルタ

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
    
    // スプレッドシート設定を読み込む（現在編集中の設定）
    // 注意: 読み込み時は常に「未保存」「未取得」状態として扱う
    const savedSpreadsheet = localStorage.getItem('sfa-spreadsheet-config')
    if (savedSpreadsheet) {
      try {
        const config = JSON.parse(savedSpreadsheet)
        
        // 重複マッピングを自動解消（最初に出現したものを優先）
        if (config.columnMappings && Array.isArray(config.columnMappings)) {
          const usedFields = new Set<string>()
          config.columnMappings = config.columnMappings.map((m: { targetField?: string }) => {
            if (m.targetField && usedFields.has(m.targetField)) {
              return { ...m, targetField: '' }
            }
            if (m.targetField) {
              usedFields.add(m.targetField)
            }
            return m
          })
        }
        
        setSpreadsheetConfig(config)
        // 読み込み時は明示的に未保存・未取得状態に設定
        setIsConfigSaved(false)
        setIsHeadersFetched(false)
        setIsMappingConfirmed(false)
      } catch (e) {
        console.error('Failed to load spreadsheet config:', e)
      }
    }
    // 初期状態（localStorageに設定がない場合）も明示的に未保存・未取得状態に設定
    setIsConfigSaved(false)
    setIsHeadersFetched(false)
    setIsMappingConfirmed(false)
    
    // 保存済みスプレッドシート設定の一覧を読み込む（APIルート経由）
    const loadSavedConfigsFromDB = async () => {
      try {
        // APIルートを使用してデータベースから取得
        const response = await fetch('/api/spreadsheet/configs')
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Failed to load configs from API:', errorData)
          
          // エラーの場合はlocalStorageから読み込む
          const savedConfigsList = localStorage.getItem('sfa-saved-spreadsheet-configs')
          if (savedConfigsList) {
            try {
              setSavedConfigs(JSON.parse(savedConfigsList))
            } catch (e) {
              console.error('Failed to load saved configs from localStorage:', e)
            }
          }
          return
        }
        
        const { configs: data } = await response.json()
        
        // localStorageからも読み込み、マージする
        const savedConfigsList = localStorage.getItem('sfa-saved-spreadsheet-configs')
        const localConfigs: SavedSpreadsheetConfig[] = savedConfigsList ? JSON.parse(savedConfigsList) : []
        
        if (data && data.length > 0) {
          // データベースの形式をSavedSpreadsheetConfig形式に変換
          const dbConfigs: SavedSpreadsheetConfig[] = data.map((row: any) => ({
            id: row.id,
            name: row.name,
            leadSourcePrefix: row.lead_source_prefix,
            spreadsheetId: row.spreadsheet_id,
            sheetName: row.sheet_name,
            sheetGid: row.sheet_gid,
            headerRow: row.header_row,
            columnMappings: row.column_mappings || [],
            lastImportedAt: row.last_imported_at,
            createdAt: row.created_at,
            lastSavedAt: row.updated_at,
          }))
          
          // DBとlocalStorageをマージ（DBを優先、localStorageにしかないものも保持）
          const dbIds = new Set(dbConfigs.map(c => c.id))
          const localOnlyConfigs = localConfigs.filter(c => !dbIds.has(c.id))
          const mergedConfigs = [...dbConfigs, ...localOnlyConfigs]
          
          setSavedConfigs(mergedConfigs)
          setIsTableMissing(false)
          localStorage.setItem('sfa-saved-spreadsheet-configs', JSON.stringify(mergedConfigs))
          
          // localStorageにしかない設定をDBに同期
          if (localOnlyConfigs.length > 0) {
            console.log(`[Settings] Found ${localOnlyConfigs.length} local-only configs, syncing to DB...`)
            syncConfigsToDB(localOnlyConfigs)
          }
        } else {
          setIsTableMissing(false) // テーブルは存在するがデータがない
          // データベースにデータがない場合、localStorageのデータを使用しDBに同期
          if (localConfigs.length > 0) {
            setSavedConfigs(localConfigs)
            // データベースにも同期
            console.log(`[Settings] Syncing ${localConfigs.length} local configs to DB...`)
            await syncConfigsToDB(localConfigs)
          }
        }
      } catch (error) {
        console.error('Failed to load configs:', error)
        // フォールバック: localStorageから読み込む
        const savedConfigsList = localStorage.getItem('sfa-saved-spreadsheet-configs')
        if (savedConfigsList) {
          try {
            setSavedConfigs(JSON.parse(savedConfigsList))
          } catch (e) {
            console.error('Failed to load saved configs from localStorage:', e)
          }
        }
      }
    }
    
    loadSavedConfigsFromDB()
  }, [])

  // 連携データサブタブが選択されたときにデータを取得（APIルート経由）
  useEffect(() => {
    if (activeSection === 'spreadsheet' && spreadsheetSubTab === 'data') {
      const fetchRecords = async () => {
        setIsLoadingRecords(true)
        try {
          const params = new URLSearchParams()
          if (recordsFilter !== 'all') {
            params.set('lead_source', recordsFilter)
          }
          params.set('limit', '100')
          
          const response = await fetch(`/api/call-records?${params.toString()}`)
          
          if (!response.ok) {
            const errorData = await response.json()
            console.error('Failed to load records:', errorData)
            return
          }
          
          const { records } = await response.json()
          setImportedRecords(records || [])
        } catch (error) {
          console.error('Failed to load records:', error)
        } finally {
          setIsLoadingRecords(false)
        }
      }
      fetchRecords()
    }
  }, [activeSection, spreadsheetSubTab, recordsFilter])
  
  // 設定をデータベースに同期する関数（APIルート経由）
  const syncConfigsToDB = async (configs: SavedSpreadsheetConfig[]) => {
    try {
      const response = await fetch('/api/spreadsheet/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to sync configs to DB:', errorData)
        return
      }
      
      const { results } = await response.json()
      const failedResults = results.filter((r: any) => !r.success)
      if (failedResults.length > 0) {
        console.error('Some configs failed to sync:', failedResults)
      }
    } catch (error) {
      console.error('Failed to sync configs to DB:', error)
    }
  }

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
        headerRow: String(spreadsheetConfig.headerRow || 1),
        action: 'headers',
      })
      // sheetGidが指定されている場合は追加
      if (spreadsheetConfig.sheetGid) {
        params.set('sheetGid', spreadsheetConfig.sheetGid)
      }
      
      const response = await fetch(`/api/spreadsheet?${params}`)
      const result = await response.json()
      
      if (result.error) {
        alert(`エラー: ${result.error}`)
        return
      }
      
      console.log('[Settings] API Response:', {
        headerRow: result.headerRow,
        headers: result.headers?.slice(0, 5),
        sampleRow: result.sampleRow?.slice(0, 5),
        totalRows: result.totalRows
      })
      
      setSpreadsheetHeaders(result.headers || [])
      
      // サンプルデータ行を取得（ヘッダー行の次の行）
      const sampleRow: string[] = result.sampleRow || []
      
      console.log('[Settings] Processing mappings:', {
        headersLength: result.headers?.length,
        sampleRowLength: sampleRow.length,
        firstHeader: result.headers?.[0],
        firstSample: sampleRow[0]
      })
      
      // 自動マッピング（ヘッダー名とサンプルデータから推定）
      // 一意性確保: 既に使用されたフィールドは他の列に割り当てない
      const usedFields = new Set<string>()
      const autoMappings: ColumnMapping[] = result.headers.map((header: string, index: number) => {
        const columnLetter = getColumnLetter(index) // A, B, ..., Z, AA, AB, ...
        const sampleValue = sampleRow[index] || ''
        
        // マッピング推定ロジック
        const matchedField = findBestMatch(header, sampleValue)
        
        // 一意性確保: 既に使用されているフィールドはスキップ
        let targetField = ''
        if (matchedField && !usedFields.has(matchedField.key)) {
          targetField = matchedField.key
          usedFields.add(matchedField.key)
        }
        
        console.log(`[Settings] Column ${columnLetter}: header="${header}", sample="${sampleValue}", matched="${targetField || 'none'}"`)
        return {
          spreadsheetColumn: columnLetter,
          spreadsheetHeader: header,
          sampleData: sampleValue, // サンプルデータを設定（存在しない場合は空文字）
          targetField,
        }
      })
      
      setSpreadsheetConfig(prev => ({
        ...prev,
        columnMappings: autoMappings,
      }))
      // ヘッダー取得は準備段階なので、未保存状態にしない
      // カラムマッピングの変更時に未保存状態になる
      
      // ヘッダー取得済みに設定
      setIsHeadersFetched(true)
      
    } catch (error) {
      console.error('Failed to fetch headers:', error)
      alert('ヘッダーの取得に失敗しました')
    } finally {
      setIsLoadingHeaders(false)
    }
  }

  // スプレッドシート設定を保存（現在の編集中設定）
  const saveSpreadsheetConfig = () => {
    const configToSave = {
      ...spreadsheetConfig,
      lastSavedAt: new Date().toISOString(),
    }
    localStorage.setItem('sfa-spreadsheet-config', JSON.stringify(configToSave))
    setSpreadsheetConfig(configToSave)
    setIsConfigSaved(true)
    setSaveMessage('設定を保存しました')
    setTimeout(() => setSaveMessage(null), 3000)
  }
  
  // 設定を連携済みリストに追加/更新
  const saveToConfigList = async () => {
    if (!newConfigName.trim()) {
      alert('連携先名を入力してください')
      return
    }
    if (!spreadsheetConfig.spreadsheetId) {
      alert('スプレッドシートIDを入力してください')
      return
    }
    
    const now = new Date().toISOString()
    
    try {
      if (editingConfigId) {
        // 既存設定を更新
        const existingConfig = savedConfigs.find(c => c.id === editingConfigId)
        if (!existingConfig) {
          alert('更新する設定が見つかりません')
          return
        }
        
        const updatedConfig: SavedSpreadsheetConfig = {
          ...existingConfig,
          ...spreadsheetConfig,
          name: newConfigName,
          leadSourcePrefix: newLeadSourcePrefix,
          lastSavedAt: now,
        }
        
        // APIルート経由でデータベースに保存
        try {
          const response = await fetch('/api/spreadsheet/configs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ configs: [updatedConfig] }),
          })
          if (!response.ok) {
            const errorData = await response.json()
            console.error('Failed to save to DB:', errorData)
          }
        } catch (dbError) {
          console.error('Failed to save to DB:', dbError)
        }
        
        const updated = savedConfigs.map(c => 
          c.id === editingConfigId ? updatedConfig : c
        )
        setSavedConfigs(updated)
        localStorage.setItem('sfa-saved-spreadsheet-configs', JSON.stringify(updated))
        setSaveMessage(`${newConfigName} を更新しました`)
      } else {
        // 新規設定を追加
        const newConfig: SavedSpreadsheetConfig = {
          ...spreadsheetConfig,
          id: `config-${Date.now()}`,
          name: newConfigName,
          leadSourcePrefix: newLeadSourcePrefix,
          createdAt: now,
          lastSavedAt: now,
        }
        
        // APIルート経由でデータベースに保存
        try {
          const response = await fetch('/api/spreadsheet/configs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ configs: [newConfig] }),
          })
          if (response.ok) {
            const { results } = await response.json()
            if (results?.[0]?.id) {
              newConfig.id = results[0].id
            }
          } else {
            const errorData = await response.json()
            console.error('Failed to save to DB:', errorData)
          }
        } catch (dbError) {
          console.error('Failed to save to DB:', dbError)
        }
        
        const updated = [...savedConfigs, newConfig]
        setSavedConfigs(updated)
        localStorage.setItem('sfa-saved-spreadsheet-configs', JSON.stringify(updated))
        setSaveMessage(`${newConfigName} を追加しました`)
      }
      
      // フォームをリセット
      setNewConfigName('')
      setNewLeadSourcePrefix('')
      setEditingConfigId(null)
      setSpreadsheetConfig(DEFAULT_SPREADSHEET_CONFIG)
      setIsConfigSaved(true)
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Failed to save config:', error)
      alert('設定の保存に失敗しました')
    }
  }
  
  // 保存済み設定を編集モードで読み込む
  const loadConfigForEdit = (config: SavedSpreadsheetConfig) => {
    // 重複マッピングを自動解消（最初に出現したものを優先）
    const usedFields = new Set<string>()
    const deduplicatedMappings = config.columnMappings.map(m => {
      if (m.targetField && usedFields.has(m.targetField)) {
        // 重複している場合はクリア
        return { ...m, targetField: '' }
      }
      if (m.targetField) {
        usedFields.add(m.targetField)
      }
      return m
    })
    
    setSpreadsheetConfig({
      spreadsheetId: config.spreadsheetId,
      sheetName: config.sheetName,
      sheetGid: config.sheetGid,
      headerRow: config.headerRow,
      columnMappings: deduplicatedMappings,
      lastImportedAt: config.lastImportedAt,
      lastSavedAt: config.lastSavedAt,
    })
    setNewConfigName(config.name)
    setNewLeadSourcePrefix(config.leadSourcePrefix)
    setEditingConfigId(config.id)
    setActiveSection('spreadsheet')
    setSpreadsheetSubTab('settings')
    setIsConfigSaved(true)
    // 既存のマッピングがある場合は取得済み・確定済みとみなす
    setIsHeadersFetched(deduplicatedMappings.some(m => m.targetField))
    setIsMappingConfirmed(deduplicatedMappings.some(m => m.targetField))
  }
  
  // 保存済み設定を削除
  const deleteConfig = async (configId: string) => {
    const config = savedConfigs.find(c => c.id === configId)
    if (!config) return
    
    if (!confirm(`「${config.name}」の設定を削除しますか？`)) return
    
    try {
      // APIルート経由でデータベースから削除
      try {
        const response = await fetch('/api/spreadsheet/configs', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: configId }),
        })
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Failed to delete from DB:', errorData)
        }
      } catch (dbError) {
        console.error('Failed to delete from DB:', dbError)
      }
      
      const updated = savedConfigs.filter(c => c.id !== configId)
      setSavedConfigs(updated)
      localStorage.setItem('sfa-saved-spreadsheet-configs', JSON.stringify(updated))
      
      // 編集中の設定が削除された場合はリセット
      if (editingConfigId === configId) {
        setEditingConfigId(null)
        setNewConfigName('')
        setNewLeadSourcePrefix('')
        setSpreadsheetConfig(DEFAULT_SPREADSHEET_CONFIG)
      }
    } catch (error) {
      console.error('Failed to delete config:', error)
      alert('設定の削除に失敗しました')
    }
  }
  
  // 設定変更をトラック
  const updateSpreadsheetConfig = (updates: Partial<SpreadsheetConfig>) => {
    setSpreadsheetConfig(prev => ({ ...prev, ...updates }))
    setIsConfigSaved(false)
    
    // スプレッドシートID、シート名、ヘッダー行が変更された場合はヘッダー取得済み・マッピング確定をリセット
    if ('spreadsheetId' in updates || 'sheetName' in updates || 'sheetGid' in updates || 'headerRow' in updates) {
      setIsHeadersFetched(false)
      setIsMappingConfirmed(false)
    }
  }

  // マッピングを更新（重複時は前の選択を自動クリア）
  const updateMapping = (index: number, targetField: string) => {
    setSpreadsheetConfig(prev => ({
      ...prev,
      columnMappings: prev.columnMappings.map((m, i) => {
        if (i === index) {
          // 選択した列に新しいフィールドを設定
          return { ...m, targetField }
        }
        // 同じフィールドが他の列で使われている場合はクリア（重複防止）
        if (targetField && m.targetField === targetField) {
          return { ...m, targetField: '' }
        }
        return m
      }),
    }))
    setIsConfigSaved(false)
    // マッピング変更時は確定状態をリセット
    setIsMappingConfirmed(false)
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
      
      // サンプルデータ行を取得（2行目、存在する場合）
      const sampleRow: string[] = rows.length > 1 ? rows[1] : []
      
      // 自動マッピング（ヘッダー名とサンプルデータから推定）
      // 一意性確保: 既に使用されたフィールドは他の列に割り当てない
      const usedFields = new Set<string>()
      const autoMappings: ColumnMapping[] = headers.map((header: string, index: number) => {
        const columnLetter = getColumnLetter(index) // A, B, ..., Z, AA, AB, ...
        const sampleValue = sampleRow[index] || ''
        
        // マッピング推定ロジック
        const matchedField = findBestMatch(header, sampleValue)
        
        // 一意性確保: 既に使用されているフィールドはスキップ
        let targetField = ''
        if (matchedField && !usedFields.has(matchedField.key)) {
          targetField = matchedField.key
          usedFields.add(matchedField.key)
        }
        
        return {
          spreadsheetColumn: columnLetter,
          spreadsheetHeader: header,
          sampleData: sampleValue, // サンプルデータを設定（存在しない場合は空文字）
          targetField,
        }
      })
      
      setSpreadsheetConfig(prev => ({
        ...prev,
        columnMappings: autoMappings,
      }))
      // CSVアップロードは準備段階なので、未保存状態にしない
      
      setUploadMode('file')
      
    } catch (error) {
      console.error('File read failed:', error)
      alert('ファイルの読み込みに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }

  // マッピングを確定して連携済み一覧に反映
  // マッピングを確定する（連携リストには追加しない）
  const confirmMapping = () => {
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
    
    // マッピング確定状態に設定
    setIsMappingConfirmed(true)
    setSaveMessage('マッピングを確定しました。連携先名とプレフィックスを入力してください。')
    setTimeout(() => setSaveMessage(null), 5000)
  }
  
  // データをインポート（手動実行用）
  const importData = async (config?: SavedSpreadsheetConfig) => {
    const configToUse = config || (editingConfigId ? savedConfigs.find(c => c.id === editingConfigId) : null)
    
    if (!configToUse) {
      alert('インポートする設定がありません')
      return
    }
    
    if (!confirm(`${configToUse.name} からデータを取得しますか？\n既存のリードIDと重複するデータは更新されます。`)) {
      return
    }
    
    setIsImporting(true)
    setImportingConfigId(configToUse.id) // 取得中のカードIDを設定
    setImportResult(null)
    
    try {
      console.log(`[importData] Starting import for ${configToUse.name}...`)
      
      const response = await fetch('/api/spreadsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: configToUse.spreadsheetId,
          sheetName: configToUse.sheetName || 'Sheet1',
          sheetGid: configToUse.sheetGid,
          headerRow: configToUse.headerRow || 1,
          columnMappings: configToUse.columnMappings.filter(m => m.targetField),
          leadSourcePrefix: configToUse.leadSourcePrefix,
        }),
      })
      
      console.log(`[importData] Response status: ${response.status}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[importData] HTTP error: ${response.status}`, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const result = await response.json()
      console.log(`[importData] Result:`, result)
      
      if (result.error) {
        alert(`エラー: ${result.error}`)
        return
      }
      
      const importedCount = result.imported || 0
      const failedCount = result.failed || 0
      
      setImportResult({
        success: importedCount,
        failed: failedCount,
        errors: result.errors || [],
      })
      
      // 各設定の取得結果を保存
      setLastImportResults(prev => ({
        ...prev,
        [configToUse.id]: {
          success: importedCount,
          failed: failedCount,
          time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        }
      }))
      
      // 最終インポート日時を更新（データベースにも保存）
      const lastImportedAt = new Date().toISOString()
      const updatedConfigs = savedConfigs.map(c => 
        c.id === configToUse.id 
          ? { ...c, lastImportedAt }
          : c
      )
      setSavedConfigs(updatedConfigs)
      localStorage.setItem('sfa-saved-spreadsheet-configs', JSON.stringify(updatedConfigs))
      
      // APIルート経由でデータベースにも保存
      try {
        const configToUpdate = { ...configToUse, lastImportedAt }
        await fetch('/api/spreadsheet/configs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ configs: [configToUpdate] }),
        })
      } catch (dbError) {
        console.error('Failed to update last_imported_at in DB:', dbError)
      }
      
      // 完了メッセージ（alertではなくUI上に表示するため、ここでは表示しない）
      console.log(`[importData] ${configToUse.name}: ${importedCount}件成功, ${failedCount}件失敗`)
      
    } catch (error) {
      console.error('Import failed:', error)
      alert('データ取得に失敗しました')
    } finally {
      setIsImporting(false)
      setImportingConfigId(null)
    }
  }

  // 連携データを取得（APIルート経由）
  const loadImportedRecords = async () => {
    setIsLoadingRecords(true)
    try {
      const params = new URLSearchParams()
      if (recordsFilter !== 'all') {
        params.set('lead_source', recordsFilter)
      }
      params.set('limit', '100')
      
      const response = await fetch(`/api/call-records?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to load records:', errorData)
        return
      }
      
      const { records } = await response.json()
      setImportedRecords(records || [])
    } catch (error) {
      console.error('Failed to load records:', error)
    } finally {
      setIsLoadingRecords(false)
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
        { type: 'divider', label: 'アクション' },
        { key: 'actionOutsideCall', label: '架電外アクション' },
        { key: 'nextActionContent', label: 'ネクストアクション内容' },
        { key: 'nextActionSupplement', label: 'ネクストアクション補足' },
        { key: 'nextActionCompleted', label: '実施' },
      ],
    },
    {
      id: 'dealManagement',
      title: '商談管理',
      fields: [
        { key: 'dealStaffFS', label: '商談担当FS' },
        { key: 'dealResult', label: '商談結果' },
        { key: 'lostReasonFS', label: '失注理由（FS→IS）' },
        { type: 'divider', label: 'フェーズ・確度' },
        { key: 'dealPhase', label: '商談フェーズ' },
        { key: 'rankEstimate', label: '確度ヨミ' },
        { key: 'rankChange', label: '確度変化' },
      ],
    },
    {
      id: 'spreadsheet',
      title: 'シート連携',
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
                  {section.fields.map((field, fieldIndex) => (
                    'type' in field && field.type === 'divider' ? (
                      <div key={`divider-${fieldIndex}`} className="flex items-center gap-3 pt-6 pb-2">
                        <div className="h-px flex-1 bg-gray-300"></div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{field.label}</span>
                        <div className="h-px flex-1 bg-gray-300"></div>
                      </div>
                    ) : (
                    <div key={'key' in field ? field.key : fieldIndex} className="border border-gray-200 rounded-lg p-4">
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
                    )
                  ))}
                </div>
              </div>
            ))}
            
            {/* スプレッドシート連携セクション */}
            <div className={activeSection === 'spreadsheet' ? '' : 'hidden'}>
              {/* サブタブ */}
              <div className="flex gap-1 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setSpreadsheetSubTab('settings')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    spreadsheetSubTab === 'settings'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  設定
                </button>
                <button
                  onClick={() => setSpreadsheetSubTab('list')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    spreadsheetSubTab === 'list'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  連携リスト
                </button>
                <button
                  onClick={() => setSpreadsheetSubTab('columns')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    spreadsheetSubTab === 'columns'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  連携カラム
                </button>
                <button
                  onClick={() => setSpreadsheetSubTab('data')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    spreadsheetSubTab === 'data'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  連携データ
                </button>
              </div>

              {/* 設定サブタブ */}
              {spreadsheetSubTab === 'settings' && (
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
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">スプレッドシート設定</h3>
                      <div className="flex items-center gap-2">
                        {saveMessage && (
                          <span className="text-sm text-green-600 animate-pulse">✓ {saveMessage}</span>
                        )}
                        {!isConfigSaved && !saveMessage && (
                          <span className="text-sm text-amber-600">● 未保存の変更があります</span>
                        )}
                        {isConfigSaved && spreadsheetConfig.lastSavedAt && !saveMessage && (
                          <span className="text-xs text-gray-500">
                            最終保存: {new Date(spreadsheetConfig.lastSavedAt).toLocaleString('ja-JP')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        スプレッドシートID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={spreadsheetConfig.spreadsheetId}
                        onChange={(e) => updateSpreadsheetConfig({ spreadsheetId: e.target.value })}
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
                                        onChange={(e) => updateSpreadsheetConfig({ sheetName: e.target.value })}
                                        className="w-full input text-sm"
                                        placeholder="12.TEMPOS（URLのシート名）"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        シートgid
                                        <span className="text-xs text-gray-500 ml-1">（オプション: URLの #gid=xxx の値）</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={spreadsheetConfig.sheetGid || ''}
                                        onChange={(e) => updateSpreadsheetConfig({ sheetGid: e.target.value })}
                                        className="w-full input text-sm"
                                        placeholder="空の場合はシート名から自動検出"
                                      />
                                      <p className="text-xs text-gray-400 mt-1">
                                        スプレッドシートURL末尾の「#gid=数字」部分。列数が正しく取得できない場合に指定してください。
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ヘッダー行 <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={spreadsheetConfig.headerRow === 0 ? '' : spreadsheetConfig.headerRow}
                                        onChange={(e) => {
                                          const val = e.target.value
                                          // 空欄または数値のみ許可
                                          if (val === '' || /^\d+$/.test(val)) {
                                            const num = parseInt(val, 10)
                                            updateSpreadsheetConfig({ headerRow: isNaN(num) ? 0 : num })
                                          }
                                        }}
                                        className="w-full input text-sm"
                                        placeholder="例: 1"
                                      />
                                      <p className="mt-1 text-xs text-gray-500">
                                        列名（ヘッダー）が記載されている行番号を指定してください
                                      </p>
                                    </div>
                                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (isConfigSaved) {
                            // 保存済み状態でクリック → 未保存状態に戻す（再保存可能に）
                            setIsConfigSaved(false)
                          } else {
                            // 未保存状態でクリック → 保存実行
                            saveSpreadsheetConfig()
                          }
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isConfigSaved 
                            ? 'text-green-700 bg-green-50 border border-green-300 hover:bg-green-100'
                            : 'text-white bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isConfigSaved ? '✓ 設定保存済' : '💾 設定を保存（未保存）'}
                      </button>
                      <button
                        onClick={() => {
                          if (isHeadersFetched) {
                            // 取得済み状態でクリック → 未取得状態に戻し、再取得実行
                            setIsHeadersFetched(false)
                            fetchSpreadsheetHeaders()
                          } else {
                            // 未取得状態でクリック → 取得実行
                            fetchSpreadsheetHeaders()
                          }
                        }}
                        disabled={isLoadingHeaders || !spreadsheetConfig.spreadsheetId}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                          isHeadersFetched
                            ? 'text-green-700 bg-green-50 border border-green-300 hover:bg-green-100'
                            : 'text-white'
                        }`}
                        style={isHeadersFetched ? {} : { backgroundColor: '#0083a0' }}
                      >
                        {isLoadingHeaders ? '読み込み中...' : isHeadersFetched ? '✓ ヘッダー取得済' : 'ヘッダーを取得'}
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
                      <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 pb-2 border-b">
                        <div>列</div>
                        <div>スプレッドシートのヘッダー</div>
                        <div>サンプルデータ</div>
                        <div>マッピング先フィールド</div>
                      </div>
                      {(() => {
                        // 既に選択されているフィールドを収集（重複禁止用）
                        const usedFields = new Set(
                          spreadsheetConfig.columnMappings
                            .filter(m => m.targetField)
                            .map(m => m.targetField)
                        )
                        
                        return spreadsheetConfig.columnMappings.map((mapping, index) => {
                          const isMapped = !!mapping.targetField
                          
                          return (
                            <div 
                              key={index} 
                              className={`grid grid-cols-4 gap-2 items-center py-1 px-2 rounded ${
                                isMapped ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className={`text-sm font-mono px-2 py-1 rounded text-center ${
                                isMapped ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                              }`}>
                                {mapping.spreadsheetColumn}
                              </div>
                              <div className={`text-sm truncate ${isMapped ? 'text-blue-800 font-medium' : 'text-gray-700'}`} title={mapping.spreadsheetHeader}>
                                {mapping.spreadsheetHeader}
                              </div>
                              <div className={`text-sm truncate px-2 py-1 rounded ${
                                isMapped ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-600'
                              }`} title={mapping.sampleData || ''}>
                                {mapping.sampleData || '（データなし）'}
                              </div>
                              <select
                                value={mapping.targetField}
                                onChange={(e) => updateMapping(index, e.target.value)}
                                className={`input text-sm ${isMapped ? 'border-blue-300 bg-blue-50' : ''}`}
                                aria-label={`${mapping.spreadsheetHeader}列のマッピング先`}
                              >
                                <option value="">-- マッピングしない --</option>
                                {MAPPABLE_FIELDS.map((field) => {
                                  // 既に他の列で使われているフィールドは無効化
                                  const isUsedElsewhere = usedFields.has(field.key) && mapping.targetField !== field.key
                                  return (
                                    <option 
                                      key={field.key} 
                                      value={field.key}
                                      disabled={isUsedElsewhere}
                                    >
                                      {field.label}（{camelToSnake(field.key)}）{field.required ? ' *' : ''}{isUsedElsewhere ? ' [使用中]' : ''}
                                    </option>
                                  )
                                })}
                              </select>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                )}

                {/* マッピング確定 & 連携リスト追加 */}
                {spreadsheetConfig.columnMappings.length > 0 && (uploadMode === 'file' || spreadsheetConfig.spreadsheetId) && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 左側：マッピング確定 */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900">① マッピング確定</h3>
                        <p className="text-sm text-gray-600">
                          必須項目のマッピングを確認し、確定ボタンを押してください。
                        </p>
                        <button
                          onClick={() => {
                            if (isMappingConfirmed) {
                              // 確定済み状態でクリック → 未確定状態に戻す
                              setIsMappingConfirmed(false)
                            } else {
                              // 未確定状態でクリック → 確定実行
                              confirmMapping()
                            }
                          }}
                          className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                            isMappingConfirmed
                              ? 'text-green-700 bg-green-50 border border-green-300 hover:bg-green-100'
                              : 'text-white'
                          }`}
                          style={isMappingConfirmed ? {} : { backgroundColor: '#0083a0' }}
                        >
                          {isMappingConfirmed ? '✓ マッピング確定済' : 'マッピングを確定'}
                        </button>
                        {saveMessage && (
                          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                            <p className="text-sm text-green-700">{saveMessage}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* 右側：連携先名・プレフィックス・追加ボタン */}
                      <div className={`space-y-4 border-l border-gray-200 pl-6 ${!isMappingConfirmed && !editingConfigId ? 'opacity-50' : ''}`}>
                        <h3 className="text-sm font-semibold text-green-900">
                          ② {editingConfigId ? '連携先設定を更新' : '連携済みリストに追加'}
                        </h3>
                        {!isMappingConfirmed && !editingConfigId && (
                          <p className="text-sm text-gray-500">
                            ← まず左側でマッピングを確定してください
                          </p>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            連携先名 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newConfigName}
                            onChange={(e) => setNewConfigName(e.target.value)}
                            disabled={!isMappingConfirmed && !editingConfigId}
                            className="w-full input text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="例: TEMPOS, OMC, Makuake"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            リードIDプレフィックス <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newLeadSourcePrefix}
                            onChange={(e) => setNewLeadSourcePrefix(e.target.value.toUpperCase())}
                            disabled={!isMappingConfirmed && !editingConfigId}
                            className="w-full input text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="例: TP, OM, MK（2文字）"
                            maxLength={2}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            リードID生成時に使用（例: TP0001）
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {editingConfigId && (
                            <button
                              onClick={() => {
                                setEditingConfigId(null)
                                setNewConfigName('')
                                setNewLeadSourcePrefix('')
                                setSpreadsheetConfig(DEFAULT_SPREADSHEET_CONFIG)
                                setIsHeadersFetched(false)
                                setIsMappingConfirmed(false)
                              }}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              キャンセル
                            </button>
                          )}
                          <button
                            onClick={saveToConfigList}
                            disabled={(!isMappingConfirmed && !editingConfigId) || !newConfigName.trim() || !newLeadSourcePrefix.trim()}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {editingConfigId ? '更新する' : '連携リストに追加'}
                          </button>
                        </div>
                      </div>
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
                        <li>各列をどのフィールドにマッピングするか選択（自動推定されます）</li>
                        <li>連携先名とリードIDプレフィックスを入力</li>
                        <li>「マッピングを確定」ボタンでマッピングを確定し、連携済み一覧に追加</li>
                        <li>連携済み一覧から「データ取得」ボタンで手動取得、または自動取得（平日9時〜18時、1時間おき）を利用</li>
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
                        <li>連携先名とリードIDプレフィックスを入力</li>
                        <li>「マッピングを確定」ボタンでマッピングを確定し、連携済み一覧に追加</li>
                      </ol>
                      <p className="mt-2 text-xs text-blue-600 ml-2">
                        ※ Excelから「CSV UTF-8（コンマ区切り）」形式で保存してください
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* 連携リストサブタブ */}
              {spreadsheetSubTab === 'list' && (
              <div className="space-y-6">
                {/* テーブル未作成警告 */}
                {isTableMissing && (
                  <div className="border border-yellow-300 rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="text-yellow-600 text-xl">⚠️</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-semibold text-yellow-900">
                          データベーステーブルが未作成です
                        </h3>
                        <p className="text-sm text-yellow-800 mt-1">
                          <code className="bg-yellow-100 px-1 rounded">spreadsheet_configs</code>テーブルがSupabaseに存在しません。
                        </p>
                        <div className="mt-3 text-sm text-yellow-800">
                          <p className="font-semibold mb-2">解決方法:</p>
                          <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>Supabaseダッシュボードにログイン</li>
                            <li>左メニューから「<strong>SQL Editor</strong>」を選択</li>
                            <li>以下のファイルの内容をコピー&ペーストして実行:</li>
                            <li className="ml-4 font-mono text-xs bg-yellow-100 px-2 py-1 rounded">
                              supabase/migrations/004_add_spreadsheet_configs.sql
                            </li>
                          </ol>
                          <p className="mt-2 text-xs text-yellow-700">
                            ※ 現在はlocalStorageからデータを読み込んでいますが、データベースに保存されません。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        連携済みスプレッドシート一覧
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {savedConfigs.length} 件の連携設定 | 自動取得: 平日9時〜18時、1時間おき
                        {isTableMissing && <span className="text-yellow-600 ml-2">（localStorageから読み込み中）</span>}
                      </p>
                    </div>
                    {savedConfigs.length > 0 && (
                      <button
                        onClick={async () => {
                          if (!confirm('すべての連携済みスプレッドシートからデータを一括取得しますか？')) {
                            return
                          }
                          
                          setIsImporting(true)
                          setImportingConfigId('all') // 一括取得中
                          setImportResult(null)
                          
                          try {
                            console.log(`[sync-all] Starting sync for ${savedConfigs.length} configs...`)
                            
                            // タイムアウト設定（120秒）
                            const controller = new AbortController()
                            const timeoutId = setTimeout(() => controller.abort(), 120000)
                            
                            const response = await fetch('/api/spreadsheet/sync-all', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ configs: savedConfigs }),
                              signal: controller.signal,
                            })
                            
                            clearTimeout(timeoutId)
                            console.log(`[sync-all] Response status: ${response.status}`)
                            
                            if (!response.ok) {
                              const errorText = await response.text()
                              console.error(`[sync-all] HTTP error: ${response.status}`, errorText)
                              throw new Error(`HTTP ${response.status}: ${errorText}`)
                            }
                            
                            const result = await response.json()
                            console.log(`[sync-all] Result:`, result)
                            
                            if (result.error) {
                              alert(`エラー: ${result.error}`)
                              return
                            }
                            
                            const totalImported = result.totalImported || 0
                            const totalFailed = result.totalFailed || 0
                            
                            setImportResult({
                              success: totalImported,
                              failed: totalFailed,
                              errors: result.results?.flatMap((r: any) => r.errors || []) || [],
                            })
                            
                            // 各設定の取得結果を個別に保存
                            const now = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                            const newResults: Record<string, { success: number; failed: number; time: string }> = {}
                            if (result.results && Array.isArray(result.results)) {
                              for (const r of result.results) {
                                if (r.configId && typeof r.imported === 'number') {
                                  newResults[r.configId] = { 
                                    success: r.imported || 0, 
                                    failed: r.failed || 0,
                                    time: now 
                                  }
                                }
                              }
                            }
                            setLastImportResults(prev => ({ ...prev, ...newResults }))
                            
                            // 最終インポート日時を更新（データベースにも保存）
                            const lastImportedAt = new Date().toISOString()
                            const updatedConfigs = savedConfigs.map(c => ({
                              ...c,
                              lastImportedAt,
                            }))
                            setSavedConfigs(updatedConfigs)
                            localStorage.setItem('sfa-saved-spreadsheet-configs', JSON.stringify(updatedConfigs))
                            
                            // APIルート経由でデータベースにも保存
                            try {
                              const configsToUpdate = savedConfigs.map(c => ({ ...c, lastImportedAt }))
                              await fetch('/api/spreadsheet/configs', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ configs: configsToUpdate }),
                              })
                            } catch (dbError) {
                              console.error('Failed to update last_imported_at in DB:', dbError)
                            }
                            
                            // 完了通知（alertを削除してUI上に表示のみ）
                            console.log(`[sync-all] 一括取得完了: ${totalImported}件成功, ${totalFailed}件失敗`)
                          } catch (error: any) {
                            console.error('Sync all failed:', error)
                            const errorMessage = error?.message || '不明なエラー'
                            alert(`一括取得に失敗しました: ${errorMessage}`)
                          } finally {
                            setIsImporting(false)
                            setImportingConfigId(null)
                          }
                        }}
                        disabled={importingConfigId === 'all'}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          importingConfigId === 'all'
                            ? 'text-orange-700 bg-orange-100 cursor-wait'
                            : 'text-white bg-green-600 hover:bg-green-700'
                        } disabled:opacity-70`}
                      >
                        {importingConfigId === 'all' ? '⏳ 取得中...' : '🔄 すべて取得'}
                      </button>
                    )}
                  </div>
                  
                  {savedConfigs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">連携済みのスプレッドシートはありません</p>
                      <p className="text-xs mt-2">
                        「シート連携設定」タブから設定を追加してください
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedConfigs.map((config) => (
                        <div
                          key={config.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={(e) => {
                            // 編集・削除ボタンのクリックは除外
                            if ((e.target as HTMLElement).closest('button')) {
                              return
                            }
                            setViewingMappingConfig(config)
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg font-semibold text-gray-900">
                                  {config.name}
                                </span>
                                {config.leadSourcePrefix && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                    {config.leadSourcePrefix}
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">スプレッドシートID:</span>{' '}
                                  <span className="font-mono text-xs bg-gray-100 px-1 rounded">
                                    {config.spreadsheetId.substring(0, 20)}...
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">シート名:</span>{' '}
                                  {config.sheetName || 'Sheet1'}
                                </div>
                                <div>
                                  <span className="font-medium">ヘッダー行:</span>{' '}
                                  {config.headerRow}行目
                                </div>
                                <div>
                                  <span className="font-medium">マッピング:</span>{' '}
                                  {config.columnMappings.filter(m => m.targetField).length}列設定済み
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-400 flex gap-4">
                                <span>
                                  作成: {new Date(config.createdAt).toLocaleDateString('ja-JP')}
                                </span>
                                {config.lastSavedAt && (
                                  <span>
                                    更新: {new Date(config.lastSavedAt).toLocaleDateString('ja-JP')}
                                  </span>
                                )}
                                {config.lastImportedAt && (
                                  <span className="text-green-600">
                                    最終インポート: {new Date(config.lastImportedAt).toLocaleString('ja-JP')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 ml-4 min-w-[120px]">
                              {/* 取得ボタンと結果表示 */}
                              <div className="flex flex-col items-end gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    importData(config)
                                  }}
                                  disabled={importingConfigId === config.id}
                                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                                    importingConfigId === config.id
                                      ? 'text-orange-700 bg-orange-100 cursor-wait'
                                      : 'text-green-700 bg-green-50 hover:bg-green-100'
                                  } disabled:opacity-70`}
                                >
                                  {importingConfigId === config.id ? '⏳ 取得中...' : '📥 データ取得'}
                                </button>
                                {/* 取得結果表示 */}
                                {lastImportResults[config.id] && importingConfigId !== config.id && (
                                  <div className="flex flex-col items-end text-xs">
                                    <span className="text-green-600 font-medium">
                                      ✓ {lastImportResults[config.id].success}件成功
                                    </span>
                                    {lastImportResults[config.id].failed > 0 && (
                                      <span className="text-gray-500">
                                        ({lastImportResults[config.id].failed}件スキップ)
                                      </span>
                                    )}
                                    <span className="text-gray-400">
                                      {lastImportResults[config.id].time}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  loadConfigForEdit(config)
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors whitespace-nowrap"
                              >
                                編集
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteConfig(config.id)
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors whitespace-nowrap"
                              >
                                削除
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* 新規追加への誘導 */}
                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <button
                    onClick={() => {
                      setEditingConfigId(null)
                      setNewConfigName('')
                      setNewLeadSourcePrefix('')
                      setSpreadsheetConfig(DEFAULT_SPREADSHEET_CONFIG)
                      setIsHeadersFetched(false)
                      setIsMappingConfirmed(false)
                      setSpreadsheetSubTab('settings')
                    }}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    ➕ 新しいシート連携を追加
                  </button>
                </div>
              </div>
              )}

              {/* 連携カラムサブタブ */}
              {spreadsheetSubTab === 'columns' && (
              <div className="space-y-4">
                {/* ヘッダー */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">連携カラム一覧</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      各シートのマッピング設定を確認できます
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={showUnmappedColumns}
                        onChange={(e) => setShowUnmappedColumns(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      未マッピング列も表示
                    </label>
                    <button
                      onClick={() => {
                        if (expandedSheets.size === savedConfigs.length) {
                          setExpandedSheets(new Set())
                        } else {
                          setExpandedSheets(new Set(savedConfigs.map(c => c.id)))
                        }
                      }}
                      className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      {expandedSheets.size === savedConfigs.length ? '全て閉じる' : '全て開く'}
                    </button>
                  </div>
                </div>

                {/* シートごとのアコーディオン */}
                {savedConfigs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-sm">連携設定がありません</p>
                    <p className="text-xs mt-2">
                      「設定」タブからシート連携を追加してください
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedConfigs.map((config) => {
                      const isExpanded = expandedSheets.has(config.id)
                      const mappings = config.columnMappings || []
                      const filteredMappings = showUnmappedColumns 
                        ? mappings 
                        : mappings.filter(m => m.targetField)
                      const mappedCount = mappings.filter(m => m.targetField).length
                      
                      return (
                        <div key={config.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* アコーディオンヘッダー */}
                          <button
                            onClick={() => {
                              const newSet = new Set(expandedSheets)
                              if (isExpanded) {
                                newSet.delete(config.id)
                              } else {
                                newSet.add(config.id)
                              }
                              setExpandedSheets(newSet)
                            }}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <svg
                                className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="font-medium text-gray-900">{config.name}</span>
                              <span className="text-xs text-gray-500">
                                （{mappedCount}列マッピング / {mappings.length}列中）
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">
                              シート: {config.sheetName || 'Sheet1'}
                            </span>
                          </button>
                          
                          {/* アコーディオンコンテンツ */}
                          {isExpanded && (
                            <div className="p-4 bg-white">
                              {filteredMappings.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">
                                  {showUnmappedColumns ? 'カラム情報がありません' : 'マッピングされた列がありません'}
                                </p>
                              ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">列</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ヘッダー名</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">マッピング先</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">サンプルデータ</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {filteredMappings.map((mapping, idx) => (
                                      <tr key={idx} className={mapping.targetField ? '' : 'bg-gray-50 text-gray-400'}>
                                        <td className="px-4 py-2 text-sm font-mono">{mapping.spreadsheetColumn}</td>
                                        <td className="px-4 py-2 text-sm">{mapping.spreadsheetHeader || '-'}</td>
                                        <td className="px-4 py-2 text-sm">
                                          {mapping.targetField ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                              {mapping.targetField}
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">-</span>
                                          )}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500 max-w-[200px] truncate" title={mapping.sampleData}>
                                          {mapping.sampleData || '-'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              )}

              {/* 連携データサブタブ */}
              {spreadsheetSubTab === 'data' && (
              <div className="space-y-4">
                {/* ヘッダー */}
                <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">連携データ一覧</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    スプレッドシートから取得したリードデータ（最新100件）
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* リードソースフィルタ */}
                  <select
                    value={recordsFilter}
                    onChange={(e) => setRecordsFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">すべてのソース</option>
                    {savedConfigs.map(config => (
                      <option key={config.id} value={config.name}>
                        {config.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={loadImportedRecords}
                    disabled={isLoadingRecords}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoadingRecords ? '読み込み中...' : '🔄 更新'}
                  </button>
                </div>
              </div>

              {/* データ件数 */}
              <div className="text-sm text-gray-600">
                {isLoadingRecords ? (
                  '読み込み中...'
                ) : (
                  `${importedRecords.length}件のデータ${recordsFilter !== 'all' ? `（${recordsFilter}）` : ''}`
                )}
              </div>

              {/* データテーブル */}
              {isLoadingRecords ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : importedRecords.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">連携データがありません</p>
                  <p className="text-xs mt-2">
                    「連携リスト」から「データ取得」を実行してください
                  </p>
                </div>
              ) : (
                <div className="overflow-auto max-h-[600px] border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          リードID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          ソース
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          会社名/店舗名
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          氏名
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          電話番号
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          連携日
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          ステータス
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {importedRecords.map((record) => (
                        <tr key={record.lead_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-mono text-blue-600">
                            {record.lead_id}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {record.lead_source || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate" title={record.company_name}>
                            {record.company_name || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.contact_name || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                            {record.phone || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {record.linked_date || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              record.status === '未架電' ? 'bg-yellow-100 text-yellow-800' :
                              record.status === '架電済' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {record.status || '未架電'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* マッピング結果表示サイドパネル */}
      {viewingMappingConfig && (
        <>
          {/* オーバーレイ */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
            onClick={() => setViewingMappingConfig(null)}
          />
          
          {/* サイドパネル */}
          <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col transform transition-transform">
            {/* パネルヘッダー */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {viewingMappingConfig.name} のマッピング設定
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  スプレッドシートID: <span className="font-mono text-xs">{viewingMappingConfig.spreadsheetId}</span>
                </p>
              </div>
              <button
                onClick={() => setViewingMappingConfig(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* パネルコンテンツ */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                {/* 基本情報 */}
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-600">シート名:</span>{' '}
                    <span className="text-gray-900">{viewingMappingConfig.sheetName || 'Sheet1'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">ヘッダー行:</span>{' '}
                    <span className="text-gray-900">{viewingMappingConfig.headerRow}行目</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">リードIDプレフィックス:</span>{' '}
                    <span className="text-gray-900">{viewingMappingConfig.leadSourcePrefix}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">マッピング済み列数:</span>{' '}
                    <span className="text-gray-900">
                      {viewingMappingConfig.columnMappings.filter(m => m.targetField).length}列
                    </span>
                  </div>
                </div>
                
                {/* マッピングテーブル（A列から順に表示） */}
                {viewingMappingConfig.columnMappings.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">カラムマッピング一覧（A列から順）</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">列</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">スプレッドシートのヘッダー</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">サンプルデータ</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">マッピング先フィールド</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {viewingMappingConfig.columnMappings.map((mapping, index) => (
                            <tr key={index} className={mapping.targetField ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'}>
                              <td className="px-4 py-3 text-sm font-mono bg-gray-100 text-center font-semibold sticky left-0 z-10 border-r border-gray-200">
                                {mapping.spreadsheetColumn}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {mapping.spreadsheetHeader || '（空）'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 bg-gray-50 max-w-xs truncate" title={mapping.sampleData || ''}>
                                {mapping.sampleData || '（データなし）'}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {mapping.targetField ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs">
                                    {MAPPABLE_FIELDS.find(f => f.key === mapping.targetField)?.label || mapping.targetField}
                                    {MAPPABLE_FIELDS.find(f => f.key === mapping.targetField)?.required && (
                                      <span className="ml-1 text-red-500">*</span>
                                    )}
                                    <span className="ml-1 text-gray-500">
                                      （{camelToSnake(mapping.targetField)}）
                                    </span>
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">-- マッピングしない --</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm font-medium">マッピング設定がありません</p>
                    <p className="text-xs mt-2 text-gray-400">「編集する」ボタンからマッピングを設定してください</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* パネルフッター */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 shrink-0 bg-gray-50">
              <button
                onClick={() => {
                  loadConfigForEdit(viewingMappingConfig)
                  setViewingMappingConfig(null)
                }}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                編集する
              </button>
              <button
                onClick={() => setViewingMappingConfig(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}







