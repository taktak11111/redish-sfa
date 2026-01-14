export { sheetsClient, columnToLetter, letterToColumn } from './client'
export { fetchCallRecords, fetchCallRecordByLeadId, fetchCallRecordsByStatus, updateCallRecord } from './calls'
export { fetchDeals, fetchDealById, fetchDealsByStaff, fetchDealsByResult, createDeal, updateDeal } from './deals'
export { 
  contractSheetsClient, 
  CONTRACT_TEMPLATE_SPREADSHEET_ID,
  CONTRACT_SHEET_NAMES,
  CONTRACT_CELL_MAPPING,
  type ContractData,
  type ContractGenerationResult,
} from './contracts'







