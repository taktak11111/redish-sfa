// シート定義
export interface SheetConfig {
  name: string
  idRow: number | null
  headerRow: number | null
  dataStartRow: number
}

// スプレッドシート設定
export const SHEETS: Record<string, SheetConfig> = {
  // リードソースシート
  LEAD_MEETSMORE: { 
    name: '11.Meetsmore', 
    idRow: 1, 
    headerRow: 5, 
    dataStartRow: 6 
  },
  LEAD_TEMPOS: { 
    name: '12.TEMPOS', 
    idRow: 1, 
    headerRow: 5, 
    dataStartRow: 6 
  },
  LEAD_OMC: { 
    name: '14.OMC', 
    idRow: 1, 
    headerRow: 5, 
    dataStartRow: 6 
  },
  LEAD_AMAZON: { 
    name: '15.Amazon', 
    idRow: 1, 
    headerRow: 5, 
    dataStartRow: 6 
  },
  LEAD_MAKUAKE: { 
    name: '3.Makuake', 
    idRow: 1, 
    headerRow: 5, 
    dataStartRow: 6 
  },
  
  // 管理シート
  CALL_MANAGEMENT: { 
    name: '架電管理表', 
    idRow: 1, 
    headerRow: 8, 
    dataStartRow: 9 
  },
  DEAL_MANAGEMENT: { 
    name: '商談管理表', 
    idRow: 1, 
    headerRow: 8, 
    dataStartRow: 9 
  },
  CONTRACT_MANAGEMENT: { 
    name: '成約管理表', 
    idRow: 1, 
    headerRow: 8, 
    dataStartRow: 9 
  },
  
  // 契約フォーム
  CONTRACT_FORM: { 
    name: '契約', 
    idRow: null, 
    headerRow: null, 
    dataStartRow: 4 
  },
  
  // 分析シート
  ANALYSIS_F: { 
    name: 'F分析', 
    idRow: null, 
    headerRow: null, 
    dataStartRow: 1 
  },
  ANALYSIS_S: { 
    name: 'S分析', 
    idRow: null, 
    headerRow: null, 
    dataStartRow: 8 
  },
}

// カラムID定義（架電管理表: K系）
export const CALL_COLUMNS = {
  LEAD_ID: 'K01',
  LEAD_SOURCE: 'K02',
  LINKED_DATE: 'K04',
  COMPANY_NAME: 'K05',
  CONTACT_NAME: 'K06',
  PHONE: 'K07',
  EMAIL: 'K08',
  STATUS: 'K09',
  CATEGORY: 'K10',
  INDUSTRY: 'K11',
  CALL_COUNT: 'K12',
  LAST_CALLED: 'K13',
  STAFF: 'K14',
  MEMO: 'K15',
  APPT_STATUS: 'K16',
  APPT_DATE: 'K17',
  SETUP_DATE: 'K23',
} as const

// カラムID定義（商談管理表: S系）
export const DEAL_COLUMNS = {
  DEAL_ID: 'S01',
  STAFF: 'S02',
  LEAD_ID: 'S03',
  DETAIL_RANK: 'S04',
  COMPANY_NAME: 'S05',
  RANK: 'S06',
  CONTACT_NAME: 'S07',
  PHONE: 'S08',
  SERVICE: 'S09',
  CATEGORY: 'S10',
  RESULT: 'S16',
  LOST_REASON: 'S18',
  DEAL_DATE: 'S22',
  EXECUTION_DATE: 'S23',
  CONTRACT_DATE: 'S24',
} as const

// カラムID定義（成約管理表）
export const CONTRACT_COLUMNS = {
  CONTRACT_ID: 'C01',
  DEAL_ID: 'C02',
  STAFF: 'C03',
  COMPANY_NAME: 'C04',
  CONTACT_NAME: 'C05',
  PHONE: 'C06',
  SERVICE: 'C07',
  CATEGORY: 'C08',
  CUSTOMER_CODE: 'C09',
  CONTRACT_DATE: 'C10',
} as const

// カラムIDから列インデックスへのマッピング（動的に生成）
export type ColumnMapping = Record<string, number>
