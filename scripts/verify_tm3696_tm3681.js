// TM3696とTM3681の実際のCSVデータを確認
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
const tm3696Row = rows.find(row => row[1]?.trim() === 'TM3696');
const tm3681Row = rows.find(row => row[1]?.trim() === 'TM3681');

console.log('=== TM3696のデータ ===\n');
if (tm3696Row) {
  console.log(`[22] W (担当IS): ${tm3696Row[22] || '(空)'}`);
  console.log(`[23] X (ISステータス): ${tm3696Row[23] || '(空)'}`);
  console.log(`[24] Y (ステータス更新日): ${tm3696Row[24] || '(空)'}`);
  console.log(`[25] Z (対応不可/失注理由): ${tm3696Row[25] || '(空)'}`);
  console.log(`[26] AA: ${tm3696Row[26] || '(空)'}`);
  console.log(`[27] AB (結果/コンタクト状況): ${tm3696Row[27] || '(空)'}`);
  console.log(`[28] AC (直近架電日): ${tm3696Row[28] || '(空)'}`);
  console.log(`[29] AD (架電数カウント): ${tm3696Row[29] || '(空)'}`);
  console.log('\n推測: AC列（直近架電日）にデータがある → 架電している → call_countは1以上と推測');
} else {
  console.log('TM3696が見つかりませんでした');
}

console.log('\n=== TM3681のデータ ===\n');
if (tm3681Row) {
  console.log(`[22] W (担当IS): ${tm3681Row[22] || '(空)'}`);
  console.log(`[23] X (ISステータス): ${tm3681Row[23] || '(空)'}`);
  console.log(`[24] Y (ステータス更新日): ${tm3681Row[24] || '(空)'}`);
  console.log(`[25] Z (対応不可/失注理由): ${tm3681Row[25] || '(空)'}`);
  console.log(`[26] AA: ${tm3681Row[26] || '(空)'}`);
  console.log(`[27] AB (結果/コンタクト状況): ${tm3681Row[27] || '(空)'}`);
  console.log(`[28] AC (直近架電日): ${tm3681Row[28] || '(空)'}`);
  console.log(`[29] AD (架電数カウント): ${tm3681Row[29] || '(空)'}`);
  console.log('\n推測: Z列（対応不可/失注理由）に「税理士あり」がある → 通電して失注していると推測');
} else {
  console.log('TM3681が見つかりませんでした');
}
