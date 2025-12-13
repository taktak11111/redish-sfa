import { sheetsClient, columnToLetter } from './client'
import { SHEETS, DEAL_COLUMNS, ColumnMapping } from '@/types/sheets'
import { Deal, DealResult, DealRank, LostReason, Category, ServiceType } from '@/types/sfa'

// 商談管理表からデータを取得
export async function fetchDeals(): Promise<Deal[]> {
  const sheetConfig = SHEETS.DEAL_MANAGEMENT
  
  // ヘッダー行からカラムマッピングを取得
  const columnMapping = await sheetsClient.getColumnMapping(sheetConfig)
  
  // データ行を取得
  const data = await sheetsClient.getValues(
    sheetConfig.name,
    `A${sheetConfig.dataStartRow}:AZ`
  )

  return data.map(row => parseDeal(row, columnMapping)).filter(Boolean) as Deal[]
}

// 特定の商談IDの商談を取得
export async function fetchDealById(dealId: string): Promise<Deal | null> {
  const deals = await fetchDeals()
  return deals.find(deal => deal.id === dealId) || null
}

// 担当者別に商談を取得
export async function fetchDealsByStaff(staff: string): Promise<Deal[]> {
  const deals = await fetchDeals()
  return deals.filter(deal => deal.staffIS === staff)
}

// 結果別に商談を取得
export async function fetchDealsByResult(result: DealResult): Promise<Deal[]> {
  const deals = await fetchDeals()
  return deals.filter(deal => deal.result === result)
}

// 新規商談を作成
export async function createDeal(dealData: Omit<Deal, 'id' | 'createdAt'>): Promise<string> {
  const sheetConfig = SHEETS.DEAL_MANAGEMENT
  const columnMapping = await sheetsClient.getColumnMapping(sheetConfig)
  
  // 次の商談IDを取得
  const dealIdCol = columnMapping[DEAL_COLUMNS.DEAL_ID]
  const nextDealId = await sheetsClient.getNextId(sheetConfig, 'SA', dealIdCol)
  
  // 行データを構築
  const rowData: string[] = new Array(Object.keys(columnMapping).length).fill('')
  
  rowData[columnMapping[DEAL_COLUMNS.DEAL_ID]] = nextDealId
  rowData[columnMapping[DEAL_COLUMNS.STAFF]] = dealData.staffIS || ''
  rowData[columnMapping[DEAL_COLUMNS.LEAD_ID]] = dealData.leadId
  rowData[columnMapping[DEAL_COLUMNS.COMPANY_NAME]] = dealData.companyName
  rowData[columnMapping[DEAL_COLUMNS.CONTACT_NAME]] = dealData.contactName
  rowData[columnMapping[DEAL_COLUMNS.PHONE]] = dealData.phone
  rowData[columnMapping[DEAL_COLUMNS.SERVICE]] = dealData.service
  rowData[columnMapping[DEAL_COLUMNS.CATEGORY]] = dealData.category
  rowData[columnMapping[DEAL_COLUMNS.RANK]] = dealData.rank
  
  if (dealData.detailRank) {
    rowData[columnMapping[DEAL_COLUMNS.DETAIL_RANK]] = dealData.detailRank
  }
  
  // データを追加
  await sheetsClient.appendValues(
    sheetConfig.name,
    `A${sheetConfig.dataStartRow}`,
    [rowData]
  )
  
  return nextDealId
}

// 商談を更新
export async function updateDeal(
  dealId: string,
  updates: Partial<Deal>
): Promise<void> {
  const sheetConfig = SHEETS.DEAL_MANAGEMENT
  const columnMapping = await sheetsClient.getColumnMapping(sheetConfig)
  
  // データ行を取得して商談IDの行を特定
  const data = await sheetsClient.getValues(
    sheetConfig.name,
    `A${sheetConfig.dataStartRow}:AZ`
  )
  
  const dealIdCol = columnMapping[DEAL_COLUMNS.DEAL_ID]
  const rowIndex = data.findIndex(row => row[dealIdCol] === dealId)
  
  if (rowIndex === -1) {
    throw new Error(`商談ID ${dealId} が見つかりません`)
  }
  
  const actualRow = sheetConfig.dataStartRow + rowIndex
  
  // 更新対象のセルを特定して更新
  const updatePromises: Promise<void>[] = []
  
  if (updates.rank !== undefined) {
    const col = columnMapping[DEAL_COLUMNS.RANK]
    updatePromises.push(
      sheetsClient.setValues(
        sheetConfig.name,
        `${columnToLetter(col)}${actualRow}`,
        [[updates.rank]]
      )
    )
  }
  
  if (updates.result !== undefined) {
    const col = columnMapping[DEAL_COLUMNS.RESULT]
    updatePromises.push(
      sheetsClient.setValues(
        sheetConfig.name,
        `${columnToLetter(col)}${actualRow}`,
        [[updates.result]]
      )
    )
  }
  
  if (updates.lostReason !== undefined) {
    const col = columnMapping[DEAL_COLUMNS.LOST_REASON]
    updatePromises.push(
      sheetsClient.setValues(
        sheetConfig.name,
        `${columnToLetter(col)}${actualRow}`,
        [[updates.lostReason || '']]
      )
    )
  }
  
  if (updates.dealDate !== undefined) {
    const col = columnMapping[DEAL_COLUMNS.DEAL_DATE]
    updatePromises.push(
      sheetsClient.setValues(
        sheetConfig.name,
        `${columnToLetter(col)}${actualRow}`,
        [[updates.dealDate ? formatDate(updates.dealDate) : '']]
      )
    )
  }
  
  if (updates.executionDate !== undefined) {
    const col = columnMapping[DEAL_COLUMNS.EXECUTION_DATE]
    updatePromises.push(
      sheetsClient.setValues(
        sheetConfig.name,
        `${columnToLetter(col)}${actualRow}`,
        [[updates.executionDate ? formatDate(updates.executionDate) : '']]
      )
    )
  }
  
  await Promise.all(updatePromises)
}

// 行データをDealに変換
function parseDeal(row: string[], columnMapping: ColumnMapping): Deal | null {
  const dealId = row[columnMapping[DEAL_COLUMNS.DEAL_ID]]
  if (!dealId) return null
  
  return {
    id: dealId,
    leadId: row[columnMapping[DEAL_COLUMNS.LEAD_ID]] || '',
    leadSource: row[columnMapping[DEAL_COLUMNS.LEAD_ID]]?.substring(0, 2) || '',
    staffIS: row[columnMapping[DEAL_COLUMNS.STAFF]] || '',
    companyName: row[columnMapping[DEAL_COLUMNS.COMPANY_NAME]] || '',
    contactName: row[columnMapping[DEAL_COLUMNS.CONTACT_NAME]] || '',
    phone: row[columnMapping[DEAL_COLUMNS.PHONE]] || '',
    service: (row[columnMapping[DEAL_COLUMNS.SERVICE]] || 'RT:税務') as ServiceType,
    category: (row[columnMapping[DEAL_COLUMNS.CATEGORY]] || 'B:非飲食') as Category,
    rank: (row[columnMapping[DEAL_COLUMNS.RANK]] || 'D:10%') as DealRank,
    detailRank: row[columnMapping[DEAL_COLUMNS.DETAIL_RANK]] || undefined,
    result: row[columnMapping[DEAL_COLUMNS.RESULT]] as DealResult | undefined,
    lostReason: row[columnMapping[DEAL_COLUMNS.LOST_REASON]] as LostReason | undefined,
    dealDate: parseDate(row[columnMapping[DEAL_COLUMNS.DEAL_DATE]]),
    executionDate: parseDate(row[columnMapping[DEAL_COLUMNS.EXECUTION_DATE]]),
    contractDate: parseDate(row[columnMapping[DEAL_COLUMNS.CONTRACT_DATE]]),
    createdAt: new Date(),
  }
}

// 日付文字列をDateに変換
function parseDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? undefined : date
}

// DateをYYYY/MM/DD形式に変換
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}






