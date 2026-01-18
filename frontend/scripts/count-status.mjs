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
  console.log('=== status_is件数確認 ===\n');

  // 総レコード数
  const { count: totalCount } = await supabase
    .from('call_records')
    .select('*', { count: 'exact', head: true });

  // 空欄(null)の件数
  const { count: nullCount } = await supabase
    .from('call_records')
    .select('*', { count: 'exact', head: true })
    .is('status_is', null);

  // 値ありの件数
  const { count: hasValueCount } = await supabase
    .from('call_records')
    .select('*', { count: 'exact', head: true })
    .not('status_is', 'is', null);

  console.log('総レコード数:', totalCount);
  console.log('値あり:', hasValueCount);
  console.log('空欄(null):', nullCount);
}

main().catch(console.error);
