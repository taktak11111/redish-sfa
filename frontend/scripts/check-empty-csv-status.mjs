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
  console.log('=== CSVで空欄のレコードのDB status_is確認 ===\n');

  // 1. CSVファイル読み込み
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (3).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  // 2. CSVで空欄のリードIDを抽出
  const emptyLeadIds = [];
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH|AS|AG|AP|RP)\d+$/;

  for (let i = 1; i < rows.length; i++) {
    const leadId = rows[i][0];
    const status = rows[i][22] || ''; // W列
    if (leadId && leadIdPattern.test(leadId) && !status) {
      emptyLeadIds.push(leadId);
    }
  }

  console.log(`CSVで空欄のリードID数: ${emptyLeadIds.length}件`);

  // 3. DBからこれらのレコードのstatus_isを取得
  const { data: records, error } = await supabase
    .from('call_records')
    .select('lead_id, status_is')
    .in('lead_id', emptyLeadIds);

  if (error) {
    console.error('エラー:', error);
    return;
  }

  // 4. status_is別に集計
  const statusCounts = {};
  records.forEach((r) => {
    const key = r.status_is || '(空欄)';
    statusCounts[key] = (statusCounts[key] || 0) + 1;
  });

  console.log('\n【CSVで空欄のレコードのDB status_is値】');
  Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([status, count]) => {
      console.log(`  "${status}": ${count}件`);
    });

  // 5. 古い形式の値を持つレコードを特定
  const oldFormats = ['04.失注', '未架電', '失注', '90.失注', '07.既存顧客', '02.コンタクト試行中', '05.対応不可/対象外', '06.ナーチャリング対象', '03.アポイント獲得済'];
  
  console.log('\n【古い形式のままのレコード（CSVが空欄のもの）】');
  oldFormats.forEach((oldStatus) => {
    const count = statusCounts[oldStatus] || 0;
    if (count > 0) {
      console.log(`  "${oldStatus}": ${count}件`);
    }
  });
}

main().catch(console.error);
