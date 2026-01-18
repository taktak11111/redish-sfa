// SQLスクリプトをバッチで実行するスクリプト（MCP経由で使用するためのSQL出力）
const fs = require('fs');
const path = require('path');

const sqlContent = fs.readFileSync(
  path.join(__dirname, 'fix_all_mismatches_executable.sql'),
  'utf-8'
);

// UPDATEステートメントを抽出
const lines = sqlContent.split('\n');
const updateStatements = lines.filter(line => line.trim().startsWith('UPDATE'));

console.log(`抽出されたUPDATEステートメント数: ${updateStatements.length}件`);

// バッチサイズ（50件ずつ）
const batchSize = 50;
const batches = [];

for (let i = 0; i < updateStatements.length; i += batchSize) {
  const batch = updateStatements.slice(i, i + batchSize);
  batches.push(batch.join('\n'));
}

console.log(`バッチ数: ${batches.length}件`);

// 各バッチをファイルに出力
for (let i = 0; i < batches.length; i++) {
  const batchPath = path.join(__dirname, `batch_${String(i + 1).padStart(2, '0')}.sql`);
  fs.writeFileSync(batchPath, batches[i], 'utf-8');
  console.log(`バッチ ${i + 1} を出力しました: ${batchPath}`);
}

console.log('\n=== 完了 ===');
console.log(`合計 ${batches.length} 個のバッチファイルを出力しました`);
console.log('各バッチファイルをMCP経由で実行してください');
