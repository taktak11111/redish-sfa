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
  console.log('=== リードID差異比較スクリプト ===\n');

  // 1. 新しいCSVファイル読み込み
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (6).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  // 2. CSVのリードIDを抽出
  const csvLeadIds = new Set();
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH|AS|AG|AP|RP)\d+$/;

  for (let i = 1; i < rows.length; i++) {
    const leadId = rows[i][0];
    if (leadId && leadIdPattern.test(leadId)) {
      csvLeadIds.add(leadId);
    }
  }

  console.log(`CSVのリードID数: ${csvLeadIds.size}`);

  // 3. DBから全レコード取得
  let allDbRecords = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data: dbRecords, error: dbError } = await supabase
      .from('call_records')
      .select('lead_id, company_name, contact_name, lead_source')
      .range(offset, offset + pageSize - 1);

    if (dbError) {
      console.error('DBエラー:', dbError);
      return;
    }

    allDbRecords = allDbRecords.concat(dbRecords);
    if (dbRecords.length < pageSize) break;
    offset += pageSize;
  }

  const dbLeadIds = new Set(allDbRecords.map(r => r.lead_id));
  const dbDataMap = new Map(allDbRecords.map(r => [r.lead_id, r]));

  console.log(`DBのリードID数: ${dbLeadIds.size}`);

  // 4. 差異を抽出
  const csvOnlyIds = [...csvLeadIds].filter(id => !dbLeadIds.has(id));
  const dbOnlyIds = [...dbLeadIds].filter(id => !csvLeadIds.has(id));
  const commonIds = [...csvLeadIds].filter(id => dbLeadIds.has(id));

  // 5. 結果出力
  console.log('\n=== 差異結果 ===\n');
  console.log(`共通: ${commonIds.length}件`);
  console.log(`CSVのみ（DBにない）: ${csvOnlyIds.length}件`);
  console.log(`DBのみ（CSVにない）: ${dbOnlyIds.length}件`);

  if (csvOnlyIds.length > 0) {
    console.log('\n【CSVのみ（DBにない）リードID】');
    csvOnlyIds.sort().forEach(id => console.log(`  ${id}`));
  }

  if (dbOnlyIds.length > 0) {
    console.log('\n【DBのみ（CSVにない）リードID】');
    dbOnlyIds.sort().forEach(id => {
      const record = dbDataMap.get(id);
      console.log(`  ${id}: ${record.company_name || '(会社名なし)'} / ${record.contact_name || '(氏名なし)'} / ${record.lead_source || '(ソースなし)'}`);
    });
  }
}

main().catch(console.error);
