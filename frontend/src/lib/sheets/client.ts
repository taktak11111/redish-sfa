import { google, sheets_v4 } from 'googleapis'
import { SHEETS, SheetConfig, ColumnMapping } from '@/types/sheets'

// Google Sheets APIクライアント
class SheetsClient {
  private sheets: sheets_v4.Sheets | null = null
  private spreadsheetId: string

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || ''
  }

  // APIクライアントの初期化
  private async getClient(): Promise<sheets_v4.Sheets> {
    if (this.sheets) {
      return this.sheets
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    this.sheets = google.sheets({ version: 'v4', auth })
    return this.sheets
  }

  // シートからデータを取得
  async getValues(sheetName: string, range: string): Promise<string[][]> {
    try {
      const client = await this.getClient()
      const response = await client.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `'${sheetName}'!${range}`,
      })
      return (response.data.values as string[][]) || []
    } catch (error) {
      console.error(`[SheetsClient.getValues] Error fetching ${sheetName}:`, error)
      throw new Error(`シートからのデータ取得に失敗しました: ${sheetName}`)
    }
  }

  // シートにデータを書き込み
  async setValues(sheetName: string, range: string, values: string[][]): Promise<void> {
    try {
      const client = await this.getClient()
      await client.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `'${sheetName}'!${range}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      })
    } catch (error) {
      console.error(`[SheetsClient.setValues] Error writing to ${sheetName}:`, error)
      throw new Error(`シートへのデータ書き込みに失敗しました: ${sheetName}`)
    }
  }

  // シートにデータを追加
  async appendValues(sheetName: string, range: string, values: string[][]): Promise<void> {
    try {
      const client = await this.getClient()
      await client.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `'${sheetName}'!${range}`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values,
        },
      })
    } catch (error) {
      console.error(`[SheetsClient.appendValues] Error appending to ${sheetName}:`, error)
      throw new Error(`シートへのデータ追加に失敗しました: ${sheetName}`)
    }
  }

  // ヘッダー行からカラムマッピングを生成
  async getColumnMapping(sheetConfig: SheetConfig): Promise<ColumnMapping> {
    if (!sheetConfig.headerRow) {
      throw new Error('このシートにはヘッダー行が設定されていません')
    }

    const headerRow = await this.getValues(
      sheetConfig.name,
      `${sheetConfig.headerRow}:${sheetConfig.headerRow}`
    )

    if (!headerRow || headerRow.length === 0) {
      throw new Error('ヘッダー行の取得に失敗しました')
    }

    const mapping: ColumnMapping = {}
    headerRow[0].forEach((columnId, index) => {
      if (columnId) {
        mapping[columnId.trim()] = index
      }
    })

    return mapping
  }

  // 次の利用可能なIDを取得（例: MT0001 -> MT0002）
  async getNextId(sheetConfig: SheetConfig, prefix: string, idColumn: number): Promise<string> {
    const data = await this.getValues(
      sheetConfig.name,
      `${columnToLetter(idColumn)}${sheetConfig.dataStartRow}:${columnToLetter(idColumn)}`
    )

    const existingIds = data
      .flat()
      .filter(id => id && id.startsWith(prefix))
      .map(id => parseInt(id.replace(prefix, ''), 10))
      .filter(num => !isNaN(num))

    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0
    return `${prefix}${String(maxId + 1).padStart(4, '0')}`
  }
}

// 列番号をアルファベットに変換（0-indexed）
export function columnToLetter(column: number): string {
  let result = ''
  let temp = column
  while (temp >= 0) {
    result = String.fromCharCode((temp % 26) + 65) + result
    temp = Math.floor(temp / 26) - 1
  }
  return result
}

// アルファベットを列番号に変換（0-indexed）
export function letterToColumn(letter: string): number {
  let result = 0
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + letter.charCodeAt(i) - 64
  }
  return result - 1
}

// シングルトンインスタンス
export const sheetsClient = new SheetsClient()






