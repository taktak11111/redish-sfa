// CSVファイルとデータベースの不整合を網羅的にリストアップするスクリプト
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

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

async function main() {
  console.log('CSVファイルを読み込んでいます...');
  
  const csvText = fs.readFileSync(
    'C:/Users/takta/Downloads/Ver2.0_セールス管理統合シート - 架電管理表 (5).csv',
    'utf-8'
  );
  
  const rows = parseCSV(csvText);
  console.log(`総行数: ${rows.length}`);
  
  // 正しい列インデックス（OC0280の解析結果に基づく）
  const colIndex = {
    leadId: 1,        // B: リードID
    leadSource: 2,    // C: リードソース
    linkedDate: 3,    // D: 連携日
    staffIs: 22,      // V: 担当IS
    statusIs: 23,     // W: ISステータス
    statusUpdateDate: 24, // X: ステータス更新日
    resultContactStatus: 27, // AA: 結果/コンタクト状況
    lastCalledDate: 28, // BA: 直近架電日
    callCount: 29,    // CA: 架電数カウント
  };
  
  const dataRows = rows.slice(8); // 9行目以降がデータ
  console.log(`データ行数: ${dataRows.length}`);
  
  // 不整合レコードを格納
  const mismatches = {
    omcNotCalled: [],           // OMCリードで未架電
    temposNotCalled: [],        // TEMPOSリードで未架電（直近7日以外）
    statusMismatch: [],         // status_isとstatusの不一致
    callCountMismatch: [],      // call_countの不一致
    resultContactMismatch: [],  // result_contact_statusの不一致
    staffMismatch: [],          // staff_isの不一致
    lastCalledDateMismatch: [], // last_called_dateの不一致
  };
  
  let processed = 0;
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const leadId = row[colIndex.leadId]?.trim();
    const leadSource = row[colIndex.leadSource]?.trim();
    
    if (!leadId || leadId === '') continue;
    
    processed++;
    if (processed % 500 === 0) {
      console.log(`処理中: ${processed}/${dataRows.length}`);
    }
    
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
    
    // データベースから既存レコードを取得
    const { data: existing, error: fetchError } = await supabase
      .from('call_records')
      .select('lead_id, status, status_is, call_count, result_contact_status, staff_is, call_status_today, last_called_date, linked_date')
      .eq('lead_id', leadId)
      .single();
    
    if (fetchError || !existing) {
      continue;
    }
    
    // 不整合チェック
    
    // 1. OMCリードで未架電
    if (leadSource === 'OMC' && existing.status === '未架電') {
      mismatches.omcNotCalled.push({
        leadId,
        csv: csvData,
        db: {
          status: existing.status,
          status_is: existing.status_is,
          call_count: existing.call_count,
          result_contact_status: existing.result_contact_status,
          staff_is: existing.staff_is,
        },
      });
    }
    
    // 2. TEMPOSリードで未架電（直近7日以外）
    if (leadSource === 'TEMPOS' && existing.status === '未架電') {
      const linkedDate = existing.linked_date ? new Date(existing.linked_date) : null;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (!linkedDate || linkedDate < sevenDaysAgo) {
        mismatches.temposNotCalled.push({
          leadId,
          csv: csvData,
          db: {
            status: existing.status,
            status_is: existing.status_is,
            call_count: existing.call_count,
            result_contact_status: existing.result_contact_status,
            staff_is: existing.staff_is,
            linked_date: existing.linked_date,
          },
        });
      }
    }
    
    // 3. status_isの不一致
    if (csvData.statusIs && csvData.statusIs !== existing.status_is) {
      mismatches.statusMismatch.push({
        leadId,
        leadSource,
        csv: { status_is: csvData.statusIs },
        db: { status_is: existing.status_is },
      });
    }
    
    // 4. call_countの不一致
    if (csvData.callCount !== null && csvData.callCount !== existing.call_count) {
      mismatches.callCountMismatch.push({
        leadId,
        leadSource,
        csv: { call_count: csvData.callCount },
        db: { call_count: existing.call_count },
      });
    }
    
    // 5. result_contact_statusの不一致
    if (csvData.resultContactStatus && csvData.resultContactStatus !== existing.result_contact_status) {
      mismatches.resultContactMismatch.push({
        leadId,
        leadSource,
        csv: { result_contact_status: csvData.resultContactStatus },
        db: { result_contact_status: existing.result_contact_status },
      });
    }
    
    // 6. staff_isの不一致
    if (csvData.staffIs && csvData.staffIs !== existing.staff_is) {
      mismatches.staffMismatch.push({
        leadId,
        leadSource,
        csv: { staff_is: csvData.staffIs },
        db: { staff_is: existing.staff_is },
      });
    }
    
    // 7. last_called_dateの不一致
    if (csvData.lastCalledDate && csvData.lastCalledDate !== existing.last_called_date) {
      mismatches.lastCalledDateMismatch.push({
        leadId,
        leadSource,
        csv: { last_called_date: csvData.lastCalledDate },
        db: { last_called_date: existing.last_called_date },
      });
    }
  }
  
  console.log('\n=== 不整合レポート ===\n');
  
  console.log(`1. OMCリードで未架電: ${mismatches.omcNotCalled.length}件`);
  mismatches.omcNotCalled.slice(0, 20).forEach(m => {
    console.log(`  ${m.leadId}: CSV[status_is=${m.csv.statusIs}, call_count=${m.csv.callCount}, result=${m.csv.resultContactStatus}] vs DB[status=${m.db.status}, status_is=${m.db.status_is}, call_count=${m.db.call_count}]`);
  });
  if (mismatches.omcNotCalled.length > 20) {
    console.log(`  ... 他${mismatches.omcNotCalled.length - 20}件`);
  }
  
  console.log(`\n2. TEMPOSリードで未架電（直近7日以外）: ${mismatches.temposNotCalled.length}件`);
  mismatches.temposNotCalled.slice(0, 20).forEach(m => {
    console.log(`  ${m.leadId}: CSV[status_is=${m.csv.statusIs}, call_count=${m.csv.callCount}, result=${m.csv.resultContactStatus}] vs DB[status=${m.db.status}, status_is=${m.db.status_is}, call_count=${m.db.call_count}]`);
  });
  if (mismatches.temposNotCalled.length > 20) {
    console.log(`  ... 他${mismatches.temposNotCalled.length - 20}件`);
  }
  
  console.log(`\n3. status_isの不一致: ${mismatches.statusMismatch.length}件`);
  mismatches.statusMismatch.slice(0, 20).forEach(m => {
    console.log(`  ${m.leadId} (${m.leadSource}): CSV[${m.csv.status_is}] vs DB[${m.db.status_is}]`);
  });
  if (mismatches.statusMismatch.length > 20) {
    console.log(`  ... 他${mismatches.statusMismatch.length - 20}件`);
  }
  
  console.log(`\n4. call_countの不一致: ${mismatches.callCountMismatch.length}件`);
  mismatches.callCountMismatch.slice(0, 20).forEach(m => {
    console.log(`  ${m.leadId} (${m.leadSource}): CSV[${m.csv.call_count}] vs DB[${m.db.call_count}]`);
  });
  if (mismatches.callCountMismatch.length > 20) {
    console.log(`  ... 他${mismatches.callCountMismatch.length - 20}件`);
  }
  
  console.log(`\n5. result_contact_statusの不一致: ${mismatches.resultContactMismatch.length}件`);
  mismatches.resultContactMismatch.slice(0, 20).forEach(m => {
    console.log(`  ${m.leadId} (${m.leadSource}): CSV[${m.csv.result_contact_status}] vs DB[${m.db.result_contact_status}]`);
  });
  if (mismatches.resultContactMismatch.length > 20) {
    console.log(`  ... 他${mismatches.resultContactMismatch.length - 20}件`);
  }
  
  console.log(`\n6. staff_isの不一致: ${mismatches.staffMismatch.length}件`);
  mismatches.staffMismatch.slice(0, 20).forEach(m => {
    console.log(`  ${m.leadId} (${m.leadSource}): CSV[${m.csv.staff_is}] vs DB[${m.db.staff_is}]`);
  });
  if (mismatches.staffMismatch.length > 20) {
    console.log(`  ... 他${mismatches.staffMismatch.length - 20}件`);
  }
  
  console.log(`\n7. last_called_dateの不一致: ${mismatches.lastCalledDateMismatch.length}件`);
  mismatches.lastCalledDateMismatch.slice(0, 20).forEach(m => {
    console.log(`  ${m.leadId} (${m.leadSource}): CSV[${m.csv.last_called_date}] vs DB[${m.db.last_called_date}]`);
  });
  if (mismatches.lastCalledDateMismatch.length > 20) {
    console.log(`  ... 他${mismatches.lastCalledDateMismatch.length - 20}件`);
  }
  
  // サマリー
  console.log('\n=== サマリー ===');
  console.log(`総不整合件数: ${mismatches.omcNotCalled.length + mismatches.temposNotCalled.length + mismatches.statusMismatch.length + mismatches.callCountMismatch.length + mismatches.resultContactMismatch.length + mismatches.staffMismatch.length + mismatches.lastCalledDateMismatch.length}件`);
  console.log(`- OMCリードで未架電: ${mismatches.omcNotCalled.length}件`);
  console.log(`- TEMPOSリードで未架電（直近7日以外）: ${mismatches.temposNotCalled.length}件`);
  console.log(`- status_isの不一致: ${mismatches.statusMismatch.length}件`);
  console.log(`- call_countの不一致: ${mismatches.callCountMismatch.length}件`);
  console.log(`- result_contact_statusの不一致: ${mismatches.resultContactMismatch.length}件`);
  console.log(`- staff_isの不一致: ${mismatches.staffMismatch.length}件`);
  console.log(`- last_called_dateの不一致: ${mismatches.lastCalledDateMismatch.length}件`);
}

main().catch(console.error);
