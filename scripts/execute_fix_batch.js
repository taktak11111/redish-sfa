// SQLスクリプトをバッチで実行するスクリプト
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 環境変数を直接読み込む（frontend/.env.localから）
function loadEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex).trim();
        let value = trimmed.substring(eqIndex + 1).trim();
        // クォートを除去
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        env[key] = value;
      }
    }
  }
  return env;
}

const envPath = path.join(__dirname, '../frontend/.env.local');
const env = loadEnvFile(envPath);
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

async function executeSQLBatch(sqlStatements) {
  // BEGINとCOMMITで囲む
  const fullSQL = `BEGIN;\n${sqlStatements.join('\n')}\nCOMMIT;`;
  
  console.log(`実行するSQLステートメント数: ${sqlStatements.length}件`);
  console.log(`SQLサイズ: ${fullSQL.length}文字`);
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: fullSQL });
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
  
  // BEGINとCOMMITの間のSQLステートメントを抽出
  const beginIndex = sqlContent.indexOf('BEGIN;');
  const commitIndex = sqlContent.indexOf('COMMIT;');
  
  if (beginIndex === -1 || commitIndex === -1) {
    console.error('BEGINまたはCOMMITが見つかりません');
    process.exit(1);
  }
  
  const sqlStatements = sqlContent
    .substring(beginIndex + 6, commitIndex)
    .split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('--'))
    .filter(line => line.trim().startsWith('UPDATE'));
  
  console.log(`抽出されたUPDATEステートメント数: ${sqlStatements.length}件`);
  
  // バッチサイズ（100件ずつ実行）
  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < sqlStatements.length; i += batchSize) {
    const batch = sqlStatements.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(sqlStatements.length / batchSize);
    
    console.log(`\nバッチ ${batchNumber}/${totalBatches} を実行中... (${batch.length}件)`);
    
    try {
      await executeSQLBatch(batch);
      successCount += batch.length;
      console.log(`✓ バッチ ${batchNumber} が正常に完了しました`);
    } catch (error) {
      errorCount += batch.length;
      console.error(`✗ バッチ ${batchNumber} でエラーが発生しました:`, error.message);
      // エラーが発生しても続行
    }
  }
  
  console.log(`\n=== 実行結果 ===`);
  console.log(`成功: ${successCount}件`);
  console.log(`失敗: ${errorCount}件`);
  console.log(`合計: ${sqlStatements.length}件`);
}

main().catch(console.error);
