import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase設定
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// スプレッドシートからデータを取得する（公開シート用）
async function fetchSpreadsheetData(spreadsheetId: string, sheetGid?: string): Promise<string[][]> {
  let csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`
  if (sheetGid) {
    csvUrl += `&gid=${sheetGid}`
  }
  
  console.log(`[sync-all] Fetching CSV from: ${csvUrl}`)
  const response = await fetch(csvUrl)
  if (!response.ok) {
    throw new Error('スプレッドシートの取得に失敗しました')
  }
  
  const csvText = await response.text()
  console.log(`[sync-all] CSV length: ${csvText.length} chars`)
  return parseCSV(csvText)
}

// CSVパーサー
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
      if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell.trim())
        rows.push(currentRow)
        currentRow = []
        currentCell = ''
      }
    } else {
      currentCell += char
    }
  }
  
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim())
    rows.push(currentRow)
  }
  
  return rows
}

// カラムレターを生成
function getColumnLetter(index: number): string {
  let result = ''
  let n = index
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result
    n = Math.floor(n / 26) - 1
  }
  return result
}

// リードIDを生成
async function generateLeadId(supabase: any, prefix: string): Promise<string> {
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

// フィールド名をスネークケースに変換
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

// POST: すべての連携済みスプレッドシートからデータを同期（手動実行用）
export async function POST(request: NextRequest) {
  console.log('[sync-all] POST request received')
  console.log('[sync-all] SUPABASE_URL:', SUPABASE_URL ? 'SET' : 'MISSING')
  console.log('[sync-all] SUPABASE_KEY:', SUPABASE_KEY ? 'SET' : 'MISSING')
  
  try {
    const body = await request.json()
    const { configs } = body as {
      configs: Array<{
        id: string
        name: string
        spreadsheetId: string
        sheetName: string
        sheetGid?: string
        headerRow: number
        columnMappings: Array<{
          spreadsheetColumn: string
          spreadsheetHeader: string
          targetField: string
        }>
        leadSourcePrefix: string
      }>
    }
    
    if (!configs || configs.length === 0) {
      return NextResponse.json({ error: '同期する設定がありません' }, { status: 400 })
    }
    
    console.log(`[sync-all] Processing ${configs.length} configs`)
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    })
    
    const results: Array<{
      configId: string
      configName: string
      imported: number
      failed: number
      errors: string[]
    }> = []
    
    // 各設定からデータを取得
    for (const config of configs) {
      console.log(`[sync-all] Processing config: ${config.name}`)
      
      const configResult = {
        configId: config.id,
        configName: config.name,
        imported: 0,
        failed: 0,
        errors: [] as string[],
      }
      
      try {
        // スプレッドシートからデータを取得
        const data = await fetchSpreadsheetData(config.spreadsheetId, config.sheetGid)
        console.log(`[sync-all] ${config.name}: Got ${data.length} rows`)
        
        if (data.length === 0) {
          configResult.errors.push('データがありません')
          results.push(configResult)
          continue
        }
        
        const headerIndex = Math.max(0, config.headerRow - 1)
        if (headerIndex >= data.length) {
          configResult.errors.push(`ヘッダー行（${config.headerRow}行目）が存在しません`)
          results.push(configResult)
          continue
        }
        
        const headers = data[headerIndex]
        const rows = data.slice(headerIndex + 1)
        console.log(`[sync-all] ${config.name}: Processing ${rows.length} data rows`)
        
        // カラムインデックスのマッピングを作成
        const columnIndexMap: Record<string, number> = {}
        headers.forEach((_, index) => {
          columnIndexMap[getColumnLetter(index)] = index
        })
        
        // 各行を処理
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i]
          const rowNum = headerIndex + 2 + i
          
          try {
            const recordData: Record<string, any> = {}
            let leadSource = config.name
            
            // マッピングに基づいてデータを抽出
            // デバッグ: 最初の3行のみログ出力
            const isDebugRow = i < 3
            if (isDebugRow) {
              console.log(`[sync-all] ${config.name} Row ${rowNum}: columnMappings count = ${config.columnMappings.length}`)
            }
            
            for (const mapping of config.columnMappings) {
              if (!mapping.targetField) continue
              
              const colIndex = columnIndexMap[mapping.spreadsheetColumn]
              if (colIndex === undefined) {
                if (isDebugRow) {
                  console.log(`[sync-all] ${config.name} Row ${rowNum}: Column ${mapping.spreadsheetColumn} not found in columnIndexMap`)
                }
                continue
              }
              
              const value = row[colIndex]?.trim() || ''
              if (isDebugRow) {
                console.log(`[sync-all] ${config.name} Row ${rowNum}: ${mapping.spreadsheetColumn}(${colIndex}) -> ${mapping.targetField} = "${value.substring(0, 30)}"`)
              }
              if (!value) continue
              
              if (mapping.targetField === 'leadSource') {
                leadSource = value
              }
              
              const snakeField = FIELD_TO_SNAKE[mapping.targetField] || mapping.targetField
              recordData[snakeField] = value
            }
            
            // 必須チェック（電話番号のみ）
            if (!recordData.phone) {
              if (isDebugRow) {
                console.log(`[sync-all] ${config.name} Row ${rowNum}: SKIPPED - no phone (recordData keys: ${Object.keys(recordData).join(', ')})`)
              }
              // 電話番号がない行はスキップ（エラーとしてカウントしない）
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
                configResult.errors.push(`行${rowNum}: 更新エラー - ${updateError.message}`)
                configResult.failed++
              } else {
                configResult.imported++
              }
            } else {
              // 新規レコードを作成
              recordData.lead_source = leadSource
              recordData.lead_id = await generateLeadId(supabase, config.leadSourcePrefix)
              recordData.linked_date = recordData.linked_date || new Date().toISOString().split('T')[0]
              
              const { error: insertError } = await supabase
                .from('call_records')
                .insert(recordData)
              
              if (insertError) {
                configResult.errors.push(`行${rowNum}: 挿入エラー - ${insertError.message}`)
                configResult.failed++
              } else {
                configResult.imported++
              }
            }
          } catch (rowError: any) {
            configResult.errors.push(`行${rowNum}: ${rowError.message}`)
            configResult.failed++
          }
        }
        
        console.log(`[sync-all] ${config.name}: Imported ${configResult.imported}, Failed ${configResult.failed}`)
        
      } catch (configError: any) {
        console.error(`[sync-all] ${config.name}: Error -`, configError)
        configResult.errors.push(`設定エラー: ${configError.message}`)
        configResult.failed++
      }
      
      results.push(configResult)
    }
    
    const totalImported = results.reduce((sum, r) => sum + r.imported, 0)
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)
    
    console.log(`[sync-all] Complete: ${totalImported} imported, ${totalFailed} failed`)
    
    return NextResponse.json({
      success: true,
      totalImported,
      totalFailed,
      results,
    })
    
  } catch (error: any) {
    console.error('[sync-all] Error:', error)
    return NextResponse.json(
      { error: error.message || '一括同期に失敗しました' },
      { status: 500 }
    )
  }
}
