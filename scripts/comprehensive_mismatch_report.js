// CSVファイルとデータベースの不整合を網羅的にリストアップするスクリプト
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

// 日付文字列をYYYY-MM-DD形式に変換
function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  const match = dateStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return null;
}

function main() {
  console.log('CSVファイルを読み込んでいます...');
  
  const csvText = fs.readFileSync(
    'C:/Users/takta/Downloads/Ver2.0_セールス管理統合シート - 架電管理表 (5).csv',
    'utf-8'
  );
  
  const rows = parseCSV(csvText);
  console.log(`総行数: ${rows.length}`);
  
  // 正しい列インデックス（OC0280の解析結果に基づく）
  // A列が空白のため、CSVのインデックスは実際の列より1つずれている
  const colIndex = {
    leadId: 1,        // B: リードID
    leadSource: 2,    // C: リードソース
    linkedDate: 3,    // D: 連携日
    staffIs: 22,      // W: 担当IS（画像確認済み）
    statusIs: 23,     // X: ISステータス
    statusUpdateDate: 24, // Y: ステータス更新日
    resultContactStatus: 27, // AB: 結果/コンタクト状況
    lastCalledDate: 28, // AC: 直近架電日
    callCount: 29,    // AD: 架電数カウント
  };
  
  const dataRows = rows.slice(8); // 9行目以降がデータ
  console.log(`データ行数: ${dataRows.length}`);
  
  // 不整合レコードを格納
  const mismatches = {
    omcNotCalled: [],           // OMCリードで未架電の可能性（CSVにデータがあるのにDBが未架電）
    omcEmptyInCsv: [],          // OMCリードでCSVにデータが空
    temposNotCalled: [],        // TEMPOSリードで未架電の可能性（直近7日以外、CSVにデータがあるのにDBが未架電）
    temposEmptyInCsv: [],       // TEMPOSリードでCSVにデータが空（直近7日以外）
  };
  
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
    
    if (leadSource === 'OMC') {
      // CSVにデータがあるのに、未架電の可能性がある
      if (csvData.statusIs && csvData.statusIs !== '未架電' && (csvData.resultContactStatus || csvData.callCount !== null)) {
        mismatches.omcNotCalled.push(csvData);
      }
      // CSVにデータが空
      if (!csvData.statusIs && !csvData.resultContactStatus && csvData.callCount === null) {
        mismatches.omcEmptyInCsv.push(csvData);
      }
    } else if (leadSource === 'TEMPOS') {
      // TEMPOSリードは直近7日以外は必ず架電されているはず
      const linkedDate = csvData.linkedDate ? new Date(csvData.linkedDate) : null;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (!linkedDate || linkedDate < sevenDaysAgo) {
        // CSVにデータがあるのに、未架電の可能性がある
        if (csvData.statusIs && csvData.statusIs !== '未架電' && (csvData.resultContactStatus || csvData.callCount !== null)) {
          mismatches.temposNotCalled.push(csvData);
        }
        // CSVにデータが空
        if (!csvData.statusIs && !csvData.resultContactStatus && csvData.callCount === null) {
          mismatches.temposEmptyInCsv.push(csvData);
        }
      }
    }
  }
  
  console.log('\n=== CSVファイルとデータベースの不整合レポート ===\n');
  
  console.log(`【カテゴリ1】OMCリードでCSVにデータがあるのにDBが未架電の可能性: ${mismatches.omcNotCalled.length}件`);
  mismatches.omcNotCalled.slice(0, 30).forEach(m => {
    console.log(`  ${m.leadId}: CSV[status_is=${m.statusIs}, call_count=${m.callCount !== null ? m.callCount : '(空)'}, result=${m.resultContactStatus || '(空)'}, staff_is=${m.staffIs || '(空)'}]`);
  });
  if (mismatches.omcNotCalled.length > 30) {
    console.log(`  ... 他${mismatches.omcNotCalled.length - 30}件`);
  }
  
  console.log(`\n【カテゴリ2】OMCリードでCSVにデータが空: ${mismatches.omcEmptyInCsv.length}件`);
  console.log(`  これらのレコードは、CSVファイルに架電データが入力されていません。`);
  mismatches.omcEmptyInCsv.slice(0, 30).forEach(m => {
    console.log(`  ${m.leadId}`);
  });
  if (mismatches.omcEmptyInCsv.length > 30) {
    console.log(`  ... 他${mismatches.omcEmptyInCsv.length - 30}件`);
  }
  
  console.log(`\n【カテゴリ3】TEMPOSリードでCSVにデータがあるのにDBが未架電の可能性（直近7日以外）: ${mismatches.temposNotCalled.length}件`);
  mismatches.temposNotCalled.slice(0, 30).forEach(m => {
    console.log(`  ${m.leadId}: linked_date=${m.linkedDate || '(空)'}, CSV[status_is=${m.statusIs}, call_count=${m.callCount !== null ? m.callCount : '(空)'}, result=${m.resultContactStatus || '(空)'}, staff_is=${m.staffIs || '(空)'}]`);
  });
  if (mismatches.temposNotCalled.length > 30) {
    console.log(`  ... 他${mismatches.temposNotCalled.length - 30}件`);
  }
  
  console.log(`\n【カテゴリ4】TEMPOSリードでCSVにデータが空（直近7日以外）: ${mismatches.temposEmptyInCsv.length}件`);
  console.log(`  これらのレコードは、CSVファイルに架電データが入力されていません。`);
  mismatches.temposEmptyInCsv.slice(0, 30).forEach(m => {
    console.log(`  ${m.leadId}: linked_date=${m.linkedDate || '(空)'}`);
  });
  if (mismatches.temposEmptyInCsv.length > 30) {
    console.log(`  ... 他${mismatches.temposEmptyInCsv.length - 30}件`);
  }
  
  // サマリー
  console.log('\n=== サマリー ===');
  console.log(`【修正が必要】OMCリードでCSVにデータがあるのにDBが未架電: ${mismatches.omcNotCalled.length}件`);
  console.log(`【要確認】OMCリードでCSVにデータが空: ${mismatches.omcEmptyInCsv.length}件`);
  console.log(`【修正が必要】TEMPOSリードでCSVにデータがあるのにDBが未架電（直近7日以外）: ${mismatches.temposNotCalled.length}件`);
  console.log(`【要確認】TEMPOSリードでCSVにデータが空（直近7日以外）: ${mismatches.temposEmptyInCsv.length}件`);
}

main();
