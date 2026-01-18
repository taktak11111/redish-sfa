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

function isDealAcquired(statusRaw) {
  const value = String(statusRaw || '').trim();
  if (!value) return false;
  if (value.includes('商談獲得')) return true;
  if (value.includes('アポ獲得')) return true;
  if (value.includes('アポイント獲得')) return true;
  return false;
}

async function main() {
  console.log('=== AA列（結果コンタクト状況）比較スクリプト ===\n');

  // 1. CSVファイル読み込み
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (7).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  // ヘッダー確認
  console.log(`CSVヘッダーAA列: ${rows[0][26]}`); // AA列 = index 26
  console.log(`CSVヘッダーAD列: ${rows[0][29]}`); // AD列 = index 29 (通話時間)

  // 2. CSVデータを集計（AA列 = index 26）
  const csvDataMap = new Map();
  const csvValueCounts = {};
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH|AS|AG|AP|RP)\d+$/;
  const inconsistentRecords = []; // 通話時間ありなのに不通

  for (let i = 1; i < rows.length; i++) {
    const leadId = rows[i][0];
    const statusIsRaw = rows[i][22] || ''; // W列（ISステータス）
    const contactStatus = rows[i][26] || ''; // AA列
    const callDuration = rows[i][29] || ''; // AD列（通話時間）
    
    if (leadId && leadIdPattern.test(leadId)) {
      csvDataMap.set(leadId, { contactStatus, callDuration, statusIsRaw });
      const key = contactStatus || '(空欄)';
      csvValueCounts[key] = (csvValueCounts[key] || 0) + 1;

      // 通話時間があるのに不通のレコードをチェック
      const hasCallDuration = callDuration && callDuration !== '0:00:00' && callDuration !== '00:00:00' && callDuration !== '';
      const isNotConnected = contactStatus === '不通' || contactStatus.includes('不通');
      
      if (hasCallDuration && isNotConnected) {
        inconsistentRecords.push({ leadId, contactStatus, callDuration });
      }
    }
  }

  console.log(`CSVのリードID数: ${csvDataMap.size}`);
  console.log('\n【CSVのAA列（結果コンタクト状況）分布】');
  Object.entries(csvValueCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([value, count]) => {
      console.log(`  "${value}": ${count}件`);
    });

  // 3. 通話時間ありなのに不通のレコード
  console.log(`\n=== 通話時間ありなのに不通のレコード: ${inconsistentRecords.length}件 ===`);
  if (inconsistentRecords.length > 0) {
    console.log('\n【矛盾レコード一覧】');
    inconsistentRecords.forEach((r) => {
      console.log(`  ${r.leadId}: "${r.contactStatus}" / 通話時間="${r.callDuration}"`);
    });
  }

  // 4. DBから全レコード取得（ページネーション対応）
  let allDbRecords = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data: dbRecords, error: dbError } = await supabase
      .from('call_records')
      .select('lead_id, result_contact_status')
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
    dbDataMap.set(r.lead_id, r.result_contact_status || '');
    const key = r.result_contact_status || '(空欄)';
    dbValueCounts[key] = (dbValueCounts[key] || 0) + 1;
  });

  console.log(`\nDBのリードID数: ${dbDataMap.size}`);
  console.log('\n【DBのresult_contact_status分布】');
  Object.entries(dbValueCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([value, count]) => {
      console.log(`  "${value}": ${count}件`);
    });

  // 5. 比較
  let matchCount = 0;
  let csvHasDbEmpty = 0;
  let csvEmptyDbHas = 0;
  let mismatchCount = 0;
  const updateTargets = [];
  const mismatchSamples = [];

  for (const [leadId, csvData] of csvDataMap) {
    const desiredValue = isDealAcquired(csvData.statusIsRaw) ? '通電' : csvData.contactStatus;
    const dbValue = dbDataMap.get(leadId) || '';

    if (desiredValue === dbValue) {
      matchCount++;
    } else if (desiredValue && !dbValue) {
      csvHasDbEmpty++;
      updateTargets.push({ leadId, csvValue: desiredValue, dbValue: '(空)' });
    } else if (!desiredValue && dbValue) {
      csvEmptyDbHas++;
    } else {
      mismatchCount++;
      updateTargets.push({ leadId, csvValue: desiredValue, dbValue });
      if (mismatchSamples.length < 20) {
        mismatchSamples.push({ leadId, csvValue: desiredValue, dbValue });
      }
    }
  }

  // 6. 結果出力
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
