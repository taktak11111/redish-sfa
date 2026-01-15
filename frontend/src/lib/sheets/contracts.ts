import { google, sheets_v4, drive_v3 } from 'googleapis'

// 契約書テンプレートのシートID
export const CONTRACT_TEMPLATE_SPREADSHEET_ID = '15JYERiJcs7k3IxYwmRGTMM-8o_6Tz8t9BW6P6c-91aY'

// Vercel環境変数の形式差（\\n / 実改行 / 前後クォート）に耐える
export function normalizeGooglePrivateKey(raw?: string): string | undefined {
  if (!raw) return undefined

  let key = String(raw).trim()
  // Vercelやコピペで前後にクォートが付くケースを吸収
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1)
  }

  // "\\n" を実改行へ
  key = key.replace(/\\n/g, '\n')
  return key
}

function extractGoogleApiErrorMessage(error: unknown): string | undefined {
  const anyErr = error as any
  const msg =
    anyErr?.response?.data?.error?.message ||
    anyErr?.response?.data?.message ||
    anyErr?.response?.data?.error_description ||
    anyErr?.errors?.[0]?.message ||
    anyErr?.message

  const status = anyErr?.response?.status
  const statusText = anyErr?.response?.statusText
  const code = anyErr?.code

  const parts = [
    typeof status === 'number' ? `HTTP ${status}` : undefined,
    typeof statusText === 'string' && statusText.trim() ? statusText.trim() : undefined,
    typeof code === 'string' && code.trim() ? `code=${code.trim()}` : undefined,
    typeof msg === 'string' && msg.trim() ? msg.trim() : undefined,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(' / ') : undefined
}

// 契約書のシート名（テンプレートスプレッドシートの実際のシート名）
// シートID: 契約=1223117001, REDISH=1723385470, クロスポイント=542860516
export const CONTRACT_SHEET_NAMES = {
  INPUT: '契約',           // 入力シート（ID: 1223117001）
  REDISH: 'REDISH',        // リディッシュ契約書シート（ID: 1723385470）
  CROSSPOINT: 'クロスポイント',  // クロスポイント税理士法人契約書シート（ID: 542860516）
} as const

// 契約書テンプレートのセルマッピング（入力シートのF列に対応）
// コード→行番号のマッピング
export const CONTRACT_CELL_MAPPING = {
  // 1. 契約情報
  C101: { row: 4, label: '契約日' },
  C102: { row: 5, label: '契約担当者' },
  C103: { row: 6, label: '顧客番号' },
  
  // 2. 顧客情報
  C201: { row: 7, label: '事業種別' },
  C202: { row: 8, label: '法人・個人' },
  C203: { row: 9, label: '代表者氏名（漢字）' },
  C204: { row: 10, label: '代表者氏名（フリガナ）' },
  C205: { row: 11, label: 'TEL' },
  C206: { row: 12, label: 'mail' },
  C207: { row: 13, label: '店舗数' },
  C208: { row: 14, label: '法人名（漢字）' },
  C209: { row: 15, label: '法人名（フリガナ）' },
  C210: { row: 16, label: '登記日' },
  C211: { row: 17, label: '決算月' },
  C212: { row: 18, label: '資本金' },
  
  // 3. 店舗情報
  C301: { row: 19, label: '店舗番号' },
  C302: { row: 20, label: '店舗名（屋号）' },
  C303: { row: 21, label: '営業初年度' },
  C304: { row: 22, label: '営業届申請住所（都道府県）' },
  C305: { row: 23, label: '営業届申請住所' },
  C306: { row: 24, label: '従業員数' },
  
  // 4. サービス費用
  C401: { row: 25, label: '初期導入費用' },
  C402: { row: 26, label: '月額記帳代行費' },
  C403: { row: 27, label: '確定申告代行費' },
  C404: { row: 28, label: '証憑入力代行月数' },
  C405: { row: 29, label: '証憑入力代行費' },
  
  // 5. 付加サービス
  C501: { row: 30, label: '営業書類代行要否' },
  C502: { row: 31, label: '人事労務freee導入有無' },
  
  // 6. 請求関連
  C601: { row: 32, label: '月額発生月' },
  C602: { row: 33, label: '初回請求支払日' },
  C603: { row: 34, label: '確定申告時支払月' },
  C604: { row: 35, label: '申告対象決算年度' },
  C605: { row: 36, label: '特殊支払い（分割）' },
  
  // 7. 契約期日
  C701: { row: 37, label: '契約更新日' },
  C702: { row: 38, label: '解約申入期日' },
  C703: { row: 39, label: '最終対応期限' },
  
  // 8. その他
  C801: { row: 40, label: '備考' },
} as const

// 契約書の差し込みデータ型（テンプレートのセルマッピングに対応）
export interface ContractData {
  // 1. 契約情報
  contractDate: string           // C101: 契約日
  contractStaff?: string         // C102: 契約担当者
  customerNumber?: string        // C103: 顧客番号
  
  // 2. 顧客情報
  businessType: string           // C201: 事業種別（A:飲食/B:その他）
  entityType: string             // C202: 法人・個人
  representativeName: string     // C203: 代表者氏名（漢字）
  representativeNameKana: string // C204: 代表者氏名（フリガナ）
  tel: string                    // C205: TEL
  email: string                  // C206: mail
  storeCount?: number            // C207: 店舗数
  companyName?: string           // C208: 法人名（漢字）
  companyNameKana?: string       // C209: 法人名（フリガナ）
  registrationDate?: string      // C210: 登記日
  fiscalMonth?: number           // C211: 決算月
  capital?: number               // C212: 資本金
  
  // 3. 店舗情報
  storeNumber?: string           // C301: 店舗番号
  storeName?: string             // C302: 店舗名（屋号）
  openingYear?: number           // C303: 営業初年度
  addressPrefecture?: string     // C304: 営業届申請住所（都道府県）
  address?: string               // C305: 営業届申請住所
  employeeCount?: number         // C306: 従業員数
  
  // 4. サービス費用
  initialFee?: number            // C401: 初期導入費用（デフォルト: ¥50,000）
  monthlyBookkeepingFee?: number // C402: 月額記帳代行費（デフォルト: ¥10,000）
  taxReturnFee?: number          // C403: 確定申告代行費（デフォルト: ¥100,000）
  receiptInputMonths?: number    // C404: 証憑入力代行月数
  receiptInputFee?: number       // C405: 証憑入力代行費（自動計算）
  
  // 5. 付加サービス
  needsBusinessDocs?: boolean    // C501: 営業書類代行要否
  needsFreee?: boolean           // C502: 人事労務freee導入有無
  
  // 6. 請求関連
  monthlyStartMonth?: string     // C601: 月額発生月
  firstPaymentDate?: string      // C602: 初回請求支払日
  taxReturnPaymentMonth?: string // C603: 確定申告時支払月
  fiscalYear?: number            // C604: 申告対象決算年度
  splitPayment?: string          // C605: 特殊支払い（分割）
  
  // 7. 契約期日（自動計算）
  renewalDate?: string           // C701: 契約更新日
  cancellationDeadline?: string  // C702: 解約申入期日
  finalDeadline?: string         // C703: 最終対応期限
  
  // 8. その他
  remarks?: string               // C801: 備考
}

// 契約書生成結果
export interface ContractGenerationResult {
  success: boolean
  spreadsheetId?: string
  spreadsheetUrl?: string
  // Drive保存時のURL（将来用）
  pdfUrls?: {
    redish?: string
    crosspoint?: string
  }
  // ダウンロード用Base64
  pdfBase64?: {
    redish?: string
    crosspoint?: string
  }
  error?: string
}

// 契約書生成用のSheetsクライアント
class ContractSheetsClient {
  private sheets: sheets_v4.Sheets | null = null
  private drive: drive_v3.Drive | null = null

  // 認証クライアントの初期化
  private async getAuth() {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = normalizeGooglePrivateKey(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)

    if (!clientEmail || !privateKey) {
      throw new Error('Google認証情報が未設定です（GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY）')
    }
    // Vercel ENV貼り付け事故（BEGIN/END欠落）を早期に検知
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
      throw new Error('Google秘密鍵の形式が不正です（BEGIN/END行を含む秘密鍵をVercelのGOOGLE_SERVICE_ACCOUNT_PRIVATE_KEYに設定してください）')
    }

    return new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
      ],
    })
  }

  // Sheets APIクライアントの取得
  private async getSheetsClient(): Promise<sheets_v4.Sheets> {
    if (this.sheets) {
      return this.sheets
    }
    const auth = await this.getAuth()
    this.sheets = google.sheets({ version: 'v4', auth })
    return this.sheets
  }

  // Drive APIクライアントの取得
  private async getDriveClient(): Promise<drive_v3.Drive> {
    if (this.drive) {
      return this.drive
    }
    const auth = await this.getAuth()
    this.drive = google.drive({ version: 'v3', auth })
    return this.drive
  }

  // スプレッドシートのメタデータを取得（シート名一覧など）
  async getSpreadsheetMetadata(spreadsheetId: string = CONTRACT_TEMPLATE_SPREADSHEET_ID) {
    try {
      const client = await this.getSheetsClient()
      const response = await client.spreadsheets.get({
        spreadsheetId,
        fields: 'spreadsheetId,properties.title,sheets.properties',
      })
      
      return {
        spreadsheetId: response.data.spreadsheetId,
        title: response.data.properties?.title,
        sheets: response.data.sheets?.map(sheet => ({
          sheetId: sheet.properties?.sheetId,
          title: sheet.properties?.title,
          index: sheet.properties?.index,
        })) || [],
      }
    } catch (error) {
      console.error('[ContractSheetsClient.getSpreadsheetMetadata] Error:', error)
      const detail = extractGoogleApiErrorMessage(error)
      throw new Error(`スプレッドシートのメタデータ取得に失敗しました${detail ? `: ${detail}` : ''}`)
    }
  }

  // スプレッドシートをコピー
  async copySpreadsheet(
    sourceSpreadsheetId: string,
    title: string,
    destinationFolderId?: string
  ): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    try {
      const drive = await this.getDriveClient()
      
      // Step 1: まずテンプレートと同じ場所にコピー（parentsなし）
      const copyResponse = await drive.files.copy({
        fileId: sourceSpreadsheetId,
        supportsAllDrives: true,
        requestBody: {
          name: title,
        },
      })
      
      const newSpreadsheetId = copyResponse.data.id!
      
      // Step 2: destinationFolderIdが指定されている場合、ファイルを移動
      if (destinationFolderId) {
        // 現在の親フォルダを取得
        const fileInfo = await drive.files.get({
          fileId: newSpreadsheetId,
          fields: 'parents',
          supportsAllDrives: true,
        })
        const currentParents = fileInfo.data.parents?.join(',') || ''
        
        // ファイルを移動
        await drive.files.update({
          fileId: newSpreadsheetId,
          addParents: destinationFolderId,
          removeParents: currentParents,
          supportsAllDrives: true,
        })
      }
      
      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit`
      
      return {
        spreadsheetId: newSpreadsheetId,
        spreadsheetUrl,
      }
    } catch (error: any) {
      console.error('[ContractSheetsClient.copySpreadsheet] Error:', error)
      // 詳細なエラーメッセージを出力
      if (error?.response?.data) {
        console.error('[ContractSheetsClient.copySpreadsheet] Response data:', JSON.stringify(error.response.data, null, 2))
      }
      if (error?.errors) {
        console.error('[ContractSheetsClient.copySpreadsheet] Errors:', JSON.stringify(error.errors, null, 2))
      }
      const errorMessage = error?.message || error?.response?.data?.error?.message || 'スプレッドシートのコピーに失敗しました'
      throw new Error(`スプレッドシートのコピーに失敗しました: ${errorMessage}`)
    }
  }

  // 特定のスプレッドシートにデータを書き込み
  async setValues(
    spreadsheetId: string,
    sheetName: string,
    range: string,
    values: (string | number | boolean)[][]
  ): Promise<void> {
    try {
      const client = await this.getSheetsClient()
      await client.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetName}'!${range}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: values.map(row => row.map(cell => String(cell))),
        },
      })
    } catch (error) {
      console.error('[ContractSheetsClient.setValues] Error:', error)
      throw new Error('スプレッドシートへのデータ書き込みに失敗しました')
    }
  }

  // 複数のセルにデータを一括書き込み（batchUpdate）
  async batchSetValues(
    spreadsheetId: string,
    updates: Array<{
      sheetName: string
      range: string
      values: (string | number | boolean)[][]
    }>
  ): Promise<void> {
    try {
      const client = await this.getSheetsClient()
      await client.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates.map(update => ({
            range: `'${update.sheetName}'!${update.range}`,
            values: update.values.map(row => row.map(cell => String(cell))),
          })),
        },
      })
    } catch (error) {
      console.error('[ContractSheetsClient.batchSetValues] Error:', error)
      throw new Error('スプレッドシートへの一括データ書き込みに失敗しました')
    }
  }

  // スプレッドシートをPDFとしてエクスポート
  // portrait: true=縦向き, false=横向き（デフォルト: false）
  async exportSheetAsPdf(
    spreadsheetId: string,
    sheetId: number,
    options?: { portrait?: boolean }
  ): Promise<Buffer> {
    try {
      const auth = await this.getAuth()
      const authClient = await auth.getClient()
      const accessTokenResponse = await authClient.getAccessToken()
      const accessToken = accessTokenResponse.token
      
      if (!accessToken) {
        throw new Error('アクセストークンの取得に失敗しました')
      }
      
      // portrait: true=縦向き, false=横向き
      const isPortrait = options?.portrait ?? false
      
      // PDF出力用のURL（A4、1ページに収める）
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?` +
        `format=pdf&` +
        `gid=${sheetId}&` +
        `size=7&` +             // A4サイズ
        `portrait=${isPortrait}&` +  // 縦向き or 横向き
        `scale=4&` +            // 1ページに収める (fit to page)
        `fitw=true&` +          // 幅に合わせる
        `fith=true&` +          // 高さに合わせる
        `top_margin=0.25&` +    // 上マージン（インチ）
        `bottom_margin=0.25&` + // 下マージン
        `left_margin=0.25&` +   // 左マージン
        `right_margin=0.25&` +  // 右マージン
        `gridlines=false&` +    // グリッド線なし
        `printtitle=false&` +   // タイトルなし
        `pagenum=UNDEFINED&` +  // ページ番号なし
        `horizontal_alignment=CENTER&` + // 水平中央揃え
        `attachment=false`
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      
      if (!response.ok) {
        throw new Error(`PDF export failed: ${response.status} ${response.statusText}`)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error) {
      console.error('[ContractSheetsClient.exportSheetAsPdf] Error:', error)
      throw new Error('PDFエクスポートに失敗しました')
    }
  }

  // PDFをGoogle Driveに保存
  async savePdfToDrive(
    pdfBuffer: Buffer,
    fileName: string,
    folderId: string
  ): Promise<{ fileId: string; webViewLink: string }> {
    try {
      const drive = await this.getDriveClient()
      
      const response = await drive.files.create({
        requestBody: {
          name: fileName,
          mimeType: 'application/pdf',
          parents: [folderId],
        },
        media: {
          mimeType: 'application/pdf',
          body: require('stream').Readable.from(pdfBuffer),
        },
        fields: 'id,webViewLink',
      })
      
      return {
        fileId: response.data.id!,
        webViewLink: response.data.webViewLink!,
      }
    } catch (error) {
      console.error('[ContractSheetsClient.savePdfToDrive] Error:', error)
      throw new Error('PDFのDrive保存に失敗しました')
    }
  }

  // ContractDataをセル値の配列に変換
  private buildCellUpdates(contractData: ContractData): Array<{ range: string; values: string[][] }> {
    const updates: Array<{ range: string; values: string[][] }> = []
    const sheetName = CONTRACT_SHEET_NAMES.INPUT
    
    // 各フィールドをセルにマッピング
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
    
    // 値があるフィールドのみ更新対象に追加
    for (const { code, value } of fieldMapping) {
      if (value !== undefined && value !== null && value !== '') {
        const cellInfo = CONTRACT_CELL_MAPPING[code]
        const cellAddress = `F${cellInfo.row}`  // F列に値を入力
        updates.push({
          range: `'${sheetName}'!${cellAddress}`,
          values: [[String(value)]],
        })
      }
    }
    
    return updates
  }

  // 契約書を生成（メイン処理）
  // 案A方式: テンプレートに一時書き込み → PDF生成 → 顧客フォルダに保存 → 元に戻す
  async generateContract(
    contractData: ContractData,
    customerFolderId: string,
    contractTitle: string
  ): Promise<ContractGenerationResult> {
    let originalValues: Map<string, string> | null = null
    const client = await this.getSheetsClient()
    
    try {
      // 1. テンプレートのメタデータを取得（シートIDを取得）
      const metadata = await this.getSpreadsheetMetadata(CONTRACT_TEMPLATE_SPREADSHEET_ID)
      
      // 2. 現在の値をバックアップ
      const cellUpdates = this.buildCellUpdates(contractData)
      if (cellUpdates.length > 0) {
        const cellRanges = cellUpdates.map(u => u.range)
        const backupResponse = await client.spreadsheets.values.batchGet({
          spreadsheetId: CONTRACT_TEMPLATE_SPREADSHEET_ID,
          ranges: cellRanges,
        })
        
        originalValues = new Map()
        backupResponse.data.valueRanges?.forEach((vr, index) => {
          const range = cellUpdates[index].range
          const value = vr.values?.[0]?.[0] || ''
          originalValues!.set(range, String(value))
        })
        
        // 3. 入力シートにデータを差し込み
        await client.spreadsheets.values.batchUpdate({
          spreadsheetId: CONTRACT_TEMPLATE_SPREADSHEET_ID,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: cellUpdates.map(update => ({
              range: update.range,
              values: update.values,
            })),
          },
        })
        console.log(`[ContractSheetsClient.generateContract] Updated ${cellUpdates.length} cells`)
      }
      
      // 4. PDFを生成（REDISHシートとクロスポイントシートのみ）
      // ダウンロード方式：Drive保存せずBase64で返す
      const pdfBase64: { redish?: string; crosspoint?: string } = {}
      
      for (const sheet of metadata.sheets) {
        if (sheet.sheetId != null && sheet.title) {
          // 入力シートはPDF化しない
          if (sheet.title === CONTRACT_SHEET_NAMES.INPUT) continue
          
          const sheetIdNum = sheet.sheetId as number
          // REDISH: A4横向き、クロスポイント: A4縦向き
          const isPortrait = sheet.title === CONTRACT_SHEET_NAMES.CROSSPOINT || sheet.title.includes('クロスポイント')
          const pdfBuffer = await this.exportSheetAsPdf(CONTRACT_TEMPLATE_SPREADSHEET_ID, sheetIdNum, { portrait: isPortrait })
          
          if (sheet.title === CONTRACT_SHEET_NAMES.REDISH || sheet.title.includes('REDISH')) {
            pdfBase64.redish = pdfBuffer.toString('base64')
          } else if (sheet.title === CONTRACT_SHEET_NAMES.CROSSPOINT || sheet.title.includes('クロスポイント')) {
            pdfBase64.crosspoint = pdfBuffer.toString('base64')
          }
        }
      }
      
      // 5. 元の値に復元
      if (originalValues && originalValues.size > 0) {
        await client.spreadsheets.values.batchUpdate({
          spreadsheetId: CONTRACT_TEMPLATE_SPREADSHEET_ID,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: Array.from(originalValues.entries()).map(([range, value]) => ({
              range,
              values: [[value]],
            })),
          },
        })
        console.log(`[ContractSheetsClient.generateContract] Restored ${originalValues.size} cells`)
      }
      
      return {
        success: true,
        pdfBase64,
      }
    } catch (error) {
      console.error('[ContractSheetsClient.generateContract] Error:', error)
      
      // エラー時も元の値に復元を試みる
      if (originalValues && originalValues.size > 0) {
        try {
          await client.spreadsheets.values.batchUpdate({
            spreadsheetId: CONTRACT_TEMPLATE_SPREADSHEET_ID,
            requestBody: {
              valueInputOption: 'USER_ENTERED',
              data: Array.from(originalValues.entries()).map(([range, value]) => ({
                range,
                values: [[value]],
              })),
            },
          })
        } catch (restoreError) {
          console.error('[ContractSheetsClient.generateContract] Failed to restore:', restoreError)
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '契約書生成に失敗しました',
      }
    }
  }
}

// シングルトンインスタンス
export const contractSheetsClient = new ContractSheetsClient()
