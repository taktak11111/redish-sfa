// CSVファイルから不整合をリストアップするスクリプト（DB接続不要）
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
    omcNotCalled: [],           // OMCリードで未架電の可能性
    temposNotCalled: [],        // TEMPOSリードで未架電の可能性（直近7日以外）
    omcEmptyData: [],           // OMCリードでデータが空
    temposEmptyData: [],        // TEMPOSリードでデータが空（直近7日以外）
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
      // OMCリードは必ず架電されているはず
      if (!csvData.statusIs || csvData.statusIs === '未架電' || !csvData.resultContactStatus || csvData.callCount === 0 || csvData.callCount === null) {
        mismatches.omcNotCalled.push(csvData);
      }
      // データが空のケース
      if (!csvData.statusIs && !csvData.resultContactStatus && csvData.callCount === null) {
        mismatches.omcEmptyData.push(csvData);
      }
    } else if (leadSource === 'TEMPOS') {
      // TEMPOSリードは直近7日以外は必ず架電されているはず
      const linkedDate = csvData.linkedDate ? new Date(csvData.linkedDate) : null;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if ((!linkedDate || linkedDate < sevenDaysAgo) && (!csvData.statusIs || csvData.statusIs === '未架電' || !csvData.resultContactStatus || csvData.callCount === 0 || csvData.callCount === null)) {
        mismatches.temposNotCalled.push(csvData);
      }
      // データが空のケース
      if ((!linkedDate || linkedDate < sevenDaysAgo) && !csvData.statusIs && !csvData.resultContactStatus && csvData.callCount === null) {
        mismatches.temposEmptyData.push(csvData);
      }
    }
  }
  
  console.log('\n=== CSVファイル内の不整合レポート ===\n');
  
  console.log(`1. OMCリードで未架電の可能性があるレコード: ${mismatches.omcNotCalled.length}件`);
  mismatches.omcNotCalled.slice(0, 30).forEach(m => {
    console.log(`  ${m.leadId}: status_is=${m.statusIs || '(空)'}, call_count=${m.callCount !== null ? m.callCount : '(空)'}, result=${m.resultContactStatus || '(空)'}, staff_is=${m.staffIs || '(空)'}`);
  });
  if (mismatches.omcNotCalled.length > 30) {
    console.log(`  ... 他${mismatches.omcNotCalled.length - 30}件`);
  }
  
  console.log(`\n2. TEMPOSリードで未架電の可能性があるレコード（直近7日以外）: ${mismatches.temposNotCalled.length}件`);
  mismatches.temposNotCalled.slice(0, 30).forEach(m => {
    console.log(`  ${m.leadId}: linked_date=${m.linkedDate || '(空)'}, status_is=${m.statusIs || '(空)'}, call_count=${m.callCount !== null ? m.callCount : '(空)'}, result=${m.resultContactStatus || '(空)'}, staff_is=${m.staffIs || '(空)'}`);
  });
  if (mismatches.temposNotCalled.length > 30) {
    console.log(`  ... 他${mismatches.temposNotCalled.length - 30}件`);
  }
  
  console.log(`\n3. OMCリードでデータが空のレコード: ${mismatches.omcEmptyData.length}件`);
  mismatches.omcEmptyData.slice(0, 20).forEach(m => {
    console.log(`  ${m.leadId}`);
  });
  if (mismatches.omcEmptyData.length > 20) {
    console.log(`  ... 他${mismatches.omcEmptyData.length - 20}件`);
  }
  
  console.log(`\n4. TEMPOSリードでデータが空のレコード（直近7日以外）: ${mismatches.temposEmptyData.length}件`);
  mismatches.temposEmptyData.slice(0, 20).forEach(m => {
    console.log(`  ${m.leadId}: linked_date=${m.linkedDate || '(空)'}`);
  });
  if (mismatches.temposEmptyData.length > 20) {
    console.log(`  ... 他${mismatches.temposEmptyData.length - 20}件`);
  }
  
  // サマリー
  console.log('\n=== サマリー ===');
  console.log(`OMCリードで未架電の可能性: ${mismatches.omcNotCalled.length}件`);
  console.log(`TEMPOSリードで未架電の可能性（直近7日以外）: ${mismatches.temposNotCalled.length}件`);
  console.log(`OMCリードでデータが空: ${mismatches.omcEmptyData.length}件`);
  console.log(`TEMPOSリードでデータが空（直近7日以外）: ${mismatches.temposEmptyData.length}件`);
}

main();
