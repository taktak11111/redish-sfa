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
  console.log('=== V列（担当IS）比較スクリプト ===\n');

  // 1. CSVファイル読み込み
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (3).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  console.log(`CSVヘッダーV列: ${rows[0][21]}`); // V列 = index 21

  // 2. CSVデータをマップ化（V列 = index 21）
  const csvDataMap = new Map();
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH|AS|AG|AP|RP)\d+$/;
  const csvIsValues = new Set();

  for (let i = 1; i < rows.length; i++) {
    const leadId = rows[i][0];
    const isPersonInCharge = rows[i][21] || ''; // V列
    if (leadId && leadIdPattern.test(leadId)) {
      csvDataMap.set(leadId, isPersonInCharge);
      if (isPersonInCharge) {
        csvIsValues.add(isPersonInCharge);
      }
    }
  }

  console.log(`CSVのリードID数: ${csvDataMap.size}`);
  console.log(`CSVのユニークな担当IS: ${csvIsValues.size}種類`);
  console.log('  ' + Array.from(csvIsValues).sort().join(', '));

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

  // 4. usersテーブルから現在のIS担当者一覧を取得
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('name, role')
    .eq('role', 'IS');

  let existingMembers = new Set();
  if (usersError) {
    console.log('\nusersテーブルからIS担当者を取得できませんでした。DBの既存値から抽出します。');
    // DBの既存値から抽出
    allDbRecords.forEach((r) => {
      if (r.staff_is) existingMembers.add(r.staff_is);
    });
  } else {
    existingMembers = new Set(users.map((u) => u.name));
  }
  console.log(`\n現在のIS担当者: ${existingMembers.size}名`);
  console.log('  ' + Array.from(existingMembers).sort().join(', '));

  // 5. 比較
  let matchCount = 0;
  let mismatchCount = 0;
  const mismatches = [];
  const newMembers = new Set();

  for (const [leadId, csvValue] of csvDataMap) {
    const dbValue = dbDataMap.get(leadId) || '';

    // CSVが空欄の場合はスキップ（そのままでOK）
    if (!csvValue) {
      matchCount++;
      continue;
    }

    // 選択肢に存在しない担当者をチェック
    if (!existingMembers.has(csvValue)) {
      newMembers.add(csvValue);
    }

    if (csvValue === dbValue) {
      matchCount++;
    } else {
      mismatchCount++;
      if (mismatches.length < 20) {
        mismatches.push({
          leadId,
          csv: csvValue,
          db: dbValue || '(空)',
        });
      }
    }
  }

  // 6. 結果出力
  console.log('\n=== 比較結果 ===\n');
  console.log(`一致（空欄含む）: ${matchCount}件`);
  console.log(`不一致: ${mismatchCount}件`);

  if (newMembers.size > 0) {
    console.log(`\n【追加が必要なメンバー】: ${newMembers.size}名`);
    Array.from(newMembers).sort().forEach((m) => console.log(`  - ${m}`));
  }

  if (mismatches.length > 0) {
    console.log(`\n【不一致例（最初の20件）】`);
    mismatches.forEach((m) => {
      console.log(`  ${m.leadId}: CSV="${m.csv}" → DB="${m.db}"`);
    });
  }

  // 7. 統計（CSVの担当IS別件数）
  const csvValueCounts = {};
  for (const [, value] of csvDataMap) {
    const key = value || '(空欄)';
    csvValueCounts[key] = (csvValueCounts[key] || 0) + 1;
  }

  console.log('\n【CSVの担当IS別件数】');
  Object.entries(csvValueCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, count]) => {
      console.log(`  ${name}: ${count}件`);
    });
}

main().catch(console.error);
