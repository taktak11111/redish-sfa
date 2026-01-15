export interface DropdownOption {
  value: string
  label: string
}

export interface DropdownSettings {
  staffIS: DropdownOption[]
  statusIS: DropdownOption[]
  cannotContactReason: DropdownOption[]
  disqualifyReason: DropdownOption[]
  unreachableReason: DropdownOption[]
  customerType: DropdownOption[]
  lostReasonPrimary: DropdownOption[]
  lostReasonCustomerSub: DropdownOption[]
  lostReasonCompanySub: DropdownOption[]
  lostReasonCompetitorSub: DropdownOption[]
  lostReasonSelfSub: DropdownOption[]
  lostReasonOtherSub: DropdownOption[]
  lostReasonMemoTemplates: DropdownOption[]
  recyclePriority: DropdownOption[]
  resultContactStatus: DropdownOption[]
  actionOutsideCall: DropdownOption[]
  nextActionContent: DropdownOption[]
  dealStaffFS: DropdownOption[]
  // 契約担当者（契約管理画面で使用）
  contractStaff: DropdownOption[]
  dealResult: DropdownOption[]
  lostReasonFS: DropdownOption[]
  competitorStatus: DropdownOption[]
  bantInfo: DropdownOption[]
  openingPeriod: DropdownOption[]
  meetingStatus: DropdownOption[]
  dealPhase: DropdownOption[]
  rankEstimate: DropdownOption[]
  rankChange: DropdownOption[]
  improvementCategory: DropdownOption[]
  // 新規追加項目（Phase 1-3）
  needTemperature: DropdownOption[]
  contractReason: DropdownOption[]
  feedbackToIS: DropdownOption[]
  bantBudget: DropdownOption[]
  bantAuthority: DropdownOption[]
  bantTimeline: DropdownOption[]
  selfHandlingStatus: DropdownOption[]
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
    { value: '06.ナーチャリング対象', label: '06.ナーチャリング対象' },
    { value: '05a.対象外（Disqualified）', label: '05a.対象外（Disqualified）' },
    { value: '05b.連絡不能（Unreachable）', label: '05b.連絡不能（Unreachable）' },
    // 互換維持（旧データ表示用）
    { value: '05.対応不可/対象外（旧）', label: '05.対応不可/対象外（旧）' },
    { value: '07.既存顧客（属性へ移行予定）', label: '07.既存顧客（属性へ移行予定）' },
  ],
  cannotContactReason: [
    // 対象外（Disqualified）
    { value: 'D1.心当たりなし（何のことかわからない）', label: 'D1.心当たりなし（何のことかわからない）' },
    { value: 'D2.言葉が通じない（言語障壁）', label: 'D2.言葉が通じない（言語障壁）' },
    { value: 'D3.完全に興味なし', label: 'D3.完全に興味なし' },
    // 連絡不能（Unreachable）
    { value: 'U1.番号違い', label: 'U1.番号違い' },
    { value: 'U2.番号不備', label: 'U2.番号不備' },
    // 互換維持（旧データ表示用）
    { value: '不在（旧）', label: '不在（旧）' },
    { value: '拒否（旧）', label: '拒否（旧）' },
    { value: '電話番号誤り（旧）', label: '電話番号誤り（旧）' },
  ],
  disqualifyReason: [
    { value: 'D1.心当たりなし（何のことかわからない）', label: 'D1.心当たりなし（何のことかわからない）' },
    { value: 'D2.言葉が通じない（言語障壁）', label: 'D2.言葉が通じない（言語障壁）' },
    { value: 'D3.完全に興味なし', label: 'D3.完全に興味なし' },
  ],
  unreachableReason: [
    { value: 'U1.番号違い', label: 'U1.番号違い' },
    { value: 'U2.番号不備', label: 'U2.番号不備' },
  ],
  customerType: [
    { value: '見込み客', label: '見込み客' },
    { value: '既存顧客', label: '既存顧客' },
    { value: '解約顧客', label: '解約顧客' },
  ],
  lostReasonPrimary: [
    { value: '顧客要因', label: '顧客要因' },
    { value: '自社要因', label: '自社要因' },
    { value: '競合要因', label: '競合要因' },
    { value: '自己対応', label: '自己対応' },
    { value: 'その他', label: 'その他' },
  ],
  lostReasonCustomerSub: [
    // 例: 画像「話だけ聞いてみたい」「興味なし/不要」「予算オーバー」「時期尚早」「依頼記憶なし」等
    { value: '話だけ聞いてみたい（開業見込みなし）', label: '話だけ聞いてみたい（開業見込みなし）' },
    { value: '興味なし/不要', label: '興味なし/不要' },
    { value: '予算オーバー', label: '予算オーバー' },
    { value: '時期尚早/今じゃない', label: '時期尚早/今じゃない' },
    { value: '時間尚早（時間帯が合わない）', label: '時間尚早（時間帯が合わない）' },
    { value: '依頼記憶なし', label: '依頼記憶なし' },
  ],
  lostReasonCompanySub: [
    // 例: 画像「弊社対応不可」「オンライン対応不可」「連携ミス」等
    { value: '弊社対応不可', label: '弊社対応不可' },
    { value: 'オンライン対応不可', label: 'オンライン対応不可' },
    { value: '連携ミス', label: '連携ミス' },
    { value: '不明（要確認）', label: '不明（要確認）' },
  ],
  lostReasonCompetitorSub: [
    // 競合要因（失注サブ理由）に「内訳」も統合（計6件）
    { value: '税理士契約済', label: '税理士契約済' },
    { value: '他税理士に決定', label: '他税理士に決定' },
    { value: '他税理士:知り合い', label: '他税理士:知り合い' },
    { value: '他税理士:面談あり', label: '他税理士:面談あり' },
    { value: '他税理士:価格', label: '他税理士:価格' },
    { value: '他税理士:サービス', label: '他税理士:サービス' },
  ],
  lostReasonSelfSub: [
    { value: '自己対応（自分でやる）', label: '自己対応（自分でやる）' },
    { value: '商工会議所・青色申告会等', label: '商工会議所・青色申告会等' },
  ],
  lostReasonOtherSub: [
    { value: '完全未通電（架電5回以上、SMS反応なし）', label: '完全未通電（架電5回以上、SMS反応なし）' },
    { value: '不明', label: '不明' },
    { value: 'その他', label: 'その他' },
  ],
  // 旧：競合内訳テンプレ（競合要因の失注サブ理由へ統合済み）
  lostReasonMemoTemplates: [
    { value: '他税理士:知り合い', label: '他税理士:知り合い（旧）' },
    { value: '他税理士:面談あり', label: '他税理士:面談あり（旧）' },
    { value: '他税理士:価格', label: '他税理士:価格（旧）' },
    { value: '他税理士:サービス', label: '他税理士:サービス（旧）' },
  ],
  recyclePriority: [
    // ナーチャリング（リサイクル）優先度：A〜E（推奨）
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'E', label: 'E' },
    // 互換維持（旧データ表示用）
    { value: '高', label: '高（旧）' },
    { value: '中', label: '中（旧）' },
    { value: '低', label: '低（旧）' },
  ],
  resultContactStatus: [
    // 直近架電結果（Phase 2クイックアクションで必須）
    { value: '未架電', label: '未架電' },
    { value: '不通', label: '不通' },
    { value: '通電', label: '通電' },
    // 互換維持（旧データ表示用）
    { value: '連絡取れた（旧）', label: '連絡取れた（旧）' },
    { value: '不在（旧）', label: '不在（旧）' },
    { value: '拒否（旧）', label: '拒否（旧）' },
  ],
  actionOutsideCall: [
    { value: 'メール送信', label: 'メール送信' },
    { value: '資料送付', label: '資料送付' },
    { value: '訪問', label: '訪問' },
  ],
  nextActionContent: [
    { value: '回答確認', label: '回答確認' },
    { value: '再架電', label: '再架電' },
    { value: 'メール送信', label: 'メール送信' },
    { value: '資料送付', label: '資料送付' },
  ],
  dealStaffFS: [
    { value: '担当者X', label: '担当者X' },
    { value: '担当者Y', label: '担当者Y' },
    { value: '担当者Z', label: '担当者Z' },
  ],
  contractStaff: [
    { value: '担当者X', label: '担当者X' },
    { value: '担当者Y', label: '担当者Y' },
    { value: '担当者Z', label: '担当者Z' },
  ],
  dealResult: [
    { value: '成約（即決）', label: '成約（即決）' },
    { value: '成約', label: '成約' },
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
    { value: 'なし', label: 'なし' },
    { value: '他税理士（知り合い）', label: '他税理士（知り合い）' },
    { value: '他税理士（面談ありサービス）', label: '他税理士（面談ありサービス）' },
    { value: '他税理士（価格安い）', label: '他税理士（価格安い）' },
    { value: '他税理士（サービスがいい）', label: '他税理士（サービスがいい）' },
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
    { value: '実施前', label: '実施前' },
    { value: '実施済', label: '実施済' },
    { value: 'ノーショー 連絡なし', label: 'ノーショー 連絡なし' },
    { value: 'キャンセル', label: 'キャンセル' },
    { value: 'リスケ', label: 'リスケ' },
  ],
  dealPhase: [
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
  improvementCategory: [
    { value: 'トークスキル', label: 'トークスキル' },
    { value: '商品知識', label: '商品知識' },
    { value: '顧客理解', label: '顧客理解' },
    { value: '反論対応', label: '反論対応' },
    { value: 'クロージング', label: 'クロージング' },
    { value: '架電効率', label: '架電効率' },
    { value: '架電量', label: '架電量' },
    { value: '架電クオリティ', label: '架電クオリティ' },
    { value: 'その他', label: 'その他' },
  ],
  // 新規追加項目（Phase 1-3）
  needTemperature: [
    { value: 'A', label: 'A: 期限あり・困り大' },
    { value: 'B', label: 'B: 条件次第・検討' },
    { value: 'C', label: 'C: 情報収集・低温' },
  ],
  contractReason: [
    { value: '価格', label: '価格' },
    { value: 'サービス内容', label: 'サービス内容' },
    { value: '価格・サービス両方', label: '価格・サービス両方' },
    { value: 'その他', label: 'その他' },
  ],
  feedbackToIS: [
    { value: 'ニーズ全くなし', label: 'ニーズ全くなし' },
    { value: '自己資金なし', label: '自己資金なし' },
    { value: '日本語問題', label: '日本語問題' },
    { value: '興味本位（少しのニーズ）', label: '興味本位（少しのニーズ）' },
    { value: '開業時期1年以上先', label: '開業時期1年以上先' },
    { value: 'その他', label: 'その他' },
  ],
  bantBudget: [
    { value: '予算オーバー', label: '予算オーバー' },
    { value: '予算内', label: '予算内' },
    { value: '確認中', label: '確認中' },
    { value: '検討中', label: '検討中' },
    { value: '不明', label: '不明' },
  ],
  bantAuthority: [
    { value: '単独決裁者', label: '単独決裁者' },
    { value: '共同決裁', label: '共同決裁' },
    { value: '決裁権限なし', label: '決裁権限なし' },
    { value: '不明', label: '不明' },
  ],
  bantTimeline: [
    { value: '即時', label: '即時' },
    { value: '3日以内', label: '3日以内' },
    { value: '1週間以内', label: '1週間以内' },
    { value: '1ヶ月以内', label: '1ヶ月以内' },
    { value: '3ヶ月以内', label: '3ヶ月以内' },
    { value: '3ヶ月以上', label: '3ヶ月以上' },
    { value: '未定', label: '未定' },
  ],
  selfHandlingStatus: [
    { value: 'なし', label: 'なし' },
    { value: 'やってみる', label: 'やってみる' },
    { value: '商工会議所・青色申告会等サポート', label: '商工会議所・青色申告会等サポート' },
    { value: '自己対応検討', label: '自己対応検討' },
  ],
}

export function applyDropdownSettingsMigrations(settings: DropdownSettings): DropdownSettings {
  const next: DropdownSettings = { ...settings }

  // 競合要因の「備忘テンプレ」廃止に伴う移行：
  // - 旧環境では lostReasonCompetitorSub が 2件など古い状態のままDB/LSに残る
  // - 旧値「競合に決定（価格/サービス）」を含む場合のみ変換・補完を行う
  // - それ以外は設定画面での編集結果をそのまま尊重する（勝手に補完しない）
  const current = Array.isArray(next.lostReasonCompetitorSub) ? next.lostReasonCompetitorSub : []

  // 旧値「競合に決定（価格/サービス）」を含むかチェック
  const hasLegacyValues = current.some((o) => {
    const v = String(o?.value ?? '').trim()
    return v === '競合に決定（価格）' || v === '競合に決定（サービス）'
  })

  // 旧値を含む場合のみ移行処理を実行
  if (hasLegacyValues) {
    const desired = DEFAULT_SETTINGS.lostReasonCompetitorSub

    const normalize = (o: any): { value: string; label: string } | null => {
      const value = String(o?.value ?? '').trim()
      if (!value) return null
      const label = String(o?.label ?? value).trim() || value
      return { value, label }
    }

    // 旧値を新値へ寄せる
    const mapped = current
      .map((o) => normalize(o))
      .filter(Boolean)
      .map((o) => {
        const v = o!.value
        if (v === '競合に決定（価格）') return { value: '他税理士:価格', label: '他税理士:価格' }
        if (v === '競合に決定（サービス）') return { value: '他税理士:サービス', label: '他税理士:サービス' }
        return o!
      })

    const seen = new Set<string>()
    const cleaned: { value: string; label: string }[] = []
    for (const o of mapped) {
      const v = String(o.value).trim()
      if (!v) continue
      if (seen.has(v)) continue
      seen.add(v)
      cleaned.push(o)
    }

    // 旧値変換後、不足分を補完
    const desiredValues = desired.map((o) => String(o.value).trim()).filter(Boolean)
    for (const dv of desiredValues) {
      if (!seen.has(dv)) {
        const found = desired.find((o) => String(o.value).trim() === dv)
        if (found) {
          cleaned.push(found)
          seen.add(dv)
        }
      }
    }

    next.lostReasonCompetitorSub = cleaned.length > 0 ? cleaned : desired
  }
  // 旧値を含まない場合は何もせず、設定画面での編集結果をそのまま返す

  return next
}

export function getDropdownSettings(): DropdownSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }
  
  const saved = localStorage.getItem('sfa-dropdown-settings')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      const merged: DropdownSettings = { ...DEFAULT_SETTINGS, ...(parsed || {}) }
      return applyDropdownSettingsMigrations(merged)
    } catch (e) {
      console.error('Failed to load dropdown settings:', e)
      return DEFAULT_SETTINGS
    }
  }
  
  return applyDropdownSettingsMigrations(DEFAULT_SETTINGS)
}

export function getDropdownOptions(field: keyof DropdownSettings): DropdownOption[] {
  const settings = getDropdownSettings()
  return settings[field] || []
}

/**
 * DB（/api/dropdown-settings）から設定を取得し、localStorageへ同期する。
 * - settingsページを開かなくても最新設定を反映するために使用する
 * - 失敗時は localStorage / DEFAULT_SETTINGS を返す
 * 
 * 注意: カテゴリ名の不一致について
 * - 設定メニューのセクションID（'dealManagement'）とDBのカテゴリ名（'deal'）が不一致
 * - この不一致は既存のDBデータとの互換性のため維持されている
 * - DBから取得した設定は、カテゴリに関係なく`DropdownSettings`型にマージされる
 */
export async function refreshDropdownSettingsFromDB(): Promise<DropdownSettings> {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  try {
    // 直近に設定画面で保存した直後は、DBからの古い設定で上書きされやすい。
    // そのため一定時間はlocalStorageをSSOTとして扱い、反映遅延/上書きを防ぐ。
    const updatedAtRaw = localStorage.getItem('sfa-dropdown-settings.updatedAt')
    const updatedAt = updatedAtRaw ? Number(updatedAtRaw) : 0
    if (Number.isFinite(updatedAt) && updatedAt > 0) {
      const ageMs = Date.now() - updatedAt
      if (ageMs >= 0 && ageMs < 10 * 60 * 1000) {
        return getDropdownSettings()
      }
    }

    const response = await fetch('/api/dropdown-settings')
    if (!response.ok) {
      return getDropdownSettings()
    }

    const { settings: dbSettings } = await response.json()
    if (!dbSettings || Object.keys(dbSettings).length === 0) {
      return getDropdownSettings()
    }

    const mergedSettings: DropdownSettings = { ...DEFAULT_SETTINGS }

    // DBから取得した設定をカテゴリ別にマージ
    // 注意: カテゴリ名（'call', 'deal'など）に関係なく、設定キーでマージされる
    // 例: 'deal'カテゴリの'staffIS'も、'call'カテゴリの'staffIS'も、同じ'staffIS'キーにマージされる
    Object.keys(dbSettings).forEach(category => {
      Object.keys(dbSettings[category] || {}).forEach(key => {
        if (key in mergedSettings) {
          mergedSettings[key as keyof DropdownSettings] = dbSettings[category][key]
        } else {
          // 型定義に存在しないキーは警告を出すが、無視する（既存動作を維持）
          // 削除済みフィールド（nextActionSupplement, nextActionCompleted）は警告を出さない
          if (key !== 'nextActionSupplement' && key !== 'nextActionCompleted') {
            console.warn(`[dropdownSettings] Key "${key}" in category "${category}" not found in DropdownSettings type`)
          }
        }
      })
    })

    const migrated = applyDropdownSettingsMigrations(mergedSettings)
    localStorage.setItem('sfa-dropdown-settings', JSON.stringify(migrated))
    localStorage.setItem('sfa-dropdown-settings.updatedAt', String(Date.now()))
    window.dispatchEvent(new Event('storage'))
    return migrated
  } catch (e) {
    console.error('Failed to refresh dropdown settings from DB:', e)
    return getDropdownSettings()
  }
}







