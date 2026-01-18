// SQLスクリプトを100件ずつのバッチファイルに分割するスクリプト
const fs = require('fs');
const path = require('path');

const sqlContent = fs.readFileSync(
  path.join(__dirname, 'fix_all_mismatches.sql'),
  'utf-8'
);

// BEGINとCOMMITの間のSQLステートメントを抽出
const beginIndex = sqlContent.indexOf('BEGIN;');
const commitIndex = sqlContent.indexOf('COMMIT;');

if (beginIndex === -1 || commitIndex === -1) {
  console.error('BEGINまたはCOMMITが見つかりません');
  process.exit(1);
}

const updateSQL = sqlContent.substring(beginIndex + 6, commitIndex);
const updates = updateSQL
  .split('\n')
  .filter(line => line.trim() && line.trim().startsWith('UPDATE'));

console.log(`抽出されたUPDATEステートメント数: ${updates.length}件`);

// バッチサイズ（100件ずつ）
const batchSize = 100;
const totalBatches = Math.ceil(updates.length / batchSize);

console.log(`総バッチ数: ${totalBatches}件`);

// 各バッチファイルを作成
for (let i = 0; i < updates.length; i += batchSize) {
  const batch = updates.slice(i, i + batchSize);
  const batchNumber = Math.floor(i / batchSize) + 1;
  
  const batchSQL = `BEGIN;\n\n${batch.join('\n')}\n\nCOMMIT;`;
  
  const outputPath = path.join(__dirname, `fix_batch_${batchNumber}.sql`);
  fs.writeFileSync(outputPath, batchSQL, 'utf-8');
  
  console.log(`バッチ ${batchNumber}/${totalBatches} を作成しました: ${outputPath} (${batch.length}件)`);
}

console.log(`\n完了: ${totalBatches}個のバッチファイルを作成しました`);
