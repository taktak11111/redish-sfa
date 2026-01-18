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
  console.log('=== 重複レコード削除スクリプト ===\n');

  // 削除対象のリードID
  const deleteIds = ['AG0022', 'AG0029', 'AP0023', 'AP0024', 'AP0025', 'AP0026', 'AP0027', 'AP0028', 'AP0029'];

  console.log(`削除対象: ${deleteIds.length}件`);
  console.log(`  ${deleteIds.join(', ')}`);

  // 削除実行
  console.log('\n【削除処理開始】');

  let successCount = 0;
  let errorCount = 0;

  for (const leadId of deleteIds) {
    const { error } = await supabase
      .from('call_records')
      .delete()
      .eq('lead_id', leadId);

    if (error) {
      console.log(`  ❌ ${leadId}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`  ✅ ${leadId}: 削除成功`);
      successCount++;
    }
  }

  // 結果出力
  console.log('\n=== 削除結果 ===\n');
  console.log(`成功: ${successCount}件`);
  console.log(`エラー: ${errorCount}件`);

  // 確認
  const { count } = await supabase
    .from('call_records')
    .select('*', { count: 'exact', head: true });

  console.log(`\nDB総レコード数: ${count}件`);
}

main().catch(console.error);
