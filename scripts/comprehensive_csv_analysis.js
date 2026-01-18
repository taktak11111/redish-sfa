// CSVファイルとデータベースの不整合を包括的に分析するスクリプト
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
  
  // ヘッダー行は8行目（インデックス7）
  const headerRow = rows[7];
  console.log('\nヘッダー行（最初の35列）:');
  headerRow.slice(0, 35).forEach((header, index) => {
    const colLetter = index === 0 ? 'A' : String.fromCharCode(65 + ((index - 1) % 26)) + (index > 26 ? String.fromCharCode(65 + Math.floor((index - 1) / 26) - 1) : '');
    console.log(`  ${colLetter} (${index}): ${header}`);
  });
  
  // CSVファイルの構造: 最初の列（インデックス0）は空、実際のデータはインデックス1から
  // したがって、列のインデックスは1つずれる
  const colIndex = {
    leadId: 1,        // B: リードID（実際はインデックス1）
    leadSource: 2,    // C: リードソース（実際はインデックス2）
    linkedDate: 3,    // D: 連携日
    industry: 4,      // E: 業種
    companyName: 5,   // F: 会社名/店舗名
    contactName: 6,   // G: 氏名
    contactNameKana: 7, // H: ふりがな
    phone: 8,         // I: 電話番号
    email: 9,         // J: メールアドレス
    address: 10,      // K: 住所／エリア
    openingDateOriginal: 11, // L: 開業時期
    contactPreferredDateTime: 12, // M: 連絡希望日時
    allianceRemarks: 13, // N: 連携元備考
    staffIs: 23,      // W: 担当IS（実際はインデックス23）
    statusIs: 24,     // X: ISステータス（実際はインデックス24）
    statusUpdateDate: 25, // Y: ステータス更新日
    resultContactStatus: 28, // AB: 結果/コンタクト状況（実際はインデックス28）
    lastCalledDate: 29, // AC: 直近架電日（実際はインデックス29）
    callCount: 30,    // AD: 架電数カウント（実際はインデックス30）
  };
  
  const dataRows = rows.slice(8); // 9行目以降がデータ
  console.log(`\nデータ行数: ${dataRows.length}`);
  
  // OMCリードの分析
  const omcMismatches = [];
  const temposMismatches = [];
  
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
        omcMismatches.push(csvData);
      }
    } else if (leadSource === 'TEMPOS') {
      // TEMPOSリードは直近7日以外は必ず架電されているはず
      const linkedDate = csvData.linkedDate ? new Date(csvData.linkedDate) : null;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if ((!linkedDate || linkedDate < sevenDaysAgo) && (!csvData.statusIs || csvData.statusIs === '未架電' || !csvData.resultContactStatus || csvData.callCount === 0 || csvData.callCount === null)) {
        temposMismatches.push(csvData);
      }
    }
  }
  
  console.log(`\n=== OMCリードで未架電の可能性があるレコード: ${omcMismatches.length}件 ===`);
  omcMismatches.slice(0, 30).forEach(record => {
    console.log(`\n${record.leadId}:`);
    console.log(`  担当IS: ${record.staffIs || '(空)'}`);
    console.log(`  ISステータス: ${record.statusIs || '(空)'}`);
    console.log(`  結果/コンタクト状況: ${record.resultContactStatus || '(空)'}`);
    console.log(`  架電数カウント: ${record.callCount !== null ? record.callCount : '(空)'}`);
    console.log(`  直近架電日: ${record.lastCalledDate || '(空)'}`);
  });
  
  console.log(`\n=== TEMPOSリードで未架電の可能性があるレコード（直近7日以外）: ${temposMismatches.length}件 ===`);
  temposMismatches.slice(0, 30).forEach(record => {
    console.log(`\n${record.leadId}:`);
    console.log(`  連携日: ${record.linkedDate || '(空)'}`);
    console.log(`  担当IS: ${record.staffIs || '(空)'}`);
    console.log(`  ISステータス: ${record.statusIs || '(空)'}`);
    console.log(`  結果/コンタクト状況: ${record.resultContactStatus || '(空)'}`);
    console.log(`  架電数カウント: ${record.callCount !== null ? record.callCount : '(空)'}`);
    console.log(`  直近架電日: ${record.lastCalledDate || '(空)'}`);
  });
  
  // OC0280の詳細確認
  console.log(`\n=== OC0280の詳細確認 ===`);
  const oc0280Row = dataRows.find(row => row[colIndex.leadId]?.trim() === 'OC0280');
  if (oc0280Row) {
    console.log(`リードID: ${oc0280Row[colIndex.leadId]}`);
    console.log(`リードソース: ${oc0280Row[colIndex.leadSource]}`);
    console.log(`担当IS (W列, インデックス23): ${oc0280Row[23] || '(空)'}`);
    console.log(`ISステータス (X列, インデックス24): ${oc0280Row[24] || '(空)'}`);
    console.log(`ステータス更新日 (Y列, インデックス25): ${oc0280Row[25] || '(空)'}`);
    console.log(`結果/コンタクト状況 (AB列, インデックス28): ${oc0280Row[28] || '(空)'}`);
    console.log(`直近架電日 (AC列, インデックス29): ${oc0280Row[29] || '(空)'}`);
    console.log(`架電数カウント (AD列, インデックス30): ${oc0280Row[30] || '(空)'}`);
  } else {
    console.log('OC0280が見つかりませんでした');
  }
  
  // サマリー
  console.log(`\n=== サマリー ===`);
  console.log(`OMCリードで未架電の可能性があるレコード: ${omcMismatches.length}件`);
  console.log(`TEMPOSリードで未架電の可能性があるレコード（直近7日以外）: ${temposMismatches.length}件`);
}

main();
