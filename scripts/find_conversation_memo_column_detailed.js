// 会話メモ・その他の列を特定するスクリプト
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

console.log('=== ヘッダー行全体を確認（会話メモ・その他を探す）===\n');

// 全列を確認
headerRow.forEach((header, index) => {
  if (header && header.includes('会話') || header.includes('メモ')) {
    const colNum = index + 1;
    let colLetter = '';
    if (colNum <= 26) {
      colLetter = String.fromCharCode(64 + colNum);
    } else {
      const first = String.fromCharCode(64 + Math.floor((colNum - 1) / 26));
      const second = String.fromCharCode(64 + ((colNum - 1) % 26) + 1);
      colLetter = first + second;
    }
    console.log(`インデックス${index} (${colLetter}列): ${header}`);
  }
});

// TM3606のデータで会話メモの列を確認（grep結果から会話メモがあることが分かっている）
console.log('\n=== TM3606のデータ（会話メモがあることが分かっている）===\n');
const tm3606Row = rows.find(row => row[1]?.trim() === 'TM3606');
if (tm3606Row) {
  // 会話メモらしき列を探す（長いテキストが入っている列）
  tm3606Row.forEach((cell, index) => {
    if (cell && cell.trim() !== '' && (cell.includes('会話') || cell.includes('運転中') || cell.length > 30)) {
      const colNum = index + 1;
      let colLetter = '';
      if (colNum <= 26) {
        colLetter = String.fromCharCode(64 + colNum);
      } else {
        const first = String.fromCharCode(64 + Math.floor((colNum - 1) / 26));
        const second = String.fromCharCode(64 + ((colNum - 1) % 26) + 1);
        colLetter = first + second;
      }
      const header = headerRow[index] || '(ヘッダーなし)';
      console.log(`インデックス${index} (${colLetter}列): ヘッダー="${header}"`);
      console.log(`  値: ${cell.substring(0, 150)}`);
    }
  });
}
