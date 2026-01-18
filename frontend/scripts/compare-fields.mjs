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
// A=0: リードID → lead_id
// B=1: リードソース → lead_source
// C=2: 連携日 → linked_date
// D=3: 業種 → industry
// E=4: 会社名/店舗名 → company_name
// F=5: 氏名 → contact_name
// G=6: ふりがな → contact_name_kana
// H=7: 電話番号 → phone
// I=8: メールアドレス → email
// J=9: 住所／エリア → address
// K=10: 開業時期 → opening_date_original
// L=11: 連絡希望日時 → contact_preferred_datetime
// M=12: 連携元備考 → alliance_remarks
// N=13: OMC追加情報① → omc_additional_info_1
// O=14: ⓶自己資金 → omc_self_fund
// P=15: ⓷物件状況 → omc_property_status
// Q=16: Amazon税理士有無 → amazon_tax_accountant
// R=17: Meetsmoreリンク → meetsmore_link
// S=18: Meetsmore法人・個人 → meetsmore_type
// T=19: Makuake PJT page → makuake_pjt_page
// U=20: Makuake実行者page → makuake_executor_page

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

const CSV_HEADERS = [
  'A:リードID', 'B:リードソース', 'C:連携日', 'D:業種', 'E:会社名',
  'F:氏名', 'G:ふりがな', 'H:電話番号', 'I:メール', 'J:住所',
  'K:開業時期', 'L:連絡希望日時', 'M:連携元備考', 'N:OMC追加情報①',
  'O:自己資金', 'P:物件状況', 'Q:Amazon税理士有無', 'R:Meetsmoreリンク',
  'S:Meetsmore法人・個人', 'T:Makuake PJT page', 'U:Makuake実行者page'
];

// 日付の正規化（比較用）
function normalizeDate(value) {
  if (!value) return '';
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
  return value;
}

// 値の正規化（比較用）
function normalizeValue(value, dbColumn) {
  if (value === null || value === undefined) return '';
  let str = String(value).trim();
  
  // 日付カラムの正規化
  if (dbColumn === 'linked_date') {
    return normalizeDate(str);
  }
  
  return str;
}

async function main() {
  console.log('=== CSV/DBフィールド比較スクリプト（A〜U列） ===\n');

  // 1. CSVファイル読み込み
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (3).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  console.log(`CSVの総行数: ${rows.length}（ヘッダー含む）`);
  console.log(`CSVヘッダー（A〜U列）:`);
  console.log(`  ${rows[0].slice(0, 21).join(' | ')}\n`);

  // 2. CSVデータをマップ化（lead_idをキーに）
  const csvDataMap = new Map();
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH|AS|AG|AP|RP)\d+$/;

  for (let i = 1; i < rows.length; i++) {
    const leadId = rows[i][0];
    if (leadId && leadIdPattern.test(leadId)) {
      csvDataMap.set(leadId, rows[i]);
    }
  }

  console.log(`CSVのリードID数: ${csvDataMap.size}`);

  // 3. DBからデータ取得（ページネーション）
  const dbDataMap = new Map();
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  // 取得するカラム
  const dbColumns = Object.values(CSV_TO_DB_MAP);

  while (hasMore) {
    const { data: dbRecords, error } = await supabase
      .from('call_records')
      .select(dbColumns.join(', '))
      .order('lead_id')
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('DB取得エラー:', error);
      process.exit(1);
    }

    if (dbRecords && dbRecords.length > 0) {
      dbRecords.forEach((r) => dbDataMap.set(r.lead_id, r));
      from += pageSize;
      hasMore = dbRecords.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  console.log(`DBのリードID数: ${dbDataMap.size}\n`);

  // 4. フィールドごとの比較
  const mismatches = [];
  let matchCount = 0;
  let mismatchCount = 0;

  for (const [leadId, csvRow] of csvDataMap) {
    const dbRecord = dbDataMap.get(leadId);
    
    if (!dbRecord) {
      mismatches.push({
        leadId,
        type: 'missing_in_db',
        message: 'DBにレコードが存在しない',
      });
      mismatchCount++;
      continue;
    }

    let hasFieldMismatch = false;
    const fieldMismatches = [];

    // A〜U列（0〜20）を比較
    for (let col = 0; col <= 20; col++) {
      const dbColumn = CSV_TO_DB_MAP[col];
      const csvValue = normalizeValue(csvRow[col], dbColumn);
      const dbValue = normalizeValue(dbRecord[dbColumn], dbColumn);

      if (csvValue !== dbValue) {
        hasFieldMismatch = true;
        fieldMismatches.push({
          column: CSV_HEADERS[col],
          csvValue: csvValue || '(空)',
          dbValue: dbValue || '(空)',
        });
      }
    }

    if (hasFieldMismatch) {
      mismatches.push({
        leadId,
        type: 'field_mismatch',
        fields: fieldMismatches,
      });
      mismatchCount++;
    } else {
      matchCount++;
    }
  }

  // 5. 結果出力
  console.log('=== 比較結果 ===\n');
  console.log(`完全一致: ${matchCount}件`);
  console.log(`不一致: ${mismatchCount}件\n`);

  if (mismatches.length > 0) {
    console.log('【不一致詳細】');
    
    // DB不在
    const missingInDb = mismatches.filter(m => m.type === 'missing_in_db');
    if (missingInDb.length > 0) {
      console.log(`\n● DBにレコードが存在しない: ${missingInDb.length}件`);
      missingInDb.slice(0, 10).forEach(m => console.log(`  ${m.leadId}`));
      if (missingInDb.length > 10) console.log(`  ...他${missingInDb.length - 10}件`);
    }

    // フィールド不一致
    const fieldMismatches = mismatches.filter(m => m.type === 'field_mismatch');
    if (fieldMismatches.length > 0) {
      console.log(`\n● フィールド不一致: ${fieldMismatches.length}件`);
      
      // フィールド別の不一致カウント
      const fieldCount = {};
      fieldMismatches.forEach(m => {
        m.fields.forEach(f => {
          fieldCount[f.column] = (fieldCount[f.column] || 0) + 1;
        });
      });
      
      console.log('\n  フィールド別不一致件数:');
      Object.entries(fieldCount)
        .sort((a, b) => b[1] - a[1])
        .forEach(([field, count]) => {
          console.log(`    ${field}: ${count}件`);
        });

      // 詳細例（最初の10件）
      console.log('\n  不一致例（最初の10件）:');
      fieldMismatches.slice(0, 10).forEach(m => {
        console.log(`\n  ${m.leadId}:`);
        m.fields.forEach(f => {
          console.log(`    ${f.column}`);
          console.log(`      CSV: "${f.csvValue}"`);
          console.log(`      DB:  "${f.dbValue}"`);
        });
      });
    }
  }

  // 結果をJSONファイルに出力
  const result = {
    timestamp: new Date().toISOString(),
    summary: {
      csvCount: csvDataMap.size,
      dbCount: dbDataMap.size,
      matchCount,
      mismatchCount,
    },
    mismatches: mismatches.slice(0, 100), // 最大100件
  };

  const outputPath = path.join(__dirname, 'compare-fields-result.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\n結果をJSONファイルに出力: ${outputPath}`);
}

main().catch(console.error);
