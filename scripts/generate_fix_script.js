// CSVファイルとデータベースの不整合を修正するSQLスクリプトを生成
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

// SQL文字列をエスケープ
function escapeSQL(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
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
    inferred.callCount = csvData.callCount || 1;
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
  
  // 修正SQLを格納
  const updateStatements = [];
  const updateStatementsWithInference = [];
  
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
    
    // 商談獲得のステータスを除外（修正対象外）
    const isDealWon = csvData.statusIs && (
      csvData.statusIs.includes('アポイント獲得済') ||
      csvData.statusIs.includes('アポ獲得') ||
      csvData.statusIs === '03.アポイント獲得済' ||
      csvData.statusIs === '09.アポ獲得'
    );
    
    if (isDealWon) {
      // 商談獲得のレコードは修正対象外
      continue;
    }
    
    // 明示的なデータがある場合の修正SQL（未架電のレコードのみ）
    if (leadSource === 'OMC') {
      // CSVに明示的なデータがあるのに、DBが未架電の可能性がある
      if (csvData.statusIs && csvData.statusIs !== '未架電' && (csvData.resultContactStatus || csvData.callCount !== null)) {
        const updates = [];
        if (csvData.statusIs) updates.push(`status_is = ${escapeSQL(csvData.statusIs)}`);
        if (csvData.resultContactStatus) updates.push(`result_contact_status = ${escapeSQL(csvData.resultContactStatus)}`);
        if (csvData.callCount !== null) updates.push(`call_count = ${csvData.callCount}`);
        if (csvData.lastCalledDate) updates.push(`last_called_date = ${escapeSQL(csvData.lastCalledDate)}`);
        if (csvData.staffIs) updates.push(`staff_is = ${escapeSQL(csvData.staffIs)}`);
        updates.push(`status = '架電中'`); // 未架電から架電中に変更
        
        if (updates.length > 0) {
          updateStatements.push(`-- ${leadId}: CSVに明示的なデータがある（未架電→架電済に修正）`);
          updateStatements.push(`UPDATE call_records SET ${updates.join(', ')}, updated_at = NOW() WHERE lead_id = ${escapeSQL(leadId)} AND status = '未架電';`);
        }
      }
      // 推測が必要なレコード（未架電のレコードのみ）
      else if (inferred.hasCalled && (!csvData.statusIs || !csvData.resultContactStatus || csvData.callCount === null)) {
        const updates = [];
        if (inferred.statusIs) updates.push(`status_is = ${escapeSQL(inferred.statusIs)}`);
        if (inferred.resultContactStatus) updates.push(`result_contact_status = ${escapeSQL(inferred.resultContactStatus)}`);
        if (inferred.callCount !== null) updates.push(`call_count = ${inferred.callCount}`);
        if (csvData.lastCalledDate) updates.push(`last_called_date = ${escapeSQL(csvData.lastCalledDate)}`);
        if (csvData.staffIs) updates.push(`staff_is = ${escapeSQL(csvData.staffIs)}`);
        updates.push(`status = '架電中'`); // 未架電から架電中に変更
        
        if (updates.length > 0) {
          updateStatementsWithInference.push(`-- ${leadId}: 推測ロジック適用 (${inferred.reasoning.join(', ')})（未架電→架電済に修正）`);
          updateStatementsWithInference.push(`UPDATE call_records SET ${updates.join(', ')}, updated_at = NOW() WHERE lead_id = ${escapeSQL(leadId)} AND status = '未架電';`);
        }
      }
    } else if (leadSource === 'TEMPOS') {
      const linkedDate = csvData.linkedDate ? new Date(csvData.linkedDate) : null;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (!linkedDate || linkedDate < sevenDaysAgo) {
        // CSVに明示的なデータがあるのに、DBが未架電の可能性がある
        if (csvData.statusIs && csvData.statusIs !== '未架電' && (csvData.resultContactStatus || csvData.callCount !== null)) {
          const updates = [];
          if (csvData.statusIs) updates.push(`status_is = ${escapeSQL(csvData.statusIs)}`);
          if (csvData.resultContactStatus) updates.push(`result_contact_status = ${escapeSQL(csvData.resultContactStatus)}`);
          if (csvData.callCount !== null) updates.push(`call_count = ${csvData.callCount}`);
          if (csvData.lastCalledDate) updates.push(`last_called_date = ${escapeSQL(csvData.lastCalledDate)}`);
          if (csvData.staffIs) updates.push(`staff_is = ${escapeSQL(csvData.staffIs)}`);
          updates.push(`status = '架電中'`); // 未架電から架電中に変更
          
          if (updates.length > 0) {
            updateStatements.push(`-- ${leadId}: CSVに明示的なデータがある（未架電→架電済に修正、連携日: ${csvData.linkedDate || '(空)'}）`);
            updateStatements.push(`UPDATE call_records SET ${updates.join(', ')}, updated_at = NOW() WHERE lead_id = ${escapeSQL(leadId)} AND status = '未架電';`);
          }
        }
        // 推測が必要なレコード（未架電のレコードのみ）
        else if (inferred.hasCalled && (!csvData.statusIs || !csvData.resultContactStatus || csvData.callCount === null)) {
          const updates = [];
          if (inferred.statusIs) updates.push(`status_is = ${escapeSQL(inferred.statusIs)}`);
          if (inferred.resultContactStatus) updates.push(`result_contact_status = ${escapeSQL(inferred.resultContactStatus)}`);
          if (inferred.callCount !== null) updates.push(`call_count = ${inferred.callCount}`);
          if (csvData.lastCalledDate) updates.push(`last_called_date = ${escapeSQL(csvData.lastCalledDate)}`);
          if (csvData.staffIs) updates.push(`staff_is = ${escapeSQL(csvData.staffIs)}`);
          updates.push(`status = '架電中'`); // 未架電から架電中に変更
          
          if (updates.length > 0) {
            updateStatementsWithInference.push(`-- ${leadId}: 推測ロジック適用 (${inferred.reasoning.join(', ')})（未架電→架電済に修正、連携日: ${csvData.linkedDate || '(空)'}）`);
            updateStatementsWithInference.push(`UPDATE call_records SET ${updates.join(', ')}, updated_at = NOW() WHERE lead_id = ${escapeSQL(leadId)} AND status = '未架電';`);
          }
        }
      }
    }
  }
  
  // SQLファイルを生成
  const sqlContent = `-- CSVファイルとデータベースの不整合を修正するSQLスクリプト
-- 生成日時: ${new Date().toISOString()}
-- 総修正件数: ${updateStatements.length / 2}件（明示的なデータ）+ ${updateStatementsWithInference.length / 2}件（推測ロジック）

-- ============================================
-- カテゴリ1: CSVに明示的なデータがあるレコード
-- ============================================
-- 件数: ${updateStatements.length / 2}件

BEGIN;

${updateStatements.join('\n')}

-- ============================================
-- カテゴリ2: 推測ロジックを適用するレコード
-- ============================================
-- 件数: ${updateStatementsWithInference.length / 2}件

${updateStatementsWithInference.join('\n')}

COMMIT;

-- 修正後の確認クエリ
SELECT 
  lead_id,
  status,
  status_is,
  call_count,
  result_contact_status,
  staff_is,
  last_called_date,
  updated_at
FROM call_records
WHERE lead_id IN (
  ${[...new Set([...updateStatements.filter(s => s.startsWith('UPDATE')), ...updateStatementsWithInference.filter(s => s.startsWith('UPDATE'))].map(s => {
    const match = s.match(/lead_id = '([^']+)'/);
    return match ? match[1] : null;
  }).filter(Boolean))].map(id => `'${id}'`).join(',\n  ')}
)
ORDER BY lead_id;
`;

  const outputPath = 'C:/Users/takta/Documents/develop/REDISH_SFA/scripts/fix_all_mismatches.sql';
  fs.writeFileSync(outputPath, sqlContent, 'utf-8');
  
  console.log(`\n=== SQLスクリプト生成完了 ===`);
  console.log(`出力ファイル: ${outputPath}`);
  console.log(`明示的なデータがあるレコード: ${updateStatements.length / 2}件`);
  console.log(`推測ロジックを適用するレコード: ${updateStatementsWithInference.length / 2}件`);
  console.log(`総修正件数: ${(updateStatements.length + updateStatementsWithInference.length) / 2}件`);
}

main();
