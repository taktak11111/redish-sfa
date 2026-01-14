import { NextRequest, NextResponse } from 'next/server'
import { contractSheetsClient, CONTRACT_TEMPLATE_SPREADSHEET_ID } from '@/lib/sheets/contracts'
import { google } from 'googleapis'

// テンプレートシートのセル値を取得（GET）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sheetName = searchParams.get('sheetName') || '契約'
    const range = searchParams.get('range') || 'A1:Z50'
    
    // 認証情報を取得
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })
    
    const sheets = google.sheets({ version: 'v4', auth })
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CONTRACT_TEMPLATE_SPREADSHEET_ID,
      range: `'${sheetName}'!${range}`,
    })
    
    return NextResponse.json({
      success: true,
      data: {
        sheetName,
        range,
        values: response.data.values || [],
      },
    })
  } catch (error) {
    console.error('[API /api/contracts/template/values] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'シートデータの取得に失敗しました',
      },
      { status: 500 }
    )
  }
}
