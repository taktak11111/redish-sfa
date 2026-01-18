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
  console.log('=== W列（ISステータス）分析スクリプト ===\n');

  // 1. CSVファイル読み込み
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (3).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  console.log(`CSVヘッダーW列: ${rows[0][22]}`); // W列 = index 22

  // 2. CSVデータを集計（W列 = index 22）
  const csvStatusCounts = {};
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH|AS|AG|AP|RP)\d+$/;
  const csvDataMap = new Map();

  for (let i = 1; i < rows.length; i++) {
    const leadId = rows[i][0];
    const status = rows[i][22] || ''; // W列
    if (leadId && leadIdPattern.test(leadId)) {
      csvDataMap.set(leadId, status);
      const key = status || '(空欄)';
      csvStatusCounts[key] = (csvStatusCounts[key] || 0) + 1;
    }
  }

  console.log(`\nCSVのリードID数: ${csvDataMap.size}`);
  console.log('\n【CSVのW列（ISステータス）ユニーク値と件数】');
  Object.entries(csvStatusCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([status, count]) => {
      console.log(`  "${status}": ${count}件`);
    });

  // 3. DBから全レコード取得（ページネーション対応）
  let allDbRecords = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data: dbRecords, error: dbError } = await supabase
      .from('call_records')
      .select('lead_id, status, status_is')
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
  const dbStatusCounts = {};
  const dbStatusIsCounts = {};

  allDbRecords.forEach((r) => {
    dbDataMap.set(r.lead_id, { status: r.status || '', status_is: r.status_is || '' });
    
    const statusKey = r.status || '(空欄)';
    dbStatusCounts[statusKey] = (dbStatusCounts[statusKey] || 0) + 1;
    
    const statusIsKey = r.status_is || '(空欄)';
    dbStatusIsCounts[statusIsKey] = (dbStatusIsCounts[statusIsKey] || 0) + 1;
  });

  console.log(`\nDBのリードID数: ${dbDataMap.size}`);
  
  console.log('\n【DBのstatusカラム（リードステータス）ユニーク値と件数】');
  Object.entries(dbStatusCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([status, count]) => {
      console.log(`  "${status}": ${count}件`);
    });

  console.log('\n【DBのstatus_isカラム（ISステータス）ユニーク値と件数】');
  Object.entries(dbStatusIsCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([status, count]) => {
      console.log(`  "${status}": ${count}件`);
    });

  // 4. CSV→DBの比較
  console.log('\n=== CSV→DB比較 ===\n');
  
  let matchCount = 0;
  let mismatchCount = 0;
  const mismatches = [];

  for (const [leadId, csvStatus] of csvDataMap) {
    const dbRecord = dbDataMap.get(leadId);
    if (!dbRecord) continue;

    // CSVのW列とDBのstatus_isを比較
    if (csvStatus === dbRecord.status_is) {
      matchCount++;
    } else {
      mismatchCount++;
      if (mismatches.length < 30) {
        mismatches.push({
          leadId,
          csvStatus: csvStatus || '(空)',
          dbStatusIs: dbRecord.status_is || '(空)',
          dbStatus: dbRecord.status || '(空)',
        });
      }
    }
  }

  console.log(`一致: ${matchCount}件`);
  console.log(`不一致: ${mismatchCount}件`);

  if (mismatches.length > 0) {
    console.log('\n【不一致例（最初の30件）】');
    console.log('lead_id | CSV(W列) | DB(status_is) | DB(status)');
    console.log('-'.repeat(80));
    mismatches.forEach((m) => {
      console.log(`${m.leadId} | "${m.csvStatus}" | "${m.dbStatusIs}" | "${m.dbStatus}"`);
    });
  }

  // 5. CSVステータスの一覧（置換表作成用）
  console.log('\n\n=== 置換表作成用：CSVステータス一覧 ===\n');
  const sortedCsvStatuses = Object.entries(csvStatusCounts)
    .sort((a, b) => {
      // 番号付きのものは番号順、それ以外はアルファベット順
      const aNum = a[0].match(/^(\d+)/);
      const bNum = b[0].match(/^(\d+)/);
      if (aNum && bNum) return parseInt(aNum[1]) - parseInt(bNum[1]);
      if (aNum) return -1;
      if (bNum) return 1;
      return a[0].localeCompare(b[0]);
    });

  console.log('CSVのISステータス | 件数');
  console.log('-'.repeat(50));
  sortedCsvStatuses.forEach(([status, count]) => {
    console.log(`"${status}" | ${count}件`);
  });
}

main().catch(console.error);
