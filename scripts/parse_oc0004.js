// OC0004の行を詳細に解析
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
const oc0004Row = rows.find(row => row[1]?.trim() === 'OC0004');

if (oc0004Row) {
  console.log('OC0004の全列（空でない列のみ）:');
  oc0004Row.forEach((cell, index) => {
    if (cell && cell.trim() !== '') {
      const colLetter = index === 0 ? 'A' : String.fromCharCode(65 + ((index - 1) % 26)) + (index > 26 ? String.fromCharCode(65 + Math.floor((index - 1) / 26) - 1) : '');
      console.log(`  [${index}] ${colLetter}: ${cell.substring(0, 100)}`);
    }
  });
  
  console.log('\n重要な列の確認:');
  console.log(`  [1] B (リードID): ${oc0004Row[1]}`);
  console.log(`  [2] C (リードソース): ${oc0004Row[2]}`);
  console.log(`  [22] V (担当IS): ${oc0004Row[22] || '(空)'}`);
  console.log(`  [23] W (ISステータス): ${oc0004Row[23] || '(空)'}`);
  console.log(`  [24] X (ステータス更新日): ${oc0004Row[24] || '(空)'}`);
  console.log(`  [25] Y (失注理由): ${oc0004Row[25] || '(空)'}`);
  console.log(`  [26] Z: ${oc0004Row[26] || '(空)'}`);
  console.log(`  [27] AA (結果/コンタクト状況): ${oc0004Row[27] || '(空)'}`);
  console.log(`  [28] BA (直近架電日): ${oc0004Row[28] || '(空)'}`);
  console.log(`  [29] CA (架電数カウント): ${oc0004Row[29] || '(空)'}`);
} else {
  console.log('OC0004が見つかりませんでした');
}
