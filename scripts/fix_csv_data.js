// CSVファイルからデータを読み込んで、データベースと比較し、不整合を修正するスクリプト
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
  // 2026/01/06形式を2026-01-06に変換
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
  
  // ヘッダー行は8行目（インデックス7）
  const headerRow = rows[7];
  console.log('ヘッダー行:', headerRow.slice(0, 10).join(', '), '...');
  
  // カラムインデックスのマッピング
  const colIndex = {
    leadId: 0,        // A: リードID
    leadSource: 1,    // B: リードソース
    linkedDate: 2,    // C: 連携日
    staffIs: 22,      // W: 担当IS
    statusIs: 23,     // X: ISステータス
    statusUpdateDate: 24, // Y: ステータス更新日
    resultContactStatus: 27, // AB: 結果/コンタクト状況
    lastCalledDate: 28, // AC: 直近架電日
    callCount: 29,    // AD: 架電数カウント
  };
  
  const dataRows = rows.slice(8); // 9行目以降がデータ
  console.log(`データ行数: ${dataRows.length}`);
  
  let updated = 0;
  let errors = 0;
  const updates = [];
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const leadId = row[colIndex.leadId]?.trim();
    
    if (!leadId || leadId === '') continue;
    
    const csvData = {
      leadId,
      leadSource: row[colIndex.leadSource]?.trim() || null,
      linkedDate: parseDate(row[colIndex.linkedDate]?.trim()),
      staffIs: row[colIndex.staffIs]?.trim() || null,
      statusIs: row[colIndex.statusIs]?.trim() || null,
      statusUpdateDate: parseDate(row[colIndex.statusUpdateDate]?.trim()),
      resultContactStatus: row[colIndex.resultContactStatus]?.trim() || null,
      lastCalledDate: parseDate(row[colIndex.lastCalledDate]?.trim()),
      callCount: row[colIndex.callCount]?.trim() ? parseInt(row[colIndex.callCount].trim(), 10) : null,
    };
    
    // データベースから既存レコードを取得
    const { data: existing, error: fetchError } = await supabase
      .from('call_records')
      .select('lead_id, status, status_is, call_count, result_contact_status, staff_is, call_status_today, last_called_date')
      .eq('lead_id', leadId)
      .single();
    
    if (fetchError || !existing) {
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116は「レコードが見つからない」エラー
        console.error(`エラー (${leadId}):`, fetchError.message);
        errors++;
      }
      continue;
    }
    
    // 不整合をチェック
    const needsUpdate = {
      statusIs: csvData.statusIs && csvData.statusIs !== existing.status_is,
      callCount: csvData.callCount !== null && csvData.callCount !== existing.call_count,
      resultContactStatus: csvData.resultContactStatus && csvData.resultContactStatus !== existing.result_contact_status,
      staffIs: csvData.staffIs && csvData.staffIs !== existing.staff_is,
      lastCalledDate: csvData.lastCalledDate && csvData.lastCalledDate !== existing.last_called_date,
    };
    
    const hasChanges = Object.values(needsUpdate).some(v => v);
    
    if (hasChanges) {
      const updateData = {};
      
      if (needsUpdate.statusIs) {
        updateData.status_is = csvData.statusIs;
      }
      if (needsUpdate.callCount) {
        updateData.call_count = csvData.callCount;
      }
      if (needsUpdate.resultContactStatus) {
        updateData.result_contact_status = csvData.resultContactStatus;
        // 通電の場合はcall_status_todayも更新
        if (csvData.resultContactStatus === '通電') {
          updateData.call_status_today = '通電';
        }
      }
      if (needsUpdate.staffIs) {
        updateData.staff_is = csvData.staffIs;
      }
      if (needsUpdate.lastCalledDate) {
        updateData.last_called_date = csvData.lastCalledDate;
      }
      
      updates.push({
        leadId,
        updateData,
        existing: {
          status_is: existing.status_is,
          call_count: existing.call_count,
          result_contact_status: existing.result_contact_status,
          staff_is: existing.staff_is,
        },
        csv: csvData,
      });
    }
  }
  
  console.log(`\n不整合が見つかったレコード数: ${updates.length}`);
  
  // 更新を実行
  for (const { leadId, updateData } of updates) {
    const { error: updateError } = await supabase
      .from('call_records')
      .update(updateData)
      .eq('lead_id', leadId);
    
    if (updateError) {
      console.error(`更新エラー (${leadId}):`, updateError.message);
      errors++;
    } else {
      updated++;
      console.log(`✓ 更新完了: ${leadId}`, updateData);
    }
  }
  
  console.log(`\n更新完了: ${updated}件`);
  console.log(`エラー: ${errors}件`);
  
  // サマリーを表示
  console.log('\n更新サマリー:');
  updates.slice(0, 10).forEach(({ leadId, updateData, existing, csv }) => {
    console.log(`\n${leadId}:`);
    console.log('  既存:', existing);
    console.log('  CSV:', { status_is: csv.statusIs, call_count: csv.callCount, result_contact_status: csv.resultContactStatus, staff_is: csv.staffIs });
    console.log('  更新:', updateData);
  });
}

main().catch(console.error);
