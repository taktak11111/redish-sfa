import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

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

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  console.log('=== 389件（call_recordsに存在しない商談）をCSV出力 ===\n');

  // 1. call_recordsのlead_idを取得
  const { data: callRecords } = await supabase.from('call_records').select('lead_id');
  const existingLeadIds = new Set(callRecords.map(r => r.lead_id));

  // 2. 商談管理CSVをパース
  const dealsCsv = fs.readFileSync('C:/Users/takta/Downloads/SFA用REDISH税務契約フォーム - 商談管理表 (1).csv', 'utf-8');
  const dealsResult = Papa.parse(dealsCsv, { header: true, skipEmptyLines: true });

  // 存在しないlead_idのデータを抽出
  const missingData = dealsResult.data.filter(row => {
    const leadId = row['リードID'];
    return leadId && leadId.trim() && !existingLeadIds.has(leadId.trim());
  });

  console.log('抽出件数:', missingData.length, '件');

  // 3. CSVとして出力
  const outputCsv = Papa.unparse(missingData, {
    header: true,
    columns: dealsResult.meta.fields
  });

  const outputPath = 'C:/Users/takta/Downloads/商談管理_call_recordsに存在しない389件.csv';
  fs.writeFileSync(outputPath, '\uFEFF' + outputCsv, 'utf-8');  // BOM付きUTF-8

  console.log('出力完了:', outputPath);

  // 内訳を表示
  const bySource = {};
  missingData.forEach(row => {
    const source = row['リードソース'] || '(空欄)';
    bySource[source] = (bySource[source] || 0) + 1;
  });
  console.log('\n【リードソース別内訳】');
  Object.entries(bySource).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => console.log('  ' + k + ': ' + v + '件'));
}

main().catch(console.error);
