// OC0001の全列を確認して、会話メモやその他の列を特定
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
const headerRow = rows[7];
const oc0001Row = rows.find(row => row[1]?.trim() === 'OC0001');

console.log('=== ヘッダー行の確認（W列～AH列）===\n');
for (let i = 22; i <= 33; i++) {
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
  const value = oc0001Row ? (oc0001Row[i] || '(空)') : '(N/A)';
  console.log(`インデックス${i} (${colLetter}列): ヘッダー="${header}" / OC0001="${value.substring(0, 50)}"`);
}

// 会話メモらしき列を探す（長いテキストが入っている列）
console.log('\n=== OC0001で長いテキストが入っている列を確認 ===\n');
if (oc0001Row) {
  oc0001Row.forEach((cell, index) => {
    if (cell && cell.trim() !== '' && cell.length > 20) {
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
