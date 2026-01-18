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
  // call_recordsのlead_idを取得
  const { data: callRecords } = await supabase.from('call_records').select('lead_id');
  const existingLeadIds = new Set(callRecords.map(r => r.lead_id));

  // CSVパース
  const csv = fs.readFileSync('C:/Users/takta/Downloads/SFA用REDISH税務契約フォーム - 商談管理表 (1).csv', 'utf-8');
  const result = Papa.parse(csv, { header: true, skipEmptyLines: true });

  // 存在しないlead_idのデータを抽出
  const missingData = result.data.filter(row => {
    const leadId = row['リードID'];
    return leadId && leadId.trim() && !existingLeadIds.has(leadId.trim());
  });

  console.log('=== 389件の詳細分析 ===\n');
  console.log('件数:', missingData.length);

  // リードソース別の内訳
  const bySource = {};
  missingData.forEach(row => {
    const source = row['リードソース'] || '(空欄)';
    bySource[source] = (bySource[source] || 0) + 1;
  });
  console.log('\n【リードソース別】');
  Object.entries(bySource).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => console.log('  ' + k + ': ' + v + '件'));

  // 商談結果別の内訳
  const byResult = {};
  missingData.forEach(row => {
    const r = row['商談結果'] || '(空欄)';
    byResult[r] = (byResult[r] || 0) + 1;
  });
  console.log('\n【商談結果別】');
  Object.entries(byResult).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => console.log('  ' + k + ': ' + v + '件'));

  // サービス別の内訳
  const byService = {};
  missingData.forEach(row => {
    const s = row['サービス'] || '(空欄)';
    byService[s] = (byService[s] || 0) + 1;
  });
  console.log('\n【サービス別】');
  Object.entries(byService).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => console.log('  ' + k + ': ' + v + '件'));

  // 担当別の内訳
  const byStaff = {};
  missingData.forEach(row => {
    const s = row['担当'] || '(空欄)';
    byStaff[s] = (byStaff[s] || 0) + 1;
  });
  console.log('\n【担当別】');
  Object.entries(byStaff).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => console.log('  ' + k + ': ' + v + '件'));

  // サンプルデータ（最初の10件）
  console.log('\n【サンプルデータ（最初の10件）】');
  missingData.slice(0, 10).forEach((row, i) => {
    console.log('\n--- ' + (i+1) + '件目 ---');
    console.log('  商談ID:', row['商談ID']);
    console.log('  リードID:', row['リードID']);
    console.log('  リードソース:', row['リードソース']);
    console.log('  会社名:', row['会社名/店舗名']);
    console.log('  氏名:', row['氏名']);
    console.log('  電話番号:', row['電話番号']);
    console.log('  商談結果:', row['商談結果']);
    console.log('  担当:', row['担当']);
  });
}

main().catch(console.error);
