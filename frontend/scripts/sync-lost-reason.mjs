import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    envVars[match[1].trim()] = value;
  }
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY, {
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
        currentCell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
        i++;
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows;
}

// 対応表: CSV値 → { primary: 失注主因, sub: 失注サブ理由 }
const LOST_REASON_MAP = {
  // === 競合要因系 ===
  '2. IS：税理士あり': { primary: '競合要因', sub: '税理士契約済' },
  '08.税理士契約済': { primary: '競合要因', sub: '税理士契約済' },
  '税理士契約済': { primary: '競合要因', sub: '税理士契約済' },
  '税理士あり': { primary: '競合要因', sub: '税理士契約済' },
  '他社契約': { primary: '競合要因', sub: '税理士契約済' },
  '税理士契約中': { primary: '競合要因', sub: '税理士契約済' },
  '契約済': { primary: '競合要因', sub: '税理士契約済' },
  '税理士と契約済': { primary: '競合要因', sub: '税理士契約済' },
  '27. FS：契約中税理士継続利用': { primary: '競合要因', sub: '税理士契約済' },
  
  '07.他税理士（知り合い）': { primary: '競合要因', sub: '他税理士:知り合い' },
  '22. FS：紹介税理士': { primary: '競合要因', sub: '他税理士:知り合い' },
  '他税理士・知人': { primary: '競合要因', sub: '他税理士:知り合い' },
  '知り合い税理士': { primary: '競合要因', sub: '他税理士:知り合い' },
  '知り合い税理士契約済': { primary: '競合要因', sub: '他税理士:知り合い' },
  '契約済（知り合い）': { primary: '競合要因', sub: '他税理士:知り合い' },
  
  '07.他税理士（面談あり）': { primary: '競合要因', sub: '他税理士:面談あり' },
  '23. FS：対面税理士': { primary: '競合要因', sub: '他税理士:面談あり' },
  
  '07.他税理士（価格・サービス）': { primary: '競合要因', sub: '他税理士:価格' },

  // === 顧客要因系 ===
  '03.興味なし／不要': { primary: '顧客要因', sub: '興味なし/不要' },
  '興味なし': { primary: '顧客要因', sub: '興味なし/不要' },
  '興味ない': { primary: '顧客要因', sub: '興味なし/不要' },
  'ニーズ無し': { primary: '顧客要因', sub: '興味なし/不要' },
  '不要': { primary: '顧客要因', sub: '興味なし/不要' },
  '16. FS：税理士を探していない': { primary: '顧客要因', sub: '興味なし/不要' },
  '18. FS：サービス内容不満足': { primary: '顧客要因', sub: '興味なし/不要' },
  '8. 対応不可：ガチャ切り': { primary: '顧客要因', sub: '興味なし/不要' },
  'ガチャ切り': { primary: '顧客要因', sub: '興味なし/不要' },
  '忙しいので連絡しないでほしい': { primary: '顧客要因', sub: '興味なし/不要' },
  '営業やめて': { primary: '顧客要因', sub: '興味なし/不要' },
  '閉業': { primary: '顧客要因', sub: '興味なし/不要' },
  '閉業したとのこと': { primary: '顧客要因', sub: '興味なし/不要' },
  
  '19. FS：価格不満足': { primary: '顧客要因', sub: '予算オーバー' },
  '05.予算オーバー': { primary: '顧客要因', sub: '予算オーバー' },
  '5. IS：価格不可': { primary: '顧客要因', sub: '予算オーバー' },
  
  '09.時期尚早': { primary: '顧客要因', sub: '時期尚早/今じゃない' },
  
  '17. FS：話だけ聞きにきた': { primary: '顧客要因', sub: '話だけ聞いてみたい（開業見込みなし）' },
  '開業見込みなし': { primary: '顧客要因', sub: '話だけ聞いてみたい（開業見込みなし）' },
  '開業しない': { primary: '顧客要因', sub: '話だけ聞いてみたい（開業見込みなし）' },
  '開業しないことになった': { primary: '顧客要因', sub: '話だけ聞いてみたい（開業見込みなし）' },
  '開業予定なし': { primary: '顧客要因', sub: '話だけ聞いてみたい（開業見込みなし）' },

  // === 自己対応系 ===
  '3. IS：自己対応': { primary: '自己対応', sub: '自己対応（自分でやる）' },
  '自己対応': { primary: '自己対応', sub: '自己対応（自分でやる）' },
  '02.自己対応': { primary: '自己対応', sub: '自己対応（自分でやる）' },
  '・自己対応': { primary: '自己対応', sub: '自己対応（自分でやる）' },
  
  '21. FS：青色申告会/商工会': { primary: '自己対応', sub: '商工会議所・青色申告会等' },
  '商工会': { primary: '自己対応', sub: '商工会議所・青色申告会等' },

  // === 自社要因系 ===
  '14.連携ミス': { primary: '自社要因', sub: '連携ミス' },
  '12.トスミス：詳細記載': { primary: '自社要因', sub: '連携ミス' },
  '10.依頼記憶なし': { primary: '自社要因', sub: '連携ミス' },
  '7. 対応不可：問い合せしていない': { primary: '自社要因', sub: '連携ミス' },
  '番号使われておらず': { primary: '自社要因', sub: '連携ミス' },
  '番号違い': { primary: '自社要因', sub: '連携ミス' },
  '番号ミス': { primary: '自社要因', sub: '連携ミス' },
  '電話番号使われていない': { primary: '自社要因', sub: '連携ミス' },
  '電話番号ミス': { primary: '自社要因', sub: '連携ミス' },
  
  '12. 弊社対応不可': { primary: '自社要因', sub: '弊社対応不可' },
  '11.対応不可：その他（対応不可理由）': { primary: '自社要因', sub: '弊社対応不可' },
  '10.対応不可：風営法': { primary: '自社要因', sub: '弊社対応不可' },
  '15. FS：弊社対応不可(理由記載)': { primary: '自社要因', sub: '弊社対応不可' },
  
  '6. IS：オンライン対応不可': { primary: '自社要因', sub: 'オンライン対応不可' },
  '13.オンライン対応不可': { primary: '自社要因', sub: 'オンライン対応不可' },
  
  '4. IS：日本語不可': { primary: '自社要因', sub: '日本語不可' },
  '04.外国人（日本語不可）': { primary: '自社要因', sub: '日本語不可' },

  // === その他系 ===
  '06.完全未通電（架電5回以上、SMS反応なし）': { primary: 'その他', sub: '完全未通電（架電5回以上、SMS反応なし）' },
  '1. 完全未通電': { primary: 'その他', sub: '完全未通電（架電5回以上、SMS反応なし）' },
  '1.完全未通電': { primary: 'その他', sub: '完全未通電（架電5回以上、SMS反応なし）' },
  '完全未通電': { primary: 'その他', sub: '完全未通電（架電5回以上、SMS反応なし）' },
  '25. FS：音信不通': { primary: 'その他', sub: '完全未通電（架電5回以上、SMS反応なし）' },
  
  '15.不明': { primary: 'その他', sub: '不明' },
  
  '26. FS：その他': { primary: 'その他', sub: 'その他' },
  'モラリティ': { primary: 'その他', sub: 'その他' },
  '超小規模': { primary: 'その他', sub: 'その他' },
};

async function main() {
  console.log('=== Y列（対応負荷・失注理由）同期スクリプト ===\n');

  // 1. CSVファイル読み込み
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (7).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  // 2. CSVデータをマップ化（Y列 = index 24）
  const csvDataMap = new Map();
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH|AS|AG|AP|RP)\d+$/;

  for (let i = 1; i < rows.length; i++) {
    const leadId = rows[i][0];
    const reason = rows[i][24] || ''; // Y列
    if (leadId && leadIdPattern.test(leadId)) {
      csvDataMap.set(leadId, reason);
    }
  }

  console.log(`CSVのリードID数: ${csvDataMap.size}`);

  // 3. 更新対象を特定
  const updateTargets = [];
  const unmappedReasons = {};
  let emptyCount = 0;

  for (const [leadId, csvReason] of csvDataMap) {
    // 空欄はスキップ
    if (!csvReason) {
      emptyCount++;
      continue;
    }

    // 対応表にある場合のみ更新
    const mapped = LOST_REASON_MAP[csvReason];
    if (mapped) {
      updateTargets.push({
        leadId,
        csvReason,
        primary: mapped.primary,
        sub: mapped.sub,
      });
    } else {
      // 対応表にない場合（フリーテキストなど）→ その他に分類
      unmappedReasons[csvReason] = (unmappedReasons[csvReason] || 0) + 1;
      updateTargets.push({
        leadId,
        csvReason,
        primary: 'その他',
        sub: 'その他',
      });
    }
  }

  console.log(`空欄の件数: ${emptyCount}件（更新しない）`);
  console.log(`更新対象: ${updateTargets.length}件`);

  // 対応表にない値を表示
  if (Object.keys(unmappedReasons).length > 0) {
    console.log('\n【対応表にない値（その他に分類）】');
    Object.entries(unmappedReasons)
      .sort((a, b) => b[1] - a[1])
      .forEach(([reason, count]) => {
        console.log(`  "${reason}": ${count}件`);
      });
  }

  // 置換内訳
  const primaryCounts = {};
  const subCounts = {};
  updateTargets.forEach((t) => {
    primaryCounts[t.primary] = (primaryCounts[t.primary] || 0) + 1;
    subCounts[`${t.primary} → ${t.sub}`] = (subCounts[`${t.primary} → ${t.sub}`] || 0) + 1;
  });

  console.log('\n【失注主因の内訳】');
  Object.entries(primaryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([key, count]) => {
      console.log(`  ${key}: ${count}件`);
    });

  console.log('\n【失注サブ理由の内訳（上位20件）】');
  Object.entries(subCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([key, count]) => {
      console.log(`  ${key}: ${count}件`);
    });

  if (updateTargets.length === 0) {
    console.log('\n更新対象がありません。');
    return;
  }

  // 4. 更新実行
  console.log('\n【更新処理開始】');

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < updateTargets.length; i++) {
    const { leadId, primary, sub } = updateTargets[i];

    const { error } = await supabase
      .from('call_records')
      .update({
        lost_reason_primary: primary,
        lost_reason_company_sub: primary === '自社要因' ? sub : null,
        lost_reason_customer_sub: primary === '顧客要因' ? sub : null,
        lost_reason_competitor_sub: primary === '競合要因' ? sub : null,
        lost_reason_self_sub: primary === '自己対応' ? sub : null,
        lost_reason_other_sub: primary === 'その他' ? sub : null,
      })
      .eq('lead_id', leadId);

    if (error) {
      errorCount++;
      if (errors.length < 10) {
        errors.push({ leadId, primary, sub, error: error.message });
      }
    } else {
      successCount++;
    }

    if ((i + 1) % 200 === 0) {
      console.log(`  ${i + 1}/${updateTargets.length}件処理済み...`);
    }
  }

  // 5. 結果出力
  console.log('\n=== 更新結果 ===\n');
  console.log(`成功: ${successCount}件`);
  console.log(`エラー: ${errorCount}件`);

  if (errors.length > 0) {
    console.log('\nエラー詳細（最初の10件）:');
    errors.forEach((e) => console.log(`  ${e.leadId}: ${e.primary}/${e.sub} → ${e.error}`));
  }

  console.log('\n完了');
}

main().catch(console.error);
