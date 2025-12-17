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

// Google Sheets APIキー（オプション - 公開シートならなくても可）
const GOOGLE_API_KEY = process.env.GOOGLE_SHEETS_API_KEY

// スプレッドシートからデータを取得する（公開シート用）
async function fetchSpreadsheetData(spreadsheetId: string, sheetName: string = 'Sheet1'): Promise<string[][]> {
  // 方法1: Google Sheets API v4 (APIキーがある場合)
  if (GOOGLE_API_KEY) {
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
  // gid=0 はデフォルトで最初のシート
  // シート名からgidを特定するのは難しいので、基本的に最初のシートを使用
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`
  
  const response = await fetch(csvUrl)
  if (!response.ok) {
    throw new Error('スプレッドシートの取得に失敗しました。シートが公開設定になっているか確認してください。')
  }
  
  const csvText = await response.text()
  return parseCSV(csvText)
}

// シンプルなCSVパーサー
function parseCSV(csvText: string): string[][] {
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

// リードIDを生成
async function generateLeadId(supabase: SupabaseClient, leadSource: string): Promise<string> {
  const prefix = LEAD_SOURCE_PREFIX[leadSource] || 'RD'
  
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
    const action = searchParams.get('action')
    
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'スプレッドシートIDが必要です' }, { status: 400 })
    }
    
    console.log(`[API/spreadsheet] Fetching data from spreadsheet: ${spreadsheetId}`)
    
    const data = await fetchSpreadsheetData(spreadsheetId, sheetName)
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'スプレッドシートにデータがありません' }, { status: 400 })
    }
    
    if (action === 'headers') {
      // ヘッダー行のみ返す
      return NextResponse.json({ headers: data[0] })
    }
    
    // 全データを返す
    return NextResponse.json({
      headers: data[0],
      rows: data.slice(1),
      totalRows: data.length - 1,
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
    const { spreadsheetId, sheetName = 'Sheet1', columnMappings } = body as {
      spreadsheetId: string
      sheetName: string
      columnMappings: ColumnMapping[]
    }
    
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'スプレッドシートIDが必要です' }, { status: 400 })
    }
    
    if (!columnMappings || columnMappings.length === 0) {
      return NextResponse.json({ error: 'カラムマッピングが必要です' }, { status: 400 })
    }
    
    console.log(`[API/spreadsheet] Importing data from spreadsheet: ${spreadsheetId}`)
    
    // スプレッドシートからデータを取得
    const data = await fetchSpreadsheetData(spreadsheetId, sheetName)
    
    if (data.length <= 1) {
      return NextResponse.json({ error: 'インポートするデータがありません' }, { status: 400 })
    }
    
    const headers = data[0]
    const rows = data.slice(1)
    
    // カラムインデックスのマッピングを作成
    const columnIndexMap: Record<string, number> = {}
    headers.forEach((header, index) => {
      columnIndexMap[String.fromCharCode(65 + index)] = index
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
        
        for (const mapping of columnMappings) {
          if (!mapping.targetField) continue
          
          const colIndex = columnIndexMap[mapping.spreadsheetColumn]
          if (colIndex === undefined) continue
          
          const value = row[colIndex]?.trim() || ''
          if (!value) continue
          
          if (mapping.targetField === 'leadSource') {
            leadSource = value
          }
          
          const snakeField = FIELD_TO_SNAKE[mapping.targetField] || mapping.targetField
          recordData[snakeField] = value
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
          recordData.lead_id = await generateLeadId(supabase, leadSource)
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







