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
  nextActionSupplement: DropdownOption[]
  nextActionCompleted: DropdownOption[]
  dealStaffFS: DropdownOption[]
  dealResult: DropdownOption[]
  lostReasonFS: DropdownOption[]
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
    { value: '未対応', label: '未対応' },
    { value: '対応中', label: '対応中' },
    { value: '商談獲得', label: '商談獲得' },
    { value: 'アポイント獲得済', label: 'アポイント獲得済' },
    { value: '完了', label: '完了' },
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
  nextActionSupplement: [
    { value: '特記事項なし', label: '特記事項なし' },
    { value: '要確認', label: '要確認' },
  ],
  nextActionCompleted: [
    { value: '実施済み', label: '実施済み' },
    { value: '未実施', label: '未実施' },
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
    { value: '予算不足', label: '予算不足' },
    { value: 'タイミング', label: 'タイミング' },
    { value: '他社選択', label: '他社選択' },
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







