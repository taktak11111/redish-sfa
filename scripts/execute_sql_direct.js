// SQLスクリプトを直接実行するスクリプト（MCP経由ではなく、Supabaseクライアント経由）
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// 環境変数を読み込む
require('dotenv').config({ path: path.join(__dirname, '../frontend/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Supabase環境変数が設定されていません');
  console.error(`SUPABASE_URL: ${!!SUPABASE_URL}`);
  console.error(`SUPABASE_SERVICE_ROLE_KEY: ${!!SUPABASE_SERVICE_ROLE_KEY}`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

async function executeSQL(sql) {
  // SupabaseのRPC関数を使用してSQLを実行
  // 注意: exec_sql関数が存在しない場合は、直接SQLを実行できない可能性があります
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) {
    console.error('SQL実行エラー:', error);
    throw error;
  }
  return data;
}

async function main() {
  console.log('SQLスクリプトを読み込んでいます...');
  
  const sqlContent = fs.readFileSync(
    path.join(__dirname, 'fix_all_mismatches.sql'),
    'utf-8'
  );
  
  console.log(`SQLスクリプトのサイズ: ${sqlContent.length}文字`);
  
  // BEGINとCOMMITの間のSQLを抽出
  const beginIndex = sqlContent.indexOf('BEGIN;');
  const commitIndex = sqlContent.indexOf('COMMIT;');
  
  if (beginIndex === -1 || commitIndex === -1) {
    console.error('BEGINまたはCOMMITが見つかりません');
    process.exit(1);
  }
  
  const updateSQL = sqlContent.substring(beginIndex, commitIndex + 7);
  console.log(`実行するSQLサイズ: ${updateSQL.length}文字`);
  
  try {
    console.log('SQLスクリプトを実行しています...');
    const result = await executeSQL(updateSQL);
    console.log('✓ SQLスクリプトの実行が完了しました');
    console.log('結果:', result);
  } catch (error) {
    console.error('✗ SQLスクリプトの実行に失敗しました:', error.message);
    // exec_sql関数が存在しない場合は、別の方法を試す
    if (error.message.includes('function') || error.message.includes('does not exist')) {
      console.log('\n注意: exec_sql関数が存在しないため、別の方法で実行する必要があります');
      console.log('MCP経由で実行するか、SQLスクリプトを分割して実行してください');
    }
    process.exit(1);
  }
}

main().catch(console.error);
