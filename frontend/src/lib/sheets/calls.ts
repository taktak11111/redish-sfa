import { sheetsClient, columnToLetter } from './client'
import { SHEETS, CALL_COLUMNS, ColumnMapping } from '@/types/sheets'
import { CallRecord, CallStatus, LeadSource, Category } from '@/types/sfa'

// 架電管理表からデータを取得
export async function fetchCallRecords(): Promise<CallRecord[]> {
  const sheetConfig = SHEETS.CALL_MANAGEMENT
  
  // ヘッダー行からカラムマッピングを取得
  const columnMapping = await sheetsClient.getColumnMapping(sheetConfig)
  
  // データ行を取得
  const data = await sheetsClient.getValues(
    sheetConfig.name,
    `A${sheetConfig.dataStartRow}:AZ`
  )

  return data.map(row => parseCallRecord(row, columnMapping)).filter(Boolean) as CallRecord[]
}

// 特定のリードIDの架電記録を取得
export async function fetchCallRecordByLeadId(leadId: string): Promise<CallRecord | null> {
  const records = await fetchCallRecords()
  return records.find(record => record.leadId === leadId) || null
}

// ステータス別に架電記録を取得
export async function fetchCallRecordsByStatus(status: CallStatus): Promise<CallRecord[]> {
  const records = await fetchCallRecords()
  return records.filter(record => record.status === status)
}

// 架電記録を更新
export async function updateCallRecord(
  leadId: string, 
  updates: Partial<CallRecord>
): Promise<void> {
  const sheetConfig = SHEETS.CALL_MANAGEMENT
  const columnMapping = await sheetsClient.getColumnMapping(sheetConfig)
  
  // データ行を取得してリードIDの行を特定
  const data = await sheetsClient.getValues(
    sheetConfig.name,
    `A${sheetConfig.dataStartRow}:AZ`
  )
  
  const leadIdCol = columnMapping[CALL_COLUMNS.LEAD_ID]
  const rowIndex = data.findIndex(row => row[leadIdCol] === leadId)
  
  if (rowIndex === -1) {
    throw new Error(`リードID ${leadId} が見つかりません`)
  }
  
  const actualRow = sheetConfig.dataStartRow + rowIndex
  
  // 更新対象のセルを特定して更新
  const updatePromises: Promise<void>[] = []
  
  if (updates.status !== undefined) {
    const col = columnMapping[CALL_COLUMNS.STATUS]
    updatePromises.push(
      sheetsClient.setValues(
        sheetConfig.name,
        `${columnToLetter(col)}${actualRow}`,
        [[updates.status]]
      )
    )
  }
  
  if (updates.appointmentStatus !== undefined) {
    const col = columnMapping[CALL_COLUMNS.APPT_STATUS]
    updatePromises.push(
      sheetsClient.setValues(
        sheetConfig.name,
        `${columnToLetter(col)}${actualRow}`,
        [[updates.appointmentStatus]]
      )
    )
  }
  
  if (updates.memo !== undefined) {
    const col = columnMapping[CALL_COLUMNS.MEMO]
    updatePromises.push(
      sheetsClient.setValues(
        sheetConfig.name,
        `${columnToLetter(col)}${actualRow}`,
        [[updates.memo]]
      )
    )
  }
  
  if (updates.callCount !== undefined) {
    const col = columnMapping[CALL_COLUMNS.CALL_COUNT]
    updatePromises.push(
      sheetsClient.setValues(
        sheetConfig.name,
        `${columnToLetter(col)}${actualRow}`,
        [[String(updates.callCount)]]
      )
    )
  }
  
  if (updates.lastCalledAt !== undefined) {
    const col = columnMapping[CALL_COLUMNS.LAST_CALLED]
    updatePromises.push(
      sheetsClient.setValues(
        sheetConfig.name,
        `${columnToLetter(col)}${actualRow}`,
        [[updates.lastCalledAt]]
      )
    )
  }
  
  await Promise.all(updatePromises)
}

// 行データをCallRecordに変換
function parseCallRecord(row: string[], columnMapping: ColumnMapping): CallRecord | null {
  const leadId = row[columnMapping[CALL_COLUMNS.LEAD_ID]]
  if (!leadId) return null
  
  return {
    id: leadId,
    leadId,
    leadSource: row[columnMapping[CALL_COLUMNS.LEAD_SOURCE]] as LeadSource,
    companyName: row[columnMapping[CALL_COLUMNS.COMPANY_NAME]] || '',
    contactName: row[columnMapping[CALL_COLUMNS.CONTACT_NAME]] || '',
    phone: row[columnMapping[CALL_COLUMNS.PHONE]] || '',
    status: (row[columnMapping[CALL_COLUMNS.STATUS]] || '未架電') as CallStatus,
    appointmentStatus: row[columnMapping[CALL_COLUMNS.APPT_STATUS]] || undefined,
    appointmentDate: parseDateString(row[columnMapping[CALL_COLUMNS.APPT_DATE]]),
    staff: row[columnMapping[CALL_COLUMNS.STAFF]] || undefined,
    memo: row[columnMapping[CALL_COLUMNS.MEMO]] || undefined,
    linkedAt: parseDateString(row[columnMapping[CALL_COLUMNS.LINKED_DATE]]) || formatCurrentDate(),
    callCount: parseInt(row[columnMapping[CALL_COLUMNS.CALL_COUNT]] || '0', 10),
    lastCalledAt: parseDateString(row[columnMapping[CALL_COLUMNS.LAST_CALLED]]),
  }
}

// 日付文字列を検証して返す（無効な場合はundefined）
function parseDateString(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? undefined : dateStr
}

// 現在日付をYYYY/MM/DD形式で返す
function formatCurrentDate(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}
