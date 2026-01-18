import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local を手動で読み込み
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    // ダブルクォートを削除
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    envVars[match[1].trim()] = value;
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// セル内改行を考慮したCSVパーサー
function parseCSV(content) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // エスケープされたダブルクォート
        currentCell += '"';
        i++;
      } else if (char === '"') {
        // クォート終了
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        // クォート開始
        inQuotes = true;
      } else if (char === ',') {
        // セル区切り
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r' && nextChar === '\n') {
        // Windows改行
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
        i++;
      } else if (char === '\n') {
        // Unix改行
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  // 最後のセル・行を追加
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows;
}

async function main() {
  console.log('=== CSV/DB比較スクリプト ===\n');

  // 1. CSVファイル読み込み（セル内改行対応）
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (3).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  console.log(`CSVの総行数: ${rows.length}（ヘッダー含む）`);
  console.log(`CSVのデータ行数: ${rows.length - 1}（ヘッダー除く）`);

  // CSVからリードIDを抽出（全プレフィックス対応）
  const csvLeadIds = new Set();
  const csvLeadIdList = []; // 重複チェック用
  // TM=TEMPOS, OC=OMC, MT=Meetsmore, MK=Makuake, RD=REDISH, AB=Amazon, US=USEN, FR=freee, HS=HOCT SYSTEM, SH=S.H.N, AS=?, AG=?, AP=?, RP=?
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH|AS|AG|AP|RP)\d+$/;

  for (let i = 1; i < rows.length; i++) { // ヘッダーをスキップ
    const firstColumn = rows[i][0];
    if (firstColumn && leadIdPattern.test(firstColumn)) {
      csvLeadIds.add(firstColumn);
      csvLeadIdList.push({ row: i + 1, leadId: firstColumn });
    }
  }

  console.log(`CSVのリードID数（ユニーク）: ${csvLeadIds.size}`);
  console.log(`CSVのリードID数（全行）: ${csvLeadIdList.length}`);

  // 重複チェック
  const duplicates = [];
  const leadIdCount = {};
  csvLeadIdList.forEach(item => {
    leadIdCount[item.leadId] = (leadIdCount[item.leadId] || 0) + 1;
  });
  Object.entries(leadIdCount).forEach(([leadId, count]) => {
    if (count > 1) {
      const rows = csvLeadIdList.filter(item => item.leadId === leadId).map(item => item.row);
      duplicates.push({ leadId, count, rows });
    }
  });
  if (duplicates.length > 0) {
    console.log(`\n【重複データ】${duplicates.length}件`);
    duplicates.forEach(d => console.log(`  ${d.leadId}: ${d.count}回（行: ${d.rows.join(', ')}）`));
  } else {
    console.log(`\n【重複データ】なし`);
  }

  // パターンにマッチしなかった行を調査
  const unmatchedRows = [];
  const emptyRows = [];
  for (let i = 1; i < rows.length; i++) {
    const firstColumn = rows[i][0];
    if (!firstColumn) {
      emptyRows.push(i + 1);
    } else if (!leadIdPattern.test(firstColumn)) {
      unmatchedRows.push({ row: i + 1, value: firstColumn });
    }
  }
  
  console.log(`\n【空欄のリードID】${emptyRows.length}件`);
  if (emptyRows.length > 0) {
    console.log(`  行番号: ${emptyRows.join(', ')}`);
  }
  
  console.log(`\n【パターンにマッチしないリードID】${unmatchedRows.length}件`);
  if (unmatchedRows.length > 0) {
    unmatchedRows.forEach(r => console.log(`  行${r.row}: "${r.value}"`));
  }

  // サマリー
  const totalDataRows = rows.length - 1;
  const validLeadIds = csvLeadIds.size;
  const duplicateCount = csvLeadIdList.length - csvLeadIds.size;
  const emptyCount = emptyRows.length;
  const unmatchedCount = unmatchedRows.length;
  
  console.log(`\n【差分サマリー】`);
  console.log(`  データ行総数: ${totalDataRows}`);
  console.log(`  有効なリードID（ユニーク）: ${validLeadIds}`);
  console.log(`  重複による減少: ${duplicateCount}件`);
  console.log(`  空欄行: ${emptyCount}件`);
  console.log(`  パターン不一致: ${unmatchedCount}件`);
  console.log(`  計算: ${validLeadIds} + ${duplicateCount} + ${emptyCount} + ${unmatchedCount} = ${validLeadIds + duplicateCount + emptyCount + unmatchedCount}`);
  console.log(`  差分: ${totalDataRows} - ${validLeadIds + duplicateCount + emptyCount + unmatchedCount} = ${totalDataRows - (validLeadIds + duplicateCount + emptyCount + unmatchedCount)}`);
  

  // 2. DBからリードID取得（ページネーションで全件取得）
  const dbLeadIds = new Set();
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: dbRecords, error } = await supabase
      .from('call_records')
      .select('lead_id')
      .order('lead_id')
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('DB取得エラー:', error);
      process.exit(1);
    }

    if (dbRecords && dbRecords.length > 0) {
      dbRecords.forEach((r) => dbLeadIds.add(r.lead_id));
      from += pageSize;
      hasMore = dbRecords.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  console.log(`DBのリードID数: ${dbLeadIds.size}`);

  // 3. 比較
  const onlyInCSV = [];
  const onlyInDB = [];

  // CSVにあってDBにないもの
  for (const id of csvLeadIds) {
    if (!dbLeadIds.has(id)) {
      onlyInCSV.push(id);
    }
  }

  // DBにあってCSVにないもの
  for (const id of dbLeadIds) {
    if (!csvLeadIds.has(id)) {
      onlyInDB.push(id);
    }
  }

  console.log('\n=== 比較結果 ===\n');
  console.log(`CSVにあってDBにない: ${onlyInCSV.length}件`);
  if (onlyInCSV.length > 0 && onlyInCSV.length <= 50) {
    console.log('リードID:', onlyInCSV.sort().join(', '));
  } else if (onlyInCSV.length > 50) {
    console.log('最初の50件:', onlyInCSV.sort().slice(0, 50).join(', '));
    console.log('...他', onlyInCSV.length - 50, '件');
  }

  console.log(`\nDBにあってCSVにない: ${onlyInDB.length}件`);
  if (onlyInDB.length > 0 && onlyInDB.length <= 50) {
    console.log('リードID:', onlyInDB.sort().join(', '));
  } else if (onlyInDB.length > 50) {
    console.log('最初の50件:', onlyInDB.sort().slice(0, 50).join(', '));
    console.log('...他', onlyInDB.length - 50, '件');
  }

  // 結果をJSONファイルに出力
  const result = {
    timestamp: new Date().toISOString(),
    csvCount: csvLeadIds.size,
    dbCount: dbLeadIds.size,
    onlyInCSV: onlyInCSV.sort(),
    onlyInDB: onlyInDB.sort(),
  };

  const outputPath = path.join(__dirname, 'compare-result.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\n結果をJSONファイルに出力: ${outputPath}`);

  // 追加対象のデータを抽出
  if (onlyInCSV.length > 0) {
    console.log('\n=== 追加対象データ詳細 ===\n');
    const headerRow = rows[0];
    console.log('ヘッダー:', headerRow.slice(0, 15).join(' | '));
    
    for (const leadId of onlyInCSV) {
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === leadId) {
          console.log(`\n${leadId}:`);
          console.log('  リードソース:', rows[i][1]);
          console.log('  連携日:', rows[i][2]);
          console.log('  業種:', rows[i][3]);
          console.log('  会社名:', rows[i][4]);
          console.log('  氏名:', rows[i][5]);
          console.log('  ふりがな:', rows[i][6]);
          console.log('  電話番号:', rows[i][7]);
          console.log('  メール:', rows[i][8]);
          console.log('  住所:', rows[i][9]);
          console.log('  開業時期:', rows[i][10]);
          console.log('  連絡希望日時:', rows[i][11]);
          console.log('  連携元備考:', rows[i][12]);
          break;
        }
      }
    }
  }
}

main().catch(console.error);
