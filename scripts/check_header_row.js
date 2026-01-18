// ヘッダー行を確認して、正しい列マッピングを特定
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

console.log('=== ヘッダー行の確認（U列～AD列周辺）===\n');

// U列（インデックス20）からAD列（インデックス29）まで確認
for (let i = 20; i <= 29; i++) {
  const colNum = i + 1; // 1ベースの列番号
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

console.log('\n=== OC0280のデータ確認（U列～AD列周辺）===\n');
const oc0280Row = rows.find(row => row[1]?.trim() === 'OC0280');
if (oc0280Row) {
  console.log('OC0280のデータ:');
  for (let i = 20; i <= 29; i++) {
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
    console.log(`インデックス${i} (${colLetter}列): ${value}`);
  }
}

console.log('\n=== 正しい列マッピング（OC0280のデータから推測）===\n');
if (oc0280Row) {
  console.log('OC0280のデータから:');
  console.log(`- インデックス22 (W列): ${oc0280Row[22]} = 担当IS`);
  console.log(`- インデックス23 (X列): ${oc0280Row[23]} = ISステータス`);
  console.log(`- インデックス24 (Y列): ${oc0280Row[24]} = ステータス更新日`);
  console.log(`- インデックス27 (AB列): ${oc0280Row[27]} = 結果/コンタクト状況`);
  console.log(`- インデックス28 (AC列): ${oc0280Row[28]} = 直近架電日`);
  console.log(`- インデックス29 (AD列): ${oc0280Row[29]} = 架電数カウント`);
}
