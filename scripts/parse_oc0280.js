// OC0280の行を詳細に解析
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

if (oc0280Row) {
  console.log('OC0280の全列（空でない列のみ）:');
  oc0280Row.forEach((cell, index) => {
    if (cell && cell.trim() !== '') {
      const colLetter = index === 0 ? 'A' : String.fromCharCode(65 + ((index - 1) % 26)) + (index > 26 ? String.fromCharCode(65 + Math.floor((index - 1) / 26) - 1) : '');
      console.log(`  [${index}] ${colLetter}: ${cell.substring(0, 100)}`);
    }
  });
  
  console.log('\n重要な列の確認:');
  console.log(`  [1] B (リードID): ${oc0280Row[1]}`);
  console.log(`  [2] C (リードソース): ${oc0280Row[2]}`);
  console.log(`  [23] W (担当IS): ${oc0280Row[23]}`);
  console.log(`  [24] X (ISステータス): ${oc0280Row[24]}`);
  console.log(`  [25] Y (ステータス更新日): ${oc0280Row[25]}`);
  console.log(`  [26] Z (失注理由): ${oc0280Row[26]}`);
  console.log(`  [27] AA (空): ${oc0280Row[27]}`);
  console.log(`  [28] AB (結果/コンタクト状況): ${oc0280Row[28]}`);
  console.log(`  [29] AC (直近架電日): ${oc0280Row[29]}`);
  console.log(`  [30] AD (架電数カウント): ${oc0280Row[30]}`);
} else {
  console.log('OC0280が見つかりませんでした');
}
