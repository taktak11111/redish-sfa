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
  console.log('=== 重複チェックスクリプト ===\n');

  // 対象のリードID
  const targetIds = ['AG0022', 'AG0029', 'AP0023', 'AP0024', 'AP0025', 'AP0026', 'AP0027', 'AP0028', 'AP0029'];

  // 1. 対象レコードの詳細を取得
  const { data: targetRecords, error: e1 } = await supabase
    .from('call_records')
    .select('lead_id, company_name, contact_name, phone, email, lead_source, created_at')
    .in('lead_id', targetIds);

  if (e1) {
    console.error('エラー:', e1);
    return;
  }

  console.log('【対象レコードの詳細】\n');
  targetRecords.forEach(r => {
    console.log(`${r.lead_id}:`);
    console.log(`  会社名: ${r.company_name || '(なし)'}`);
    console.log(`  氏名: ${r.contact_name || '(なし)'}`);
    console.log(`  電話: ${r.phone || '(なし)'}`);
    console.log(`  メール: ${r.email || '(なし)'}`);
    console.log(`  ソース: ${r.lead_source}`);
    console.log(`  作成日: ${r.created_at}`);
    console.log('');
  });

  // 2. 各レコードについて、同じ電話番号または氏名+会社名の重複を検索
  console.log('\n【重複チェック結果】\n');

  for (const target of targetRecords) {
    console.log(`=== ${target.lead_id} の重複チェック ===`);
    
    let duplicates = [];

    // 電話番号での重複チェック
    if (target.phone) {
      const { data: phoneMatches } = await supabase
        .from('call_records')
        .select('lead_id, company_name, contact_name, phone, lead_source')
        .eq('phone', target.phone)
        .neq('lead_id', target.lead_id);

      if (phoneMatches && phoneMatches.length > 0) {
        duplicates = duplicates.concat(phoneMatches.map(m => ({ ...m, matchType: '電話番号' })));
      }
    }

    // 氏名での重複チェック（会社名が空の場合）
    if (target.contact_name && !target.company_name) {
      const { data: nameMatches } = await supabase
        .from('call_records')
        .select('lead_id, company_name, contact_name, phone, lead_source')
        .eq('contact_name', target.contact_name)
        .neq('lead_id', target.lead_id);

      if (nameMatches && nameMatches.length > 0) {
        nameMatches.forEach(m => {
          if (!duplicates.find(d => d.lead_id === m.lead_id)) {
            duplicates.push({ ...m, matchType: '氏名' });
          }
        });
      }
    }

    // 会社名+氏名での重複チェック
    if (target.company_name && target.contact_name) {
      const { data: companyNameMatches } = await supabase
        .from('call_records')
        .select('lead_id, company_name, contact_name, phone, lead_source')
        .eq('company_name', target.company_name)
        .eq('contact_name', target.contact_name)
        .neq('lead_id', target.lead_id);

      if (companyNameMatches && companyNameMatches.length > 0) {
        companyNameMatches.forEach(m => {
          if (!duplicates.find(d => d.lead_id === m.lead_id)) {
            duplicates.push({ ...m, matchType: '会社名+氏名' });
          }
        });
      }
    }

    if (duplicates.length > 0) {
      console.log(`  ⚠️ 重複あり: ${duplicates.length}件`);
      duplicates.forEach(d => {
        console.log(`    → ${d.lead_id}: ${d.company_name || '(なし)'} / ${d.contact_name} / ${d.phone || '(なし)'} / ${d.lead_source} [${d.matchType}一致]`);
      });
    } else {
      console.log(`  ✅ 重複なし`);
    }
    console.log('');
  }
}

main().catch(console.error);
