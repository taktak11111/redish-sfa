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
  console.log('=== AA列（結果コンタクト状況）同期スクリプト ===\n');

  // 1. CSVファイル読み込み
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (7).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  // 2. CSVデータをマップ化（AA列 = index 26）
  const csvDataMap = new Map();
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH|AS|AG|AP|RP)\d+$/;

  for (let i = 1; i < rows.length; i++) {
    const leadId = rows[i][0];
    const contactStatus = rows[i][26] || ''; // AA列
    const statusIsRaw = rows[i][22] || ''; // W列（ISステータス）
    const callDuration = rows[i][29] || ''; // AD列（通話時間）
    if (leadId && leadIdPattern.test(leadId)) {
      csvDataMap.set(leadId, { contactStatus, statusIsRaw, callDuration });
    }
  }

  console.log(`CSVのリードID数: ${csvDataMap.size}`);

  // 3. DBから全レコード取得
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
  allDbRecords.forEach((r) => {
    dbDataMap.set(r.lead_id, r.result_contact_status || '');
  });

  // 4. 更新対象を特定
  const updateTargets = [];

  for (const [leadId, csvData] of csvDataMap) {
    const dbValue = dbDataMap.get(leadId) || '';
    const hasCallDuration =
      csvData.callDuration &&
      csvData.callDuration !== '0:00:00' &&
      csvData.callDuration !== '00:00:00';
    const desiredValue = hasCallDuration
      ? '通電'
      : isDealAcquired(csvData.statusIsRaw)
        ? '通電'
        : csvData.contactStatus;
    
    // CSVが空の場合はスキップ
    if (!desiredValue) continue;
    
    // 一致している場合はスキップ
    if (desiredValue === dbValue) continue;
    
    // 更新対象
    updateTargets.push({ leadId, csvValue: desiredValue });
  }

  console.log(`更新対象: ${updateTargets.length}件`);

  if (updateTargets.length === 0) {
    console.log('\n更新対象がありません。');
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
      .update({ result_contact_status: csvValue })
      .eq('lead_id', leadId);

    if (error) {
      errorCount++;
      if (errors.length < 10) {
        errors.push({ leadId, csvValue, error: error.message });
      }
    } else {
      successCount++;
    }

    if ((i + 1) % 200 === 0) {
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

  console.log('\n完了');
}

main().catch(console.error);
