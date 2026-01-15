import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth/guard'
import { DEFAULT_SETTINGS } from '@/lib/dropdownSettings'

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
    const { spreadsheetId, sheetName = 'Sheet1', sheetGid, columnMappings, headerRow = 1, leadSourcePrefix, spreadsheetConfigId } = body as {
      spreadsheetId: string
      sheetName: string
      sheetGid?: string
      columnMappings: ColumnMapping[]
      headerRow?: number
      leadSourcePrefix?: string
      spreadsheetConfigId?: string
    }
    
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'スプレッドシートIDが必要です' }, { status: 400 })
    }
    
    if (!columnMappings || columnMappings.length === 0) {
      return NextResponse.json({ error: 'カラムマッピングが必要です' }, { status: 400 })
    }
    
    console.log(`[API/spreadsheet] Importing data from spreadsheet: ${spreadsheetId}, gid: ${sheetGid || 'auto'}, headerRow: ${headerRow}`)
    
    // スプレッドシートからデータを取得
    const data = await fetchSpreadsheetData(spreadsheetId, sheetName, sheetGid)
    
    // ヘッダー行のインデックス（1-indexed → 0-indexed）
    const headerIndex = Math.max(0, headerRow - 1)
    
    if (data.length <= headerIndex + 1) {
      return NextResponse.json({ error: 'インポートするデータがありません' }, { status: 400 })
    }
    
    const headers = data[headerIndex]
    const rows = data.slice(headerIndex + 1)
    
    // カラムインデックスのマッピングを作成（A-Z, AA-AZ, BA-BZ...対応）
    const columnIndexMap: Record<string, number> = {}
    headers.forEach((header, index) => {
      columnIndexMap[getColumnLetter(index)] = index
    })
    
    const supabase = getSupabaseClient()
    const allowedOpeningPeriods = await loadAllowedOpeningPeriodValues(supabase)

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
          spreadsheet_config_id: spreadsheetConfigId ?? null,
          status: 'running',
          started_at: nowIso,
          imported_count: 0,
          needs_review_count: 0,
          created_by: createdBy,
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
    const errors: string[] = []
    const openingPeriodUnknowns = new Map<string, { observedValue: string; count: number; sampleRecordIds: string[] }>()
    
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex]
      const rowNum = rowIndex + 2 // ヘッダー行 + 0-index
      
      try {
        // マッピングに従ってデータを構築
        const recordData: Record<string, any> = {
          status: '未架電',
          call_count: 0,
        }
        
        let leadSource = 'REDISH' // デフォルト
        const sourceSpecificData: Record<string, any> = {} // リードソース別情報を格納
        let openingDateObserved: string | null = null
        
        for (const mapping of columnMappings) {
          if (!mapping.targetField) continue
          
          const colIndex = columnIndexMap[mapping.spreadsheetColumn]
          if (colIndex === undefined) continue
          
          const value = row[colIndex]?.trim() || ''
          if (!value) continue
          
          if (mapping.targetField === 'leadSource') {
            leadSource = value
          }
          if (mapping.targetField === 'openingDate') {
            openingDateObserved = value
          }
          
          // リードソース別情報のチェック
          const sourceMapping = SOURCE_SPECIFIC_MAPPINGS[leadSource]
          if (sourceMapping && mapping.spreadsheetHeader && sourceMapping[mapping.spreadsheetHeader]) {
            // リードソース別情報はJSONBに保存
            sourceSpecificData[sourceMapping[mapping.spreadsheetHeader]] = value
          } else {
            // 共通フィールドは通常カラムに保存
            const snakeField = FIELD_TO_SNAKE[mapping.targetField] || mapping.targetField
            recordData[snakeField] = value
            
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
        
        // source_specific_dataをJSONB形式で設定
        if (Object.keys(sourceSpecificData).length > 0) {
          recordData.source_specific_data = sourceSpecificData
        }
        
        // 必須チェック
        if (!recordData.company_name && !recordData.contact_name) {
          errors.push(`行${rowNum}: 会社名または氏名が必要です`)
          failed++
          continue
        }
        
        if (!recordData.phone) {
          errors.push(`行${rowNum}: 電話番号が必要です`)
          failed++
          continue
        }
        
        // 電話番号で重複チェック
        const { data: existing } = await supabase
          .from('call_records')
          .select('lead_id')
          .eq('phone', recordData.phone)
          .single()

        let leadIdForSample: string | null = existing?.lead_id ?? null

        if (existing) {
          // 既存レコードを更新
          const { error: updateError } = await supabase
            .from('call_records')
            .update(recordData)
            .eq('lead_id', existing.lead_id)
          
          if (updateError) {
            errors.push(`行${rowNum}: 更新エラー - ${updateError.message}`)
            failed++
          } else {
            imported++
          }
        } else {
          // 新規レコードを作成
          recordData.lead_source = leadSource
          recordData.lead_id = await generateLeadId(supabase, leadSource, leadSourcePrefix)
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
          }
        }

        // needs_review（MVP: openingPeriod=開業時期 の未登録値のみ）
        const openingNorm = normalizeValue(openingDateObserved ?? recordData.opening_date)
        if (openingNorm) {
          const isKnown = allowedOpeningPeriods.has(openingNorm)
          if (!isKnown) {
            const current = openingPeriodUnknowns.get(openingNorm) ?? {
              observedValue: String(openingDateObserved ?? openingNorm),
              count: 0,
              sampleRecordIds: [],
            }
            current.count += 1
            if (leadIdForSample) {
              current.sampleRecordIds = mergeSampleRecordIds(current.sampleRecordIds, [leadIdForSample], 20)
            }
            openingPeriodUnknowns.set(openingNorm, current)
          }
        }
        
      } catch (rowError: any) {
        errors.push(`行${rowNum}: ${rowError.message}`)
        failed++
      }
    }
    
    console.log(`[API/spreadsheet] Import completed: ${imported} imported, ${failed} failed`)

    // data_quality_issues へ集約（テーブル未作成ならスキップ）
    let needsReviewCount = 0
    if (openingPeriodUnknowns.size > 0) {
      const unknownEntries: Array<[string, { observedValue: string; count: number; sampleRecordIds: string[] }]> = []
      openingPeriodUnknowns.forEach((info, normalizedValue) => {
        needsReviewCount += info.count
        unknownEntries.push([normalizedValue, info])
      })
      try {
        for (const [normalizedValue, info] of unknownEntries) {
          // 既存open行を取得（count_total加算・sample_record_idsマージ）
          const { data: existingIssue, error: issueFetchError } = await supabase
            .from('data_quality_issues')
            .select('id,count_total,sample_record_ids')
            .eq('issue_type', 'unknown_option')
            .eq('status', 'open')
            .eq('setting_key', 'openingPeriod')
            .eq('normalized_value', normalizedValue)
            .maybeSingle()

          if (issueFetchError) throw issueFetchError

          const commonPayload = {
            issue_type: 'unknown_option',
            status: 'open',
            setting_key: 'openingPeriod',
            setting_key_label_ja: '開業時期',
            observed_value: info.observedValue,
            normalized_value: normalizedValue,
            source: 'spreadsheet_import',
            source_ref_id: importRunId,
            sample_table: 'call_records',
            sample_column: 'opening_date',
            last_seen_at: nowIso,
          }

          if (existingIssue?.id) {
            const mergedSampleIds = mergeSampleRecordIds(existingIssue.sample_record_ids, info.sampleRecordIds, 20)
            const newCount = Number(existingIssue.count_total || 0) + info.count
            const { error: updErr } = await supabase
              .from('data_quality_issues')
              .update({
                ...commonPayload,
                count_total: newCount,
                sample_record_ids: mergedSampleIds,
              })
              .eq('id', existingIssue.id)
            if (updErr) throw updErr
          } else {
            const { error: insErr } = await supabase
              .from('data_quality_issues')
              .insert({
                ...commonPayload,
                sample_record_ids: info.sampleRecordIds,
                count_total: info.count,
                first_seen_at: nowIso,
                created_at: nowIso,
                updated_at: nowIso,
              })
            if (insErr) throw insErr
          }
        }
      } catch (e: any) {
        if (!isMissingTableError(e, 'data_quality_issues')) {
          console.warn('[API/spreadsheet] Failed to write data_quality_issues:', e?.message)
        }
      }
    }

    // import_runs を完了状態に更新（テーブル未作成ならスキップ）
    if (importRunId) {
      try {
        const status =
          imported === 0 && failed > 0 ? 'failed' :
          failed > 0 || needsReviewCount > 0 ? 'partial' :
          'success'

        const errorMessage = errors.length > 0 ? errors.slice(0, 50).join('\n') : null

        const { error: runUpdErr } = await supabase
          .from('import_runs')
          .update({
            status,
            finished_at: nowIso,
            imported_count: imported,
            needs_review_count: needsReviewCount,
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
    
    return NextResponse.json({
      success: true,
      imported,
      failed,
      total: rows.length,
      errors: errors.slice(0, 50), // 最大50件のエラーを返す
      importRunId,
      needsReviewCount,
      unknownUniqueCount: openingPeriodUnknowns.size,
      needsReview: openingPeriodUnknowns.size
        ? {
            issueType: 'unknown_option',
            settingKey: 'openingPeriod',
            settingKeyLabelJa: '開業時期',
            unknowns: Array.from(openingPeriodUnknowns.entries()).map(([normalized, info]) => ({
              value: info.observedValue,
              normalizedValue: normalized,
              count: info.count,
              sampleRecordIds: info.sampleRecordIds,
            })),
          }
        : null,
    })
    
  } catch (error: any) {
    console.error('[API/spreadsheet] Import error:', error)
    return NextResponse.json(
      { error: error.message || 'インポートに失敗しました' },
      { status: 500 }
    )
  }
}







