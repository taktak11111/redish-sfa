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

// 電話番号を正規化（ハイフン除去、全角→半角）
function normalizePhone(phone) {
  if (!phone) return '';
  return phone.toString()
    .replace(/[－ー−‐]/g, '-')  // 全角ハイフンを半角に
    .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))  // 全角数字を半角に
    .replace(/[-\s]/g, '')  // ハイフンとスペースを除去
    .trim();
}

async function main() {
  console.log('=== 電話番号による紐付け検証 ===\n');

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

  // TEMPOSのみ抽出
  const temposMissing = missingData.filter(row => row['リードソース'] === 'TEMPOS');
  console.log('TEMPOS（call_recordsに存在しない）:', temposMissing.length, '件');

  // 3. 架電管理CSVをパース
  const leadsCsv = fs.readFileSync('C:/Users/takta/Downloads/SFA用REDISH税務契約フォーム - 顧客リード_ TR のコピー のコピー.csv', 'utf-8');
  const leadsResult = Papa.parse(leadsCsv, { header: true, skipEmptyLines: true });
  console.log('架電管理CSV総件数:', leadsResult.data.length, '件');

  // 電話番号→lead_id（列1）のマップを作成
  const phoneToLeadId = new Map();
  leadsResult.data.forEach(row => {
    const phone = normalizePhone(row['電話']);
    const leadId = row['列 1'];  // これがリードID相当
    if (phone && leadId) {
      // 電話番号が重複する場合は最初のものを使用
      if (!phoneToLeadId.has(phone)) {
        phoneToLeadId.set(phone, leadId);
      }
    }
  });
  console.log('架電管理CSVの電話番号数（ユニーク）:', phoneToLeadId.size, '件');

  // 4. 電話番号で突合
  let matchedCount = 0;
  let unmatchedCount = 0;
  const unmatchedSamples = [];
  const matchedSamples = [];

  temposMissing.forEach(row => {
    const phone = normalizePhone(row['電話番号']);
    if (phoneToLeadId.has(phone)) {
      matchedCount++;
      if (matchedSamples.length < 5) {
        matchedSamples.push({
          dealLeadId: row['リードID'],
          phone: row['電話番号'],
          csvRow: phoneToLeadId.get(phone),
          companyName: row['会社名/店舗名'],
          contactName: row['氏名']
        });
      }
    } else {
      unmatchedCount++;
      if (unmatchedSamples.length < 10) {
        unmatchedSamples.push({
          dealLeadId: row['リードID'],
          phone: row['電話番号'],
          companyName: row['会社名/店舗名'],
          contactName: row['氏名']
        });
      }
    }
  });

  console.log('\n=== 突合結果 ===');
  console.log('電話番号で紐付け可能:', matchedCount, '件');
  console.log('電話番号で紐付け不可:', unmatchedCount, '件');
  console.log('紐付け率:', ((matchedCount / temposMissing.length) * 100).toFixed(1) + '%');

  if (matchedSamples.length > 0) {
    console.log('\n【紐付け成功サンプル】');
    matchedSamples.forEach((s, i) => {
      console.log(`  ${i+1}. 商談リードID: ${s.dealLeadId} → CSV行番号: ${s.csvRow}`);
      console.log(`     電話: ${s.phone}, 会社: ${s.companyName}, 氏名: ${s.contactName}`);
    });
  }

  if (unmatchedSamples.length > 0) {
    console.log('\n【紐付け失敗サンプル（電話番号が架電管理CSVにない）】');
    unmatchedSamples.forEach((s, i) => {
      console.log(`  ${i+1}. 商談リードID: ${s.dealLeadId}`);
      console.log(`     電話: ${s.phone}, 会社: ${s.companyName}, 氏名: ${s.contactName}`);
    });
  }
}

main().catch(console.error);
