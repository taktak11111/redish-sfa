// SQLスクリプトを読み込んで、MCP経由で実行するための準備スクリプト
// このスクリプトは、SQLスクリプトを読み込んで、MCP経由で実行できる形式に変換します

const fs = require('fs');
const path = require('path');

const sqlContent = fs.readFileSync(
  path.join(__dirname, 'fix_all_mismatches.sql'),
  'utf-8'
);

// BEGINとCOMMITの間のSQLを抽出
const beginIndex = sqlContent.indexOf('BEGIN;');
const commitIndex = sqlContent.indexOf('COMMIT;');

if (beginIndex === -1 || commitIndex === -1) {
  console.error('BEGINまたはCOMMITが見つかりません');
  process.exit(1);
}

const updateSQL = sqlContent.substring(beginIndex, commitIndex + 7);

console.log(`SQLスクリプトのサイズ: ${updateSQL.length}文字`);
console.log(`\n=== SQLスクリプト（最初の500文字）===\n`);
console.log(updateSQL.substring(0, 500));
console.log(`\n... (残り ${updateSQL.length - 500}文字)`);
console.log(`\n=== SQLスクリプト（最後の500文字）===\n`);
console.log(updateSQL.substring(updateSQL.length - 500));

// UPDATEステートメントの数をカウント
const updateCount = (updateSQL.match(/UPDATE call_records/g) || []).length;
console.log(`\n=== 統計 ===`);
console.log(`UPDATEステートメント数: ${updateCount}件`);
console.log(`SQLサイズ: ${updateSQL.length}文字`);

// MCP経由で実行するためのSQLファイルを出力
const outputPath = path.join(__dirname, 'fix_all_mismatches_executable.sql');
fs.writeFileSync(outputPath, updateSQL, 'utf-8');
console.log(`\n実行用SQLファイルを出力しました: ${outputPath}`);
