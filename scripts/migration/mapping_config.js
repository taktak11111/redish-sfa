/**
 * 商談データ移行用マッピング設定
 * 
 * CSVの列名 → DBのフィールドへの変換ルールを定義
 * 
 * 作成日: 2026-01-18
 * 確認済み: CEOとの質疑応答で全ルール確定
 */

// ===========================================
// AE列（商談結果）→ meetingStatus / dealResult 変換ルール
// ===========================================
const dealResultMapping = {
  // 成約系
  '01.成約（契約締結）': {
    meetingStatus: '商談実施',
    dealResult: '成約（即決）'
  },
  'A：受注': {
    meetingStatus: '商談実施',
    dealResult: '成約（後日）'
  },
  'B：口頭OK': {
    meetingStatus: '商談実施',
    dealResult: '口頭受注'
  },
  
  // 失注系
  '02.失注（リサイクル対象外）': {
    meetingStatus: '商談実施',
    dealResult: '失注（リサイクル対象外）'
  },
  '03.失注（リサイクル対象）': {
    meetingStatus: '商談実施',
    dealResult: '失注（リサイクル対象）'
  },
  'D：失注': {
    meetingStatus: '商談実施',
    dealResult: '失注（リサイクル対象外）'
  },
  'H：リサイクル': {
    meetingStatus: '商談実施',
    dealResult: '失注（リサイクル対象）'
  },
  
  // 検討中系
  'C：①他社比較（サービス）': {
    meetingStatus: '商談実施',
    dealResult: '検討中'
  },
  'C：②他社比較（価格）': {
    meetingStatus: '商談実施',
    dealResult: '検討中'
  },
  'C：③自己対応比較': {
    meetingStatus: '商談実施',
    dealResult: '検討中'
  },
  'C：④他決裁者との合意': {
    meetingStatus: '商談実施',
    dealResult: '検討中'
  },
  'C：⑤開業時期が未定or先々': {
    meetingStatus: '商談実施',
    dealResult: '検討中'
  },
  
  // 商談実施（結果未確定）
  '03.商談実施': {
    meetingStatus: '商談実施',
    dealResult: null  // 個別判断が必要
  },
  
  // リスケ系
  'E：リスケ調整中': {
    meetingStatus: '商談再設定',
    dealResult: null
  },
  
  // ノーショー系
  'F：ノーショウ・音信不通': {
    meetingStatus: 'ノーショー（連絡なし）',
    dealResult: null
  },
  'F：ノーショウ ・音信不通': {  // 表記ゆれ対応（スペースあり）
    meetingStatus: 'ノーショー（連絡なし）',
    dealResult: null
  },
  
  // キャンセル系
  'G：キャンセル（商談未実施）': {
    meetingStatus: '商談キャンセル',
    dealResult: null
  }
};

// ===========================================
// CSVの列名 → DBフィールド名のマッピング（スネークケース）
// ===========================================
const columnMapping = {
  // 基本情報
  '商談ID': 'deal_id',  // DBのプライマリキーはUUIDだが、deal_idがTEXTユニーク
  'サービス': 'service',
  'カテゴリ': 'category',
  'リードID': 'lead_id',
  'リードソース': 'lead_source',
  '連携日': 'linked_date',
  '業種': 'industry',
  '会社名/店舗名': 'company_name',
  '氏名': 'contact_name',
  'ふりがな': 'contact_name_kana',
  '電話番号': 'phone',
  'メールアドレス': 'email',
  '住所／エリア': 'address',
  '開業時期': 'opening_date',
  '連絡希望日時': 'contact_preferred_datetime',
  '備考': 'alliance_remarks',
  
  // リードソース別情報
  'OMC 追加情報①': 'omc_additional_info1',
  '⓶自己資金': 'omc_self_funds',
  '⓷物件状況': 'omc_property_status',
  'Amazon 税理士有無': 'amazon_tax_accountant',
  'Meetsmore リンク': 'meetsmore_link',
  'Makuakeリンク': 'makuake_link',
  
  // 商談管理情報
  '会話メモ': 'conversation_memo',
  '担当IS': 'staff_is',
  'アポイント獲得日': 'appointment_date',
  '商談設定日': 'deal_setup_date',
  '商談時間': 'deal_time',
  '担当': 'deal_staff_fs',
  '商談実施日': 'deal_execution_date',
  '動画 リンク': 'video_link',
  '商談フェーズ': 'deal_phase',
  'フェーズ更新日': 'phase_update_date',
  '確度 ヨミ': 'rank_estimate',
  '確度 変化': 'rank_change',
  '確度 更新日': 'rank_update_date',
  '最終 接触日': 'last_contact_date',
  'アクション 予定日': 'action_scheduled_date',
  '次回アクション内容': 'next_action_content',
  '回答 期限': 'response_deadline',
  '対応済': 'action_completed',
  '顧客BANT情報': 'customer_bant_info',
  '競合・自己対応情報': 'competitor_info',
  '商談メモ': 'deal_memo',
  
  // 商談結果関連（特殊処理が必要）
  '商談結果': '_original_deal_result',  // 変換元として保持（後で削除）
  '結果確定日 （契約日）': 'result_date',
  '失注要因': 'lost_factor',
  '失注理由': 'lost_reason',
  '失注後の対応・改善策': 'lost_after_action',
  'ISへのFB': 'feedback_to_is',
  'FB': 'feedback'
};

// ===========================================
// サービス/カテゴリの変換ルール
// ===========================================
const serviceMapping = {
  'RT:税務': 'RT:税務',
  'RT:助成金': 'RT:助成金',
  // 必要に応じて追加
};

const categoryMapping = {
  'A:飲食': 'A:飲食',
  'B:美容': 'B:美容',
  'C:その他': 'C:その他',
  // 必要に応じて追加
};

// ===========================================
// 確度ヨミの変換ルール
// ===========================================
const rankMapping = {
  'A': 'A:80%',
  'A:80%': 'A:80%',
  'B': 'B:50%',
  'B:50%': 'B:50%',
  'C': 'C:20%',
  'C:20%': 'C:20%',
  'D': 'D:10%',
  'D:10%': 'D:10%',
  '': 'D:10%',  // デフォルト
  null: 'D:10%'
};

// ===========================================
// データ変換関数
// ===========================================

/**
 * CSV行をDBレコードに変換
 * @param {Object} csvRow - CSVの1行（列名: 値のオブジェクト）
 * @returns {Object} DBに挿入するレコード
 */
function transformRow(csvRow) {
  const record = {};
  
  // 基本フィールドのマッピング
  for (const [csvCol, dbField] of Object.entries(columnMapping)) {
    const value = csvRow[csvCol];
    if (value !== undefined && value !== '') {
      record[dbField] = value;
    }
  }
  
  // 商談結果の特殊変換（DBのresultカラムに格納）
  const originalResult = csvRow['商談結果'];
  if (originalResult && dealResultMapping[originalResult]) {
    const mapped = dealResultMapping[originalResult];
    // DBのresultカラムはCHECK制約あり: '01.成約（契約締結）', '02.失注（リサイクル対象外）', '03.失注（リサイクル対象）'
    // それ以外の値は設定しない（NULL）
    if (mapped.dealResult) {
      // DBのCHECK制約に合わせてマッピング
      const resultMapping = {
        '成約（即決）': '01.成約（契約締結）',
        '成約（後日）': '01.成約（契約締結）',
        '口頭受注': '01.成約（契約締結）',
        '失注（リサイクル対象外）': '02.失注（リサイクル対象外）',
        '失注（リサイクル対象）': '03.失注（リサイクル対象）',
        '検討中': null  // CHECK制約に該当しないためNULL
      };
      const dbResult = resultMapping[mapped.dealResult];
      if (dbResult) {
        record.result = dbResult;
      }
    }
  }
  
  // DBスキーマにないフィールドを削除
  delete record._original_deal_result;
  
  // NOT NULL制約のあるフィールドにデフォルト値を設定
  if (!record.company_name) {
    record.company_name = '（未設定）';
  }
  if (!record.contact_name) {
    record.contact_name = '（未設定）';
  }
  if (!record.phone) {
    record.phone = '（未設定）';
  }
  
  // 外部キー制約回避: lead_idはcall_recordsに存在しない可能性があるためNULLに
  // TODO: 将来的にcall_recordsデータ移行後に紐付けを行う
  delete record.lead_id;
  
  // 確度ヨミの変換
  const rankValue = csvRow['確度 ヨミ'];
  record.rank = rankMapping[rankValue] || rankMapping[''];
  
  // 日付フィールドの正規化（スネークケース）
  const dateFields = [
    'linked_date', 'appointment_date', 'deal_setup_date', 'deal_execution_date',
    'phase_update_date', 'rank_update_date', 'last_contact_date', 'action_scheduled_date',
    'response_deadline', 'result_date'
  ];
  
  for (const field of dateFields) {
    if (record[field]) {
      record[field] = normalizeDate(record[field]);
    }
  }
  
  return record;
}

/**
 * 日付文字列を正規化
 * @param {string} dateStr - 日付文字列（例: 2024/08/30, 05/12, 2024年10月中旬）
 * @returns {string|null} ISO形式の日付、またはnull（DBのDATE型に変換できない場合）
 */
function normalizeDate(dateStr) {
  if (!dateStr) return null;
  
  // YYYY/MM/DD 形式
  const slashMatch = dateStr.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (slashMatch) {
    const [, year, month, day] = slashMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // YYYY-MM-DD 形式（そのまま）
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // MM/DD 形式（年なし）→ 現在年を補完
  const mmddMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (mmddMatch) {
    const [, month, day] = mmddMatch;
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // その他（2024年10月中旬 など）→ DBのDATE型に変換できないのでnullを返す
  // テキストフィールド（opening_dateなど）はそのまま保持される
  return null;
}

/**
 * 商談結果の変換ルールを取得
 * @param {string} originalResult - CSVの商談結果値
 * @returns {Object|null} { meetingStatus, dealResult } または null
 */
function getMappedResult(originalResult) {
  return dealResultMapping[originalResult] || null;
}

/**
 * 未知の商談結果値を検出
 * @param {string} originalResult - CSVの商談結果値
 * @returns {boolean} マッピングが存在しない場合 true
 */
function isUnknownResult(originalResult) {
  if (!originalResult || originalResult === '') return false;
  return !dealResultMapping[originalResult];
}

module.exports = {
  dealResultMapping,
  columnMapping,
  serviceMapping,
  categoryMapping,
  rankMapping,
  transformRow,
  normalizeDate,
  getMappedResult,
  isUnknownResult
};
