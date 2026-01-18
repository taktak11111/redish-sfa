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
  console.log('=== 連携日（C列）比較スクリプト ===\n');

  // 1. 新しいCSVファイル読み込み
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (7).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  console.log(`CSVヘッダーC列: ${rows[0][2]}`); // C列 = index 2

  // 2. CSVデータをマップ化（C列 = index 2）
  const csvDataMap = new Map();
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH|AS|AG|AP|RP)\d+$/;

  for (let i = 1; i < rows.length; i++) {
    const leadId = rows[i][0];
    const linkedDate = normalizeDate(rows[i][2]); // C列
    if (leadId && leadIdPattern.test(leadId)) {
      csvDataMap.set(leadId, linkedDate);
    }
  }

  console.log(`CSVのリードID数: ${csvDataMap.size}`);

  // 3. DBから全レコード取得（ページネーション対応）
  let allDbRecords = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data: dbRecords, error: dbError } = await supabase
      .from('call_records')
      .select('lead_id, linked_date')
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
    dbDataMap.set(r.lead_id, r.linked_date || null);
  });

  console.log(`DBのリードID数: ${dbDataMap.size}`);

  // 4. 比較
  let matchCount = 0;
  let mismatchCount = 0;
  let csvHasDbEmpty = 0; // CSVにあり、DBが空
  let csvEmptyDbHas = 0; // CSVが空、DBにあり
  const updateTargets = [];

  for (const [leadId, csvDate] of csvDataMap) {
    const dbDate = dbDataMap.get(leadId);

    if (csvDate === dbDate) {
      matchCount++;
    } else if (csvDate && !dbDate) {
      // CSVにあり、DBが空 → 追記対象
      csvHasDbEmpty++;
      updateTargets.push({ leadId, csvDate, dbDate: '(空)' });
    } else if (!csvDate && dbDate) {
      // CSVが空、DBにあり → 保持
      csvEmptyDbHas++;
    } else {
      // 両方にあるが異なる
      mismatchCount++;
      updateTargets.push({ leadId, csvDate, dbDate });
    }
  }

  // 5. 結果出力
  console.log('\n=== 比較結果 ===\n');
  console.log(`完全一致: ${matchCount}件`);
  console.log(`CSVあり→DB空（追記対象）: ${csvHasDbEmpty}件`);
  console.log(`CSV空→DBあり（保持）: ${csvEmptyDbHas}件`);
  console.log(`値が異なる: ${mismatchCount}件`);
  console.log(`\n更新対象合計: ${updateTargets.length}件`);

  if (updateTargets.length > 0) {
    console.log('\n【更新対象サンプル（最初の20件）】');
    updateTargets.slice(0, 20).forEach((t) => {
      console.log(`  ${t.leadId}: DB="${t.dbDate}" → CSV="${t.csvDate}"`);
    });
  }
}

main().catch(console.error);
