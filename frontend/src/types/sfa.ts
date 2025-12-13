// リードソース
export type LeadSource = 
  | 'Meetsmore'
  | 'TEMPOS'
  | 'OMC'
  | 'Amazon'
  | 'Makuake'
  | 'REDISH'

// リードIDプレフィックス
export const LEAD_ID_PREFIX: Record<LeadSource, string> = {
  Meetsmore: 'MT',
  TEMPOS: 'TP',
  OMC: 'OM',
  Amazon: 'AM',
  Makuake: 'MK',
  REDISH: 'RD',
}

// 架電ステータス
export type CallStatus = 
  | '未架電'
  | '架電中'
  | '03.アポイント獲得済'
  | '09.アポ獲得'
  | '04.アポなし'

// 架電履歴の状況
export type CallHistoryStatus = 
  | '不通'
  | '通話できた'
  | '再架電依頼'
  | 'アポ獲得'
  | '不在'
  | '拒否'
  | 'その他'

// 架電履歴
export interface CallHistory {
  id: string // 履歴ID（自動生成）
  callDate: string // 架電日（YYYY-MM-DD）
  callTime?: string // 架電時刻（HH:mm）
  staffIS: string // 担当IS
  status: CallHistoryStatus // 架電状況
  result?: string // 結果（通話できた、不通、再架電依頼など）
  duration?: number // 通話時間（秒）
  memo?: string // メモ
  createdAt: Date // 作成日時
}

// 商談結果
export type DealResult = 
  | '01.成約（契約締結）'
  | '02.失注（リサイクル対象外）'
  | '03.失注（リサイクル対象）'

// 確度
export type DealRank = 'A:80%' | 'B:50%' | 'C:20%' | 'D:10%'

// 失注理由
export type LostReason = 
  | 'A.自己対応'
  | 'B.競合決定'
  | 'C.予算'
  | 'D.時期'
  | 'E.ニーズ訴求不足'
  | 'F.(超)小規模店'
  | 'G.興味本位'
  | 'H.ノーショー（音信不通）'
  | 'I.弊社対応不可'
  | 'J.その他'

// カテゴリ
export type Category = 'A:飲食' | 'B:非飲食'

// サービス種別
export type ServiceType = 
  | 'RO:開業（融資）'
  | 'RT:税務'
  | 'RA:補助金'
  | 'RB:融資（借り換え）'

// リード
export interface Lead {
  id: string
  source: LeadSource
  companyName: string
  contactName: string
  phone: string
  email: string
  status: CallStatus
  category?: Category
  industry?: string
  createdAt: Date
  linkedAt?: Date
}

// 架電記録
export interface CallRecord {
  id?: string
  leadId: string
  leadSource: LeadSource
  linkedDate?: string // 連携日
  industry?: string // 業種
  companyName: string // 会社名/店舗名
  contactName: string // 氏名
  contactNameKana?: string // ふりがな
  phone: string // 電話番号
  email?: string // メールアドレス
  address?: string // 住所／エリア
  openingDate?: string // 開業時期
  contactPreferredDateTime?: string // 連絡希望日時
  allianceRemarks?: string // 連携元備考
  omcAdditionalInfo1?: string // OMC追加情報①
  omcSelfFunds?: string // ⓶自己資金
  omcPropertyStatus?: string // ⓷物件状況
  amazonTaxAccountant?: string // Amazon税理士有無
  meetsmoreLink?: string // Meetsmoreリンク
  meetsmoreEntityType?: string // Meetsmore法人・個人
  makuakePjtPage?: string // MakuakePJT page
  makuakeExecutorPage?: string // Makuake実行者page
  status: CallStatus
  staffIS?: string // 担当IS
  statusIS?: string // ISステータス
  statusUpdateDate?: string // ステータス更新日
  cannotContactReason?: string // 対応不可/失注理由
  recyclePriority?: string // リサイクル優先度
  resultContactStatus?: string // 結果/コンタクト状況
  lastCalledDate?: string // 直近架電日
  callCount: number // 架電数カウント
  callDuration?: string // 通話時間（目安）
  conversationMemo?: string // 会話メモ・その他
  actionOutsideCall?: string // 架電外アクション
  nextActionDate?: string // ネクストアクション日
  nextActionContent?: string // ネクストアクション内容
  nextActionSupplement?: string // ネクストアクション補足
  nextActionCompleted?: string // 実施
  appointmentDate?: string // アポイント獲得日
  dealSetupDate?: string // 商談設定日
  dealTime?: string // 商談時間
  dealStaffFS?: string // 商談担当FS
  dealResult?: string // 商談結果
  lostReasonFS?: string // 失注理由（FS→IS）
  appointmentStatus?: string
  appointmentDateOld?: Date // 旧形式（互換性のため）
  staff?: string
  memo?: string
  linkedAt?: Date // 旧形式（互換性のため）
  lastCalledAt?: Date // 旧形式（互換性のため）
  callHistory?: CallHistory[] // 架電履歴配列
}

// 商談
export interface Deal {
  // 基本情報（架電管理から引き継ぎ）
  id: string // SA0001形式（商談ID）
  leadId: string
  leadSource: string
  linkedDate?: string
  industry?: string
  companyName: string
  contactName: string
  contactNameKana?: string
  phone: string
  email?: string
  address?: string
  openingDate?: string
  contactPreferredDateTime?: string
  allianceRemarks?: string
  omcAdditionalInfo1?: string
  omcSelfFunds?: string
  omcPropertyStatus?: string
  amazonTaxAccountant?: string
  meetsmoreLink?: string
  makuakeLink?: string
  conversationMemo?: string
  
  // 商談管理固有情報
  service: ServiceType
  category: Category
  staffIS?: string // 担当IS
  appointmentDate?: string // アポイント獲得日
  dealSetupDate?: string // 商談設定日
  dealTime?: string // 商談時間
  dealStaffFS?: string // 商談担当
  dealExecutionDate?: string // 商談実施日
  videoLink?: string // 動画リンク
  dealPhase?: string // 商談フェーズ
  phaseUpdateDate?: string // フェーズ更新日
  rankEstimate?: string // 確度ヨミ
  rankChange?: string // 確度変化
  rankUpdateDate?: string // 確度更新日
  lastContactDate?: string // 最終接触日
  actionScheduledDate?: string // アクション予定日
  nextActionContent?: string // 次回アクション内容
  responseDeadline?: string // 回答期限
  actionCompleted?: string // 対応済
  customerBANTInfo?: string // 顧客BANT情報
  competitorInfo?: string // 競合・自己対応情報
  dealMemo?: string // 商談メモ
  rank: DealRank
  detailRank?: string
  result?: DealResult
  resultDate?: string // 結果確定日（契約日）
  lostFactor?: string // 失注要因
  lostReason?: LostReason
  lostAfterAction?: string // 失注後の対応・改善策
  feedbackToIS?: string // ISへのFB
  feedback?: string // FB
  dealDate?: Date
  executionDate?: Date
  contractDate?: Date
  setupDate?: Date
  createdAt: Date
}

// 成約（Deal型を拡張）
export interface Contract extends Deal {
  contractId: string // CN0001形式（成約ID）
  customerCode?: string // A000001 or B000001形式
}

// 顧客
export interface Customer {
  code: string // A000001 or B000001形式
  category: Category
  companyName: string
  contactName: string
  phone: string
  email?: string
  address?: string
  createdAt: Date
}

// 分析データ（F分析）
export interface FieldSalesAnalysis {
  period: {
    start: Date
    end: Date
  }
  staff: string[]
  deals: {
    total: number
    contracts: number
    immediate: number
    lost: number
  }
  ranks: {
    A: number
    B: number
    C: number
    D: number
  }
  channels: {
    Meetsmore: ChannelMetrics
    TEMPOS: ChannelMetrics
    OMC: ChannelMetrics
    Amazon: ChannelMetrics
    Makuake: ChannelMetrics
  }
  lostReasons: Record<LostReason, number>
}

export interface ChannelMetrics {
  leads: number
  appointments: number
  setups: number
  executions: number
  contracts: number
}

// 分析データ（S分析）
export interface DailySalesAnalysis {
  date: Date
  deals: number
  contracts: number
  lost: number
  ranks: {
    A: number
    B: number
    C: number
    D: number
  }
  channels: {
    Meetsmore: ChannelMetrics
    TEMPOS: ChannelMetrics
    OMC: ChannelMetrics
    Amazon: ChannelMetrics
    Makuake: ChannelMetrics
  }
  lostReasons: Record<LostReason, number>
}






