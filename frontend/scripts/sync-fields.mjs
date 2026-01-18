import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local を手動で読み込み
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    envVars[match[1].trim()] = value;
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// セル内改行を考慮したCSVパーサー
function parseCSV(content) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
        i++;
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows;
}

// CSVカラム → DBカラムのマッピング（A〜U列）
const CSV_TO_DB_MAP = {
  0: 'lead_id',
  1: 'lead_source',
  2: 'linked_date',
  3: 'industry',
  4: 'company_name',
  5: 'contact_name',
  6: 'contact_name_kana',
  7: 'phone',
  8: 'email',
  9: 'address',
  10: 'opening_date_original',
  11: 'contact_preferred_datetime',
  12: 'alliance_remarks',
  13: 'omc_additional_info1',
  14: 'omc_self_funds',
  15: 'omc_property_status',
  16: 'amazon_tax_accountant',
  17: 'meetsmore_link',
  18: 'meetsmore_entity_type',
  19: 'makuake_pjt_page',
  20: 'makuake_executor_page',
};

// 日付の正規化
function normalizeDate(value) {
  if (!value) return null;
  // YYYY/MM/DD → YYYY-MM-DD
  const match = value.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (match) {
    return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  }
  // YYYY-MM-DD形式はそのまま
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }
  return value || null;
}

// NOT NULL制約のあるカラム（空文字列を使用）
const NOT_NULL_COLUMNS = [
  'lead_source',
  'company_name',
  'contact_name',
  'contact_name_kana',
  'phone',
  'email',
  'address',
  'industry',
  'opening_date_original',
  'contact_preferred_datetime',
  'alliance_remarks',
];

// 値の変換（DB保存用）
function convertValue(value, dbColumn) {
  let str = (value === null || value === undefined) ? '' : String(value).trim();
  
  // 日付カラム
  if (dbColumn === 'linked_date') {
    const normalized = normalizeDate(str);
    return normalized || null; // 日付は空ならnull
  }
  
  // NOT NULL制約のあるカラムは空文字列を返す
  if (NOT_NULL_COLUMNS.includes(dbColumn)) {
    return str; // 空でも空文字列
  }
  
  // その他は空ならnull
  return str || null;
}

async function main() {
  console.log('=== CSV→DBフィールド同期スクリプト ===\n');

  // 1. CSVファイル読み込み
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (3).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  console.log(`CSVの総行数: ${rows.length}（ヘッダー含む）`);

  // 2. CSVデータをマップ化
  const csvDataMap = new Map();
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH|AS|AG|AP|RP)\d+$/;

  for (let i = 1; i < rows.length; i++) {
    const leadId = rows[i][0];
    if (leadId && leadIdPattern.test(leadId)) {
      csvDataMap.set(leadId, rows[i]);
    }
  }

  console.log(`CSVのリードID数: ${csvDataMap.size}`);

  // 3. 全レコードを更新（A〜U列）
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  console.log('\n【更新処理開始】');
  
  let processed = 0;
  for (const [leadId, csvRow] of csvDataMap) {
    // 更新データを構築（A〜U列、lead_id以外）
    const updateData = {};
    
    for (let col = 1; col <= 20; col++) { // lead_id(0)はスキップ
      const dbColumn = CSV_TO_DB_MAP[col];
      const value = convertValue(csvRow[col], dbColumn);
      updateData[dbColumn] = value;
    }

    // 更新実行
    const { error } = await supabase
      .from('call_records')
      .update(updateData)
      .eq('lead_id', leadId);

    if (error) {
      errorCount++;
      if (errors.length < 10) {
        errors.push({ leadId, error: error.message });
      }
    } else {
      successCount++;
    }

    processed++;
    if (processed % 500 === 0) {
      console.log(`  ${processed}/${csvDataMap.size}件処理済み...`);
    }
  }

  // 4. 結果出力
  console.log('\n=== 更新結果 ===\n');
  console.log(`成功: ${successCount}件`);
  console.log(`エラー: ${errorCount}件`);

  if (errors.length > 0) {
    console.log('\nエラー詳細（最初の10件）:');
    errors.forEach(e => console.log(`  ${e.leadId}: ${e.error}`));
  }

  console.log('\n完了');
}

main().catch(console.error);
