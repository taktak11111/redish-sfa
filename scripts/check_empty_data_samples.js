// 「データが空」と判定されたレコードの詳細を確認
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

function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  const match = dateStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return null;
}

const csvText = fs.readFileSync(
  'C:/Users/takta/Downloads/Ver2.0_セールス管理統合シート - 架電管理表 (5).csv',
  'utf-8'
);

const rows = parseCSV(csvText);
const dataRows = rows.slice(8);

const colIndex = {
  leadId: 1,
  leadSource: 2,
  linkedDate: 3,
  staffIs: 22,
  statusIs: 23,
  statusUpdateDate: 24,
  resultContactStatus: 27,
  lastCalledDate: 28,
  callCount: 29,
};

// 「データが空」と判定されるレコードを抽出
const emptyOmcRecords = [];
const emptyTemposRecords = [];

for (let i = 0; i < dataRows.length; i++) {
  const row = dataRows[i];
  const leadId = row[colIndex.leadId]?.trim();
  const leadSource = row[colIndex.leadSource]?.trim();
  
  if (!leadId || leadId === '') continue;
  
  const csvData = {
    leadId,
    leadSource,
    staffIs: row[colIndex.staffIs]?.trim() || null,
    statusIs: row[colIndex.statusIs]?.trim() || null,
    statusUpdateDate: parseDate(row[colIndex.statusUpdateDate]?.trim()),
    resultContactStatus: row[colIndex.resultContactStatus]?.trim() || null,
    lastCalledDate: parseDate(row[colIndex.lastCalledDate]?.trim()),
    callCount: row[colIndex.callCount]?.trim() ? parseInt(row[colIndex.callCount].trim(), 10) : null,
    linkedDate: parseDate(row[colIndex.linkedDate]?.trim()),
  };
  
  // 「データが空」の判定条件を確認
  const isEmpty = !csvData.statusIs && !csvData.resultContactStatus && csvData.callCount === null;
  
  if (leadSource === 'OMC' && isEmpty) {
    emptyOmcRecords.push({
      leadId,
      csvData,
      // 他の列のデータも確認
      companyName: row[5] || '(空)',
      contactName: row[6] || '(空)',
      phone: row[8] || '(空)',
    });
  } else if (leadSource === 'TEMPOS' && isEmpty) {
    const linkedDate = csvData.linkedDate ? new Date(csvData.linkedDate) : null;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    if (!linkedDate || linkedDate < sevenDaysAgo) {
      emptyTemposRecords.push({
        leadId,
        csvData,
        linkedDate: csvData.linkedDate,
        companyName: row[5] || '(空)',
        contactName: row[6] || '(空)',
        phone: row[8] || '(空)',
      });
    }
  }
}

console.log('=== 「データが空」の判定条件 ===\n');
console.log('以下の3つのフィールドがすべて空の場合に「データが空」と判定しています:');
console.log('1. status_is (ISステータス)');
console.log('2. result_contact_status (結果/コンタクト状況)');
console.log('3. call_count (架電数カウント)');
console.log('\n※ 他のデータ（会社名、電話番号など）は存在する可能性があります。\n');

console.log(`=== OMCリードで「データが空」と判定されたレコード（最初の10件）===\n`);
emptyOmcRecords.slice(0, 10).forEach(record => {
  console.log(`${record.leadId}:`);
  console.log(`  会社名: ${record.companyName}`);
  console.log(`  担当者名: ${record.contactName}`);
  console.log(`  電話番号: ${record.phone}`);
  console.log(`  担当IS: ${record.csvData.staffIs || '(空)'}`);
  console.log(`  ISステータス: ${record.csvData.statusIs || '(空)'}`);
  console.log(`  結果/コンタクト状況: ${record.csvData.resultContactStatus || '(空)'}`);
  console.log(`  架電数カウント: ${record.csvData.callCount !== null ? record.csvData.callCount : '(空)'}`);
  console.log(`  直近架電日: ${record.csvData.lastCalledDate || '(空)'}`);
  console.log('');
});

console.log(`\n=== TEMPOSリードで「データが空」と判定されたレコード（最初の10件）===\n`);
emptyTemposRecords.slice(0, 10).forEach(record => {
  console.log(`${record.leadId}:`);
  console.log(`  連携日: ${record.linkedDate || '(空)'}`);
  console.log(`  会社名: ${record.companyName}`);
  console.log(`  担当者名: ${record.contactName}`);
  console.log(`  電話番号: ${record.phone}`);
  console.log(`  担当IS: ${record.csvData.staffIs || '(空)'}`);
  console.log(`  ISステータス: ${record.csvData.statusIs || '(空)'}`);
  console.log(`  結果/コンタクト状況: ${record.csvData.resultContactStatus || '(空)'}`);
  console.log(`  架電数カウント: ${record.csvData.callCount !== null ? record.csvData.callCount : '(空)'}`);
  console.log(`  直近架電日: ${record.csvData.lastCalledDate || '(空)'}`);
  console.log('');
});

console.log(`\n=== サマリー ===`);
console.log(`OMCリードで「データが空」: ${emptyOmcRecords.length}件`);
console.log(`TEMPOSリードで「データが空」（直近7日以外）: ${emptyTemposRecords.length}件`);
console.log(`\n※ これらのレコードは、CSVファイルに架電関連のデータ（status_is、result_contact_status、call_count）が入力されていません。`);
console.log(`   ただし、リード情報（会社名、電話番号など）は存在する可能性があります。`);
