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
  openingDateOriginal: 'opening_date_original', // 連携元から入力（自由記述）
  openingDate: 'opening_date', // ヒアリング後に選択式で入力
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
  // 架電管理関連フィールド
  status: 'status', // 架電進捗状態
  statusIs: 'status_is', // ISステータス
  callCount: 'call_count', // 架電数カウント
  resultContactStatus: 'result_contact_status', // 結果/コンタクト状況
  callStatusToday: 'call_status_today', // 当日架電結果
  todayCallStatus: 'today_call_status', // 当日架電完了状態
  staffIs: 'staff_is', // 担当IS
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

// CSVパーサー
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

// POST: CSVファイルをアップロードしてインポート
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const columnMappingsJson = formData.get('columnMappings') as string
    
    if (!file) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 })
    }
    
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'CSVファイルを選択してください' }, { status: 400 })
    }
    
    if (!columnMappingsJson) {
      return NextResponse.json({ error: 'カラムマッピングが必要です' }, { status: 400 })
    }
    
    const columnMappings: ColumnMapping[] = JSON.parse(columnMappingsJson)
    
    if (columnMappings.length === 0) {
      return NextResponse.json({ error: 'カラムマッピングが必要です' }, { status: 400 })
    }
    
    console.log(`[API/spreadsheet/upload] Importing data from file: ${file.name}`)
    
    // ファイルを読み込んでパース
    const csvText = await file.text()
    const data = parseCSV(csvText)
    
    if (data.length <= 1) {
      return NextResponse.json({ error: 'インポートするデータがありません' }, { status: 400 })
    }
    
    const headers = data[0]
    const rows = data.slice(1)
    
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
        // マッピングに従ってデータを構築（デフォルト値は設定しない）
        const recordData: Record<string, any> = {}
        
        let leadSource = 'REDISH' // デフォルト
        
        for (const mapping of columnMappings) {
          if (!mapping.targetField) continue
          
          const colIndex = columnIndexMap[mapping.spreadsheetColumn]
          if (colIndex === undefined) continue
          
          const value = row[colIndex]?.trim() || ''
          // 空の値はスキップ（デフォルト値で上書きしない）
          if (!value) continue
          
          if (mapping.targetField === 'leadSource') {
            leadSource = value
          }
          
          const snakeField = FIELD_TO_SNAKE[mapping.targetField] || mapping.targetField
          
          // call_countは数値に変換
          if (snakeField === 'call_count') {
            const numValue = parseInt(value, 10)
            if (!isNaN(numValue)) {
              recordData[snakeField] = numValue
            }
          } else {
            recordData[snakeField] = value
          }
        }
        
        // 新規レコードの場合のみデフォルト値を設定
        // 既存レコードの更新時は、元データに含まれている値のみを使用
        
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
          .select('lead_id, status, call_count, status_is, result_contact_status, staff_is')
          .eq('phone', recordData.phone)
          .single()
        
        if (existing) {
          // 既存レコードを更新
          // 重要なフィールド（status, call_count等）は、元データに含まれている場合のみ更新
          // 元データに含まれていない場合は、既存の値を保持
          const updateData: Record<string, any> = { ...recordData }
          
          // 既存レコードの重要なフィールドを保持（元データに含まれていない場合）
          if (!updateData.status && existing.status) {
            // statusが元データにない場合は既存値を保持（更新しない）
          }
          if (updateData.call_count === undefined && existing.call_count !== undefined) {
            // call_countが元データにない場合は既存値を保持（更新しない）
            delete updateData.call_count
          }
          if (!updateData.status_is && existing.status_is) {
            // status_isが元データにない場合は既存値を保持（更新しない）
          }
          if (!updateData.result_contact_status && existing.result_contact_status) {
            // result_contact_statusが元データにない場合は既存値を保持（更新しない）
          }
          if (!updateData.staff_is && existing.staff_is) {
            // staff_isが元データにない場合は既存値を保持（更新しない）
          }
          
          const { error: updateError } = await supabase
            .from('call_records')
            .update(updateData)
            .eq('lead_id', existing.lead_id)
          
          if (updateError) {
            errors.push(`行${rowNum}: 更新エラー - ${updateError.message}`)
            failed++
          } else {
            imported++
          }
        } else {
          // 新規レコードを作成
          // デフォルト値を設定（元データに含まれていない場合のみ）
          if (!recordData.status) {
            recordData.status = '未架電'
          }
          if (recordData.call_count === undefined) {
            recordData.call_count = 0
          }
          
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
    
    console.log(`[API/spreadsheet/upload] Import completed: ${imported} imported, ${failed} failed`)
    
    return NextResponse.json({
      success: true,
      imported,
      failed,
      total: rows.length,
      errors: errors.slice(0, 50), // 最大50件のエラーを返す
    })
    
  } catch (error: any) {
    console.error('[API/spreadsheet/upload] Import error:', error)
    return NextResponse.json(
      { error: error.message || 'インポートに失敗しました' },
      { status: 500 }
    )
  }
}







