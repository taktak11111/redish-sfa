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

async function main() {
  console.log('=== V列（担当IS）同期スクリプト ===\n');

  // 1. CSVファイル読み込み
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (3).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  console.log(`CSVヘッダーV列: ${rows[0][21]}`); // V列 = index 21

  // 2. CSVデータをマップ化（V列 = index 21）
  const csvDataMap = new Map();
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH|AS|AG|AP|RP)\d+$/;

  for (let i = 1; i < rows.length; i++) {
    const leadId = rows[i][0];
    const staffIs = rows[i][21] || ''; // V列
    if (leadId && leadIdPattern.test(leadId)) {
      csvDataMap.set(leadId, staffIs);
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
      .select('lead_id, staff_is')
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
    dbDataMap.set(r.lead_id, r.staff_is || '');
  });

  console.log(`DBのリードID数: ${dbDataMap.size}`);

  // 4. 更新対象を特定
  const updateTargets = [];

  for (const [leadId, csvValue] of csvDataMap) {
    // CSVが空欄の場合はスキップ（そのままでOK）
    if (!csvValue) {
      continue;
    }

    const dbValue = dbDataMap.get(leadId) || '';

    // 不一致の場合のみ更新対象
    if (csvValue !== dbValue) {
      updateTargets.push({
        leadId,
        csvValue,
        dbValue: dbValue || '(空)',
      });
    }
  }

  console.log(`\n更新対象: ${updateTargets.length}件`);

  if (updateTargets.length === 0) {
    console.log('更新対象がありません。');
    return;
  }

  // 5. 更新実行
  console.log('\n【更新処理開始】');
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < updateTargets.length; i++) {
    const { leadId, csvValue } = updateTargets[i];

    const { error } = await supabase
      .from('call_records')
      .update({ staff_is: csvValue })
      .eq('lead_id', leadId);

    if (error) {
      errorCount++;
      if (errors.length < 10) {
        errors.push({ leadId, csvValue, error: error.message });
      }
    } else {
      successCount++;
    }

    if ((i + 1) % 100 === 0) {
      console.log(`  ${i + 1}/${updateTargets.length}件処理済み...`);
    }
  }

  // 6. 結果出力
  console.log('\n=== 更新結果 ===\n');
  console.log(`成功: ${successCount}件`);
  console.log(`エラー: ${errorCount}件`);

  if (errors.length > 0) {
    console.log('\nエラー詳細（最初の10件）:');
    errors.forEach((e) => console.log(`  ${e.leadId}: ${e.csvValue} → ${e.error}`));
  }

  // 7. 更新内容サンプル出力
  console.log('\n【更新内容サンプル（最初の10件）】');
  updateTargets.slice(0, 10).forEach((t) => {
    console.log(`  ${t.leadId}: "${t.dbValue}" → "${t.csvValue}"`);
  });

  console.log('\n完了');
}

main().catch(console.error);
