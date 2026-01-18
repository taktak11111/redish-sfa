// CSVファイルの列マッピングを検証するスクリプト
const fs = require('fs');

// CSVパーサー
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

// ヘッダー行は8行目（インデックス7）
const headerRow = rows[7];
console.log('=== ヘッダー行の確認（V列～AC列周辺）===\n');

// V列（インデックス21）からAC列（インデックス28）まで確認
for (let i = 21; i <= 28; i++) {
  const colLetter = String.fromCharCode(65 + (i % 26)) + (i >= 26 ? String.fromCharCode(65 + Math.floor(i / 26) - 1) : '');
  const header = headerRow[i] || '(空)';
  console.log(`インデックス${i} (${colLetter}列): ${header}`);
}

console.log('\n=== OC0280のデータ確認（V列～AC列周辺）===\n');
const oc0280Row = rows.find(row => row[1]?.trim() === 'OC0280');
if (oc0280Row) {
  console.log('OC0280のデータ:');
  for (let i = 21; i <= 28; i++) {
    const colLetter = String.fromCharCode(65 + (i % 26)) + (i >= 26 ? String.fromCharCode(65 + Math.floor(i / 26) - 1) : '');
    const value = oc0280Row[i] || '(空)';
    console.log(`インデックス${i} (${colLetter}列): ${value}`);
  }
} else {
  console.log('OC0280が見つかりませんでした');
}

console.log('\n=== A列（インデックス0）の確認 ===\n');
console.log('ヘッダー行のA列:', headerRow[0] || '(空)');
if (oc0280Row) {
  console.log('OC0280のA列:', oc0280Row[0] || '(空)');
}

console.log('\n=== 正しい列マッピングの推測 ===\n');
console.log('画像によると:');
console.log('- W列が担当IS');
console.log('- X列がISステータス');
console.log('- Y列がステータス更新日');
console.log('- AA列が結果/コンタクト状況');
console.log('- AB列が直近架電日');
console.log('- AC列が架電数カウント');
console.log('\nA列が空白の場合、CSVのインデックスは:');
console.log('- インデックス22 (W列) = 担当IS');
console.log('- インデックス23 (X列) = ISステータス');
console.log('- インデックス24 (Y列) = ステータス更新日');
console.log('- インデックス26 (AA列) = 結果/コンタクト状況');
console.log('- インデックス27 (AB列) = 直近架電日');
console.log('- インデックス28 (AC列) = 架電数カウント');
