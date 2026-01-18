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

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  console.log('=== 商談CSVデータ確認スクリプト ===\n');

  // 1. dealsテーブルの既存データ確認
  const { count: dealsCount, error: countError } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true });
  
  console.log('=== dealsテーブル既存データ ===');
  if (countError) {
    console.log('エラー:', countError.message);
  } else {
    console.log('既存件数:', dealsCount || 0);
  }

  // 2. call_recordsのlead_idを全件取得
  const { data: callRecords, error: crError } = await supabase
    .from('call_records')
    .select('lead_id');
  
  if (crError) {
    console.log('call_recordsエラー:', crError.message);
    return;
  }

  const existingLeadIds = new Set(callRecords.map(r => r.lead_id));
  console.log('\n=== call_recordsのlead_id ===');
  console.log('件数:', existingLeadIds.size);

  // 3. CSVのlead_idと突合
  const csvPath = 'C:/Users/takta/Downloads/SFA用REDISH税務契約フォーム - 商談管理表 (1).csv';
  const csv = fs.readFileSync(csvPath, 'utf-8');
  const result = Papa.parse(csv, { header: true, skipEmptyLines: true });

  console.log('\n=== CSVパース結果 ===');
  console.log('データ行数:', result.data.length);

  const csvLeadIds = new Set();
  result.data.forEach(row => {
    const leadId = row['リードID'];
    if (leadId && leadId.trim()) csvLeadIds.add(leadId.trim());
  });

  // 存在しないlead_idをリストアップ
  const missingLeadIds = [...csvLeadIds].filter(id => !existingLeadIds.has(id));

  console.log('\n=== lead_id突合結果 ===');
  console.log('CSVのユニークlead_id数:', csvLeadIds.size);
  console.log('call_recordsに存在しないlead_id数:', missingLeadIds.length);
  
  if (missingLeadIds.length > 0) {
    console.log('\n存在しないlead_id一覧:');
    missingLeadIds.forEach(id => console.log('- ' + id));
  } else {
    console.log('\n全てのlead_idがcall_recordsに存在します。');
  }
}

main().catch(console.error);
