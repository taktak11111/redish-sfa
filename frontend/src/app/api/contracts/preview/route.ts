import { NextRequest, NextResponse } from 'next/server'
import { contractSheetsClient, CONTRACT_TEMPLATE_SPREADSHEET_ID, CONTRACT_SHEET_NAMES, CONTRACT_CELL_MAPPING, ContractData } from '@/lib/sheets/contracts'
import { google } from 'googleapis'

// プレビュー用：テンプレートにデータを一時的に書き込み → PDFエクスポート → 元に戻す
// 注意: 同時実行時の競合リスクがあるため、本番環境では排他制御を検討

interface PreviewRequest {
  contractData: ContractData
  sheetName: 'REDISH' | 'クロスポイント'  // クライアントから送られるシート名
}

// シート名のマッピング（クライアント → テンプレート内の実際のシート名）
function getSheetSearchPattern(sheetName: string): string {
  if (sheetName === 'REDISH') {
    return 'REDISH'
  } else if (sheetName === 'クロスポイント') {
    return 'クロスポイント'
  }
  return sheetName
}

// ContractDataからセル更新データを構築
function buildCellUpdates(contractData: ContractData): Array<{ cell: string; value: string }> {
  const updates: Array<{ cell: string; value: string }> = []
  
  const fieldMapping: Array<{ code: keyof typeof CONTRACT_CELL_MAPPING; value: string | number | boolean | undefined }> = [
    // 1. 契約情報
    { code: 'C101', value: contractData.contractDate },
    { code: 'C102', value: contractData.contractStaff },
    { code: 'C103', value: contractData.customerNumber },
    // 2. 顧客情報
    { code: 'C201', value: contractData.businessType },
    { code: 'C202', value: contractData.entityType },
    { code: 'C203', value: contractData.representativeName },
    { code: 'C204', value: contractData.representativeNameKana },
    { code: 'C205', value: contractData.tel },
    { code: 'C206', value: contractData.email },
    { code: 'C207', value: contractData.storeCount },
    { code: 'C208', value: contractData.companyName },
    { code: 'C209', value: contractData.companyNameKana },
    { code: 'C210', value: contractData.registrationDate },
    { code: 'C211', value: contractData.fiscalMonth },
    { code: 'C212', value: contractData.capital },
    // 3. 店舗情報
    { code: 'C301', value: contractData.storeNumber },
    { code: 'C302', value: contractData.storeName },
    { code: 'C303', value: contractData.openingYear },
    { code: 'C304', value: contractData.addressPrefecture },
    { code: 'C305', value: contractData.address },
    { code: 'C306', value: contractData.employeeCount },
    // 4. サービス費用
    { code: 'C401', value: contractData.initialFee != null ? `¥${contractData.initialFee.toLocaleString()}` : undefined },
    { code: 'C402', value: contractData.monthlyBookkeepingFee != null ? `¥${contractData.monthlyBookkeepingFee.toLocaleString()}` : undefined },
    { code: 'C403', value: contractData.taxReturnFee != null ? `¥${contractData.taxReturnFee.toLocaleString()}` : undefined },
    { code: 'C404', value: contractData.receiptInputMonths },
    { code: 'C405', value: contractData.receiptInputFee != null ? `¥${contractData.receiptInputFee.toLocaleString()}` : undefined },
    // 5. 付加サービス
    { code: 'C501', value: contractData.needsBusinessDocs ? '○' : '×' },
    { code: 'C502', value: contractData.needsFreee ? '○' : '×' },
    // 6. 請求関連
    { code: 'C601', value: contractData.monthlyStartMonth },
    { code: 'C602', value: contractData.firstPaymentDate },
    { code: 'C603', value: contractData.taxReturnPaymentMonth },
    { code: 'C604', value: contractData.fiscalYear },
    { code: 'C605', value: contractData.splitPayment },
    // 7. 契約期日
    { code: 'C701', value: contractData.renewalDate },
    { code: 'C702', value: contractData.cancellationDeadline },
    { code: 'C703', value: contractData.finalDeadline },
    // 8. その他
    { code: 'C801', value: contractData.remarks },
  ]
  
  for (const { code, value } of fieldMapping) {
    if (value !== undefined && value !== null && value !== '') {
      const cellInfo = CONTRACT_CELL_MAPPING[code]
      const cell = `F${cellInfo.row}`  // F列に値を入力
      updates.push({ cell, value: String(value) })
    }
  }
  
  return updates
}

// プレビューPDFを取得（POST）
export async function POST(request: NextRequest) {
  let originalValues: Map<string, string> | null = null
  
  try {
    const body: PreviewRequest = await request.json()
    
    if (!body.sheetName) {
      return NextResponse.json(
        { success: false, error: 'シート名が必要です' },
        { status: 400 }
      )
    }
    
    // テンプレートのメタデータを取得
    const metadata = await contractSheetsClient.getSpreadsheetMetadata(CONTRACT_TEMPLATE_SPREADSHEET_ID)
    
    // 指定されたシートのIDを取得
    const searchPattern = getSheetSearchPattern(body.sheetName)
    const targetSheet = metadata.sheets.find(sheet => 
      sheet.title?.includes(searchPattern)
    )
    
    if (!targetSheet || targetSheet.sheetId === undefined) {
      return NextResponse.json(
        { success: false, error: `シート「${body.sheetName}」が見つかりません` },
        { status: 404 }
      )
    }
    
    // 認証クライアントを取得
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth })
    
    // データがある場合のみ差し込み処理を行う
    if (body.contractData) {
      const cellUpdates = buildCellUpdates(body.contractData)
      
      if (cellUpdates.length > 0) {
        // Step 1: 現在の値をバックアップ
        const cellRanges = cellUpdates.map(u => `'${CONTRACT_SHEET_NAMES.INPUT}'!${u.cell}`)
        const backupResponse = await sheets.spreadsheets.values.batchGet({
          spreadsheetId: CONTRACT_TEMPLATE_SPREADSHEET_ID,
          ranges: cellRanges,
        })
        
        originalValues = new Map()
        backupResponse.data.valueRanges?.forEach((vr, index) => {
          const cell = cellUpdates[index].cell
          const value = vr.values?.[0]?.[0] || ''
          originalValues!.set(cell, String(value))
        })
        
        // Step 2: 新しい値を書き込み
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: CONTRACT_TEMPLATE_SPREADSHEET_ID,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: cellUpdates.map(u => ({
              range: `'${CONTRACT_SHEET_NAMES.INPUT}'!${u.cell}`,
              values: [[u.value]],
            })),
          },
        })
      }
    }
    
    // Step 3: PDFをエクスポート
    // REDISH: A4横向き、クロスポイント: A4縦向き
    const sheetIdNum = targetSheet.sheetId as number
    const isPortrait = body.sheetName === 'クロスポイント'  // クロスポイントのみ縦向き
    const pdfBuffer = await contractSheetsClient.exportSheetAsPdf(
      CONTRACT_TEMPLATE_SPREADSHEET_ID,
      sheetIdNum,
      { portrait: isPortrait }
    )
    
    // Step 4: 元の値に復元（必ず実行）
    if (originalValues && originalValues.size > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: CONTRACT_TEMPLATE_SPREADSHEET_ID,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: Array.from(originalValues.entries()).map(([cell, value]) => ({
            range: `'${CONTRACT_SHEET_NAMES.INPUT}'!${cell}`,
            values: [[value]],
          })),
        },
      })
    }
    
    // PDFをBase64で返す
    return NextResponse.json({
      success: true,
      data: {
        pdfBase64: pdfBuffer.toString('base64'),
        sheetName: body.sheetName,
        mimeType: 'application/pdf',
      },
    })
  } catch (error) {
    console.error('[API /api/contracts/preview] Error:', error)
    
    // エラー時も元の値に復元を試みる
    if (originalValues && originalValues.size > 0) {
      try {
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          },
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        })
        const sheets = google.sheets({ version: 'v4', auth })
        
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: CONTRACT_TEMPLATE_SPREADSHEET_ID,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: Array.from(originalValues.entries()).map(([cell, value]) => ({
              range: `'${CONTRACT_SHEET_NAMES.INPUT}'!${cell}`,
              values: [[value]],
            })),
          },
        })
      } catch (restoreError) {
        console.error('[API /api/contracts/preview] Failed to restore original values:', restoreError)
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'プレビュー生成に失敗しました',
      },
      { status: 500 }
    )
  }
}
