// サンプルレコードを詳細に解析して、CSVとDBの不整合を確認
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
const dataRows = rows.slice(8);

// サンプルレコードを解析
const sampleLeadIds = ['OC0004', 'OC0007', 'OC0008', 'OC0010', 'OC0016', 'TM3592', 'TM3593', 'TM3594', 'TM3600', 'TM3601'];

console.log('=== サンプルレコードの詳細解析 ===\n');

sampleLeadIds.forEach(leadId => {
  const row = dataRows.find(r => r[1]?.trim() === leadId);
  if (row) {
    console.log(`${leadId}:`);
    console.log(`  リードソース: ${row[2]}`);
    console.log(`  担当IS (インデックス22): ${row[22] || '(空)'}`);
    console.log(`  ISステータス (インデックス23): ${row[23] || '(空)'}`);
    console.log(`  ステータス更新日 (インデックス24): ${row[24] || '(空)'}`);
    console.log(`  結果/コンタクト状況 (インデックス27): ${row[27] || '(空)'}`);
    console.log(`  直近架電日 (インデックス28): ${row[28] || '(空)'}`);
    console.log(`  架電数カウント (インデックス29): ${row[29] || '(空)'}`);
    console.log('');
  }
});
