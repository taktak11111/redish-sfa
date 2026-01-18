import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY, {
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
  return null;
}

async function main() {
  console.log('=== ステータス更新日（X列）比較スクリプト ===\n');

  // 1. CSVファイル読み込み
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (7).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  console.log(`CSVヘッダーX列: ${rows[0][23]}`); // X列 = index 23

  // 2. CSVデータをマップ化（X列 = index 23）
  const csvDataMap = new Map();
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH|AS|AG|AP|RP)\d+$/;

  for (let i = 1; i < rows.length; i++) {
    const leadId = rows[i][0];
    const statusUpdatedDate = normalizeDate(rows[i][23]); // X列
    if (leadId && leadIdPattern.test(leadId)) {
      csvDataMap.set(leadId, statusUpdatedDate);
    }
  }

  console.log(`CSVのリードID数: ${csvDataMap.size}`);

  // CSV内の日付分布を確認
  const csvDateCounts = {};
  for (const [, date] of csvDataMap) {
    const key = date || '(空欄)';
    csvDateCounts[key] = (csvDateCounts[key] || 0) + 1;
  }
  console.log('\n【CSVのX列（ステータス更新日）分布】');
  Object.entries(csvDateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([date, count]) => {
      console.log(`  ${date}: ${count}件`);
    });

  // 3. DBから全レコード取得（ページネーション対応）
  let allDbRecords = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data: dbRecords, error: dbError } = await supabase
      .from('call_records')
      .select('lead_id, status_update_date')
      .range(offset, offset + pageSize - 1);

    if (dbError) {
      console.error('DBエラー:', dbError);
      return;
    }

    allDbRecords = allDbRecords.concat(dbRecords);
    if (dbRecords.length < pageSize) break;
    offset += pageSize;
  }

  const dbDataMap = new Map();
  allDbRecords.forEach((r) => {
    // DBの日付をYYYY-MM-DD形式に正規化
    let dbDate = null;
    if (r.status_update_date) {
      const match = r.status_update_date.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        dbDate = `${match[1]}-${match[2]}-${match[3]}`;
      }
    }
    dbDataMap.set(r.lead_id, dbDate);
  });

  console.log(`\nDBのリードID数: ${dbDataMap.size}`);

  // DB内の日付分布を確認
  const dbDateCounts = {};
  for (const [, date] of dbDataMap) {
    const key = date || '(空欄)';
    dbDateCounts[key] = (dbDateCounts[key] || 0) + 1;
  }
  console.log('\n【DBのstatus_updated_at分布】');
  Object.entries(dbDateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([date, count]) => {
      console.log(`  ${date}: ${count}件`);
    });

  // 4. 比較
  let matchCount = 0;
  let mismatchCount = 0;
  let csvHasDbEmpty = 0; // CSVにあり、DBが空
  let csvEmptyDbHas = 0; // CSVが空、DBにあり
  const updateTargets = [];
  const mismatchSamples = [];

  for (const [leadId, csvDate] of csvDataMap) {
    const dbDate = dbDataMap.get(leadId);

    if (csvDate === dbDate) {
      matchCount++;
    } else if (csvDate && !dbDate) {
      // CSVにあり、DBが空 → 追記対象
      csvHasDbEmpty++;
      updateTargets.push({ leadId, csvDate, dbDate: '(空)' });
    } else if (!csvDate && dbDate) {
      // CSVが空、DBにあり → 保持（または上書きしない）
      csvEmptyDbHas++;
    } else {
      // 両方にあるが異なる → CSVで上書き
      mismatchCount++;
      updateTargets.push({ leadId, csvDate, dbDate });
      if (mismatchSamples.length < 20) {
        mismatchSamples.push({ leadId, csvDate, dbDate });
      }
    }
  }

  // 5. 結果出力
  console.log('\n=== 比較結果 ===\n');
  console.log(`完全一致: ${matchCount}件`);
  console.log(`CSVあり→DB空（追記対象）: ${csvHasDbEmpty}件`);
  console.log(`CSV空→DBあり（保持）: ${csvEmptyDbHas}件`);
  console.log(`値が異なる（CSV優先で上書き）: ${mismatchCount}件`);
  console.log(`\n更新対象合計: ${updateTargets.length}件`);

  if (mismatchSamples.length > 0) {
    console.log('\n【値が異なるサンプル（最初の20件）】');
    mismatchSamples.forEach((t) => {
      console.log(`  ${t.leadId}: DB="${t.dbDate}" → CSV="${t.csvDate}"`);
    });
  }

  if (updateTargets.length > 0) {
    console.log('\n【更新対象サンプル（最初の20件）】');
    updateTargets.slice(0, 20).forEach((t) => {
      console.log(`  ${t.leadId}: DB="${t.dbDate}" → CSV="${t.csvDate}"`);
    });
  }
}

main().catch(console.error);
