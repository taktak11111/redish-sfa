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

async function main() {
  console.log('=== Z列（リサイクル優先度）比較スクリプト ===\n');

  // 1. CSVファイル読み込み
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (7).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  console.log(`CSVヘッダーZ列: ${rows[0][25]}`); // Z列 = index 25

  // 2. CSVデータを集計（Z列 = index 25）
  const csvDataMap = new Map();
  const csvValueCounts = {};
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH|AS|AG|AP|RP)\d+$/;

  for (let i = 1; i < rows.length; i++) {
    const leadId = rows[i][0];
    const priority = rows[i][25] || ''; // Z列
    if (leadId && leadIdPattern.test(leadId)) {
      csvDataMap.set(leadId, priority);
      const key = priority || '(空欄)';
      csvValueCounts[key] = (csvValueCounts[key] || 0) + 1;
    }
  }

  console.log(`CSVのリードID数: ${csvDataMap.size}`);
  console.log('\n【CSVのZ列（リサイクル優先度）分布】');
  Object.entries(csvValueCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([value, count]) => {
      console.log(`  "${value}": ${count}件`);
    });

  // 3. DBから全レコード取得（ページネーション対応）
  let allDbRecords = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data: dbRecords, error: dbError } = await supabase
      .from('call_records')
      .select('lead_id, recycle_priority')
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
  const dbValueCounts = {};
  allDbRecords.forEach((r) => {
    dbDataMap.set(r.lead_id, r.recycle_priority || '');
    const key = r.recycle_priority || '(空欄)';
    dbValueCounts[key] = (dbValueCounts[key] || 0) + 1;
  });

  console.log(`\nDBのリードID数: ${dbDataMap.size}`);
  console.log('\n【DBのrecycle_priority分布】');
  Object.entries(dbValueCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([value, count]) => {
      console.log(`  "${value}": ${count}件`);
    });

  // 4. 比較
  let matchCount = 0;
  let csvHasDbEmpty = 0;
  let csvEmptyDbHas = 0;
  let mismatchCount = 0;
  const updateTargets = [];
  const mismatchSamples = [];

  for (const [leadId, csvValue] of csvDataMap) {
    const dbValue = dbDataMap.get(leadId) || '';

    if (csvValue === dbValue) {
      matchCount++;
    } else if (csvValue && !dbValue) {
      csvHasDbEmpty++;
      updateTargets.push({ leadId, csvValue, dbValue: '(空)' });
    } else if (!csvValue && dbValue) {
      csvEmptyDbHas++;
    } else {
      mismatchCount++;
      updateTargets.push({ leadId, csvValue, dbValue });
      if (mismatchSamples.length < 20) {
        mismatchSamples.push({ leadId, csvValue, dbValue });
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
      console.log(`  ${t.leadId}: DB="${t.dbValue}" → CSV="${t.csvValue}"`);
    });
  }

  if (updateTargets.length > 0) {
    console.log('\n【更新対象サンプル（最初の20件）】');
    updateTargets.slice(0, 20).forEach((t) => {
      console.log(`  ${t.leadId}: DB="${t.dbValue}" → CSV="${t.csvValue}"`);
    });
  }
}

main().catch(console.error);
