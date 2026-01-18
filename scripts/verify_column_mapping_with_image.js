// 画像の情報とOC0280のデータから正しい列マッピングを確認
const fs = require('fs');

function parseCSV(csvText) {
  const rows = [];
  const lines = csvText.split(/\r?\n/);
  
  for (const line of lines) {
    if (line.trim() === '') continue;
    
    const cells = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    rows.push(cells);
  }
  
  return rows;
}

const csvText = fs.readFileSync(
  'C:/Users/takta/Downloads/Ver2.0_セールス管理統合シート - 架電管理表 (5).csv',
  'utf-8'
);

const rows = parseCSV(csvText);
const oc0280Row = rows.find(row => row[1]?.trim() === 'OC0280');

console.log('=== 画像とOC0280のデータから正しい列マッピングを確認 ===\n');
console.log('画像によると:');
console.log('- AA列 = 結果/コンタクト状況');
console.log('- AB列 = 直近架電日');
console.log('- AC列 = 架電数カウント\n');

console.log('OC0280のデータ:');
console.log(`[22] W (担当IS): ${oc0280Row[22] || '(空)'}`);
console.log(`[23] X (ISステータス): ${oc0280Row[23] || '(空)'}`);
console.log(`[24] Y (ステータス更新日): ${oc0280Row[24] || '(空)'}`);
console.log(`[25] Z (対応不可/失注理由): ${oc0280Row[25] || '(空)'}`);
console.log(`[26] AA (結果/コンタクト状況): ${oc0280Row[26] || '(空)'}`);
console.log(`[27] AB (直近架電日): ${oc0280Row[27] || '(空)'}`);
console.log(`[28] AC (架電数カウント): ${oc0280Row[28] || '(空)'}`);
console.log(`[29] AD: ${oc0280Row[29] || '(空)'}`);

console.log('\n=== 正しい列マッピング（画像とOC0280のデータから）===');
console.log('インデックス26 (AA列) = 結果/コンタクト状況');
console.log('インデックス27 (AB列) = 直近架電日');
console.log('インデックス28 (AC列) = 架電数カウント');
