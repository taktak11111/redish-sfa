import { NextRequest, NextResponse } from 'next/server'
import { contractSheetsClient, CONTRACT_TEMPLATE_SPREADSHEET_ID } from '@/lib/sheets/contracts'

// テンプレートのメタデータを取得（GET）
export async function GET(request: NextRequest) {
  try {
    const metadata = await contractSheetsClient.getSpreadsheetMetadata(CONTRACT_TEMPLATE_SPREADSHEET_ID)
    
    return NextResponse.json({
      success: true,
      data: metadata,
    })
  } catch (error) {
    console.error('[API /api/contracts/template] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'テンプレート情報の取得に失敗しました',
      },
      { status: 500 }
    )
  }
}
