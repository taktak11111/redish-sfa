// OC0001の実際のCSVデータを確認
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
const oc0001Row = rows.find(row => row[1]?.trim() === 'OC0001');

if (oc0001Row) {
  console.log('=== OC0001の全列データ（空でない列のみ）===\n');
  oc0001Row.forEach((cell, index) => {
    if (cell && cell.trim() !== '') {
      const colNum = index + 1;
      let colLetter = '';
      if (colNum <= 26) {
        colLetter = String.fromCharCode(64 + colNum);
      } else {
        const first = String.fromCharCode(64 + Math.floor((colNum - 1) / 26));
        const second = String.fromCharCode(64 + ((colNum - 1) % 26) + 1);
        colLetter = first + second;
      }
      console.log(`インデックス${index} (${colLetter}列): ${cell.substring(0, 100)}`);
    }
  });
  
  console.log('\n=== 重要な列の確認 ===');
  console.log(`[1] B (リードID): ${oc0001Row[1]}`);
  console.log(`[2] C (リードソース): ${oc0001Row[2]}`);
  console.log(`[22] W (担当IS): ${oc0001Row[22] || '(空)'}`);
  console.log(`[23] X (ISステータス): ${oc0001Row[23] || '(空)'}`);
  console.log(`[24] Y (ステータス更新日): ${oc0001Row[24] || '(空)'}`);
  console.log(`[25] Z (対応不可/失注理由): ${oc0001Row[25] || '(空)'}`);
  console.log(`[26] AA: ${oc0001Row[26] || '(空)'}`);
  console.log(`[27] AB (結果/コンタクト状況): ${oc0001Row[27] || '(空)'}`);
  console.log(`[28] AC (直近架電日): ${oc0001Row[28] || '(空)'}`);
  console.log(`[29] AD (架電数カウント): ${oc0001Row[29] || '(空)'}`);
} else {
  console.log('OC0001が見つかりませんでした');
}
