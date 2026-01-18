// CSVファイルとデータベースの不整合を一括修正するスクリプト
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Supabase環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '設定済み' : '未設定');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_KEY ? '設定済み' : '未設定');
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
    staffIs: 22,      // V: 担当IS（修正: 以前は23だった）
    statusIs: 23,     // W: ISステータス（修正: 以前は24だった）
    statusUpdateDate: 24, // X: ステータス更新日（修正: 以前は25だった）
    resultContactStatus: 27, // AA: 結果/コンタクト状況（修正: 以前は28だった）
    lastCalledDate: 28, // BA: 直近架電日（修正: 以前は29だった）
    callCount: 29,    // CA: 架電数カウント（修正: 以前は30だった）
  };
  
  const dataRows = rows.slice(8); // 9行目以降がデータ
  console.log(`データ行数: ${dataRows.length}`);
  
  let updated = 0;
  let errors = 0;
  const updates = [];
  
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
    };
    
    // データベースから既存レコードを取得
    const { data: existing, error: fetchError } = await supabase
      .from('call_records')
      .select('lead_id, status, status_is, call_count, result_contact_status, staff_is, call_status_today, last_called_date')
      .eq('lead_id', leadId)
      .single();
    
    if (fetchError || !existing) {
      if (fetchError && fetchError.code !== 'PGRST116') {
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
        if (csvData.resultContactStatus === '通電' || csvData.resultContactStatus === 'TRUE') {
          updateData.call_status_today = '通電';
        } else if (csvData.resultContactStatus === '不通') {
          updateData.call_status_today = `不通${csvData.callCount || ''}`;
        }
      }
      if (needsUpdate.staffIs) {
        updateData.staff_is = csvData.staffIs;
      }
      if (needsUpdate.lastCalledDate) {
        updateData.last_called_date = csvData.lastCalledDate;
      }
      
      // status_isに基づいてstatusを更新
      if (csvData.statusIs) {
        if (csvData.statusIs.includes('03.アポイント獲得済') || csvData.statusIs.includes('09.アポ獲得') || csvData.statusIs.includes('商談獲得')) {
          updateData.status = '商談獲得';
        } else if (csvData.statusIs.includes('02.コンタクト試行中')) {
          updateData.status = '架電中';
        } else if (csvData.statusIs.includes('失注') || csvData.statusIs.includes('04.失注')) {
          updateData.status = '04.アポなし';
        } else if (csvData.statusIs === '保留') {
          updateData.status = '架電中';
        } else if (csvData.statusIs === '通電') {
          updateData.status = '架電中';
        }
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
  
  // 更新を実行（バッチ処理）
  const batchSize = 50;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    
    for (const { leadId, updateData } of batch) {
      const { error: updateError } = await supabase
        .from('call_records')
        .update(updateData)
        .eq('lead_id', leadId);
      
      if (updateError) {
        console.error(`更新エラー (${leadId}):`, updateError.message);
        errors++;
      } else {
        updated++;
        if (updated % 100 === 0) {
          console.log(`更新進捗: ${updated}/${updates.length}`);
        }
      }
    }
  }
  
  console.log(`\n更新完了: ${updated}件`);
  console.log(`エラー: ${errors}件`);
  
  // サマリーを表示
  console.log('\n更新サマリー（最初の10件）:');
  updates.slice(0, 10).forEach(({ leadId, updateData, existing, csv }) => {
    console.log(`\n${leadId}:`);
    console.log('  既存:', existing);
    console.log('  CSV:', { status_is: csv.statusIs, call_count: csv.callCount, result_contact_status: csv.resultContactStatus, staff_is: csv.staffIs });
    console.log('  更新:', updateData);
  });
}

main().catch(console.error);
