export interface DropdownOption {
  value: string
  label: string
}

export interface DropdownSettings {
  staffIS: DropdownOption[]
  statusIS: DropdownOption[]
  cannotContactReason: DropdownOption[]
  recyclePriority: DropdownOption[]
  resultContactStatus: DropdownOption[]
  actionOutsideCall: DropdownOption[]
  nextActionContent: DropdownOption[]
  dealStaffFS: DropdownOption[]
  dealResult: DropdownOption[]
  lostReasonFS: DropdownOption[]
  competitorStatus: DropdownOption[]
  bantInfo: DropdownOption[]
  openingPeriod: DropdownOption[]
  meetingStatus: DropdownOption[]
  dealPhase: DropdownOption[]
  rankEstimate: DropdownOption[]
  rankChange: DropdownOption[]
}

export const DEFAULT_SETTINGS: DropdownSettings = {
  staffIS: [
    { value: '担当者A', label: '担当者A' },
    { value: '担当者B', label: '担当者B' },
    { value: '担当者C', label: '担当者C' },
  ],
  statusIS: [
    { value: '01.新規リード', label: '01.新規リード' },
    { value: '02.コンタクト試行中', label: '02.コンタクト試行中' },
    { value: '03.アポイント獲得済', label: '03.アポイント獲得済' },
    { value: '04.失注（ナーチャリング対象外）', label: '04.失注（ナーチャリング対象外）' },
    { value: '05.対応不可/対象外', label: '05.対応不可/対象外' },
    { value: '06.ナーチャリング対象', label: '06.ナーチャリング対象' },
    { value: '07.既存顧客', label: '07.既存顧客' },
  ],
  cannotContactReason: [
    { value: '不在', label: '不在' },
    { value: '拒否', label: '拒否' },
    { value: '電話番号誤り', label: '電話番号誤り' },
  ],
  recyclePriority: [
    { value: '高', label: '高' },
    { value: '中', label: '中' },
    { value: '低', label: '低' },
  ],
  resultContactStatus: [
    { value: '連絡取れた', label: '連絡取れた' },
    { value: '不在', label: '不在' },
    { value: '拒否', label: '拒否' },
  ],
  actionOutsideCall: [
    { value: 'メール送信', label: 'メール送信' },
    { value: '資料送付', label: '資料送付' },
    { value: '訪問', label: '訪問' },
  ],
  nextActionContent: [
    { value: '再架電', label: '再架電' },
    { value: 'メール送信', label: 'メール送信' },
    { value: '資料送付', label: '資料送付' },
  ],
  dealStaffFS: [
    { value: '担当者X', label: '担当者X' },
    { value: '担当者Y', label: '担当者Y' },
    { value: '担当者Z', label: '担当者Z' },
  ],
  dealResult: [
    { value: '成約', label: '成約' },
    { value: '検討中', label: '検討中' },
    { value: '失注', label: '失注' },
  ],
  lostReasonFS: [
    { value: 'A.自己対応', label: 'A.自己対応' },
    { value: 'B.競合決定', label: 'B.競合決定' },
    { value: 'C.予算', label: 'C.予算' },
    { value: 'D.時期', label: 'D.時期' },
    { value: 'E.ニーズ訴求不足', label: 'E.ニーズ訴求不足' },
    { value: 'F.(超)小規模店', label: 'F.(超)小規模店' },
    { value: 'G.興味本位', label: 'G.興味本位' },
    { value: 'H.ノーショー（音信不通）', label: 'H.ノーショー（音信不通）' },
    { value: 'I.弊社対応不可', label: 'I.弊社対応不可' },
    { value: 'J.その他', label: 'J.その他' },
  ],
  competitorStatus: [
    { value: 'A1.他税理士（知り合い）', label: 'A1.他税理士（知り合い）' },
    { value: 'A2.他税理士（面談あり）', label: 'A2.他税理士（面談あり）' },
    { value: 'A3.他税理士（価格・サービス）', label: 'A3.他税理士（価格・サービス）' },
    { value: 'A4.税理士契約済', label: 'A4.税理士契約済' },
    { value: 'B1.自己対応（やってみる）', label: 'B1.自己対応（やってみる）' },
    { value: 'B2.商工会議所・青色申告会等', label: 'B2.商工会議所・青色申告会等' },
    { value: 'C1.他の競合・自己要因', label: 'C1.他の競合・自己要因' },
  ],
  bantInfo: [
    { value: 'B1.予算オーバー', label: 'B1.予算オーバー' },
    { value: 'B2.予算検討', label: 'B2.予算検討' },
    { value: 'B3.予算内', label: 'B3.予算内' },
    { value: 'A1.決裁権限あり（一人で決定可）', label: 'A1.決裁権限あり（一人で決定可）' },
    { value: 'A2.共同決済', label: 'A2.共同決済' },
    { value: 'A3.決裁権限なし', label: 'A3.決裁権限なし' },
    { value: 'N1.ニーズあり（商談メモに具体記載）', label: 'N1.ニーズあり（商談メモに具体記載）' },
    { value: 'N2.ニーズなし（商談メモに具体記載）', label: 'N2.ニーズなし（商談メモに具体記載）' },
    { value: 'T1.未定・検討中（開業未定）', label: 'T1.未定・検討中（開業未定）' },
    { value: 'T2.開業時期決定', label: 'T2.開業時期決定' },
  ],
  openingPeriod: [
    { value: '1カ月以内', label: '1カ月以内' },
    { value: '3カ月以内', label: '3カ月以内' },
    { value: '6カ月以内', label: '6カ月以内' },
    { value: '1年以内', label: '1年以内' },
    { value: '1年以上', label: '1年以上' },
    { value: '未定', label: '未定' },
    { value: '開業済（初年度）', label: '開業済（初年度）' },
    { value: '開業２年目以降', label: '開業２年目以降' },
  ],
  meetingStatus: [
    { value: '商談キャンセル', label: '商談キャンセル' },
    { value: 'ノーショー（連絡なし）', label: 'ノーショー（連絡なし）' },
    { value: '商談実施', label: '商談実施' },
    { value: '商談再設定', label: '商談再設定' },
  ],
  dealPhase: [
    { value: '初回商談', label: '初回商談' },
    { value: '提案中', label: '提案中' },
    { value: '検討中', label: '検討中' },
    { value: '契約準備', label: '契約準備' },
  ],
  rankEstimate: [
    { value: 'A:80%', label: 'A:80%' },
    { value: 'B:50%', label: 'B:50%' },
    { value: 'C:20%', label: 'C:20%' },
    { value: 'D:10%', label: 'D:10%' },
  ],
  rankChange: [
    { value: '向上', label: '向上' },
    { value: '維持', label: '維持' },
    { value: '低下', label: '低下' },
  ],
}

export function getDropdownSettings(): DropdownSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }
  
  const saved = localStorage.getItem('sfa-dropdown-settings')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load dropdown settings:', e)
      return DEFAULT_SETTINGS
    }
  }
  
  return DEFAULT_SETTINGS
}

export function getDropdownOptions(field: keyof DropdownSettings): DropdownOption[] {
  const settings = getDropdownSettings()
  return settings[field] || []
}







