import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth/guard'
import { DEFAULT_SETTINGS } from '@/lib/dropdownSettings'

// APIルートのタイムアウト設定（5分）- 大量データインポート用
export const maxDuration = 300

// Supabase設定
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabaseクライアント（遅延初期化）
let supabaseClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error(`Supabase environment variables missing.`)
    }
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    })
  }
  return supabaseClient
}

function normalizeValue(v: unknown): string {
  return String(v ?? '').trim()
}

function normalizePhone(phone: string): string {
  return String(phone ?? '').replace(/\D/g, '')
}

function isCallDateField(targetField: string): boolean {
  return (
    targetField === 'statusUpdateDate' ||
    targetField === 'lastCalledDate' ||
    targetField === 'nextActionDate' ||
    targetField === 'appointmentDate' ||
    targetField === 'dealSetupDate'
  )
}

function normalizeCallCsvValue(targetField: string, rawValue: string): string {
  const value = String(rawValue ?? '').trim()
  if (!value) return ''

  if (isCallDateField(targetField)) {
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(value)) {
      return value.replace(/\//g, '-')
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value
    }
    return ''
  }

  // 架電数カウントは数値のみ抽出
  if (targetField === 'callCount') {
    const digits = value.replace(/\D/g, '')
    return digits
  }

  // 通話時間（目安）は「2分」→「2」
  if (targetField === 'callDuration') {
    const digits = value.replace(/\D/g, '')
    return digits || value
  }

  return value
}

function isMissingTableError(err: any, tableName: string): boolean {
  const msg = String(err?.message ?? '')
  return msg.includes('does not exist') && msg.includes(tableName)
}

function mergeSampleRecordIds(existing: unknown, toAdd: string[], limit: number): string[] {
  const base = Array.isArray(existing) ? (existing as unknown[]) : []
  const out: string[] = []
  const seen = new Set<string>()

  for (const v of base) {
    const s = String(v ?? '').trim()
    if (!s || seen.has(s)) continue
    seen.add(s)
    out.push(s)
  }

  for (const v of toAdd) {
    const s = String(v ?? '').trim()
    if (!s || seen.has(s)) continue
    seen.add(s)
    out.push(s)
    if (out.length >= limit) break
  }

  return out.slice(0, limit)
}

async function loadAllowedOpeningPeriodValues(supabase: SupabaseClient): Promise<Set<string>> {
  // DBのdropdown_settings（key=openingPeriod）を優先。なければDEFAULT_SETTINGSへフォールバック。
  try {
    const { data, error } = await supabase
      .from('dropdown_settings')
      .select('options')
      .eq('key', 'openingPeriod')

    if (error) throw error

    const out = new Set<string>()
    for (const row of data || []) {
      const options = (row as any)?.options
      if (!Array.isArray(options)) continue
      for (const o of options) {
        const nv = normalizeValue((o as any)?.value)
        if (nv) out.add(nv)
      }
    }

    if (out.size > 0) return out
  } catch (e: any) {
    if (!isMissingTableError(e, 'dropdown_settings')) {
      console.warn('[API/spreadsheet] Failed to load dropdown_settings for openingPeriod, fallback to defaults:', e?.message)
    }
  }

  return new Set(DEFAULT_SETTINGS.openingPeriod.map((o) => normalizeValue(o.value)).filter(Boolean))
}

// カラムマッピングの型
interface ColumnMapping {
  spreadsheetColumn: string
  spreadsheetHeader: string
  targetField: string
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

// フィールド名をスネークケースに変換するマッピング
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
  staffIS: 'staff_is',
  statusIS: 'status_is',
  statusUpdateDate: 'status_update_date',
  cannotContactReason: 'cannot_contact_reason',
  recyclePriority: 'recycle_priority',
  resultContactStatus: 'result_contact_status',
  lastCalledDate: 'last_called_date',
  callCount: 'call_count',
  callDuration: 'call_duration',
  conversationMemo: 'conversation_memo',
  actionOutsideCall: 'action_outside_call',
  nextActionDate: 'next_action_date',
  nextActionContent: 'next_action_content',
  nextActionSupplement: 'next_action_supplement',
  nextActionCompleted: 'next_action_completed',
  appointmentDate: 'appointment_date',
  dealSetupDate: 'deal_setup_date',
  dealTime: 'deal_time',
  dealStaffFS: 'deal_staff_fs',
  dealResult: 'deal_result',
  lostReasonFS: 'lost_reason_fs',
  restaurantType: 'restaurant_type',
  desiredLoanamount: 'desired_loan_amount',
  shopName: 'shop_name',
  mobilePhone: 'mobile_phone',
  shopPhone: 'shop_phone',
  temposExternalId: 'tempos_external_id',
  omcExternalId: 'omc_external_id',
  temposCpDesk: 'tempos_cp_desk',
  temposSalesOwner: 'tempos_sales_owner',
  temposCpCode: 'tempos_cp_code',
  omcInteriorMatchApplied: 'omc_interior_match_applied',
}

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

// リードソースのプレフィックスマッピング
const LEAD_SOURCE_PREFIX: Record<string, string> = {
  Meetsmore: 'MT',
  TEMPOS: 'TP',
  OMC: 'OM',
  Amazon: 'AM',
  Makuake: 'MK',
  REDISH: 'RD',
}

// リードソース別のマッピング定義（スプレッドシートのヘッダー名 → JSONB内のキー名）
const SOURCE_SPECIFIC_MAPPINGS: Record<string, Record<string, string>> = {
  OMC: {
    'OMC追加情報①': 'additional_info1',
    '⓶自己資金': 'self_funds',
    '⓷物件状況': 'property_status',
  },
  TEMPOS: {
    'OMC追加情報①': 'additional_info1', // TEMPOSも同じ構造
    '⓶自己資金': 'self_funds',
    '⓷物件状況': 'property_status',
    // TEMPOS専用フィールドがあれば追加可能
  },
  // 他のリードソースも同様に定義可能
}

// Google Sheets APIキー（オプション - 公開シートならなくても可）
const GOOGLE_API_KEY = process.env.GOOGLE_SHEETS_API_KEY

// シート名からgidを取得する（公開スプレッドシート用）
async function getSheetGid(spreadsheetId: string, sheetName: string): Promise<number | null> {
  try {
    // スプレッドシートのHTMLを取得してgidを抽出
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      console.log('[getSheetGid] Failed to fetch spreadsheet HTML')
      return null
    }
    
    const html = await response.text()
    
    // シート名とgidのマッピングを探す（複数パターン対応）
    // パターン1: "name":"シート名","index":0,"gid":12345
    const pattern1 = new RegExp(`"name":"${sheetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*"gid":(\\d+)`, 'i')
    const match1 = html.match(pattern1)
    if (match1) {
      console.log(`[getSheetGid] Found gid ${match1[1]} for sheet "${sheetName}"`)
      return parseInt(match1[1], 10)
    }
    
    // パターン2: gid=数字 と シート名の組み合わせを探す
    const gidPattern = /gid=(\d+)/g
    const gids: number[] = []
    let gidMatch
    while ((gidMatch = gidPattern.exec(html)) !== null) {
      gids.push(parseInt(gidMatch[1], 10))
    }
    
    if (gids.length > 0) {
      console.log(`[getSheetGid] Found gids in HTML: ${gids.slice(0, 5).join(', ')}...`)
    }
    
    // シート名がHTMLに含まれているか確認
    if (html.includes(sheetName)) {
      console.log(`[getSheetGid] Sheet name "${sheetName}" found in HTML, returning first non-zero gid or 0`)
      // 最初のgidを返す（0以外を優先）
      return gids.find(g => g !== 0) ?? gids[0] ?? null
    }
    
    return null
  } catch (error) {
    console.error('[getSheetGid] Error:', error)
    return null
  }
}

// スプレッドシートからデータを取得する（公開シート用）
async function fetchSpreadsheetData(spreadsheetId: string, sheetName: string = 'Sheet1', sheetGid?: string): Promise<string[][]> {
  // 方法1: Google Sheets API v4 (APIキーがある場合)
  if (GOOGLE_API_KEY) {
    console.log('[fetchSpreadsheetData] Using Google Sheets API with API key')
    const range = encodeURIComponent(`${sheetName}!A:ZZ`)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${GOOGLE_API_KEY}`
    
    const response = await fetch(url)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'スプレッドシートの取得に失敗しました')
    }
    
    const data = await response.json()
    return data.values || []
  }
  
  // 方法2: CSV エクスポートURL（公開シート用、APIキー不要）
  console.log(`[fetchSpreadsheetData] Using CSV export for sheet: "${sheetName}", providedGid: ${sheetGid || 'none'}`)
  
  // gidの決定（優先順位: 直接指定 > シート名から自動取得 > デフォルト0）
  let gid = 0
  if (sheetGid) {
    // gidが直接指定されている場合はそれを使用
    gid = parseInt(sheetGid, 10)
    console.log(`[fetchSpreadsheetData] Using provided gid=${gid}`)
  } else if (sheetName && sheetName !== 'Sheet1') {
    // シート名からgidを自動取得
    const foundGid = await getSheetGid(spreadsheetId, sheetName)
    if (foundGid !== null) {
      gid = foundGid
      console.log(`[fetchSpreadsheetData] Auto-detected gid=${gid} for sheet "${sheetName}"`)
    } else {
      console.log(`[fetchSpreadsheetData] Could not find gid for sheet "${sheetName}", using gid=0`)
    }
  }
  
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`
  console.log(`[fetchSpreadsheetData] CSV URL: ${csvUrl}`)
  
  const response = await fetch(csvUrl)
  if (!response.ok) {
    throw new Error('スプレッドシートの取得に失敗しました。シートが公開設定になっているか確認してください。')
  }
  
  const csvText = await response.text()
  console.log(`[fetchSpreadsheetData] CSV text length: ${csvText.length} chars`)
  
  return parseCSV(csvText)
}

// 改良版CSVパーサー（複数行セル対応）
function parseCSV(csvText: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ''
  let inQuotes = false
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i]
    const nextChar = csvText[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // エスケープされたダブルクォート
        currentCell += '"'
        i++
      } else {
        // クォートの開始/終了
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // セルの区切り
      currentRow.push(currentCell.trim())
      currentCell = ''
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      // 行の区切り（クォート外）
      if (char === '\r' && nextChar === '\n') {
        i++ // \r\n の場合、\n をスキップ
      }
      if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell.trim())
        // 空行も含めてすべての行を保持（ヘッダー行の位置を正確に保持するため）
        rows.push(currentRow)
        currentRow = []
        currentCell = ''
      }
    } else {
      // 通常の文字（改行もクォート内なら追加）
      currentCell += char
    }
  }
  
  // 最後のセル/行を処理
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim())
    // 空行も含めてすべての行を保持（ヘッダー行の位置を正確に保持するため）
    rows.push(currentRow)
  }
  
  console.log(`[CSV Parser] Parsed ${rows.length} rows, max columns: ${Math.max(...rows.map(r => r.length), 0)}`)
  console.log(`[CSV Parser] First 3 rows preview:`)
  rows.slice(0, Math.min(3, rows.length)).forEach((row, idx) => {
    console.log(`  Row ${idx}: [${row.slice(0, 3).join(', ')}...] (length: ${row.length})`)
  })
  
  return rows
}

// リードIDを生成
async function generateLeadId(supabase: SupabaseClient, leadSource: string, customPrefix?: string): Promise<string> {
  const prefix = customPrefix || LEAD_SOURCE_PREFIX[leadSource] || 'RD'
  
  // 同じプレフィックスの最大IDを取得
  const { data } = await supabase
    .from('call_records')
    .select('lead_id')
    .like('lead_id', `${prefix}%`)
    .order('lead_id', { ascending: false })
    .limit(1)
  
  let nextNum = 1
  if (data && data.length > 0) {
    const lastId = data[0].lead_id
    const numPart = parseInt(lastId.substring(2), 10)
    if (!isNaN(numPart)) {
      nextNum = numPart + 1
    }
  }
  
  return `${prefix}${String(nextNum).padStart(4, '0')}`
}

// GET: ヘッダーを取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const spreadsheetId = searchParams.get('spreadsheetId')
    const sheetName = searchParams.get('sheetName') || 'Sheet1'
    const sheetGid = searchParams.get('sheetGid') || undefined  // シートgid（オプション）
    const action = searchParams.get('action')
    const headerRow = parseInt(searchParams.get('headerRow') || '1', 10) // デフォルトは1行目
    
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'スプレッドシートIDが必要です' }, { status: 400 })
    }
    
    console.log(`[API/spreadsheet] Fetching data from spreadsheet: ${spreadsheetId}, sheetName: ${sheetName}, gid: ${sheetGid || 'auto'}, headerRow: ${headerRow}`)
    
    const data = await fetchSpreadsheetData(spreadsheetId, sheetName, sheetGid)
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'スプレッドシートにデータがありません' }, { status: 400 })
    }
    
    // ヘッダー行のインデックス（1-indexed → 0-indexed）
    const headerIndex = Math.max(0, headerRow - 1)
    
    console.log(`[API/spreadsheet] headerRow: ${headerRow}, headerIndex: ${headerIndex}, data.length: ${data.length}`)
    console.log(`[API/spreadsheet] First 5 rows preview:`)
    data.slice(0, Math.min(5, data.length)).forEach((row, idx) => {
      console.log(`  Row ${idx}: [${row.slice(0, 5).join(', ')}...]`)
    })
    
    if (headerIndex >= data.length) {
      return NextResponse.json({ error: `指定されたヘッダー行（${headerRow}行目）が存在しません` }, { status: 400 })
    }
    
    if (action === 'headers') {
      // ヘッダー行とサンプルデータ行（ヘッダー行の次の行）を返す
      const sampleRowIndex = headerIndex + 1
      const sampleRow = sampleRowIndex < data.length ? data[sampleRowIndex] : []
      
      console.log(`[API/spreadsheet] Returning headers from index ${headerIndex}: [${data[headerIndex].slice(0, 5).join(', ')}...]`)
      console.log(`[API/spreadsheet] Returning sampleRow from index ${sampleRowIndex}: [${sampleRow.slice(0, 5).join(', ')}...]`)
      
      return NextResponse.json({ 
        headers: data[headerIndex],
        sampleRow: sampleRow,
        headerRow: headerRow,
        totalRows: data.length
      })
    }
    
    // 全データを返す（ヘッダー行より後のデータ）
    return NextResponse.json({
      headers: data[headerIndex],
      rows: data.slice(headerIndex + 1),
      totalRows: data.length - headerIndex - 1,
      headerRow: headerRow,
    })
    
  } catch (error: any) {
    console.error('[API/spreadsheet] Error:', error)
    return NextResponse.json(
      { error: error.message || 'スプレッドシートの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: データをインポート
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const {
      spreadsheetId,
      sheetName = 'Sheet1',
      sheetGid,
      columnMappings,
      headerRow = 1,
      leadSourcePrefix,
      spreadsheetConfigId,
      updateMode = 'incremental',
      incrementalLimit = 100,
      uploadMode = 'spreadsheet',
      csvRows,
      allowedLeadSources,
    } = body as {
      spreadsheetId?: string
      sheetName?: string
      sheetGid?: string
      columnMappings: ColumnMapping[]
      headerRow?: number
      leadSourcePrefix?: string
      spreadsheetConfigId?: string
      updateMode?: 'incremental' | 'full'
      incrementalLimit?: number
      uploadMode?: 'spreadsheet' | 'file'
      csvRows?: string[][]
      allowedLeadSources?: string[]
    }
    
    if (uploadMode !== 'file' && !spreadsheetId) {
      return NextResponse.json({ error: 'スプレッドシートIDが必要です' }, { status: 400 })
    }
    
    if (!columnMappings || columnMappings.length === 0) {
      return NextResponse.json({ error: 'カラムマッピングが必要です' }, { status: 400 })
    }
    
    const sourceLabel = uploadMode === 'file' ? 'csv' : 'spreadsheet'
    console.log(`[API/spreadsheet] Importing data from ${sourceLabel}: ${spreadsheetId || 'local-file'}, gid: ${sheetGid || 'auto'}, headerRow: ${headerRow}, updateMode: ${updateMode}, incrementalLimit: ${incrementalLimit}`)
    
    // スプレッドシート/CSVからデータを取得
    if (uploadMode !== 'file' && !spreadsheetId) {
      return NextResponse.json({ error: 'スプレッドシートIDが必要です' }, { status: 400 })
    }
    const data = uploadMode === 'file'
      ? (csvRows || [])
      : await fetchSpreadsheetData(spreadsheetId!, sheetName, sheetGid)
    
    // ヘッダー行のインデックス（1-indexed → 0-indexed）
    const headerIndex = Math.max(0, headerRow - 1)
    
    if (data.length <= headerIndex + 1) {
      return NextResponse.json({ error: 'インポートするデータがありません' }, { status: 400 })
    }
    
    const headers = data[headerIndex]
    let rows = data.slice(headerIndex + 1)
    
    // カラムインデックスのマッピングを作成（A-Z, AA-AZ, BA-BZ...対応）
    const columnIndexMap: Record<string, number> = {}
    headers.forEach((header, index) => {
      columnIndexMap[getColumnLetter(index)] = index
    })
    
    // 差分更新モードの場合、日付でソートして最新N件のみを取得
    console.log(`[API/spreadsheet] Update mode: ${updateMode}, rows before filtering: ${rows.length}`)
    if (updateMode === 'incremental') {
      // linkedDateにマッピングされた列を特定
      const linkedDateMapping = columnMappings.find(m => m.targetField === 'linkedDate')
      if (linkedDateMapping) {
        const dateColIndex = columnIndexMap[linkedDateMapping.spreadsheetColumn]
        if (dateColIndex !== undefined) {
          // 日付でソート（降順：新しい順）
          rows = rows
            .map((row, index) => ({ row, index, dateValue: row[dateColIndex]?.trim() || '' }))
            .sort((a, b) => {
              // 日付のパース（YYYY/MM/DD, YYYY-MM-DD形式に対応）
              const parseDate = (dateStr: string): Date | null => {
                if (!dateStr) return null
                // YYYY/MM/DD形式
                const match1 = dateStr.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/)
                if (match1) {
                  return new Date(parseInt(match1[1]), parseInt(match1[2]) - 1, parseInt(match1[3]))
                }
                // YYYY-MM-DD形式
                const match2 = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
                if (match2) {
                  return new Date(parseInt(match2[1]), parseInt(match2[2]) - 1, parseInt(match2[3]))
                }
                // パース失敗時は文字列比較
                return null
              }
              
              const dateA = parseDate(a.dateValue)
              const dateB = parseDate(b.dateValue)
              
              if (dateA && dateB) {
                return dateB.getTime() - dateA.getTime() // 降順
              }
              if (dateA) return -1 // dateAが有効なら前に
              if (dateB) return 1 // dateBが有効なら前に
              return b.dateValue.localeCompare(a.dateValue) // 文字列比較（降順）
            })
            .slice(0, incrementalLimit) // 最新N件のみ
            .map(item => item.row)
          
          console.log(`[API/spreadsheet] Incremental update: sorted by date, processing latest ${rows.length} rows (limit: ${incrementalLimit})`)
        } else {
          console.warn(`[API/spreadsheet] linkedDate column not found, falling back to latest ${incrementalLimit} rows`)
          rows = rows.slice(-incrementalLimit) // 日付列が見つからない場合は末尾N件
        }
      } else {
        console.warn(`[API/spreadsheet] linkedDate mapping not found, falling back to latest ${incrementalLimit} rows`)
        rows = rows.slice(-incrementalLimit) // マッピングがない場合は末尾N件
      }
    } else {
      console.log(`[API/spreadsheet] Full update mode: processing all ${rows.length} rows`)
    }
    console.log(`[API/spreadsheet] Rows after filtering: ${rows.length}`)
    
    const supabase = getSupabaseClient()

    // import_runs を作成（テーブル未作成ならスキップ）
    const nowIso = new Date().toISOString()
    let importRunId: string | null = null
    try {
      let createdBy: string | null = null
      const email = (authResult as any)?.user?.email
      if (email) {
        const { data: userRow } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single()
        createdBy = userRow?.id ?? null
      }

      const { data: importRun, error: importRunError } = await supabase
        .from('import_runs')
        .insert({
          source: 'spreadsheet_import',
          source_ref_id: spreadsheetConfigId ?? null,
          status: 'running',
          started_at: nowIso,
          total_rows: rows.length,
          imported_rows: 0,
          failed_rows: 0,
          needs_review_count: 0,
          created_at: nowIso,
        })
        .select('id')
        .single()

      if (importRunError) throw importRunError
      importRunId = importRun?.id ?? null
    } catch (e: any) {
      if (!isMissingTableError(e, 'import_runs')) {
        console.warn('[API/spreadsheet] Failed to create import_runs row:', e?.message)
      }
    }
    
    let imported = 0
    let failed = 0
    let newRecords = 0 // 新規作成件数
    let updatedRecords = 0 // 更新件数
    const errors: string[] = []
    // 欠損データ統計（フィールド名をキーとして件数をカウント）
    const missingDataStats: Record<string, number> = {}
    // 重要データ欠損統計（連携日付、氏名、電話番号の欠損）
    const criticalMissingDataStats: Record<string, number> = {
      linkedDate: 0,
      contactName: 0,
      phone: 0,
    }
    
    // 空行を除外した実際の処理対象行数をカウント
    let processedRowCount = 0
    
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex]
      const rowNum = rowIndex + 2 // ヘッダー行 + 0-index
      
      // 空行チェック: すべての列が空の場合はスキップ
      const isEmptyRow = !row || row.every((cell: any) => !cell || String(cell).trim() === '')
      if (isEmptyRow) {
        continue
      }
      
      // 処理対象行数をカウント（空行を除く）
      processedRowCount++
      
      try {
        // マッピングに従ってデータを構築
        const recordData: Record<string, any> = {
          status: '未架電',
          call_count: 0,
        }
        
        let leadSource = leadSourcePrefix || 'REDISH' // デフォルトはリードソースプレフィックス
        const sourceSpecificData: Record<string, any> = {} // リードソース別情報を格納
        let openingDateObserved: string | null = null
        
        // 必須データの値を先に取得（検証用）
        let linkedDateValue = ''
        let contactNameValue = ''
        let phoneValue = ''
        
        for (const mapping of columnMappings) {
          if (!mapping.targetField) continue
          
          const colIndex = columnIndexMap[mapping.spreadsheetColumn]
          if (colIndex === undefined) continue
          
          const rawValue = row[colIndex]?.trim() || ''
          if (!rawValue) continue
          const value = normalizeCallCsvValue(mapping.targetField, rawValue)
          if (!value) {
            if (!isCallDateField(mapping.targetField)) {
              continue
            }
          }
          
          if (mapping.targetField === 'leadSource') {
            leadSource = value
          }
          if (mapping.targetField === 'openingDate') {
            openingDateObserved = value
          }
          
          // 必須データの値を取得
          if (mapping.targetField === 'linkedDate') {
            linkedDateValue = value
          }
          if (mapping.targetField === 'contactName') {
            contactNameValue = value
          }
          if (mapping.targetField === 'phone') {
            phoneValue = value
          }
          
          // リードソース別情報のチェック
          const sourceMapping = SOURCE_SPECIFIC_MAPPINGS[leadSource]
          if (sourceMapping && mapping.spreadsheetHeader && sourceMapping[mapping.spreadsheetHeader]) {
            // リードソース別情報はJSONBに保存
            sourceSpecificData[sourceMapping[mapping.spreadsheetHeader]] = value
          } else {
            // 共通フィールドは通常カラムに保存
            const snakeField = FIELD_TO_SNAKE[mapping.targetField] || mapping.targetField
            if (isCallDateField(mapping.targetField)) {
              recordData[`${snakeField}_raw`] = rawValue
            }
            if (value) {
              recordData[snakeField] = value
            }

            // 論理統合: status/staff は正本に合わせて同期
            if (snakeField === 'status_is') {
              recordData.status = value
            }
            if (snakeField === 'staff_is') {
              recordData.calling_staff_is = value
            }
            
            // 後方互換性: omc_*カラムにも保存（OMC/TEMPOSの場合）
            if (leadSource === 'OMC' || leadSource === 'TEMPOS') {
              if (mapping.targetField === 'omcAdditionalInfo1') {
                recordData.omc_additional_info1 = value
              } else if (mapping.targetField === 'omcSelfFunds') {
                recordData.omc_self_funds = value
              } else if (mapping.targetField === 'omcPropertyStatus') {
                recordData.omc_property_status = value
              }
            }
          }
        }

        if (allowedLeadSources && allowedLeadSources.length > 0) {
          if (!allowedLeadSources.includes(leadSource)) {
            continue
          }
        }
        
        // source_specific_dataをJSONB形式で設定
        if (Object.keys(sourceSpecificData).length > 0) {
          recordData.source_specific_data = sourceSpecificData
        }
        
        // 必須データの検証（連携日付、氏名、電話番号）
        // linked_dateがマッピングされていない場合は、recordDataから取得を試みる
        if (!linkedDateValue && recordData.linked_date) {
          linkedDateValue = String(recordData.linked_date)
        }
        // contact_nameがマッピングされていない場合は、recordDataから取得を試みる
        if (!contactNameValue && recordData.contact_name) {
          contactNameValue = String(recordData.contact_name)
        }
        // phoneがマッピングされていない場合は、recordDataから取得を試みる
        if (!phoneValue && recordData.phone) {
          phoneValue = String(recordData.phone)
        }
        
        const hasLinkedDate = !!linkedDateValue && linkedDateValue.trim() !== ''
        const hasContactName = !!contactNameValue && contactNameValue.trim() !== '' && contactNameValue !== '未設定'
        const hasPhone = !!phoneValue && phoneValue.trim() !== '' && phoneValue !== '000-0000-0000'
        
        // 必須データの有無をカウント（3つのうち何個揃っているか）
        const requiredDataCount = (hasLinkedDate ? 1 : 0) + (hasContactName ? 1 : 0) + (hasPhone ? 1 : 0)
        
        // 3つのうち2つ以上が揃っている場合は取り込み対象、1つ以下は取り込み対象外
        const isImportTarget = requiredDataCount >= 2
        
        // 取り込み対象外（3つのうち1つ以下）の場合はスキップ
        if (!isImportTarget) {
          continue
        }
        
        // 取り込み対象の場合のみ、重要データ欠損統計をカウント
        // 取り込み対象の中で、必須データが欠けているものをカウント
        if (!hasLinkedDate) criticalMissingDataStats.linkedDate++
        if (!hasContactName) criticalMissingDataStats.contactName++
        if (!hasPhone) criticalMissingDataStats.phone++
        
        // 取り込み対象の場合、必須データが欠けている場合はデフォルト値を設定
        
        // 必須フィールドのデフォルト値設定（取り込み対象内で必須データが欠けている場合）
        if (!hasLinkedDate) {
          recordData.linked_date = new Date().toISOString().split('T')[0] // 今日の日付を設定
        }
        if (!hasContactName) {
          recordData.contact_name = '未設定'
        }
        if (!hasPhone) {
          recordData.phone = '000-0000-0000'
        }
        
        // その他のフィールドのデフォルト値設定（必須データは揃っているが、他のフィールドが欠損している場合）
        if (!recordData.company_name && !recordData.contact_name) {
          recordData.company_name = '未設定'
          // contact_nameは既に設定済みの可能性があるため、上書きしない
          if (!recordData.contact_name) {
            recordData.contact_name = '未設定'
          }
        } else {
          // company_nameがNULLの場合、contact_nameをcompany_nameにコピー（DB制約対応）
          if (!recordData.company_name && recordData.contact_name) {
            recordData.company_name = recordData.contact_name
          } else if (!recordData.company_name) {
            recordData.company_name = '未設定'
          }
          
          // contact_nameがNULLの場合、company_nameをcontact_nameにコピー（DB制約対応）
          if (!recordData.contact_name && recordData.company_name) {
            recordData.contact_name = recordData.company_name
          } else if (!recordData.contact_name) {
            recordData.contact_name = '未設定'
          }
        }
        
        const normalizedPhone = normalizePhone(recordData.phone)
        const canCheckDuplicate = Boolean(hasPhone && normalizedPhone && normalizedPhone !== '0000000000')
        if (canCheckDuplicate) {
          recordData.duplicate_key = normalizedPhone
        }
        recordData.is_duplicate = false

        let existingByLeadId: { lead_id: string } | null = null
        if (recordData.lead_id) {
          const { data: existingLead } = await supabase
            .from('call_records')
            .select('lead_id')
            .eq('lead_id', recordData.lead_id)
            .limit(1)
          existingByLeadId = existingLead?.[0] ?? null
        }

        let existingByPhone: { lead_id: string } | null = null
        if (!existingByLeadId && canCheckDuplicate) {
          const { data: existingPhone } = await supabase
            .from('call_records')
            .select('lead_id')
            .or(`duplicate_key.eq.${normalizedPhone},phone.eq.${recordData.phone}`)
            .limit(1)
          existingByPhone = existingPhone?.[0] ?? null
        }

        let leadIdForSample: string | null =
          existingByLeadId?.lead_id ?? existingByPhone?.lead_id ?? null

        // データ欠損統計をカウント（取り込み対象の場合、新規作成・更新問わず）
        // マッピングされたフィールドの欠損をチェック
        for (const mapping of columnMappings) {
          if (!mapping.targetField) continue
          
          // 必須データは重要データ欠損統計に含まれるため、通常のデータ欠損統計からは除外
          if (mapping.targetField === 'linkedDate' || mapping.targetField === 'contactName' || mapping.targetField === 'phone') {
            continue
          }
          
          // leadSourceは除外
          if (mapping.targetField === 'leadSource') {
            continue
          }
          
          const colIndex = columnIndexMap[mapping.spreadsheetColumn]
          if (colIndex === undefined) continue
          
          // スプレッドシートの値を取得（マッピングされた列の値）
          const spreadsheetValue = row[colIndex]?.trim() || ''
          
          // スプレッドシートの値が空の場合は欠損としてカウント
          if (!spreadsheetValue) {
            missingDataStats[mapping.targetField] = (missingDataStats[mapping.targetField] || 0) + 1
          }
        }

        if (existingByLeadId) {
          // 既存レコードを更新（データ欠損統計は既にカウント済み）
          const { error: updateError } = await supabase
            .from('call_records')
            .update(recordData)
            .eq('lead_id', existingByLeadId.lead_id)
          
          if (updateError) {
            errors.push(`行${rowNum}: 更新エラー - ${updateError.message}`)
            failed++
          } else {
            imported++
            updatedRecords++
          }
        } else {
          // 新規レコードを作成（データ欠損統計は既にカウント済み）
          
          recordData.lead_source = leadSource
          // スプレッドシートからleadIdが設定されていない場合のみ自動採番
          if (!recordData.lead_id) {
            recordData.lead_id = await generateLeadId(supabase, leadSource, leadSourcePrefix)
          }

          if (existingByPhone && canCheckDuplicate) {
            recordData.is_duplicate = true
            recordData.duplicate_key = normalizedPhone
            await supabase
              .from('call_records')
              .update({ is_duplicate: true, duplicate_key: normalizedPhone })
              .or(`duplicate_key.eq.${normalizedPhone},phone.eq.${recordData.phone}`)
          }
          recordData.linked_date = recordData.linked_date || new Date().toISOString().split('T')[0]
          leadIdForSample = recordData.lead_id
          
          const { error: insertError } = await supabase
            .from('call_records')
            .insert(recordData)
          
          if (insertError) {
            errors.push(`行${rowNum}: 挿入エラー - ${insertError.message}`)
            failed++
          } else {
            imported++
            newRecords++
          }
        }
        
      } catch (rowError: any) {
        errors.push(`行${rowNum}: ${rowError.message}`)
        failed++
      }
    }
    
    console.log(`[API/spreadsheet] Import completed: ${imported} imported (${newRecords} new, ${updatedRecords} updated), ${failed} failed, ${processedRowCount} processed rows (total rows in sheet: ${rows.length})`)

    // import_runs を完了状態に更新（テーブル未作成ならスキップ）
    if (importRunId) {
      try {
        const status =
          imported === 0 && failed > 0 ? 'failed' :
          failed > 0 ? 'partial' :
          'success'

        const errorMessage = errors.length > 0 ? errors.slice(0, 50).join('\n') : null

        const { error: runUpdErr } = await supabase
          .from('import_runs')
          .update({
            status,
            finished_at: nowIso,
            imported_rows: imported,
            failed_rows: failed,
            needs_review_count: 0, // 開業時期の未登録値チェックを削除したため0に
            error_message: errorMessage,
          })
          .eq('id', importRunId)
        if (runUpdErr) throw runUpdErr
      } catch (e: any) {
        if (!isMissingTableError(e, 'import_runs')) {
          console.warn('[API/spreadsheet] Failed to update import_runs:', e?.message)
        }
      }
    }
    
    // 欠損データ統計をフィールド順にソート（FIELD_TO_SNAKEの順序に従う）
    const sortedMissingDataStats: Record<string, number> = {}
    const fieldOrder = Object.keys(FIELD_TO_SNAKE)
    for (const fieldKey of fieldOrder) {
      if (missingDataStats[fieldKey] && missingDataStats[fieldKey] > 0) {
        sortedMissingDataStats[fieldKey] = missingDataStats[fieldKey]
      }
    }
    // FIELD_TO_SNAKEにないフィールドも追加
    for (const fieldKey of Object.keys(missingDataStats)) {
      if (!FIELD_TO_SNAKE[fieldKey] && missingDataStats[fieldKey] > 0) {
        sortedMissingDataStats[fieldKey] = missingDataStats[fieldKey]
      }
    }
    
    // 重要データ欠損統計は0件でも常に表示する（3つのフィールド全てを含める）
    const finalCriticalMissingDataStats: Record<string, number> = {
      linkedDate: criticalMissingDataStats.linkedDate || 0,
      contactName: criticalMissingDataStats.contactName || 0,
      phone: criticalMissingDataStats.phone || 0,
    }
    
    return NextResponse.json({
      success: true,
      imported,
      newRecords, // 新規作成件数
      updatedRecords, // 更新件数
      failed,
      total: processedRowCount, // 実際に処理された行数（空行を除く）
      totalRowsInSheet: rows.length, // スプレッドシートの全行数（空行含む）
      errors: errors.slice(0, 50), // 最大50件のエラーを返す
      importRunId,
      missingDataStats: sortedMissingDataStats, // 欠損データ統計
      criticalMissingDataStats: finalCriticalMissingDataStats, // 重要データ欠損統計（0件でも表示）
    })
    
  } catch (error: any) {
    console.error('[API/spreadsheet] Import error:', error)
    return NextResponse.json(
      { error: error.message || 'インポートに失敗しました' },
      { status: 500 }
    )
  }
}







