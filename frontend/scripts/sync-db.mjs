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

async function main() {
  console.log('=== DB同期スクリプト ===\n');

  // 1. 追加対象データ（CSVから抽出済み、B案マッピング適用）
  // マッピング: ソース不明→REDISH, RDパートナー→REDISH, 未着手→未架電
  const recordsToAdd = [
    {
      lead_id: 'RD0005',
      lead_source: 'REDISH', // ソース不明→REDISH
      linked_date: '2025-04-18',
      industry: 'フリーランス',
      company_name: '',
      contact_name: '山口',
      contact_name_kana: '',
      phone: '080-7880-8620',
      email: '',
      address: '',
      opening_date_original: '',
      contact_preferred_datetime: '',
      alliance_remarks: '元リードソース: ソース不明',
      status: '未架電', // 未着手→未架電
    },
    {
      lead_id: 'RD0013',
      lead_source: 'REDISH',
      linked_date: '2025-06-12', // 2025/0612 → 2025-06-12に修正
      industry: '居酒屋',
      company_name: '',
      contact_name: '渡辺',
      contact_name_kana: '',
      phone: '',
      email: '',
      address: '',
      opening_date_original: '',
      contact_preferred_datetime: '',
      alliance_remarks: 'OMC',
      status: '未架電', // 未着手→未架電
    },
    {
      lead_id: 'RP0002',
      lead_source: 'REDISH', // RDパートナー→REDISH
      linked_date: null,
      industry: '',
      company_name: '',
      contact_name: '日高　慶紀',
      contact_name_kana: 'ヒダカ　ヨシノリ',
      phone: '090-8963-0279',
      email: '',
      address: '',
      opening_date_original: '',
      contact_preferred_datetime: '',
      alliance_remarks: '元リードソース: RDパートナー',
      status: '未架電', // 未着手→未架電
    },
    {
      lead_id: 'RP0003',
      lead_source: 'REDISH', // RDパートナー→REDISH
      linked_date: '2025-10-29',
      industry: '',
      company_name: '',
      contact_name: '石川　久美子',
      contact_name_kana: 'イシカワ　クミコ',
      phone: '090-4843-1593',
      email: '',
      address: '',
      opening_date_original: '',
      contact_preferred_datetime: '',
      alliance_remarks: '元リードソース: RDパートナー',
      status: '未架電', // 未着手→未架電
    },
  ];

  // 2. 削除対象（既に削除済み）
  const idsToDelete = ['RD0034', 'RD0035'];

  // 3. 追加実行（削除は既に完了済みなのでスキップ）
  console.log('【追加処理】4件');
  for (const record of recordsToAdd) {
    const { error } = await supabase.from('call_records').insert(record);
    if (error) {
      console.error(`  ❌ ${record.lead_id} 追加失敗:`, error.message);
    } else {
      console.log(`  ✅ ${record.lead_id} 追加成功`);
    }
  }

  // 4. 削除実行
  console.log('\n【削除処理】2件');
  for (const id of idsToDelete) {
    const { error } = await supabase
      .from('call_records')
      .delete()
      .eq('lead_id', id);
    if (error) {
      console.error(`  ❌ ${id} 削除失敗:`, error.message);
    } else {
      console.log(`  ✅ ${id} 削除成功`);
    }
  }

  // 5. 確認
  console.log('\n【確認】');
  const { data: addedCheck } = await supabase
    .from('call_records')
    .select('lead_id')
    .in('lead_id', recordsToAdd.map(r => r.lead_id));
  console.log('追加確認:', addedCheck?.map(r => r.lead_id).join(', ') || 'なし');

  const { data: deletedCheck } = await supabase
    .from('call_records')
    .select('lead_id')
    .in('lead_id', idsToDelete);
  console.log('削除確認:', deletedCheck?.length === 0 ? '削除済み' : deletedCheck?.map(r => r.lead_id).join(', '));

  console.log('\n完了');
}

main().catch(console.error);
