// 会話メモの列を特定するスクリプト
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
const headerRow = rows[7]; // 8行目がヘッダー

console.log('=== ヘッダー行の確認（AA列以降）===\n');

// AA列（インデックス26）以降を確認
for (let i = 26; i <= 35; i++) {
  const colNum = i + 1;
  let colLetter = '';
  if (colNum <= 26) {
    colLetter = String.fromCharCode(64 + colNum);
  } else {
    const first = String.fromCharCode(64 + Math.floor((colNum - 1) / 26));
    const second = String.fromCharCode(64 + ((colNum - 1) % 26) + 1);
    colLetter = first + second;
  }
  const header = headerRow[i] || '(空)';
  console.log(`インデックス${i} (${colLetter}列): ${header}`);
}

// OC0280のデータで会話メモらしき列を探す
console.log('\n=== OC0280のデータ（AA列以降）===\n');
const oc0280Row = rows.find(row => row[1]?.trim() === 'OC0280');
if (oc0280Row) {
  for (let i = 26; i <= 35; i++) {
    const colNum = i + 1;
    let colLetter = '';
    if (colNum <= 26) {
      colLetter = String.fromCharCode(64 + colNum);
    } else {
      const first = String.fromCharCode(64 + Math.floor((colNum - 1) / 26));
      const second = String.fromCharCode(64 + ((colNum - 1) % 26) + 1);
      colLetter = first + second;
    }
    const value = oc0280Row[i] || '(空)';
    if (value && value.trim() !== '') {
      console.log(`インデックス${i} (${colLetter}列): ${value.substring(0, 100)}`);
    }
  }
}
