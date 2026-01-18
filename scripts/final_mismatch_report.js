// CSVファイルとデータベースの不整合を網羅的にリストアップ（推測ロジック含む・最終版）
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

// データから推測するロジック（ユーザー指定の推測ロジック）
function inferCallData(csvData) {
  const inferred = {
    hasCalled: false,
    callCount: null,
    resultContactStatus: null,
    statusIs: null,
    reasoning: [],
  };
  
  // 1. 直近架電日が存在する → 必ず架電している
  if (csvData.lastCalledDate) {
    inferred.hasCalled = true;
    inferred.callCount = csvData.callCount || 1; // 推測: 少なくとも1回
    inferred.reasoning.push(`直近架電日(${csvData.lastCalledDate})が存在 → 必ず架電している`);
  }
  
  // 2. 会話メモが存在する → 架電して通電していると推測
  if (csvData.conversationMemo) {
    inferred.hasCalled = true;
    inferred.resultContactStatus = inferred.resultContactStatus || '通電';
    if (!inferred.callCount) {
      inferred.callCount = csvData.callCount || 1;
    }
    inferred.reasoning.push(`会話メモが存在 → 架電して通電していると推測`);
  }
  
  // 3. 対応不可/失注理由が存在する → 通電している可能性が極めて高い
  //    かつ、ステータスはほとんどのケースで失注になる
  if (csvData.reasonForUnavailability) {
    inferred.hasCalled = true;
    inferred.resultContactStatus = inferred.resultContactStatus || '通電';
    // 失注理由がある場合、ステータスは失注系と推測
    if (!csvData.statusIs || csvData.statusIs === '未架電') {
      inferred.statusIs = '04.失注'; // デフォルトは失注
    } else {
      inferred.statusIs = csvData.statusIs;
    }
    if (!inferred.callCount) {
      inferred.callCount = csvData.callCount || 1;
    }
    inferred.reasoning.push(`対応不可/失注理由(${csvData.reasonForUnavailability})が存在 → 通電している可能性が極めて高い`);
  }
  
  // 4. ISステータスが存在する → 架電している
  if (csvData.statusIs && csvData.statusIs !== '未架電') {
    inferred.hasCalled = true;
    inferred.statusIs = csvData.statusIs;
    if (!inferred.callCount) {
      inferred.callCount = csvData.callCount || 1;
    }
    inferred.reasoning.push(`ISステータス(${csvData.statusIs})が存在`);
  }
  
  // 5. 結果/コンタクト状況が存在する → 架電している
  if (csvData.resultContactStatus) {
    inferred.hasCalled = true;
    inferred.resultContactStatus = csvData.resultContactStatus;
    if (!inferred.callCount) {
      inferred.callCount = csvData.callCount || 1;
    }
    inferred.reasoning.push(`結果/コンタクト状況(${csvData.resultContactStatus})が存在`);
  }
  
  // 6. 担当ISが存在する → 架電している可能性が高い（OMC/TEMPOSの場合）
  if (csvData.staffIs) {
    if (csvData.leadSource === 'OMC' || csvData.leadSource === 'TEMPOS') {
      inferred.hasCalled = true;
      if (!inferred.callCount) {
        inferred.callCount = csvData.callCount || 1;
      }
      inferred.reasoning.push(`担当IS(${csvData.staffIs})が存在`);
    }
  }
  
  return inferred;
}

function main() {
  console.log('CSVファイルを読み込んでいます...');
  
  const csvText = fs.readFileSync(
    'C:/Users/takta/Downloads/Ver2.0_セールス管理統合シート - 架電管理表 (5).csv',
    'utf-8'
  );
  
  const rows = parseCSV(csvText);
  console.log(`総行数: ${rows.length}`);
  
  // 列マッピング（OC0280のデータから確認）
  const colIndex = {
    leadId: 1,        // B: リードID
    leadSource: 2,    // C: リードソース
    linkedDate: 3,    // D: 連携日
    staffIs: 22,      // W: 担当IS
    statusIs: 23,     // X: ISステータス
    statusUpdateDate: 24, // Y: ステータス更新日
    reasonForUnavailability: 25, // Z: 対応不可/失注理由
    resultContactStatus: 27, // AB: 結果/コンタクト状況
    lastCalledDate: 28, // AC: 直近架電日
    callCount: 29,    // AD: 架電数カウント
    conversationMemo: 31, // AF: 会話メモ・その他
  };
  
  const dataRows = rows.slice(8);
  console.log(`データ行数: ${dataRows.length}`);
  
  // 不整合レコードを格納
  const mismatches = {
    omcNotCalled: [],           // OMCリードで未架電の可能性（CSVに明示的なデータがあるのにDBが未架電）
    omcNeedsInference: [],      // OMCリードで推測が必要なレコード
    temposNotCalled: [],        // TEMPOSリードで未架電の可能性（直近7日以外、CSVに明示的なデータがあるのにDBが未架電）
    temposNeedsInference: [],  // TEMPOSリードで推測が必要なレコード
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
      reasonForUnavailability: row[colIndex.reasonForUnavailability]?.trim() || null,
      resultContactStatus: row[colIndex.resultContactStatus]?.trim() || null,
      lastCalledDate: parseDate(row[colIndex.lastCalledDate]?.trim()),
      callCount: row[colIndex.callCount]?.trim() ? parseInt(row[colIndex.callCount].trim(), 10) : null,
      linkedDate: parseDate(row[colIndex.linkedDate]?.trim()),
      conversationMemo: row[colIndex.conversationMemo]?.trim() || null,
    };
    
    // 推測ロジックを適用
    const inferred = inferCallData(csvData);
    
    if (leadSource === 'OMC') {
      // CSVに明示的なデータがあるのに、未架電の可能性がある
      if (csvData.statusIs && csvData.statusIs !== '未架電' && (csvData.resultContactStatus || csvData.callCount !== null)) {
        mismatches.omcNotCalled.push({ ...csvData, inferred });
      }
      // 推測が必要なレコード（明示的なデータはないが、他のデータから推測できる）
      else if (inferred.hasCalled && (!csvData.statusIs || !csvData.resultContactStatus || csvData.callCount === null)) {
        mismatches.omcNeedsInference.push({ ...csvData, inferred });
      }
    } else if (leadSource === 'TEMPOS') {
      const linkedDate = csvData.linkedDate ? new Date(csvData.linkedDate) : null;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (!linkedDate || linkedDate < sevenDaysAgo) {
        // CSVに明示的なデータがあるのに、未架電の可能性がある
        if (csvData.statusIs && csvData.statusIs !== '未架電' && (csvData.resultContactStatus || csvData.callCount !== null)) {
          mismatches.temposNotCalled.push({ ...csvData, inferred });
        }
        // 推測が必要なレコード
        else if (inferred.hasCalled && (!csvData.statusIs || !csvData.resultContactStatus || csvData.callCount === null)) {
          mismatches.temposNeedsInference.push({ ...csvData, inferred });
        }
      }
    }
  }
  
  console.log('\n=== CSVファイルとデータベースの不整合レポート（推測ロジック含む）===\n');
  
  console.log(`【カテゴリ1】OMCリードでCSVに明示的なデータがあるのにDBが未架電: ${mismatches.omcNotCalled.length}件`);
  console.log('  これらのレコードは、CSVファイルに明示的な架電データ（ISステータス、結果/コンタクト状況、架電数カウント）があるのに、');
  console.log('  データベースでは「未架電」になっています。\n');
  mismatches.omcNotCalled.slice(0, 20).forEach(m => {
    console.log(`  ${m.leadId}: CSV[status_is=${m.statusIs}, call_count=${m.callCount !== null ? m.callCount : '(空)'}, result=${m.resultContactStatus || '(空)'}, staff_is=${m.staffIs || '(空)'}]`);
  });
  if (mismatches.omcNotCalled.length > 20) {
    console.log(`  ... 他${mismatches.omcNotCalled.length - 20}件`);
  }
  
  console.log(`\n【カテゴリ2】OMCリードで推測が必要なレコード: ${mismatches.omcNeedsInference.length}件`);
  console.log('  これらのレコードは、CSVファイルに明示的な架電データはありませんが、');
  console.log('  他のデータ（直近架電日、会話メモ、対応不可/失注理由、担当IS等）から架電していると推測できます。\n');
  mismatches.omcNeedsInference.slice(0, 20).forEach(m => {
    console.log(`  ${m.leadId}:`);
    console.log(`    CSVデータ: status_is=${m.statusIs || '(空)'}, call_count=${m.callCount !== null ? m.callCount : '(空)'}, result=${m.resultContactStatus || '(空)'}`);
    console.log(`    推測根拠: ${m.inferred.reasoning.join(', ')}`);
    console.log(`    推測値: call_count=${m.inferred.callCount || '(推測不可)'}, result=${m.inferred.resultContactStatus || '(推測不可)'}, status_is=${m.inferred.statusIs || '(推測不可)'}`);
    console.log('');
  });
  if (mismatches.omcNeedsInference.length > 20) {
    console.log(`  ... 他${mismatches.omcNeedsInference.length - 20}件`);
  }
  
  console.log(`\n【カテゴリ3】TEMPOSリードでCSVに明示的なデータがあるのにDBが未架電（直近7日以外）: ${mismatches.temposNotCalled.length}件`);
  console.log('  これらのレコードは、CSVファイルに明示的な架電データがあるのに、');
  console.log('  データベースでは「未架電」になっています（連携日が7日以上前）。\n');
  mismatches.temposNotCalled.slice(0, 20).forEach(m => {
    console.log(`  ${m.leadId}: linked_date=${m.linkedDate || '(空)'}, CSV[status_is=${m.statusIs}, call_count=${m.callCount !== null ? m.callCount : '(空)'}, result=${m.resultContactStatus || '(空)'}, staff_is=${m.staffIs || '(空)'}]`);
  });
  if (mismatches.temposNotCalled.length > 20) {
    console.log(`  ... 他${mismatches.temposNotCalled.length - 20}件`);
  }
  
  console.log(`\n【カテゴリ4】TEMPOSリードで推測が必要なレコード（直近7日以外）: ${mismatches.temposNeedsInference.length}件`);
  console.log('  これらのレコードは、CSVファイルに明示的な架電データはありませんが、');
  console.log('  他のデータから架電していると推測できます（連携日が7日以上前）。\n');
  mismatches.temposNeedsInference.slice(0, 20).forEach(m => {
    console.log(`  ${m.leadId}:`);
    console.log(`    連携日: ${m.linkedDate || '(空)'}`);
    console.log(`    CSVデータ: status_is=${m.statusIs || '(空)'}, call_count=${m.callCount !== null ? m.callCount : '(空)'}, result=${m.resultContactStatus || '(空)'}`);
    console.log(`    推測根拠: ${m.inferred.reasoning.join(', ')}`);
    console.log(`    推測値: call_count=${m.inferred.callCount || '(推測不可)'}, result=${m.inferred.resultContactStatus || '(推測不可)'}, status_is=${m.inferred.statusIs || '(推測不可)'}`);
    console.log('');
  });
  if (mismatches.temposNeedsInference.length > 20) {
    console.log(`  ... 他${mismatches.temposNeedsInference.length - 20}件`);
  }
  
  // サマリー
  console.log('\n=== サマリー ===');
  console.log(`【修正が必要】OMCリードでCSVに明示的なデータがあるのにDBが未架電: ${mismatches.omcNotCalled.length}件`);
  console.log(`【推測が必要】OMCリードで推測が必要なレコード: ${mismatches.omcNeedsInference.length}件`);
  console.log(`【修正が必要】TEMPOSリードでCSVに明示的なデータがあるのにDBが未架電（直近7日以外）: ${mismatches.temposNotCalled.length}件`);
  console.log(`【推測が必要】TEMPOSリードで推測が必要なレコード（直近7日以外）: ${mismatches.temposNeedsInference.length}件`);
  console.log(`\n総不整合件数: ${mismatches.omcNotCalled.length + mismatches.omcNeedsInference.length + mismatches.temposNotCalled.length + mismatches.temposNeedsInference.length}件`);
}

main();
