import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// 顧客IDスプレッドシートの設定
const SPREADSHEET_ID = '15JYERiJcs7k3IxYwmRGTMM-8o_6Tz8t9BW6P6c-91aY'
const SHEET_NAME = '顧客ID'
const CUSTOMER_ID_COLUMN = 'A'

// 認証クライアントの初期化
async function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
}

// 次の顧客番号を生成
async function generateNextCustomerId(prefix: 'A' | 'B'): Promise<string> {
  const auth = await getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  
  // A列の全データを取得（ヘッダー除く）
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${SHEET_NAME}'!${CUSTOMER_ID_COLUMN}:${CUSTOMER_ID_COLUMN}`,
  })
  
  const values = response.data.values || []
  
  // 指定されたプレフィックスで始まるIDをフィルタ
  const filteredIds = values
    .flat()
    .filter((id): id is string => 
      typeof id === 'string' && id.startsWith(prefix)
    )
  
  if (filteredIds.length === 0) {
    // 該当するIDがない場合は001から開始
    return `${prefix}000001`
  }
  
  // 最大の番号を取得
  const maxNumber = filteredIds.reduce((max, id) => {
    // プレフィックスを除いた数値部分を取得
    const numStr = id.substring(1) // A000860 → 000860
    const num = parseInt(numStr, 10)
    return num > max ? num : max
  }, 0)
  
  // +1して新しい番号を生成（6桁ゼロ埋め）
  const nextNumber = maxNumber + 1
  return `${prefix}${String(nextNumber).padStart(6, '0')}`
}

// 次の顧客番号を取得（GET）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessType = searchParams.get('businessType')
    
    // プレフィックスを決定
    let prefix: 'A' | 'B'
    if (businessType === 'A:飲食') {
      prefix = 'A'
    } else if (businessType === 'B:非飲食') {
      prefix = 'B'
    } else {
      return NextResponse.json(
        { success: false, error: '事業種別が不正です。A:飲食 または B:非飲食 を指定してください。' },
        { status: 400 }
      )
    }
    
    const customerId = await generateNextCustomerId(prefix)
    
    return NextResponse.json({
      success: true,
      data: {
        customerId,
        prefix,
      },
    })
  } catch (error) {
    console.error('[API /api/contracts/customer-id] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '顧客番号の取得に失敗しました',
      },
      { status: 500 }
    )
  }
}
