// SQLスクリプトを読み込んで実行するスクリプト
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 環境変数を読み込む（.env.localから）
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function executeSQL(sql) {
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
    'C:/Users/takta/Documents/develop/REDISH_SFA/scripts/fix_all_mismatches.sql',
    'utf-8'
  );
  
  console.log(`SQLスクリプトのサイズ: ${sqlContent.length}文字`);
  
  // SQLスクリプトを実行
  try {
    console.log('SQLスクリプトを実行しています...');
    const result = await executeSQL(sqlContent);
    console.log('SQLスクリプトの実行が完了しました');
    console.log('結果:', result);
  } catch (error) {
    console.error('SQLスクリプトの実行に失敗しました:', error);
    process.exit(1);
  }
}

main();
