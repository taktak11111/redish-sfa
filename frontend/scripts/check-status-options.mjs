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

async function main() {
  console.log('=== システムステータス設定確認 ===\n');

  // 1. status_is_optionsテーブルを確認
  console.log('【status_is_optionsテーブル】');
  const { data: statusIsOptions, error: e1 } = await supabase
    .from('status_is_options')
    .select('*')
    .order('display_order');
  
  if (e1) {
    console.log('  テーブルなし or エラー:', e1.message);
  } else {
    console.log('  件数:', statusIsOptions?.length);
    statusIsOptions?.forEach((o, i) => console.log(`  ${i + 1}. ${o.value || o.name || JSON.stringify(o)}`));
  }

  // 2. result_contact_status_optionsテーブルを確認
  console.log('\n【result_contact_status_optionsテーブル】');
  const { data: resultOptions, error: e2 } = await supabase
    .from('result_contact_status_options')
    .select('*')
    .order('display_order');
  
  if (e2) {
    console.log('  テーブルなし or エラー:', e2.message);
  } else {
    console.log('  件数:', resultOptions?.length);
    resultOptions?.forEach((o, i) => console.log(`  ${i + 1}. ${o.value || o.name || JSON.stringify(o)}`));
  }

  // 3. system_optionsテーブルを確認（汎用設定）
  console.log('\n【system_optionsテーブル】');
  const { data: sysOptions, error: e3 } = await supabase
    .from('system_options')
    .select('*');
  
  if (e3) {
    console.log('  テーブルなし or エラー:', e3.message);
  } else {
    console.log('  件数:', sysOptions?.length);
    sysOptions?.forEach((o) => console.log(`  - ${o.category}: ${o.value}`));
  }

  // 4. call_record_optionsテーブルを確認
  console.log('\n【call_record_optionsテーブル】');
  const { data: callOptions, error: e4 } = await supabase
    .from('call_record_options')
    .select('*')
    .order('category, display_order');
  
  if (e4) {
    console.log('  テーブルなし or エラー:', e4.message);
  } else {
    console.log('  件数:', callOptions?.length);
    const byCategory = {};
    callOptions?.forEach((o) => {
      if (!byCategory[o.category]) byCategory[o.category] = [];
      byCategory[o.category].push(o.value);
    });
    Object.entries(byCategory).forEach(([cat, values]) => {
      console.log(`  [${cat}]`);
      values.forEach((v, i) => console.log(`    ${i + 1}. ${v}`));
    });
  }

  // 5. DBのstatus_isカラムの実際の値を再確認
  console.log('\n【DBのstatus_isカラムの実際の値】');
  const { data: records, error: e5 } = await supabase
    .from('call_records')
    .select('status_is')
    .not('status_is', 'is', null);
  
  if (e5) {
    console.log('  エラー:', e5.message);
  } else {
    const counts = {};
    records?.forEach((r) => {
      counts[r.status_is] = (counts[r.status_is] || 0) + 1;
    });
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([v, c]) => console.log(`  "${v}": ${c}件`));
  }

  // 6. DBのresult_contact_statusカラムの実際の値を確認
  console.log('\n【DBのresult_contact_statusカラムの実際の値】');
  const { data: records2, error: e6 } = await supabase
    .from('call_records')
    .select('result_contact_status')
    .not('result_contact_status', 'is', null);
  
  if (e6) {
    console.log('  エラー:', e6.message);
  } else {
    const counts = {};
    records2?.forEach((r) => {
      counts[r.result_contact_status] = (counts[r.result_contact_status] || 0) + 1;
    });
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([v, c]) => console.log(`  "${v}": ${c}件`));
  }
}

main().catch(console.error);
