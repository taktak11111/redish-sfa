import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

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
    const body = await request.json()
    const { spreadsheetId, sheetName = 'Sheet1', sheetGid, columnMappings, headerRow = 1, leadSourcePrefix } = body as {
      spreadsheetId: string
      sheetName: string
      sheetGid?: string
      columnMappings: ColumnMapping[]
      headerRow?: number
      leadSourcePrefix?: string
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
    
    let imported = 0
    let failed = 0
    const errors: string[] = []
    
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
        
        for (const mapping of columnMappings) {
          if (!mapping.targetField) continue
          
          const colIndex = columnIndexMap[mapping.spreadsheetColumn]
          if (colIndex === undefined) continue
          
          const value = row[colIndex]?.trim() || ''
          if (!value) continue
          
          if (mapping.targetField === 'leadSource') {
            leadSource = value
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
        
      } catch (rowError: any) {
        errors.push(`行${rowNum}: ${rowError.message}`)
        failed++
      }
    }
    
    console.log(`[API/spreadsheet] Import completed: ${imported} imported, ${failed} failed`)
    
    return NextResponse.json({
      success: true,
      imported,
      failed,
      total: rows.length,
      errors: errors.slice(0, 50), // 最大50件のエラーを返す
    })
    
  } catch (error: any) {
    console.error('[API/spreadsheet] Import error:', error)
    return NextResponse.json(
      { error: error.message || 'インポートに失敗しました' },
      { status: 500 }
    )
  }
}







