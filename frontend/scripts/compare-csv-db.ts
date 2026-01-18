import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  console.log('=== CSV/DB比較スクリプト ===\n');

  // 1. CSVファイル読み込み
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (2).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');

  // CSVからリードIDを抽出（TM/OC/MT/MK/RD/AB/US/FR/HS/SHで始まる行）
  const csvLeadIds = new Set<string>();
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH)\d+/;

  for (const line of lines) {
    const firstColumn = line.split(',')[0]?.trim();
    if (firstColumn && leadIdPattern.test(firstColumn)) {
      csvLeadIds.add(firstColumn);
    }
  }

  console.log(`CSVのリードID数: ${csvLeadIds.size}`);

  // 2. DBからリードID取得
  const { data: dbRecords, error } = await supabase
    .from('call_records')
    .select('lead_id')
    .order('lead_id');

  if (error) {
    console.error('DB取得エラー:', error);
    process.exit(1);
  }

  const dbLeadIds = new Set(dbRecords?.map((r) => r.lead_id) || []);
  console.log(`DBのリードID数: ${dbLeadIds.size}`);

  // 3. 比較
  const onlyInCSV: string[] = [];
  const onlyInDB: string[] = [];

  // CSVにあってDBにないもの
  for (const id of csvLeadIds) {
    if (!dbLeadIds.has(id)) {
      onlyInCSV.push(id);
    }
  }

  // DBにあってCSVにないもの
  for (const id of dbLeadIds) {
    if (!csvLeadIds.has(id)) {
      onlyInDB.push(id);
    }
  }

  console.log('\n=== 比較結果 ===\n');
  console.log(`CSVにあってDBにない: ${onlyInCSV.length}件`);
  if (onlyInCSV.length > 0) {
    console.log('リードID:', onlyInCSV.sort().join(', '));
  }

  console.log(`\nDBにあってCSVにない: ${onlyInDB.length}件`);
  if (onlyInDB.length > 0) {
    console.log('リードID:', onlyInDB.sort().join(', '));
  }

  // 結果をJSONファイルに出力
  const result = {
    timestamp: new Date().toISOString(),
    csvCount: csvLeadIds.size,
    dbCount: dbLeadIds.size,
    onlyInCSV: onlyInCSV.sort(),
    onlyInDB: onlyInDB.sort(),
  };

  const outputPath = path.join(__dirname, 'compare-result.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\n結果をJSONファイルに出力: ${outputPath}`);
}

main().catch(console.error);
