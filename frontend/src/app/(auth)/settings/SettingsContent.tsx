'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DropdownSettings, DropdownOption, DEFAULT_SETTINGS, applyDropdownSettingsMigrations } from '@/lib/dropdownSettings'
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
  updateMode?: 'incremental' | 'full'  // 更新モード
  incrementalLimit?: number  // 差分更新時の処理件数
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
    restaurantType: 'restaurant_type',
    desiredLoanamount: 'desired_loan_amount',
    shopName: 'shop_name',
    shopPhone: 'shop_phone',
    temposExternalId: 'tempos_external_id',
    omcExternalId: 'omc_external_id',
    temposCpDesk: 'tempos_cp_desk',
    temposSalesOwner: 'tempos_sales_owner',
    temposCpCode: 'tempos_cp_code',
    omcInteriorMatchApplied: 'omc_interior_match_applied',
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
  { key: 'restaurantType', label: '業態', required: false },
  { key: 'desiredLoanamount', label: '融資希望額', required: false },
  { key: 'shopName', label: '店舗名', required: false },
  { key: 'shopPhone', label: '店舗電話', required: false },
  { key: 'temposExternalId', label: 'TEMPOS ID', required: false },
  { key: 'omcExternalId', label: 'OMC ID', required: false },
  { key: 'temposCpDesk', label: 'TEMPOS受付窓口', required: false },
  { key: 'temposSalesOwner', label: 'TEMPOS営業担当者', required: false },
  { key: 'temposCpCode', label: 'TEMPOS担当コード', required: false },
  { key: 'omcInteriorMatchApplied', label: '内装マッチ申し込み', required: false },
]

// フィールド名と日本語ラベルのマッピング（欠損データ統計表示用）
const FIELD_LABELS: Record<string, string> = {
  leadSource: 'リードソース',
  linkedDate: '連携日',
  industry: '業種',
  companyName: '会社名/店舗名',
  contactName: '氏名',
  contactNameKana: 'ふりがな',
  phone: '電話番号',
  email: 'メールアドレス',
  address: '住所/エリア',
  openingDate: '開業時期',
  contactPreferredDateTime: '連絡希望日時',
  allianceRemarks: '連携元備考',
  omcAdditionalInfo1: 'OMC追加情報①',
  omcSelfFunds: '自己資金',
  omcPropertyStatus: '物件状況',
  amazonTaxAccountant: 'Amazon税理士有無',
  meetsmoreLink: 'Meetsmoreリンク',
  meetsmoreEntityType: 'Meetsmore法人・個人',
  makuakePjtPage: 'MakuakePJT page',
  makuakeExecutorPage: 'Makuake実行者page',
  restaurantType: '業態',
  desiredLoanamount: '融資希望額',
  shopName: '店舗名',
  shopPhone: '店舗電話',
  temposExternalId: 'TEMPOS ID',
  omcExternalId: 'OMC ID',
  temposCpDesk: 'TEMPOS受付窓口',
  temposSalesOwner: 'TEMPOS営業担当者',
  temposCpCode: 'TEMPOS担当コード',
  omcInteriorMatchApplied: '内装マッチ申し込み',
}

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
      restaurantType: ['業態', 'ジャンル', '業種'],
      desiredLoanamount: ['融資希望', '希望額', '希望金額', '資金', '融資'],
      shopName: ['店舗名', '店名', '屋号', 'ショップ名'],
      shopPhone: ['店舗tel', '店舗電話', '店舗TEL', '店電話'],
      temposExternalId: ['tempos', 'tm', 'tempos id', 'テンポスid', 'テンポス', 'id'],
      omcExternalId: ['omc', 'oc', 'omc id', 'omc_id', 'omc番号', 'id'],
      temposCpDesk: ['受付', '窓口', '受付窓口'],
      temposSalesOwner: ['営業担当', '担当者', '営業'],
      temposCpCode: ['担当コード', 'cpコード', 'コード'],
      omcInteriorMatchApplied: ['内装マッチ', '内装', 'マッチ申込', '申込'],
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

export default function SettingsContent() {
  // Note: SSRがdynamic importでスキップされているため、isMountedガードは不要
  
  const [settings, setSettings] = useState<DropdownSettings | null>(null)
  const [originalSettings, setOriginalSettings] = useState<DropdownSettings | null>(null)
  const [activeSection, setActiveSection] = useState<string>('call')
  const [spreadsheetSubTab, setSpreadsheetSubTab] = useState<'settings' | 'list' | 'columns' | 'data'>('settings')
  const [showUnmappedColumns, setShowUnmappedColumns] = useState(false)
  const [expandedSheets, setExpandedSheets] = useState<Set<string>>(new Set())
  const [isEditing, setIsEditing] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<{ field: keyof DropdownSettings; index: number } | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<{ field: keyof DropdownSettings; index: number } | null>(null)
  
  // NextAuthセッションを取得
  const { data: session, status: sessionStatus } = useSession()
  
  // スプレッドシート連携用のstate
  const [spreadsheetConfig, setSpreadsheetConfig] = useState<SpreadsheetConfig>(DEFAULT_SPREADSHEET_CONFIG)
  const [spreadsheetHeaders, setSpreadsheetHeaders] = useState<string[]>([])
  const [isLoadingHeaders, setIsLoadingHeaders] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  // 取得中の状態管理（設定IDとモードを保持）
  const [importingState, setImportingState] = useState<{ configId: string; mode: 'full' | 'incremental' } | null>(null)
  // 後方互換性のため、importingConfigIdも保持（既存コードで使用されている可能性があるため）
  const importingConfigId = importingState?.configId || null
  const [importResult, setImportResult] = useState<{
    success: number
    failed: number
    errors: string[]
    importRunId?: string | null
    missingDataStats?: Record<string, number> // 欠損データ統計
    criticalMissingDataStats?: Record<string, number> // 重要データ欠損統計
  } | null>(null)
  const [lastImportResults, setLastImportResults] = useState<Record<string, { success: number; failed: number; time: string; needsReviewCount?: number; unknownUniqueCount?: number; importRunId?: string | null }>>({}) // 各設定の最終取得結果
  const [lastImportNeedsReviewDetails, setLastImportNeedsReviewDetails] = useState<Record<string, any>>({})
  
  // インポート結果履歴の型定義
  type ImportResultHistoryEntry = {
    id: string
    timestamp: string
    configId: string
    configName: string
    result: {
      success: number
      failed: number
      errors: string[]
      importRunId?: string | null
      missingDataStats?: Record<string, number>
      criticalMissingDataStats?: Record<string, number>
    }
  }
  const [importResultHistory, setImportResultHistory] = useState<ImportResultHistoryEntry[]>([])
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number>(0) // 選択中の履歴インデックス
  
  // ファイルアップロード用のstate
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [csvRows, setCsvRows] = useState<string[][]>([])
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
  const [updateMode, setUpdateMode] = useState<'incremental' | 'full'>('incremental')
  const [incrementalLimit, setIncrementalLimit] = useState(100)
  
  // マッピング結果表示用のモーダル
  const [viewingMappingConfig, setViewingMappingConfig] = useState<SavedSpreadsheetConfig | null>(null)
  // サイドパネル内で編集中のマッピング設定（ローカル編集用）
  const [editingMappingInPanel, setEditingMappingInPanel] = useState<SavedSpreadsheetConfig | null>(null)
  
  // カスタムマッピングフィールド用のstate
  const [customFields, setCustomFields] = useState<any[]>([])
  const [isLoadingCustomFields, setIsLoadingCustomFields] = useState(false)
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false)
  const [newCustomField, setNewCustomField] = useState({ field_key: '', field_label: '', field_type: 'text' as 'text' | 'number' | 'date' | 'boolean', description: '' })
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'staff' | null>(null)
  const [pendingMappingIndex, setPendingMappingIndex] = useState<number | null>(null) // カスタムフィールド追加後にマッピングする列のインデックス
  const [editingCustomFieldId, setEditingCustomFieldId] = useState<string | null>(null) // 編集中のカスタムフィールドID
  
  // 開発環境かどうかを判定（サーバー・クライアントで同じ値になるよう NODE_ENV を使用）
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // ユーザー権限管理用のstate
  const [users, setUsers] = useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingUserRole, setEditingUserRole] = useState<'admin' | 'manager' | 'staff'>('staff')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', full_name: '', role: 'staff' as 'admin' | 'manager' | 'staff', department: '' })
  
  // 互換セクション（折りたたみ）状態
  const [compatSectionOpen, setCompatSectionOpen] = useState<Record<string, boolean>>({
    call: false,
    dealManagement: false,
  })
  
  // ヘルスチェック（要確認一覧）
  const [healthStatusFilter, setHealthStatusFilter] = useState<'open' | 'resolved' | 'ignored'>('open')
  const [healthIssues, setHealthIssues] = useState<any[]>([])
  const [isLoadingHealthIssues, setIsLoadingHealthIssues] = useState(false)
  const [isRunningHealthScan, setIsRunningHealthScan] = useState(false)
  const [healthTableMissing, setHealthTableMissing] = useState(false)
  
  // 連携データ表示用のstate
  const [importedRecords, setImportedRecords] = useState<any[]>([])
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)
  const [recordsFilter, setRecordsFilter] = useState<string>('all') // リードソースでフィルタ
  const [showAllRecords, setShowAllRecords] = useState(false) // 全件表示フラグ
  const [totalRecordsCount, setTotalRecordsCount] = useState<number | null>(null) // 総件数

  useEffect(() => {
    // データベースから設定を読み込む（フォールバック: localStorage）
    const loadSettings = async () => {
      // 直近に設定を保存した直後は、DB側の古い設定で上書きされて「元に戻る」ことがある。
      // 保存直後はlocalStorageをSSOTとして扱い、DB取得をスキップする。
      try {
        const updatedAtRaw = localStorage.getItem('sfa-dropdown-settings.updatedAt')
        const updatedAt = updatedAtRaw ? Number(updatedAtRaw) : 0
        if (Number.isFinite(updatedAt) && updatedAt > 0) {
          const ageMs = Date.now() - updatedAt
          if (ageMs >= 0 && ageMs < 10 * 60 * 1000) {
            const saved = localStorage.getItem('sfa-dropdown-settings')
            if (saved) {
              const parsed = JSON.parse(saved)
              const merged: DropdownSettings = { ...DEFAULT_SETTINGS, ...(parsed || {}) }
              const migrated = applyDropdownSettingsMigrations(merged)
              setSettings(migrated)
              setOriginalSettings(migrated)
              return
            }
          }
        }
      } catch {
        // noop
      }

      try {
        const response = await fetch('/api/dropdown-settings')
        if (response.ok) {
          const { settings: dbSettings, raw } = await response.json()
          
          // DBから取得した設定をマージ
          if (dbSettings && Object.keys(dbSettings).length > 0) {
            const mergedSettings: DropdownSettings = { ...DEFAULT_SETTINGS }
            
            // 各カテゴリの設定をマージ
            Object.keys(dbSettings).forEach(category => {
              Object.keys(dbSettings[category]).forEach(key => {
                if (key in mergedSettings) {
                  mergedSettings[key as keyof DropdownSettings] = dbSettings[category][key]
                } else {
                  // 削除済みフィールド（nextActionSupplement, nextActionCompleted）は警告を出さない
                  if (key !== 'nextActionSupplement' && key !== 'nextActionCompleted') {
                    console.warn(`[Settings] Key "${key}" in category "${category}" not found in DropdownSettings type`)
                  }
                }
              })
            })
            
            // デバッグ: openingPeriodの読み込み確認
            if (mergedSettings.openingPeriod && mergedSettings.openingPeriod.length > 0) {
              console.log('[Settings] openingPeriod loaded:', mergedSettings.openingPeriod)
            } else {
              console.warn('[Settings] openingPeriod not loaded or empty. DB settings:', dbSettings)
            }
            
            // デバッグ: 全設定の確認
            console.log('[Settings] All settings keys:', Object.keys(mergedSettings))
            console.log('[Settings] openingPeriod in settings:', 'openingPeriod' in mergedSettings, mergedSettings.openingPeriod)
            
            const migrated = applyDropdownSettingsMigrations(mergedSettings)
            setSettings(migrated)
            setOriginalSettings(migrated)
            
            // localStorageにも保存（フォールバック用）
            localStorage.setItem('sfa-dropdown-settings', JSON.stringify(migrated))
            return
          }
        }
      } catch (error) {
        console.error('Failed to load settings from DB:', error)
      }
      
      // フォールバック: ローカルストレージから設定を読み込む
      const saved = localStorage.getItem('sfa-dropdown-settings')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const merged: DropdownSettings = { ...DEFAULT_SETTINGS, ...(parsed || {}) }
          const migrated = applyDropdownSettingsMigrations(merged)
          setSettings(migrated)
          setOriginalSettings(migrated)
        } catch (e) {
          console.error('Failed to load settings:', e)
          setSettings(DEFAULT_SETTINGS)
          setOriginalSettings(DEFAULT_SETTINGS)
        }
      } else {
        const migrated = applyDropdownSettingsMigrations(DEFAULT_SETTINGS)
        setSettings(migrated)
        setOriginalSettings(migrated)
      }
    }
    
    loadSettings()
    
    // インポート結果履歴を読み込む
    const loadImportResultHistory = () => {
      try {
        const savedHistory = localStorage.getItem('sfa-import-result-history')
        if (savedHistory) {
          const history = JSON.parse(savedHistory) as ImportResultHistoryEntry[]
          if (history.length > 0) {
            setImportResultHistory(history)
            // 最新の結果を表示
            setImportResult(history[0].result)
            setSelectedHistoryIndex(0)
          }
        }
      } catch (e) {
        console.error('Failed to load import result history:', e)
      }
    }
    loadImportResultHistory()
    
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
            updateMode: row.update_mode || 'incremental',
            incrementalLimit: row.incremental_limit || 100,
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
    
    // カスタムマッピングフィールドを取得
    const loadCustomFields = async () => {
      setIsLoadingCustomFields(true)
      try {
        const response = await fetch('/api/custom-mapping-fields')
        if (response.ok) {
          const { fields } = await response.json()
          setCustomFields(fields || [])
        }
      } catch (error) {
        console.error('Failed to load custom fields:', error)
      } finally {
        setIsLoadingCustomFields(false)
      }
    }
    loadCustomFields()
    
    // ユーザー権限を取得
    const loadUserRole = async () => {
      // 開発環境では、セッションがなくても実行
      const userEmail = session?.user?.email || (isDevelopment ? 'tmatsukuma@redish.jp' : null)
      
      if (userEmail || isDevelopment) {
        try {
          // API経由でユーザー情報を取得（認証情報を含む）
          const response = await fetch('/api/users')
          if (response.ok) {
            const { users: usersData } = await response.json()
            console.log('[loadUserRole] Fetched users:', usersData)
            console.log('[loadUserRole] Looking for email:', userEmail)
            
            if (usersData && usersData.length > 0) {
              // 現在のユーザー情報を取得（メールアドレスで検索）
              // 開発環境では、メールアドレスが一致しない場合でも最初のユーザーを使用
              let currentUser = usersData.find((u: any) => u.email === userEmail)
              
              // 開発環境でメールアドレスが一致しない場合、最初のユーザーを使用
              if (!currentUser && isDevelopment && usersData.length > 0) {
                currentUser = usersData[0]
                console.log('[loadUserRole] Email not found, using first user in dev mode:', currentUser)
              }
              
              if (currentUser?.role) {
                console.log('[loadUserRole] Setting role to:', currentUser.role)
                setUserRole(currentUser.role as 'admin' | 'manager' | 'staff')
              } else {
                console.log('[loadUserRole] No role found, defaulting to staff')
                setUserRole('staff') // デフォルト
              }
            } else {
              console.log('[loadUserRole] No users found')
              setUserRole('staff') // デフォルト
            }
          } else {
            // APIエラーの場合もデフォルトを設定
            console.error('[loadUserRole] API error:', response.status, response.statusText)
            setUserRole('staff')
          }
        } catch (error) {
          console.error('[loadUserRole] Failed to load user role:', error)
          setUserRole('staff') // デフォルト
        }
      }
    }
    // 開発環境では常に実行、本番環境では認証済みの場合のみ
    if (sessionStatus === 'authenticated' || isDevelopment) {
      loadUserRole()
    }
    
    // ユーザー一覧を取得（adminのみ）
    const loadUsers = async () => {
      if (userRole === 'admin') {
        setIsLoadingUsers(true)
        try {
          const response = await fetch('/api/users')
          if (response.ok) {
            const { users: usersData } = await response.json()
            setUsers(usersData || [])
          }
        } catch (error) {
          console.error('Failed to load users:', error)
        } finally {
          setIsLoadingUsers(false)
        }
      }
    }
    if (userRole === 'admin') {
      loadUsers()
    }
  }, [session, sessionStatus, userRole])

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

  // ヘルスチェックタブが選択されたときに一覧を取得
  // Note: このuseEffectは早期リターン(if !settings)より前に配置する必要がある（フック数の一貫性のため）
  useEffect(() => {
    if (activeSection === 'healthCheck') {
      fetchHealthIssues()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, healthStatusFilter])
  
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

  // Note: 早期リターンはフックの数の一貫性を崩すため削除。
  // settingsがnullの場合のローディング表示はJSXの中で行う。

  const handleEdit = () => {
    setIsEditing(true)
  }

  // SSOT辞書（最小：設定画面で使うキーのみ）
  const SETTING_LABELS_JA: Record<string, string> = {
    // call
    staffIS: '担当IS',
    statusIS: 'リードステータス（IS）',
    customerType: '顧客区分（属性）',
    resultContactStatus: '直近架電結果（未架電/不通/通電）',
    cannotContactReason: '対象外/連絡不能 理由（互換）',
    disqualifyReason: '対象外（Disqualified）理由',
    unreachableReason: '連絡不能（Unreachable）理由',
    lostReasonPrimary: '失注主因（顧客/自社/競合/自己対応/その他）',
    lostReasonCustomerSub: '失注サブ理由（顧客要因）',
    lostReasonCompanySub: '失注サブ理由（自社要因）',
    lostReasonCompetitorSub: '失注サブ理由（競合要因）',
    lostReasonSelfSub: '失注サブ理由（自己対応）',
    lostReasonOtherSub: '失注サブ理由（その他）',
    lostReasonMemoTemplates: '（旧）備忘テンプレ（互換）',
    recyclePriority: 'ナーチャリング優先度',
    actionOutsideCall: '架電外アクション',
    nextActionContent: 'ネクストアクション内容',
    improvementCategory: '改善・学習カテゴリ',
    needTemperature: 'ニーズ温度（IS判定）',
    // deal
    dealStaffFS: '商談担当FS',
    contractStaff: '契約担当者',
    meetingStatus: '商談実施状況',
    dealResult: '商談結果',
    lostReasonFS: '失注理由（FS→IS）',
    contractReason: '成約要因',
    feedbackToIS: 'ISへのフィードバック',
    bantBudget: 'BANT（予算）',
    bantAuthority: 'BANT（決裁権）',
    bantTimeline: 'BANT（導入時期）',
    competitorStatus: '競合状況',
    selfHandlingStatus: '自己対応状況',
    bantInfo: 'BANT（旧・互換）',
    openingPeriod: '開業時期',
    dealPhase: '商談フェーズ',
    rankEstimate: '確度ヨミ',
    rankChange: '確度変化',
  }

  const COMPAT_KEYS_ALWAYS: Array<keyof DropdownSettings> = [
    'cannotContactReason',
    'lostReasonMemoTemplates',
    'bantInfo',
  ]

  const COMPAT_OPTION_FIELDS: Array<keyof DropdownSettings> = [
    'statusIS',
    'recyclePriority',
    'resultContactStatus',
  ]

  const isLegacyOption = (opt: DropdownOption) => {
    const s = `${opt?.value ?? ''} ${opt?.label ?? ''}`
    return s.includes('（旧）') || s.includes('(旧)') || s.includes('旧)')
  }

  const splitOptions = (field: keyof DropdownSettings, options: DropdownOption[]) => {
    if (COMPAT_KEYS_ALWAYS.includes(field)) {
      return { normal: [] as DropdownOption[], compat: options || [] }
    }
    if (COMPAT_OPTION_FIELDS.includes(field)) {
      const normal = (options || []).filter((o) => !isLegacyOption(o))
      const compat = (options || []).filter((o) => isLegacyOption(o))
      return { normal, compat }
    }
    return { normal: options || [], compat: [] as DropdownOption[] }
  }

  const getKeyLabel = (key: string, fallbackJa?: string) => {
    const ja = SETTING_LABELS_JA[key] || fallbackJa || key
    return `${key}（${ja}）`
  }

  const fetchHealthIssues = async () => {
    setIsLoadingHealthIssues(true)
    try {
      const params = new URLSearchParams()
      params.set('status', healthStatusFilter)
      params.set('limit', '200')
      const res = await fetch(`/api/data-quality/issues?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) {
        console.error('[HealthCheck] Failed to load issues:', data)
        return
      }
      setHealthIssues(data.issues || [])
      setHealthTableMissing(Boolean(data.tableMissing))
    } catch (e) {
      console.error('[HealthCheck] Failed to load issues:', e)
    } finally {
      setIsLoadingHealthIssues(false)
    }
  }

  const runHealthScan = async () => {
    setIsRunningHealthScan(true)
    try {
      const res = await fetch('/api/data-quality/scan', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        console.error('[HealthCheck] Scan failed:', data)
        alert(data.error || 'ヘルスチェックの実行に失敗しました')
        return
      }
      await fetchHealthIssues()
    } catch (e) {
      console.error('[HealthCheck] Scan failed:', e)
      alert('ヘルスチェックの実行に失敗しました')
    } finally {
      setIsRunningHealthScan(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return
    
    // localStorageに保存（即座に反映）
    localStorage.setItem('sfa-dropdown-settings', JSON.stringify(settings))
    localStorage.setItem('sfa-dropdown-settings.updatedAt', String(Date.now()))
    setOriginalSettings(settings)
    window.dispatchEvent(new Event('storage'))
    
    // データベースにも保存
    try {
      // 各セクション（カテゴリ）ごとに保存
      const saveResults: { section: string; success: boolean; error?: string }[] = []
      
      const savePromises = sections.map(async (section) => {
        const categorySettings: Record<string, any[]> = {}
        
        section.fields.forEach(field => {
          if ('key' in field && field.key && field.key in settings) {
            categorySettings[field.key] = settings[field.key as keyof DropdownSettings]
          }
        })
        
        if (Object.keys(categorySettings).length > 0) {
          // カテゴリマッピング: 設定メニューのセクションID → DBカテゴリ名
          // 注意: 既存のDBデータとの互換性のため、このマッピングを維持
          // - 'call': 架電管理 - セクションIDとDBカテゴリが一致
          // - 'dealManagement': 商談管理 - セクションIDは'dealManagement'だが、DBカテゴリは'deal'
          const categoryMap: Record<string, string> = {
            'call': 'call',
            'dealManagement': 'deal',
          }
          
          const category = categoryMap[section.id] || section.id
          console.log(`[Settings] Saving ${section.id} (category: ${category}):`, Object.keys(categorySettings))
          
          const response = await fetch('/api/dropdown-settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category,
              settings: categorySettings,
            }),
          })
          
          const result = await response.json()
          console.log(`[Settings] Save result for ${section.id}:`, result)
          
          if (!response.ok) {
            saveResults.push({ section: section.id, success: false, error: result.error || '保存失敗' })
            throw new Error(result.error || '保存に失敗しました')
          }
          
          saveResults.push({ section: section.id, success: true })
        }
      })
      
      await Promise.all(savePromises)
      console.log('[Settings] All save results:', saveResults)
      setIsEditing(false)
      alert('設定を保存しました（データベースにも保存されました）')
    } catch (error) {
      console.error('Failed to save to database:', error)
      setIsEditing(false)
      alert('設定を保存しました（ローカルストレージのみ。データベースへの保存に失敗しました）')
    }
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

  const moveOption = (field: keyof DropdownSettings, fromIndex: number, toIndex: number) => {
    setSettings(prev => {
      if (!prev) return prev
      const options = [...prev[field]]
      const [moved] = options.splice(fromIndex, 1)
      options.splice(toIndex, 0, moved)
      return {
        ...prev,
        [field]: options,
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
          updateMode: updateMode,
          incrementalLimit: incrementalLimit,
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
          updateMode: updateMode,
          incrementalLimit: incrementalLimit,
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
      setUpdateMode('incremental')
      setIncrementalLimit(100)
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
    setUpdateMode(config.updateMode || 'incremental')
    setIncrementalLimit(config.incrementalLimit || 100)
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
    let currentRow: string[] = []
    let currentCell = ''
    let inQuotes = false

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i]
      const nextChar = csvText[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell.trim())
        currentCell = ''
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++
        }
        currentRow.push(currentCell.trim())
        rows.push(currentRow)
        currentRow = []
        currentCell = ''
      } else {
        currentCell += char
      }
    }

    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim())
      rows.push(currentRow)
    }

    return rows.filter((row) => row.some((cell) => cell.trim() !== ''))
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
      
      setCsvRows(rows)
      setSpreadsheetHeaders([])
      setSpreadsheetConfig(prev => ({
        ...prev,
        columnMappings: [],
      }))
      setIsHeadersFetched(false)
      setIsMappingConfirmed(false)
      setUploadMode('file')
      
    } catch (error) {
      console.error('File read failed:', error)
      alert('ファイルの読み込みに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }

  const runCsvMapping = () => {
    if (csvRows.length === 0) {
      alert('CSVファイルを先に選択してください')
      return
    }
    const headerRowIndex = Math.max(0, (spreadsheetConfig.headerRow || 1) - 1)
    if (headerRowIndex >= csvRows.length) {
      alert(`指定されたヘッダー行（${spreadsheetConfig.headerRow || 1}行目）が存在しません`)
      return
    }
    const headers = csvRows[headerRowIndex]
    setSpreadsheetHeaders(headers)

    const sampleRowIndex = headerRowIndex + 1
    const sampleRow: string[] = csvRows.length > sampleRowIndex ? csvRows[sampleRowIndex] : []

    const usedFields = new Set<string>()
    const autoMappings: ColumnMapping[] = headers.map((header: string, index: number) => {
      const columnLetter = getColumnLetter(index)
      const sampleValue = sampleRow[index] || ''

      const matchedField = findBestMatch(header, sampleValue)
      let targetField = ''
      if (matchedField && !usedFields.has(matchedField.key)) {
        targetField = matchedField.key
        usedFields.add(matchedField.key)
      }

      return {
        spreadsheetColumn: columnLetter,
        spreadsheetHeader: header,
        sampleData: sampleValue,
        targetField,
      }
    })

    setSpreadsheetConfig(prev => ({
      ...prev,
      columnMappings: autoMappings,
    }))
  }

  const getColumnIndexFromLetter = (column: string): number | null => {
    if (!column) return null
    let index = 0
    for (let i = 0; i < column.length; i++) {
      const code = column.charCodeAt(i)
      if (code < 65 || code > 90) return null
      index = index * 26 + (code - 64)
    }
    return index - 1
  }

  const buildCallCsvMappings = (): ColumnMapping[] => {
    const headerRowIndex = Math.max(0, (spreadsheetConfig.headerRow || 1) - 1)
    const headers = csvRows[headerRowIndex] || []
    const sampleRowIndex = headerRowIndex + 1
    const sampleRow: string[] = csvRows.length > sampleRowIndex ? csvRows[sampleRowIndex] : []

    const mappings: Array<{ column: string; targetField: string }> = [
      { column: 'B', targetField: 'leadId' },
      { column: 'C', targetField: 'leadSource' },
      { column: 'D', targetField: 'linkedDate' },
      { column: 'E', targetField: 'industry' },
      { column: 'F', targetField: 'companyName' },
      { column: 'G', targetField: 'contactName' },
      { column: 'H', targetField: 'contactNameKana' },
      { column: 'I', targetField: 'phone' },
      { column: 'J', targetField: 'email' },
      { column: 'K', targetField: 'address' },
      { column: 'L', targetField: 'openingDate' },
      { column: 'M', targetField: 'contactPreferredDateTime' },
      { column: 'N', targetField: 'allianceRemarks' },
      { column: 'O', targetField: 'omcAdditionalInfo1' },
      { column: 'P', targetField: 'omcSelfFunds' },
      { column: 'Q', targetField: 'omcPropertyStatus' },
      { column: 'R', targetField: 'amazonTaxAccountant' },
      { column: 'S', targetField: 'meetsmoreLink' },
      { column: 'T', targetField: 'meetsmoreEntityType' },
      { column: 'U', targetField: 'makuakePjtPage' },
      { column: 'V', targetField: 'makuakeExecutorPage' },
      { column: 'W', targetField: 'staffIS' },
      { column: 'X', targetField: 'statusIS' },
      { column: 'Y', targetField: 'statusUpdateDate' },
      { column: 'Z', targetField: 'cannotContactReason' },
      { column: 'AA', targetField: 'recyclePriority' },
      { column: 'AB', targetField: 'resultContactStatus' },
      { column: 'AC', targetField: 'lastCalledDate' },
      { column: 'AD', targetField: 'callCount' },
      { column: 'AE', targetField: 'callDuration' },
      { column: 'AF', targetField: 'conversationMemo' },
      { column: 'AH', targetField: 'actionOutsideCall' },
      { column: 'AI', targetField: 'nextActionDate' },
      { column: 'AJ', targetField: 'nextActionContent' },
      { column: 'AK', targetField: 'nextActionSupplement' },
      { column: 'AL', targetField: 'nextActionCompleted' },
      { column: 'AM', targetField: 'appointmentDate' },
      { column: 'AN', targetField: 'dealSetupDate' },
      { column: 'AO', targetField: 'dealTime' },
      { column: 'AP', targetField: 'dealStaffFS' },
      { column: 'AQ', targetField: 'dealResult' },
      { column: 'AR', targetField: 'lostReasonFS' },
    ]

    return mappings.map(({ column, targetField }) => {
      const idx = getColumnIndexFromLetter(column)
      const header = idx !== null ? headers[idx] || '' : ''
      const sampleValue = idx !== null ? sampleRow[idx] || '' : ''
      return {
        spreadsheetColumn: column,
        spreadsheetHeader: header,
        sampleData: sampleValue,
        targetField,
      }
    })
  }

  const importCallCsvDirect = async () => {
    if (csvRows.length === 0) {
      alert('CSVファイルを先に選択してください')
      return
    }
    if (!spreadsheetConfig.headerRow) {
      alert('ヘッダー行を入力してください')
      return
    }

    const headerRowIndex = Math.max(0, spreadsheetConfig.headerRow - 1)
    if (headerRowIndex >= csvRows.length) {
      alert(`指定されたヘッダー行（${spreadsheetConfig.headerRow}行目）が存在しません`)
      return
    }

    const columnMappings = buildCallCsvMappings()
    setIsImporting(true)
    setImportingState({ configId: 'csv-direct', mode: 'full' })
    setImportResult(null)

    try {
      const response = await fetch('/api/spreadsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadMode: 'file',
          csvRows,
          columnMappings,
          headerRow: spreadsheetConfig.headerRow || 1,
          updateMode: 'full',
          incrementalLimit,
          allowedLeadSources: ['TEMPOS', 'OMC'],
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        const errorMessage = result?.error || 'データ取得に失敗しました'
        throw new Error(errorMessage)
      }

      const importedCount = result.imported || 0
      const newRecordsCount = result.newRecords || 0
      const updatedRecordsCount = result.updatedRecords || 0
      const failedCount = result.failed || 0
      const importRunId = result.importRunId || null
      const missingDataStats = result.missingDataStats || {}
      const criticalMissingDataStats = result.criticalMissingDataStats || {}

      const displayCount = importedCount
      const newImportResult = {
        success: displayCount,
        failed: failedCount,
        errors: result.errors || [],
        importRunId,
        missingDataStats,
        criticalMissingDataStats,
        newRecords: newRecordsCount,
        updatedRecords: updatedRecordsCount,
      }

      setImportResult(newImportResult)
      setSaveMessage(
        `CSV取込: 成功${displayCount}件（新規${newRecordsCount}・更新${updatedRecordsCount}）, 失敗${failedCount}件`
      )

      const newHistoryEntry: ImportResultHistoryEntry = {
        id: importRunId || `csv-import-${Date.now()}`,
        timestamp: new Date().toISOString(),
        configId: 'csv-direct',
        configName: 'CSV架電取込',
        result: newImportResult,
      }
      const existingHistory = JSON.parse(
        localStorage.getItem('sfa-import-result-history') || '[]'
      ) as ImportResultHistoryEntry[]
      const updatedHistory = [newHistoryEntry, ...existingHistory].slice(0, 50)
      localStorage.setItem('sfa-import-result-history', JSON.stringify(updatedHistory))
      setImportResultHistory(updatedHistory)
      setSelectedHistoryIndex(0)
    } catch (error: any) {
      const errorMessage = error?.message || 'データ取得に失敗しました'
      setImportResult({
        success: 0,
        failed: 0,
        errors: [errorMessage],
        importRunId: null,
        missingDataStats: {},
        criticalMissingDataStats: {},
      })
      alert(`データ取得に失敗しました: ${errorMessage}`)
    } finally {
      setIsImporting(false)
      setImportingState(null)
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
  const importData = async (config?: SavedSpreadsheetConfig, overrideUpdateMode?: 'incremental' | 'full') => {
    const configToUse = config || (editingConfigId ? savedConfigs.find(c => c.id === editingConfigId) : null)
    
    if (!configToUse) {
      alert('インポートする設定がありません')
      return
    }
    
    // 更新モードを決定（オーバーライド指定があればそれを使用、なければ設定のupdateModeを使用）
    const updateMode = overrideUpdateMode || configToUse.updateMode || 'incremental'
    const modeLabel = updateMode === 'full' ? '全件' : '差分'
    
    if (!confirm(`${configToUse.name} から${modeLabel}データを取得しますか？\n既存のリードIDと重複するデータは更新され、電話番号重複は新規作成で重複フラグが付与されます。`)) {
      return
    }
    
    setIsImporting(true)
    setImportingState({ configId: configToUse.id, mode: updateMode }) // 取得中の設定IDとモードを設定
    setImportResult(null)
    
    try {
      console.log(`[importData] Starting import for ${configToUse.name} (mode: ${updateMode})...`)
      
      // タイムアウト設定（6分 = 360秒）- API側のmaxDuration(300秒)より長く設定
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, 360000) // 6分
      
      let response: Response
      try {
        response = await fetch('/api/spreadsheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spreadsheetId: configToUse.spreadsheetId,
            sheetName: configToUse.sheetName || 'Sheet1',
            sheetGid: configToUse.sheetGid,
            headerRow: configToUse.headerRow || 1,
            columnMappings: configToUse.columnMappings.filter(m => m.targetField),
            leadSourcePrefix: configToUse.leadSourcePrefix,
            spreadsheetConfigId: configToUse.id,
            updateMode: updateMode,
            incrementalLimit: configToUse.incrementalLimit || 100,
          }),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          throw new Error('リクエストがタイムアウトしました。データ量が多い可能性があります。しばらく待ってから再度お試しください。')
        }
        throw fetchError
      }
      
      console.log(`[importData] Response status: ${response.status}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[importData] HTTP error: ${response.status}`, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      let result: any
      try {
        const resultText = await response.text()
        if (!resultText) {
          throw new Error('レスポンスが空です')
        }
        result = JSON.parse(resultText)
        console.log(`[importData] Result:`, result)
      } catch (parseError: any) {
        console.error('[importData] JSON parse error:', parseError)
        throw new Error(`レスポンスの解析に失敗しました: ${parseError.message}`)
      }
      
      if (result.error) {
        console.error('[importData] API returned error:', result.error)
        setImportResult({
          success: 0,
          failed: 0,
          errors: [result.error],
          importRunId: null,
          missingDataStats: {},
          criticalMissingDataStats: {},
        })
        alert(`エラー: ${result.error}`)
        return
      }
      
      const importedCount = result.imported || 0
      const newRecordsCount = result.newRecords || 0 // 新規作成件数
      const updatedRecordsCount = result.updatedRecords || 0 // 更新件数
      const failedCount = result.failed || 0
      const importRunId = result.importRunId || null
      const missingDataStats = result.missingDataStats || {}
      const criticalMissingDataStats = result.criticalMissingDataStats || {}
      
      // 全件取得時は合計表示、それ以外は新規作成件数を優先的に表示
      const isFullMode = updateMode === 'full'
      const displayCount = isFullMode
        ? importedCount
        : (newRecordsCount > 0 ? newRecordsCount : importedCount)
      
      const newImportResult = {
        success: displayCount, // 新規作成件数を優先的に表示
        failed: failedCount,
        errors: result.errors || [],
        importRunId,
        missingDataStats,
        criticalMissingDataStats,
        newRecords: newRecordsCount,
        updatedRecords: updatedRecordsCount,
      }
      
      setImportResult(newImportResult)
      
      // インポート結果履歴に追加
      const newHistoryEntry: ImportResultHistoryEntry = {
        id: importRunId || `import-${Date.now()}`,
        timestamp: new Date().toISOString(),
        configId: configToUse.id,
        configName: configToUse.name,
        result: newImportResult,
      }
      
      // 既存の履歴を読み込む
      const existingHistory = JSON.parse(
        localStorage.getItem('sfa-import-result-history') || '[]'
      ) as ImportResultHistoryEntry[]
      
      // 最新の結果を先頭に追加（最大50件まで保持）
      const updatedHistory = [newHistoryEntry, ...existingHistory].slice(0, 50)
      localStorage.setItem('sfa-import-result-history', JSON.stringify(updatedHistory))
      setImportResultHistory(updatedHistory)
      setSelectedHistoryIndex(0) // 最新の結果を選択
      
      // 各設定の取得結果を保存
      setLastImportResults(prev => ({
        ...prev,
        [configToUse.id]: {
          success: displayCount, // 新規作成件数を優先的に表示
          failed: failedCount,
          time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
          needsReviewCount: 0,
          unknownUniqueCount: 0,
          importRunId,
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
      console.log(`[importData] ${configToUse.name}: ${displayCount}件成功 (新規: ${newRecordsCount}件, 更新: ${updatedRecordsCount}件), ${failedCount}件失敗`)
      
    } catch (error: any) {
      console.error('[importData] Import failed:', error)
      const errorMessage = error?.message || 'データ取得に失敗しました'
      console.error('[importData] Error details:', {
        name: error?.name,
        message: errorMessage,
        stack: error?.stack,
      })
      
      // エラー時も結果を表示（失敗件数のみ）
      setImportResult({
        success: 0,
        failed: 0,
        errors: [errorMessage],
        importRunId: null,
        missingDataStats: {},
        criticalMissingDataStats: {},
      })
      
      alert(`データ取得に失敗しました: ${errorMessage}`)
    } finally {
      console.log('[importData] Finally block: resetting import state')
      setIsImporting(false)
      setImportingState(null)
    }
  }

  // 連携データを取得（APIルート経由）
  const loadImportedRecords = async (loadAll: boolean = false) => {
    setIsLoadingRecords(true)
    try {
      const params = new URLSearchParams()
      if (recordsFilter !== 'all') {
        params.set('lead_source', recordsFilter)
      }
      // 全件表示の場合はlimit=0（無制限）、それ以外は100件
      params.set('limit', loadAll ? '0' : '100')
      
      const response = await fetch(`/api/call-records?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to load records:', errorData)
        return
      }
      
      const { records, totalCount } = await response.json()
      setImportedRecords(records || [])
      if (totalCount !== undefined) {
        setTotalRecordsCount(totalCount)
      }
      if (loadAll) {
        setShowAllRecords(true)
      }
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
        { type: 'divider', label: 'ステータス（混在防止）' },
        { key: 'statusIS', label: 'リードステータス' },
        { key: 'customerType', label: '顧客区分（属性）' },
        { key: 'resultContactStatus', label: '直近架電結果（未架電/不通/通電）' },
        { key: 'cannotContactReason', label: '対象外/連絡不能 理由（現行フィールド）' },
        { key: 'disqualifyReason', label: '対象外（Disqualified）理由（v2）' },
        { key: 'unreachableReason', label: '連絡不能（Unreachable）理由（v2）' },
        { type: 'divider', label: '失注理由（架電）' },
        { key: 'lostReasonPrimary', label: '失注主因（顧客要因/自社要因/競合要因/自己対応/その他）' },
        { key: 'lostReasonCustomerSub', label: '失注サブ理由（顧客要因）' },
        { key: 'lostReasonCompanySub', label: '失注サブ理由（自社要因）' },
        { key: 'lostReasonCompetitorSub', label: '失注サブ理由（競合要因）' },
        { key: 'lostReasonSelfSub', label: '失注サブ理由（自己対応）' },
        { key: 'lostReasonOtherSub', label: '失注サブ理由（その他）' },
        { key: 'lostReasonMemoTemplates', label: '（旧）備忘テンプレ（競合内訳は「失注サブ理由（競合要因）」へ統合）' },
        { key: 'recyclePriority', label: 'ナーチャリング優先度（A〜E）' },
        { type: 'divider', label: 'アクション' },
        { key: 'actionOutsideCall', label: '架電外アクション' },
        { key: 'nextActionContent', label: 'ネクストアクション内容' },
        { key: 'improvementCategory', label: '改善・学習カテゴリ' },
        { key: 'needTemperature', label: 'ニーズ温度（IS判定）' },
      ],
    },
    {
      id: 'dealManagement',
      title: '商談管理',
      fields: [
        { key: 'dealStaffFS', label: '商談担当FS' },
        { key: 'contractStaff', label: '契約担当者（成約・契約管理）' },
        { key: 'meetingStatus', label: '商談実施状況' },
        { key: 'dealResult', label: '商談結果' },
        { key: 'lostReasonFS', label: '失注理由（FS→IS）' },
        { key: 'contractReason', label: '成約要因' },
        { key: 'feedbackToIS', label: 'ISへのフィードバック' },
        { type: 'divider', label: 'BANT情報' },
        { key: 'bantBudget', label: 'BANT情報（B:予算）' },
        { key: 'bantAuthority', label: 'BANT情報（A:決裁権）' },
        { key: 'bantTimeline', label: 'BANT情報（T:導入時期）' },
        { key: 'competitorStatus', label: '競合状況' },
        { key: 'selfHandlingStatus', label: '自己対応状況' },
        { key: 'bantInfo', label: 'BANT情報（旧）' },
        { key: 'openingPeriod', label: '開業時期' },
        { type: 'divider', label: 'フェーズ・確度' },
        { key: 'dealPhase', label: '商談フェーズ' },
        { key: 'rankEstimate', label: '確度ヨミ' },
        { key: 'rankChange', label: '確度変化' },
      ],
    },
    {
      id: 'healthCheck',
      title: 'ヘルスチェック',
      fields: [],
    },
    {
      id: 'spreadsheet',
      title: 'シート連携',
      fields: [],
    },
    {
      id: 'users',
      title: 'ユーザー権限',
      fields: [],
    },
  ]

  // settingsがnullの場合はローディング表示
  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

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
                : activeSection === 'healthCheck'
                ? '未登録値（needs_review）を検知・回収するヘルスチェック'
                : activeSection === 'users'
                ? 'ユーザー権限を管理します（管理者のみ）'
                : 'ドロップダウンの選択項目を管理します'
              }
            </p>
          </div>
          {/* アクションボタン（ドロップダウン設定用） */}
          {(activeSection === 'call' || activeSection === 'dealManagement') && (
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
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#0083a0' }}
                  >
                    保存
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#0083a0' }}
                >
                  編集
                </button>
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
            {sections.filter(s => s.id === 'call' || s.id === 'dealManagement').map((section) => (
              <div key={section.id} className={activeSection === section.id ? '' : 'hidden'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.fields
                    .filter((f: any) => {
                      if (!('key' in f) || !f.key) return true
                      return !COMPAT_KEYS_ALWAYS.includes(f.key as keyof DropdownSettings)
                    })
                    .map((field, fieldIndex) => {
                    const fieldKey = 'type' in field && field.type === 'divider' 
                      ? `divider-${section.id}-${fieldIndex}`
                      : ('key' in field && field.key ? `${section.id}-${field.key}` : `${section.id}-field-${fieldIndex}`)
                    
                    return 'type' in field && field.type === 'divider' ? (
                      <div key={fieldKey} className="col-span-1 md:col-span-2 flex items-center gap-3 pt-6 pb-2">
                        <div className="h-px flex-1 bg-gray-300"></div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{field.label}</span>
                        <div className="h-px flex-1 bg-gray-300"></div>
                      </div>
                    ) : (
                    <React.Fragment key={fieldKey}>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                          {'key' in field && field.key ? getKeyLabel(field.key, field.label) : field.label}
                        </h3>
                        <div className="space-y-2">
                          {('key' in field && field.key && settings) ? (splitOptions(field.key as keyof DropdownSettings, settings[field.key as keyof DropdownSettings] || []).normal.map((option, index) => {
                            const settingFieldKey = field.key as keyof DropdownSettings
                            const isDragging = draggedIndex?.field === settingFieldKey && draggedIndex?.index === index
                            const isDragOver = dragOverIndex?.field === settingFieldKey && dragOverIndex?.index === index
                            
                            return (
                              <div 
                                key={index} 
                                className={`flex items-center gap-2 ${
                                  isDragging ? 'opacity-50' : ''
                                } ${
                                  isDragOver ? 'border-t-2 border-primary-500' : ''
                                }`}
                                draggable={isEditing}
                                onDragStart={(e) => {
                                  if (isEditing) {
                                    setDraggedIndex({ field: settingFieldKey, index })
                                    e.dataTransfer.effectAllowed = 'move'
                                  }
                                }}
                                onDragOver={(e) => {
                                  if (isEditing && draggedIndex && draggedIndex.field === settingFieldKey && draggedIndex.index !== index) {
                                    e.preventDefault()
                                    e.dataTransfer.dropEffect = 'move'
                                    setDragOverIndex({ field: settingFieldKey, index })
                                  }
                                }}
                                onDragLeave={() => {
                                  if (dragOverIndex?.field === settingFieldKey && dragOverIndex?.index === index) {
                                    setDragOverIndex(null)
                                  }
                                }}
                                onDrop={(e) => {
                                  e.preventDefault()
                                  if (draggedIndex && draggedIndex.field === settingFieldKey && draggedIndex.index !== index) {
                                    moveOption(settingFieldKey, draggedIndex.index, index)
                                  }
                                  setDraggedIndex(null)
                                  setDragOverIndex(null)
                                }}
                                onDragEnd={() => {
                                  setDraggedIndex(null)
                                  setDragOverIndex(null)
                                }}
                              >
                                {isEditing ? (
                                  <>
                                    <div 
                                      className="cursor-move flex-shrink-0 flex items-center justify-center" 
                                      title="ドラッグして並び順を変更"
                                      style={{ width: '24px', height: '24px', minWidth: '24px', minHeight: '24px' }}
                                    >
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="9" cy="5" r="2" fill="#6b7280"></circle>
                                        <circle cx="9" cy="12" r="2" fill="#6b7280"></circle>
                                        <circle cx="9" cy="19" r="2" fill="#6b7280"></circle>
                                        <circle cx="15" cy="5" r="2" fill="#6b7280"></circle>
                                        <circle cx="15" cy="12" r="2" fill="#6b7280"></circle>
                                        <circle cx="15" cy="19" r="2" fill="#6b7280"></circle>
                                      </svg>
                                    </div>
                                    <input
                                      type="text"
                                      value={option.label}
                                      onChange={(e) => {
                                        const newLabel = e.target.value
                                        // 表示名を変更したら、値も同じ値に自動更新
                                        updateOption(
                                          settingFieldKey,
                                          index,
                                          { value: newLabel, label: newLabel }
                                        )
                                      }}
                                      className="flex-1 input text-sm"
                                      placeholder="表示名"
                                    />
                                    <button
                                      onClick={() => removeOption(settingFieldKey, index)}
                                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors flex items-center justify-center"
                                      title="削除"
                                    >
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                      </svg>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex-1 px-3 py-2 text-sm bg-gray-50 rounded border border-gray-200 text-gray-700">
                                      {option.label}
                                    </div>
                                  </>
                                )}
                              </div>
                            )
                          })) : (
                            <div className="text-sm text-gray-500">設定が読み込まれていません</div>
                          )}
                          {isEditing && 'key' in field && field.key && (
                            <button
                              onClick={() => {
                                // 新しい項目を追加（値と表示名は同じ値で初期化）
                                const newValue = ''
                                addOption(field.key as keyof DropdownSettings, { value: newValue, label: newValue })
                              }}
                              className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                              + 項目を追加
                            </button>
                          )}
                        </div>
                      </div>
                      {/* リサイクル優先度の説明セクション */}
                    </React.Fragment>
                    )
                  })}

                  {/* リサイクル優先度の説明セクション（最下部へ移動） */}
                  {section.id === 'call' && (
                    <div className="col-span-1 md:col-span-2 border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">リサイクル優先度 判断基準</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-blue-100">
                              <th className="border border-blue-300 px-3 py-2 text-left font-semibold text-gray-900">優先度</th>
                              <th className="border border-blue-300 px-3 py-2 text-left font-semibold text-gray-900">判断基準例</th>
                              <th className="border border-blue-300 px-3 py-2 text-left font-semibold text-gray-900">対応アクション</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-blue-300 px-3 py-2 font-medium text-gray-900">A</td>
                              <td className="border border-blue-300 px-3 py-2 text-gray-700">
                                <ul className="list-disc list-inside space-y-1">
                                  <li>失注理由が「タイミング」</li>
                                  <li>RDで解決できる明確な課題あり。</li>
                                  <li>自己対応による失注</li>
                                </ul>
                              </td>
                              <td className="border border-blue-300 px-3 py-2 text-gray-700">
                                再度アプローチすることで、短期間（例：1ヶ月以内）での商談化が期待できる最優先リード。
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-blue-300 px-3 py-2 font-medium text-gray-900">B</td>
                              <td className="border border-blue-300 px-3 py-2 text-gray-700">
                                <ul className="list-disc list-inside space-y-1">
                                  <li>サービスに興味あり</li>
                                  <li>課題感は明確</li>
                                  <li>失注理由が「予算」</li>
                                </ul>
                              </td>
                              <td className="border border-blue-300 px-3 py-2 text-gray-700">
                                関心は示しており、タイミングや追加情報提供によって商談化の可能性があるリード。定期的なフォローアップ対象。
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-blue-300 px-3 py-2 font-medium text-gray-900">C</td>
                              <td className="border border-blue-300 px-3 py-2 text-gray-700">
                                <ul className="list-disc list-inside space-y-1">
                                  <li>課題認識は低いが課題あり</li>
                                  <li>過去の接触で明確な反応は薄い</li>
                                  <li>他の税理士決定だが不満がでる可能性</li>
                                </ul>
                              </td>
                              <td className="border border-blue-300 px-3 py-2 text-gray-700">
                                中長期的な関係構築が必要なリード。有益な情報提供を通じて関心度を高めるナーチャリング対象。
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-blue-300 px-3 py-2 font-medium text-gray-900">D</td>
                              <td className="border border-blue-300 px-3 py-2 text-gray-700">
                                <ul className="list-disc list-inside space-y-1">
                                  <li>反応がほとんどない</li>
                                  <li>失注理由が「機能不足」「競合決定」</li>
                                </ul>
                              </td>
                              <td className="border border-blue-300 px-3 py-2 text-gray-700">
                                アプローチの優先度は低いが、将来的に状況が変わる可能性もあるリード。低頻度での情報提供や、新機能リリースなどのタイミングで再アプローチを検討。
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-blue-300 px-3 py-2 font-medium text-gray-900">E</td>
                              <td className="border border-blue-300 px-3 py-2 text-gray-700">
                                <ul className="list-disc list-inside space-y-1">
                                  <li>ターゲット条件から外れている（業種、規模など）</li>
                                  <li>連絡先不明、コンタクト不可</li>
                                  <li>明確なアプローチ拒否</li>
                                </ul>
                              </td>
                              <td className="border border-blue-300 px-3 py-2 text-gray-700">
                                基本的にリサイクル対象外とするリード。CRM上は区別して管理。
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 互換セクション（折りたたみ・閲覧のみ） */}
                  <div className="col-span-1 md:col-span-2 border border-amber-200 rounded-lg bg-amber-50">
                    <button
                      onClick={() => {
                        setCompatSectionOpen((prev) => ({
                          ...prev,
                          [section.id]: !prev[section.id],
                        }))
                      }}
                      className="w-full flex items-center justify-between px-4 py-3"
                      title="互換セクションを開閉"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-amber-900">互換（旧データ表示用・原則編集禁止）</span>
                        <span className="text-xs text-amber-700">（デフォルト折りたたみ）</span>
                      </div>
                      <span className="text-amber-800 text-sm">{compatSectionOpen[section.id] ? '▲' : '▼'}</span>
                    </button>

                    {compatSectionOpen[section.id] && (
                      <div className="px-4 pb-4">
                        <div className="text-xs text-amber-800 mb-3">
                          過去データ表示のための互換枠です。MVPでは<strong>閲覧のみ</strong>（編集導線なし）です。
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(() => {
                            const compatFields: Array<{ key: keyof DropdownSettings; label: string }> = []

                            // 常に互換に隔離するキー
                            for (const k of COMPAT_KEYS_ALWAYS) {
                              if ((section.id === 'call' && (k === 'cannotContactReason' || k === 'lostReasonMemoTemplates')) || (section.id === 'dealManagement' && k === 'bantInfo')) {
                                compatFields.push({ key: k, label: getKeyLabel(String(k), SETTING_LABELS_JA[String(k)]) })
                              }
                            }

                            // (旧)選択肢を隔離するキー
                            for (const k of COMPAT_OPTION_FIELDS) {
                              if (section.id !== 'call') continue
                              const { compat } = splitOptions(k, settings?.[k] || [])
                              if (compat.length > 0) {
                                compatFields.push({ key: k, label: `${getKeyLabel(String(k), SETTING_LABELS_JA[String(k)])}（互換）` })
                              }
                            }

                            if (compatFields.length === 0) {
                              return <div className="text-sm text-gray-600">互換項目はありません</div>
                            }

                            return compatFields.map((f) => {
                              const { compat } = splitOptions(f.key, settings?.[f.key] || [])
                              return (
                                <div key={`compat-${section.id}-${String(f.key)}`} className="border border-amber-200 rounded bg-white p-3">
                                  <div className="text-sm font-semibold text-gray-900 mb-2">{f.label}</div>
                                  <div className="space-y-1">
                                    {compat.length === 0 ? (
                                      <div className="text-sm text-gray-500">互換値なし</div>
                                    ) : (
                                      compat.map((opt, idx) => (
                                        <div key={idx} className="px-3 py-2 text-sm bg-gray-50 rounded border border-gray-200 text-gray-700">
                                          {opt.label}
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              )
                            })
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* ヘルスチェック */}
            {activeSection === 'healthCheck' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">ヘルスチェック（未登録値の要確認）</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      DB内の実値と許容値（ドロップダウン設定）を突合し、未登録値を集約表示します（MVP）
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={healthStatusFilter}
                      onChange={(e) => setHealthStatusFilter(e.target.value as any)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      title="ステータス"
                    >
                      <option value="open">open</option>
                      <option value="resolved">resolved</option>
                      <option value="ignored">ignored</option>
                    </select>
                    <button
                      onClick={fetchHealthIssues}
                      disabled={isLoadingHealthIssues}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoadingHealthIssues ? '読み込み中...' : '更新'}
                    </button>
                    <button
                      onClick={runHealthScan}
                      disabled={isRunningHealthScan}
                      className="px-4 py-2 text-sm font-medium text-amber-900 bg-amber-100 rounded-lg hover:bg-amber-200 disabled:opacity-70"
                      title="DBをスキャンして要確認を更新します"
                    >
                      {isRunningHealthScan ? 'スキャン中...' : 'スキャン実行'}
                    </button>
                  </div>
                </div>

                {healthTableMissing && (
                  <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-sm text-amber-900">
                    要確認テーブルが未作成の可能性があります（`data_quality_issues`）。Supabaseマイグレーションを適用してください。
                  </div>
                )}

                {isLoadingHealthIssues ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : healthIssues.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-sm">要確認はありません</p>
                    <p className="text-xs mt-2">「スキャン実行」で再チェックできます</p>
                  </div>
                ) : (
                  <div className="overflow-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設定キー</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">未登録値</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">件数</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最終観測</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {healthIssues.map((issue) => (
                          <tr key={issue.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {issue.setting_key_label_ja
                                ? `${issue.setting_key}（${issue.setting_key_label_ja}）`
                                : getKeyLabel(issue.setting_key, issue.setting_key)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{issue.observed_value}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-right">{issue.count_total}</td>
                            <td className="px-4 py-3 text-xs text-gray-500">{issue.last_seen_at ? new Date(issue.last_seen_at).toLocaleString('ja-JP') : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {/* ユーザー権限設定セクション */}
            <div className={activeSection === 'users' ? '' : 'hidden'}>
              <div className="space-y-6">
                {/* 現在のユーザー情報表示 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">現在のユーザー情報</h3>
                  {(session?.user || (isDevelopment && sessionStatus === 'unauthenticated')) ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {session?.user?.name || session?.user?.email || '開発ユーザー'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {session?.user?.email || 'tmatsukuma@redish.jp'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded ${
                            userRole === 'admin' ? 'bg-red-100 text-red-800' :
                            userRole === 'manager' ? 'bg-blue-100 text-blue-800' :
                            userRole === 'staff' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {userRole === 'admin' ? '管理者' :
                             userRole === 'manager' ? 'マネージャー' :
                             userRole === 'staff' ? 'スタッフ' :
                             '権限未設定'}
                          </span>
                        </div>
                      </div>
                      {userRole !== 'admin' ? (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800">
                            <strong>注意:</strong> カスタムフィールドの追加・編集には <strong>管理者</strong> 権限が必要です。
                          </p>
                          <p className="text-xs text-yellow-700 mt-2">
                            現在の権限では「カスタムフィールドを追加」ボタンは表示されません。権限の変更が必要な場合は、管理者に依頼してください。
                          </p>
                          {isDevelopment && (
                            <div className="mt-3 pt-3 border-t border-yellow-300">
                              <p className="text-xs text-yellow-800 mb-2">
                                <strong>開発環境:</strong> 開発ユーザーを管理者に設定できます
                              </p>
                              <button
                                onClick={async () => {
                                  if (!confirm('開発ユーザー（tmatsukuma@redish.jp）を管理者に設定しますか？')) {
                                    return
                                  }
                                  try {
                                    const email = session?.user?.email || 'tmatsukuma@redish.jp'
                                    const response = await fetch('/api/users/setup-dev', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ email, role: 'admin' }),
                                    })
                                    const data = await response.json()
                                    if (response.ok) {
                                      alert(data.message || '管理者権限を設定しました。ページをリロードします。')
                                      window.location.reload()
                                    } else {
                                      // エラーメッセージを詳細に表示
                                      let errorMessage = data.error || '管理者権限の設定に失敗しました'
                                      if (data.message) {
                                        errorMessage += '\n\n' + data.message
                                      }
                                      if (data.instructions) {
                                        errorMessage += '\n\n【設定手順】\n' + data.instructions
                                      }
                                      if (data.details) {
                                        errorMessage += '\n\n【詳細】\n' + data.details
                                      }
                                      alert(errorMessage)
                                    }
                                  } catch (error) {
                                    console.error('Failed to setup admin:', error)
                                    alert('管理者権限の設定に失敗しました。\nSupabaseダッシュボードから手動で設定してください。')
                                  }
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-yellow-600 rounded hover:bg-yellow-700 transition-colors"
                              >
                                🔧 開発環境: 管理者権限を設定
                              </button>
                            </div>
                          )}
                        </div>
                      ) : userRole === 'admin' ? (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-xs text-green-800">
                            ✓ カスタムフィールドの追加・編集が可能です。
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-800">
                            ✓ 通常の設定（マッピング設定など）が可能です。
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">ログイン情報を取得できませんでした</p>
                    </div>
                  )}
                </div>

                {/* ユーザー一覧（adminのみ） */}
                {userRole === 'admin' && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">ユーザー一覧</h3>
                      <button
                        onClick={() => {
                          setNewUser({ email: '', full_name: '', role: 'staff', department: '' })
                          setShowAddUserModal(true)
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                      >
                        + ユーザーを追加
                      </button>
                    </div>
                    {isLoadingUsers ? (
                      <div className="text-center py-8 text-gray-500">読み込み中...</div>
                    ) : users.length > 0 ? (
                      <div className="space-y-2">
                        {users.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{user.full_name || user.email}</div>
                              <div className="text-xs text-gray-500 mt-1">{user.email}</div>
                              {user.department && (
                                <div className="text-xs text-gray-500 mt-1">部署: {user.department}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {editingUserId === user.id ? (
                                <>
                                  <select
                                    value={editingUserRole}
                                    onChange={(e) => setEditingUserRole(e.target.value as any)}
                                    title={`${user.full_name || user.email}の権限を選択`}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="staff">スタッフ</option>
                                    <option value="manager">マネージャー</option>
                                    <option value="admin">管理者</option>
                                  </select>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const response = await fetch('/api/users', {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ id: user.id, role: editingUserRole }),
                                        })
                                        if (response.ok) {
                                          const { user: updatedUser } = await response.json()
                                          setUsers(users.map(u => u.id === user.id ? updatedUser : u))
                                          setEditingUserId(null)
                                          
                                          // 自分の権限を更新した場合は、userRoleも更新
                                          if (user.id === session?.user?.email && session?.user) {
                                            setUserRole(editingUserRole)
                                          }
                                          
                                          alert('ユーザー権限を更新しました')
                                          // ページをリロードして反映
                                          window.location.reload()
                                        } else {
                                          const error = await response.json()
                                          alert(error.error || 'ユーザー権限の更新に失敗しました')
                                        }
                                      } catch (error) {
                                        console.error('Failed to update user role:', error)
                                        alert('ユーザー権限の更新に失敗しました')
                                      }
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                                  >
                                    保存
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingUserId(null)
                                      setEditingUserRole('staff')
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                  >
                                    キャンセル
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className={`px-3 py-1 text-xs font-medium rounded ${
                                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                    user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {user.role === 'admin' ? '管理者' :
                                     user.role === 'manager' ? 'マネージャー' :
                                     'スタッフ'}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingUserId(user.id)
                                      setEditingUserRole(user.role || 'staff')
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                  >
                                    編集
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">ユーザーが登録されていません</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
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
                  onClick={() => setSpreadsheetSubTab('data')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    spreadsheetSubTab === 'data'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  連携データ
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
                          ヘッダー行は下の入力欄で指定できます。Excelから「CSV UTF-8（コンマ区切り）」形式で保存してください。
                        </p>
                        {uploadedFile && (
                          <p className="mt-2 text-sm text-green-600">
                            ✓ {uploadedFile.name} を読み込みました
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ヘッダー行 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={spreadsheetConfig.headerRow === 0 ? '' : spreadsheetConfig.headerRow}
                          onChange={(e) => {
                            const val = e.target.value
                            if (val === '' || /^\d+$/.test(val)) {
                              const num = parseInt(val, 10)
                              updateSpreadsheetConfig({ headerRow: isNaN(num) ? 0 : num })
                            }
                          }}
                          className="w-full input text-sm"
                          placeholder="例: 8"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          列名（ヘッダー）が記載されている行番号を指定してください
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={runCsvMapping}
                          disabled={csvRows.length === 0}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            csvRows.length === 0
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                        >
                          カラムマッピングを実行
                        </button>
                        <p className="mt-1 text-xs text-gray-500">
                          ヘッダー行を入力後に実行してください
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={importCallCsvDirect}
                          disabled={csvRows.length === 0 || isImporting}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            csvRows.length === 0 || isImporting
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          架電CSVをDBに取り込む
                        </button>
                        <p className="mt-1 text-xs text-gray-500">
                          TEMPOS/OMCのみ対象、固定マッピングで更新します
                        </p>
                        {saveMessage && (
                          <div className="mt-2 p-3 rounded-lg bg-green-50 border border-green-200">
                            <p className="text-sm text-green-700">{saveMessage}</p>
                          </div>
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
                                onChange={(e) => {
                                  if (e.target.value === '__add_custom__') {
                                    setPendingMappingIndex(index)
                                    setShowCustomFieldModal(true)
                                  } else {
                                    updateMapping(index, e.target.value)
                                  }
                                }}
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
                                {customFields.map((field) => {
                                  const isUsedElsewhere = usedFields.has(field.field_key) && mapping.targetField !== field.field_key
                                  return (
                                    <option 
                                      key={field.field_key} 
                                      value={field.field_key}
                                      disabled={isUsedElsewhere}
                                    >
                                      {field.field_label}（カスタム: {field.field_key}）{isUsedElsewhere ? ' [使用中]' : ''}
                                    </option>
                                  )
                                })}
                                {userRole === 'admin' && (
                                  <option value="__add_custom__" className="text-blue-600 font-semibold">
                                    + カスタムフィールドを追加
                                  </option>
                                )}
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
                        
                        {/* 更新モード選択 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            デフォルト更新モード
                          </label>
                          <select
                            value={updateMode}
                            onChange={(e) => setUpdateMode(e.target.value as 'incremental' | 'full')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="incremental">差分更新（最新N件）</option>
                            <option value="full">全件更新</option>
                          </select>
                          <p className="mt-1 text-xs text-gray-500">
                            {updateMode === 'incremental' 
                              ? 'デフォルトで最新のデータのみを処理します（推奨）。連携リストのボタンで上書き可能です。'
                              : 'デフォルトでスプレッドシートの全データを処理します。連携リストのボタンで上書き可能です。'}
                          </p>
                        </div>
                        
                        {/* 差分更新件数（差分更新モード時のみ表示） */}
                        {updateMode === 'incremental' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              差分更新件数
                            </label>
                            <input
                              type="number"
                              value={incrementalLimit}
                              onChange={(e) => setIncrementalLimit(Math.max(1, parseInt(e.target.value) || 100))}
                              min={1}
                              max={10000}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="100"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              最新の何件を処理するか指定します（デフォルト: 100件）
                            </p>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          {editingConfigId && (
                            <button
                              onClick={() => {
                                setEditingConfigId(null)
                                setNewConfigName('')
                                setNewLeadSourcePrefix('')
                                setUpdateMode('incremental')
                                setIncrementalLimit(100)
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
                {/* 取り込み結果（needs_review表示） */}
                {importResult && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold text-gray-900">直近の取り込み結果</div>
                          <button
                            onClick={() => {
                              if (confirm('インポート履歴をすべて削除しますか？')) {
                                localStorage.removeItem('sfa-import-result-history')
                                setImportResultHistory([])
                                setImportResult(null)
                                setSelectedHistoryIndex(0)
                              }
                            }}
                            className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                            title="履歴をクリア"
                          >
                            履歴をクリア
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          importRunId: <span className="font-mono">{importResult.importRunId || '-'}</span>
                        </div>
                        {/* 履歴一覧 */}
                        {importResultHistory.length > 0 && (
                          <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              履歴一覧
                            </label>
                            <select
                              value={selectedHistoryIndex}
                              onChange={(e) => {
                                const index = parseInt(e.target.value)
                                setSelectedHistoryIndex(index)
                                setImportResult(importResultHistory[index].result)
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {importResultHistory.map((entry, index) => (
                                <option key={entry.id} value={index}>
                                  {new Date(entry.timestamp).toLocaleString('ja-JP', { 
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })} - {entry.configName} ({entry.result.success}件成功, {entry.result.failed}件失敗)
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="border border-gray-200 rounded p-3">
                        <div className="text-xs text-gray-500">成功</div>
                        <div className="text-lg font-bold text-green-700">{importResult.success}</div>
                      </div>
                      <div className="border border-gray-200 rounded p-3">
                        <div className="text-xs text-gray-500">失敗（DB操作エラーのみ）</div>
                        <div className="text-lg font-bold text-gray-700">{importResult.failed}</div>
                      </div>
                    </div>

                    {/* 重要データ欠損統計（常に表示、0件でも表示） */}
                    {importResult.criticalMissingDataStats && (
                      <div className="mt-4">
                        <div className="text-sm font-semibold text-red-900 mb-2">⚠️ 重要データ欠損統計</div>
                        <div className="border border-red-200 rounded-lg p-3 bg-red-50">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-2">
                            {(['linkedDate', 'contactName', 'phone'] as const).map((fieldKey) => {
                              const count = importResult.criticalMissingDataStats?.[fieldKey] || 0
                              return (
                                <div key={fieldKey} className={`border rounded-lg p-2 shadow-sm ${
                                  count > 0 
                                    ? 'border-red-300 bg-white' 
                                    : 'border-gray-200 bg-gray-50'
                                }`}>
                                  <div className={`text-xs mb-1 ${
                                    count > 0 ? 'text-red-700' : 'text-gray-500'
                                  }`}>
                                    {FIELD_LABELS[fieldKey] || fieldKey}
                                  </div>
                                  <div className={`text-sm font-bold ${
                                    count > 0 ? 'text-red-900' : 'text-gray-400'
                                  }`}>
                                    {count}件
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          <p className="text-xs text-red-600 mt-2">
                            連携日付、氏名、電話番号のいずれかが欠けているデータの件数です。リード連携元への通知が必要な場合があります。
                          </p>
                        </div>
                      </div>
                    )}

                    {/* データ欠損統計 */}
                    {importResult.missingDataStats && Object.keys(importResult.missingDataStats).length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-semibold text-gray-900 mb-2">データ欠損統計</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-2">
                          {Object.entries(importResult.missingDataStats).map(([fieldKey, count]) => (
                            <div key={fieldKey} className="border border-gray-200 rounded-lg p-2 bg-white shadow-sm">
                              <div className="text-xs text-gray-500 mb-1">{FIELD_LABELS[fieldKey] || fieldKey}</div>
                              <div className="text-sm font-bold text-gray-900">{count}件</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                      <div className="flex gap-2">
                        {/* 全件一括取得ボタン */}
                        <button
                          onClick={async () => {
                            if (!confirm('すべての連携済みスプレッドシートから全件データを一括取得しますか？')) {
                              return
                            }
                            
                            setIsImporting(true)
                            setImportingState({ configId: 'all', mode: 'full' })
                            setImportResult(null)
                            
                            try {
                              console.log(`[sync-all-full] Starting full sync for ${savedConfigs.length} configs...`)
                              
                              // タイムアウト設定（10分 = 600秒）- 全件取得は時間がかかるため
                              const controller = new AbortController()
                              const timeoutId = setTimeout(() => controller.abort(), 600000)
                              
                              const response = await fetch('/api/spreadsheet/sync-all', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ configs: savedConfigs.map(c => ({ ...c, updateMode: 'full' })) }),
                                signal: controller.signal,
                              })
                              
                              clearTimeout(timeoutId)
                              console.log(`[sync-all-full] Response status: ${response.status}`)
                              
                              if (!response.ok) {
                                const errorText = await response.text()
                                console.error(`[sync-all-full] HTTP error: ${response.status}`, errorText)
                                throw new Error(`HTTP ${response.status}: ${errorText}`)
                              }
                              
                              const result = await response.json()
                              console.log(`[sync-all-full] Result:`, result)
                              
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
                              
                              console.log(`[sync-all-full] 全件一括取得完了: ${totalImported}件成功, ${totalFailed}件失敗`)
                            } catch (error: any) {
                              console.error('Sync all full failed:', error)
                              const errorMessage = error?.message || '不明なエラー'
                              alert(`全件一括取得に失敗しました: ${errorMessage}`)
                            } finally {
                              setIsImporting(false)
                              setImportingState(null)
                            }
                          }}
                          disabled={importingState?.configId === 'all'}
                          className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                            importingState?.configId === 'all' && importingState?.mode === 'full'
                              ? 'text-orange-700 bg-orange-100 cursor-wait'
                              : 'text-white bg-red-600 hover:bg-red-700'
                          } disabled:opacity-70`}
                          title="全リードソースから全件データを一括取得"
                        >
                          {importingState?.configId === 'all' && importingState?.mode === 'full' ? (
                            <span className="flex items-center gap-1">
                              <span className="animate-spin">⏳</span>
                              <span>全件取得中...</span>
                            </span>
                          ) : (
                            '🔄 全件一括取得'
                          )}
                        </button>
                        
                        {/* 全件一括差分取得ボタン */}
                        <button
                          onClick={async () => {
                            if (!confirm('すべての連携済みスプレッドシートから差分データを一括取得しますか？')) {
                              return
                            }
                            
                            setIsImporting(true)
                            setImportingState({ configId: 'all', mode: 'incremental' })
                            setImportResult(null)
                            
                            try {
                              console.log(`[sync-all-incremental] Starting incremental sync for ${savedConfigs.length} configs...`)
                              
                              // タイムアウト設定（120秒）
                              const controller = new AbortController()
                              const timeoutId = setTimeout(() => controller.abort(), 120000)
                              
                              const response = await fetch('/api/spreadsheet/sync-all', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ configs: savedConfigs.map(c => ({ ...c, updateMode: 'incremental' })) }),
                                signal: controller.signal,
                              })
                              
                              clearTimeout(timeoutId)
                              console.log(`[sync-all-incremental] Response status: ${response.status}`)
                              
                              if (!response.ok) {
                                const errorText = await response.text()
                                console.error(`[sync-all-incremental] HTTP error: ${response.status}`, errorText)
                                throw new Error(`HTTP ${response.status}: ${errorText}`)
                              }
                              
                              const result = await response.json()
                              console.log(`[sync-all-incremental] Result:`, result)
                              
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
                              
                              console.log(`[sync-all-incremental] 全件一括差分取得完了: ${totalImported}件成功, ${totalFailed}件失敗`)
                            } catch (error: any) {
                              console.error('Sync all incremental failed:', error)
                              const errorMessage = error?.message || '不明なエラー'
                              alert(`全件一括差分取得に失敗しました: ${errorMessage}`)
                            } finally {
                              setIsImporting(false)
                              setImportingState(null)
                            }
                          }}
                          disabled={importingState?.configId === 'all'}
                          className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                            importingState?.configId === 'all' && importingState?.mode === 'incremental'
                              ? 'text-orange-700 bg-orange-100 cursor-wait'
                              : 'text-white bg-blue-600 hover:bg-blue-700'
                          } disabled:opacity-70`}
                          title="全リードソースから差分データのみを一括取得"
                        >
                          {importingState?.configId === 'all' && importingState?.mode === 'incremental' ? (
                            <span className="flex items-center gap-1">
                              <span className="animate-spin">⏳</span>
                              <span>差分取得中...</span>
                            </span>
                          ) : (
                            '🔄 全件一括差分取得'
                          )}
                        </button>
                      </div>
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
                          <div className="flex items-end justify-between">
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
                            <div className="flex items-end justify-end gap-3 ml-4">
                              {/* 取得結果表示（左側） */}
                              {lastImportResults[config.id] && importingState?.configId !== config.id && (
                                <div className="flex flex-col text-xs min-w-[120px]">
                                  <span className="text-green-600 font-medium">
                                    ✓ {lastImportResults[config.id].success}件成功
                                  </span>
                                  {lastImportResults[config.id].failed > 0 && (
                                    <span className="text-gray-500">
                                      ({lastImportResults[config.id].failed}件スキップ)
                                    </span>
                                  )}
                                  {(lastImportResults[config.id].needsReviewCount || 0) > 0 && (
                                    <span className="text-amber-700 font-medium">
                                      要確認 {lastImportResults[config.id].needsReviewCount}件
                                    </span>
                                  )}
                                  <span className="text-gray-400">
                                    {lastImportResults[config.id].time}
                                  </span>
                                </div>
                              )}
                              {/* ボタン群（横一列・右寄せ・下寄せ） */}
                              <div className="flex items-end gap-1.5">
                                {/* 全件データ取得ボタン */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    importData(config, 'full')
                                  }}
                                  disabled={importingState?.configId === config.id}
                                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                                    importingState?.configId === config.id && importingState?.mode === 'full'
                                      ? 'text-orange-700 bg-orange-100 cursor-wait'
                                      : 'text-white bg-red-400 hover:bg-red-500'
                                  } disabled:opacity-70`}
                                  title="全件データ取得"
                                >
                                  {importingState?.configId === config.id && importingState?.mode === 'full' ? (
                                    <span className="flex items-center gap-1">
                                      <span className="animate-spin">⏳</span>
                                      <span>全件取得中</span>
                                    </span>
                                  ) : (
                                    '全件'
                                  )}
                                </button>
                                {/* 差分データ取得ボタン */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    importData(config, 'incremental')
                                  }}
                                  disabled={importingState?.configId === config.id}
                                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                                    importingState?.configId === config.id && importingState?.mode === 'incremental'
                                      ? 'text-orange-700 bg-orange-100 cursor-wait'
                                      : 'text-white bg-blue-400 hover:bg-blue-500'
                                  } disabled:opacity-70`}
                                  title="差分データ取得"
                                >
                                  {importingState?.configId === config.id && importingState?.mode === 'incremental' ? (
                                    <span className="flex items-center gap-1">
                                      <span className="animate-spin">⏳</span>
                                      <span>差分取得中</span>
                                    </span>
                                  ) : (
                                    '差分'
                                  )}
                                </button>
                                {/* 編集ボタン */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    loadConfigForEdit(config)
                                  }}
                                  className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors whitespace-nowrap"
                                >
                                  編集
                                </button>
                                {/* 削除ボタン（ゴミ箱マーク） */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteConfig(config.id)
                                  }}
                                  className="px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors whitespace-nowrap"
                                  title="削除"
                                >
                                  🗑️
                                </button>
                              </div>
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
                                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">列</th>
                                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">ヘッダー名</th>
                                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">マッピング先</th>
                                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">サンプルデータ</th>
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
                
                {/* カスタムフィールド管理セクション */}
                <div className="border border-gray-200 rounded-lg p-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">カスタムマッピングフィールド</h2>
                      <p className="text-xs text-gray-500 mt-1">
                        マッピング先に追加できるカスタムフィールドを管理します
                      </p>
                    </div>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => {
                          setNewCustomField({ field_key: '', field_label: '', field_type: 'text', description: '' })
                          setShowCustomFieldModal(true)
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        + カスタムフィールドを追加
                      </button>
                    )}
                  </div>
                  
                  {isLoadingCustomFields ? (
                    <div className="text-center py-8 text-gray-500">読み込み中...</div>
                  ) : customFields.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">フィールドキー</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">表示名</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">タイプ</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">説明</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">作成日</th>
                            {userRole === 'admin' && (
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {customFields.map((field) => (
                            <tr key={field.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-mono text-gray-900">{field.field_key}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{field.field_label}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  field.field_type === 'text' ? 'bg-blue-100 text-blue-800' :
                                  field.field_type === 'number' ? 'bg-green-100 text-green-800' :
                                  field.field_type === 'date' ? 'bg-purple-100 text-purple-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {field.field_type === 'text' ? 'テキスト' :
                                   field.field_type === 'number' ? '数値' :
                                   field.field_type === 'date' ? '日付' :
                                   '真偽値'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate" title={field.description || ''}>
                                {field.description || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {field.created_at ? new Date(field.created_at).toLocaleDateString('ja-JP') : '-'}
                              </td>
                              {userRole === 'admin' && (
                                <td className="px-4 py-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setNewCustomField({
                                          field_key: field.field_key,
                                          field_label: field.field_label,
                                          field_type: field.field_type,
                                          description: field.description || '',
                                        })
                                        setEditingCustomFieldId(field.id)
                                        setShowCustomFieldModal(true)
                                      }}
                                      className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                    >
                                      編集
                                    </button>
                                    {userRole === 'admin' && (
                                      <button
                                        onClick={async () => {
                                          if (!confirm(`「${field.field_label}」を削除しますか？\nこの操作は取り消せません。`)) {
                                            return
                                          }
                                          try {
                                            const response = await fetch(`/api/custom-mapping-fields?id=${field.id}`, {
                                              method: 'DELETE',
                                            })
                                            if (response.ok) {
                                              setCustomFields(customFields.filter(f => f.id !== field.id))
                                              alert('カスタムフィールドを削除しました')
                                            } else {
                                              const error = await response.json()
                                              alert(error.error || 'カスタムフィールドの削除に失敗しました')
                                            }
                                          } catch (error) {
                                            console.error('Failed to delete custom field:', error)
                                            alert('カスタムフィールドの削除に失敗しました')
                                          }
                                        }}
                                        className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                      >
                                        削除
                                      </button>
                                    )}
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">カスタムフィールドが登録されていません</p>
                      {userRole === 'admin' && (
                        <p className="text-xs mt-2 text-gray-400">
                          「+ カスタムフィールドを追加」ボタンから追加できます
                        </p>
                      )}
                    </div>
                  )}
                </div>
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
                    スプレッドシートから取得したリードデータ
                    {showAllRecords ? '（全件表示中）' : '（最新100件）'}
                    {totalRecordsCount !== null && !showAllRecords && ` - 総件数: ${totalRecordsCount}件`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* リードソースフィルタ */}
                  <select
                    value={recordsFilter}
                    onChange={(e) => {
                      setRecordsFilter(e.target.value)
                      setShowAllRecords(false)
                    }}
                    title="リードソースでフィルタ"
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">すべてのソース</option>
                    {savedConfigs.map(config => (
                      <option key={config.id} value={config.name}>
                        {config.name}
                      </option>
                    ))}
                  </select>
                  {/* 全件表示ボタン */}
                  <button
                    onClick={() => loadImportedRecords(true)}
                    disabled={isLoadingRecords || showAllRecords}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      showAllRecords
                        ? 'text-gray-500 bg-gray-100 cursor-default'
                        : 'text-white bg-green-600 hover:bg-green-700'
                    } disabled:opacity-50`}
                  >
                    {isLoadingRecords ? '読み込み中...' : showAllRecords ? '✓ 全件表示中' : '📋 全件表示'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAllRecords(false)
                      loadImportedRecords(false)
                    }}
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
                  <>
                    {importedRecords.length}件のデータ
                    {recordsFilter !== 'all' && `（${recordsFilter}）`}
                    {totalRecordsCount !== null && !showAllRecords && importedRecords.length < totalRecordsCount && (
                      <span className="text-gray-400 ml-2">
                        （全{totalRecordsCount}件中）
                      </span>
                    )}
                  </>
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
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          連携日
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          リードID
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          ソース
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          氏名
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          電話番号
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          ステータス
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {importedRecords.map((record) => (
                        <tr key={record.lead_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.linked_date || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-blue-600 max-w-[120px] truncate" title={record.lead_id}>
                            {record.lead_id}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {record.lead_source || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.contact_name || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                            {record.phone || '-'}
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
            className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300"
            onClick={() => {
              setViewingMappingConfig(null)
              setEditingMappingInPanel(null)
            }}
          />
          
          {/* サイドパネル */}
          <div className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl z-50 flex flex-col animate-[slideInRight_0.3s_ease-out]">
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
                onClick={() => {
                  setViewingMappingConfig(null)
                  setEditingMappingInPanel(null)
                }}
                title="閉じる"
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
                      {(editingMappingInPanel || viewingMappingConfig).columnMappings.filter(m => m.targetField).length}列
                    </span>
                  </div>
                </div>
                
                {/* マッピングテーブル（A列から順に表示） */}
                {viewingMappingConfig.columnMappings.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 shrink-0">
                      <h3 className="text-sm font-semibold text-gray-900">カラムマッピング一覧（A列から順）</h3>
                    </div>
                    <div className="overflow-auto flex-1">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0 z-20">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 sticky left-0 bg-gray-50 z-30 border-r border-gray-200 shadow-sm">列</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">スプレッドシートのヘッダー</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">サンプルデータ</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">マッピング先フィールド</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {(editingMappingInPanel || viewingMappingConfig).columnMappings.map((mapping, index) => {
                            const currentConfig = editingMappingInPanel || viewingMappingConfig
                            const handleMappingChange = (newTargetField: string) => {
                              if (!editingMappingInPanel) {
                                // 編集モードに切り替え
                                setEditingMappingInPanel({ ...viewingMappingConfig! })
                              }
                              const updatedMappings = [...(editingMappingInPanel || viewingMappingConfig).columnMappings]
                              updatedMappings[index] = { ...updatedMappings[index], targetField: newTargetField }
                              setEditingMappingInPanel({ ...currentConfig, columnMappings: updatedMappings })
                            }
                            
                            return (
                              <tr key={index} className={mapping.targetField ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'}>
                                <td className={`px-4 py-3 text-sm font-mono text-center font-semibold sticky left-0 z-20 border-r border-gray-200 shadow-sm ${mapping.targetField ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                  {mapping.spreadsheetColumn}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {mapping.spreadsheetHeader || '（空）'}
                                </td>
                                <td className={`px-4 py-3 text-sm max-w-xs truncate ${mapping.targetField ? 'bg-blue-50 text-gray-700' : 'bg-gray-50 text-gray-600'}`} title={mapping.sampleData || ''}>
                                  {mapping.sampleData || '（データなし）'}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={mapping.targetField || ''}
                                    onChange={(e) => {
                                      if (e.target.value === '__add_custom__') {
                                        setPendingMappingIndex(index)
                                        setShowCustomFieldModal(true)
                                      } else {
                                        handleMappingChange(e.target.value)
                                      }
                                    }}
                                      title={`${mapping.spreadsheetColumn}列のマッピング先フィールドを選択`}
                                      className={`flex-1 px-2 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        mapping.targetField 
                                          ? 'border-blue-300 bg-blue-50 text-blue-900' 
                                          : 'border-gray-300 bg-white'
                                      }`}
                                    >
                                      <option value="">-- マッピングしない --</option>
                                      {MAPPABLE_FIELDS.map(field => (
                                        <option key={field.key} value={field.key}>
                                          {field.label}{field.required ? ' *' : ''} ({camelToSnake(field.key)})
                                        </option>
                                      ))}
                                      {customFields.map(field => (
                                        <option key={field.field_key} value={field.field_key}>
                                          {field.field_label} (カスタム: {field.field_key})
                                        </option>
                                      ))}
                                      {userRole === 'admin' && (
                                        <option value="__add_custom__" className="text-blue-600 font-semibold">
                                          + カスタムフィールドを追加
                                        </option>
                                      )}
                                    </select>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
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
              {editingMappingInPanel && (
                <button
                  onClick={async () => {
                    // 編集内容を保存
                    const configToSave = editingMappingInPanel
                    const updatedConfig: SavedSpreadsheetConfig = {
                      ...configToSave,
                      lastSavedAt: new Date().toISOString(),
                    }
                    
                    // データベースに保存
                    try {
                      const response = await fetch('/api/spreadsheet/configs', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ config: updatedConfig }),
                      })
                      if (response.ok) {
                        const { result } = await response.json()
                        if (result?.id) {
                          updatedConfig.id = result.id
                        }
                      }
                    } catch (error) {
                      console.error('Failed to save to DB:', error)
                    }
                    
                    // ローカルストレージとstateを更新
                    const updated = savedConfigs.map(c => 
                      c.id === updatedConfig.id ? updatedConfig : c
                    )
                    setSavedConfigs(updated)
                    localStorage.setItem('sfa-saved-spreadsheet-configs', JSON.stringify(updated))
                    
                    // 表示を更新
                    setViewingMappingConfig(updatedConfig)
                    setEditingMappingInPanel(null)
                    
                    alert('マッピング設定を保存しました')
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存
                </button>
              )}
              {editingMappingInPanel && (
                <button
                  onClick={() => {
                    setEditingMappingInPanel(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              )}
              {!editingMappingInPanel && (
                <button
                  onClick={() => {
                    loadConfigForEdit(viewingMappingConfig)
                    setViewingMappingConfig(null)
                    setEditingMappingInPanel(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  詳細編集
                </button>
              )}
              <button
                onClick={() => {
                  setViewingMappingConfig(null)
                  setEditingMappingInPanel(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* ユーザー追加モーダル */}
      {showAddUserModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity duration-300"
            onClick={() => setShowAddUserModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ユーザーを追加</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    氏名
                  </label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="山田 太郎"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    部署
                  </label>
                  <input
                    type="text"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="営業部"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    権限 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'manager' | 'staff' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="ユーザーの権限を選択"
                  >
                    <option value="staff">スタッフ</option>
                    <option value="manager">マネージャー</option>
                    <option value="admin">管理者</option>
                  </select>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>情報:</strong> ユーザーを追加すると、自動的にSupabase Authenticationにもユーザーが作成されます。
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    パスワードは自動生成されます。ユーザーには初回ログイン時にパスワードリセットが必要です。
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={async () => {
                    if (!newUser.email) {
                      alert('メールアドレスは必須です')
                      return
                    }
                    try {
                      const response = await fetch('/api/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newUser),
                      })
                      const data = await response.json()
                      if (response.ok) {
                        alert('ユーザーを追加しました')
                        setShowAddUserModal(false)
                        setNewUser({ email: '', full_name: '', role: 'staff', department: '' })
                        // ユーザー一覧を再読み込み
                        const usersResponse = await fetch('/api/users')
                        if (usersResponse.ok) {
                          const { users: updatedUsers } = await usersResponse.json()
                          setUsers(updatedUsers || [])
                        }
                      } else {
                        alert(data.error || 'ユーザーの追加に失敗しました')
                      }
                    } catch (error) {
                      console.error('Failed to add user:', error)
                      alert('ユーザーの追加に失敗しました')
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* カスタムフィールド追加モーダル */}
      {showCustomFieldModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity duration-300"
            onClick={() => setShowCustomFieldModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-[slideInRight_0.3s_ease-out]">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCustomFieldId ? 'カスタムフィールドを編集' : 'カスタムフィールドを追加'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingCustomFieldId ? 'カスタムフィールドの情報を編集します' : '新しいマッピング先フィールドを作成します'}
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    フィールドキー <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCustomField.field_key}
                    onChange={(e) => setNewCustomField({ ...newCustomField, field_key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                    placeholder="例: custom_field_1"
                    disabled={!!editingCustomFieldId}
                    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      editingCustomFieldId ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editingCustomFieldId ? 'フィールドキーは変更できません' : '英数字とアンダースコアのみ使用可能'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    表示名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCustomField.field_label}
                    onChange={(e) => setNewCustomField({ ...newCustomField, field_label: e.target.value })}
                    placeholder="例: カスタム項目1"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    フィールドタイプ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newCustomField.field_type}
                    onChange={(e) => setNewCustomField({ ...newCustomField, field_type: e.target.value as any })}
                    title="カスタムフィールドのタイプを選択"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">テキスト</option>
                    <option value="number">数値</option>
                    <option value="date">日付</option>
                    <option value="boolean">真偽値</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    説明（任意）
                  </label>
                  <textarea
                    value={newCustomField.description}
                    onChange={(e) => setNewCustomField({ ...newCustomField, description: e.target.value })}
                    placeholder="このフィールドの説明を入力"
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setShowCustomFieldModal(false)
                    setNewCustomField({ field_key: '', field_label: '', field_type: 'text', description: '' })
                    setEditingCustomFieldId(null)
                    setPendingMappingIndex(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={async () => {
                    if (!newCustomField.field_key || !newCustomField.field_label) {
                      alert('フィールドキーと表示名は必須です')
                      return
                    }
                    
                    try {
                      if (editingCustomFieldId) {
                        // 更新
                        const response = await fetch('/api/custom-mapping-fields', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: editingCustomFieldId, ...newCustomField }),
                        })
                        
                        if (response.ok) {
                          const { field } = await response.json()
                          setCustomFields(customFields.map(f => f.id === editingCustomFieldId ? field : f))
                          setShowCustomFieldModal(false)
                          setNewCustomField({ field_key: '', field_label: '', field_type: 'text', description: '' })
                          setEditingCustomFieldId(null)
                          alert('カスタムフィールドを更新しました')
                        } else {
                          const error = await response.json()
                          alert(error.error || 'カスタムフィールドの更新に失敗しました')
                        }
                      } else {
                        // 新規作成
                        const response = await fetch('/api/custom-mapping-fields', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(newCustomField),
                        })
                        
                        if (response.ok) {
                          const { field } = await response.json()
                          setCustomFields([...customFields, field])
                          setShowCustomFieldModal(false)
                          setNewCustomField({ field_key: '', field_label: '', field_type: 'text', description: '' })
                          
                          // カスタムフィールド追加後に自動的にマッピング
                          if (pendingMappingIndex !== null) {
                            if (editingMappingInPanel) {
                              // サイドパネル内の編集
                              const updatedMappings = [...(editingMappingInPanel || viewingMappingConfig).columnMappings]
                              updatedMappings[pendingMappingIndex] = { ...updatedMappings[pendingMappingIndex], targetField: field.field_key }
                              setEditingMappingInPanel({ ...(editingMappingInPanel || viewingMappingConfig)!, columnMappings: updatedMappings })
                            } else {
                              // 設定タブの編集
                              updateMapping(pendingMappingIndex, field.field_key)
                            }
                            setPendingMappingIndex(null)
                          }
                          
                          alert('カスタムフィールドを追加しました')
                        } else {
                          const error = await response.json()
                          alert(error.error || 'カスタムフィールドの追加に失敗しました')
                        }
                      }
                    } catch (error) {
                      console.error('Failed to save custom field:', error)
                      alert(editingCustomFieldId ? 'カスタムフィールドの更新に失敗しました' : 'カスタムフィールドの追加に失敗しました')
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingCustomFieldId ? '更新' : '追加'}
                  </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 架電関連DBフィールド整理表 */}
      <div className="mt-8 card">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">架電関連DBフィールド整理表</h2>
          <p className="text-sm text-gray-600 mb-6">
            架電管理で使用する主要なDBフィールドの役割と使い方を整理した表です。混乱を避けるため、各フィールドの意味と使い分けを確認してください。
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">フィールド名（DB）</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">日本語表記</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">なぜあるのか</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">現状の選択肢</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">過去データの状況</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">今後どう使うか</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">status</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">架電進捗状態</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">当日の架電作業の進捗状態を表す</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'未架電'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'架電中'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'03.アポイント獲得済'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'09.アポ獲得'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'04.アポなし'</code>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'未架電'</code>: 1124件<br/>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'03.アポイント獲得済'</code>: 418件<br/>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'09.アポ獲得'</code>: 209件
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    <strong>推奨:</strong> <code className="text-xs bg-gray-100 px-2 py-1 rounded">'未架電'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'架電中'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'商談獲得'</code>に統一<br/>
                    <strong>過去データ:</strong> <code className="text-xs bg-gray-100 px-2 py-1 rounded">'03.アポイント獲得済'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'09.アポ獲得'</code> → 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'商談獲得'</code>に読み替え
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">status_is</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">リードステータス（IS）</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">リード全体のISステータスを表す（当日に限らない）</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    設定メニューより:<br/>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'新規リード'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'コンタクト試行中（折り返し含む）'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'商談獲得'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'失注（リサイクル対象外）'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'失注（リサイクル対象 A-E付与）'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'対象外（Disqualified）'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'連絡不能（Unreachable）'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'既存顧客（属性へ移行予定）'</code>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'未架電'</code>: 1123件<br/>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'商談獲得'</code>: 628件
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    設定メニューの値を使用<br/>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">status = '商談獲得'</code>のレコードは
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">statusIS = '商談獲得'</code>も設定
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">today_call_status</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">その日の架電完了状態</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">その日の架電作業が完了したかどうかを表す</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'済'</code>（完了）, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'未了'</code>（未完了）, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">null</code>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">null</code>: 1750件<br/>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'済'</code>: 1件
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    <strong>推奨:</strong> <code className="text-xs bg-gray-100 px-2 py-1 rounded">'済'</code>（完了）または
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">null</code>（未完了）<br/>
                    「終了」ボタンを押したときは<code className="text-xs bg-gray-100 px-2 py-1 rounded">'済'</code>に設定
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">call_status_today</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">その日の架電結果</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">その日の具体的な架電結果を表す（複数回架電に対応）</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'通電'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'不通'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'不通1'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'不通2'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'不通3'</code>, ... 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'未架電'</code>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'通電'</code>: 1件<br/>
                    その他は<code className="text-xs bg-gray-100 px-2 py-1 rounded">null</code>が多い
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    <strong>推奨:</strong> その日の結果を保存<br/>
                    「不通」ボタン: <code className="text-xs bg-gray-100 px-2 py-1 rounded">'不通1'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'不通2'</code>...<br/>
                    「通電」ボタン: <code className="text-xs bg-gray-100 px-2 py-1 rounded">'通電'</code><br/>
                    「終了」ボタン: 結果を保持
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">result_contact_status</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">直近架電結果</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">直近の架電結果を表す（設定メニューで管理）</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    設定メニューより:<br/>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'未架電'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'不通'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'通電'</code>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'通電'</code>: 414件<br/>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'不通'</code>: 135件<br/>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'未通'</code>: 21件<br/>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'未架電'</code>: 6件<br/>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'未通電'</code>: 3件
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    <strong>推奨:</strong> <code className="text-xs bg-gray-100 px-2 py-1 rounded">'未架電'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'不通'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'通電'</code>に統一<br/>
                    <strong>過去データ:</strong> <code className="text-xs bg-gray-100 px-2 py-1 rounded">'未通'</code>, 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'未通電'</code> → 
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">'不通'</code>に読み替え<br/>
                    商談獲得したものは<code className="text-xs bg-gray-100 px-2 py-1 rounded">'通電'</code>に設定
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">ended_at</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">架電終了時刻</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">架電を終了した時刻を記録（KPI計算などに使用）</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    ISO8601形式のタイムスタンプ
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    ほとんどが<code className="text-xs bg-gray-100 px-2 py-1 rounded">null</code>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    <strong>推奨:</strong> 「終了」ボタンを押したときに設定<br/>
                    商談獲得したものは設定済みにする
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">重要な違い</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li><strong>call_status_today（その日の架電結果）:</strong> その日の詳細な結果（複数回架電に対応、不通1、不通2など）</li>
              <li><strong>result_contact_status（直近架電結果）:</strong> 設定メニューで管理される「直近の架電結果」（シンプルな値）</li>
              <li><strong>status（架電進捗状態）:</strong> 当日の作業状態（未架電、架電中、商談獲得など）</li>
              <li><strong>statusIS（リードステータス）:</strong> リード全体のISステータス（当日に限らない）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}







