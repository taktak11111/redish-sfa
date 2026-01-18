import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// セル内改行を考慮したCSVパーサー
function parseCSV(content) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
        i++;
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows;
}

async function main() {
  console.log('=== Y列（対応負荷・失注理由）分析スクリプト ===\n');

  // 1. CSVファイル読み込み
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (7).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  console.log(`CSVヘッダーY列: ${rows[0][24]}`); // Y列 = index 24

  // 2. CSVデータを集計（Y列 = index 24）
  const reasonCounts = {};
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH|AS|AG|AP|RP)\d+$/;

  for (let i = 1; i < rows.length; i++) {
    const leadId = rows[i][0];
    const reason = rows[i][24] || ''; // Y列
    if (leadId && leadIdPattern.test(leadId)) {
      const key = reason || '(空欄)';
      reasonCounts[key] = (reasonCounts[key] || 0) + 1;
    }
  }

  // 3. 結果出力（件数順）
  console.log('\n【CSVのY列（対応負荷・失注理由）ユニーク値と件数】\n');
  
  const sorted = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
  
  console.log('値 | 件数');
  console.log('-'.repeat(60));
  sorted.forEach(([reason, count]) => {
    console.log(`"${reason}" | ${count}件`);
  });

  console.log(`\n合計ユニーク値: ${sorted.length}種類`);
  console.log(`空欄以外の値: ${sorted.filter(([r]) => r !== '(空欄)').length}種類`);
}

main().catch(console.error);
