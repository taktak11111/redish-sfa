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

// 置換表
const STATUS_MAP = {
  // 商談獲得系
  '03.アポイント獲得済': '商談獲得',
  '09.アポ獲得': '商談獲得',
  'アポ獲得': '商談獲得',
  'アポ獲得済': '商談獲得',
  'アポ獲得済？': '商談獲得',
  
  // 失注（リサイクル対象外）系
  '04.失注': '失注（リサイクル対象外）',
  '90.失注': '失注（リサイクル対象外）',
  '90. 失注': '失注（リサイクル対象外）', // スペースあり
  '失注': '失注（リサイクル対象外）',
  '04.失注（ナーチャリング対象外）': '失注（リサイクル対象外）',
  '前も電話していらない': '失注（リサイクル対象外）',
  
  // 失注（リサイクル対象 A-E付与）系
  '06.ナーチャリング対象': '失注（リサイクル対象 A-E付与）',
  'リサイクル対象': '失注（リサイクル対象 A-E付与）',
  
  // コンタクト試行中（折り返し含む）系
  '02.コンタクト試行中': 'コンタクト試行中（折り返し含む）',
  '08.掛け直し（通電・アポ前）': 'コンタクト試行中（折り返し含む）',
  '通電': 'コンタクト試行中（折り返し含む）',
  '留守電に直通': 'コンタクト試行中（折り返し含む）',
  '途中で切られた': 'コンタクト試行中（折り返し含む）',
  '保留': 'コンタクト試行中（折り返し含む）',
  
  // 連絡不能（Unreachable）系
  '05.未通電⑥': '連絡不能（Unreachable）',
  '06.未通電⑤': '連絡不能（Unreachable）',
  '06.未通電⑦': '連絡不能（Unreachable）',
  
  // 対象外（Disqualified）系
  '05.対応不可/対象外': '対象外（Disqualified）',
  '架電対象外': '対象外（Disqualified）',
  '31.トスミス（重複）': '対象外（Disqualified）',
  
  // 既存顧客系
  '07.既存顧客': '既存顧客（属性へ移行予定）',
};

async function main() {
  console.log('=== W列（ISステータス）同期スクリプト ===\n');

  // 1. CSVファイル読み込み
  const csvPath = 'C:\\Users\\takta\\Downloads\\SFA用REDISH税務契約フォーム - 架電管理表 (3).csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  // 2. CSVデータをマップ化（W列 = index 22）
  const csvDataMap = new Map();
  const leadIdPattern = /^(TM|OC|MT|MK|RD|AB|US|FR|HS|SH|AS|AG|AP|RP)\d+$/;
  let emptyCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const leadId = rows[i][0];
    const status = rows[i][22] || ''; // W列
    if (leadId && leadIdPattern.test(leadId)) {
      if (!status) {
        emptyCount++;
      }
      csvDataMap.set(leadId, status);
    }
  }

  console.log(`CSVのリードID数: ${csvDataMap.size}`);
  console.log(`空欄の件数: ${emptyCount}件（更新しない）`);

  // 3. 更新対象を特定
  const updateTargets = [];
  const statusCounts = {};

  for (const [leadId, csvStatus] of csvDataMap) {
    // 空欄はスキップ
    if (!csvStatus) {
      continue;
    }

    // 置換表にある場合のみ更新
    const newStatus = STATUS_MAP[csvStatus];
    if (newStatus) {
      updateTargets.push({
        leadId,
        oldStatus: csvStatus,
        newStatus,
      });
      statusCounts[`${csvStatus} → ${newStatus}`] = (statusCounts[`${csvStatus} → ${newStatus}`] || 0) + 1;
    } else {
      // 置換表にない場合（そのまま使用可能なステータス？）
      console.log(`  警告: 置換表にないステータス: "${csvStatus}"`);
    }
  }

  console.log(`\n更新対象: ${updateTargets.length}件`);
  console.log('\n【置換内訳】');
  Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
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
    const { leadId, newStatus } = updateTargets[i];

    const { error } = await supabase
      .from('call_records')
      .update({ status_is: newStatus })
      .eq('lead_id', leadId);

    if (error) {
      errorCount++;
      if (errors.length < 10) {
        errors.push({ leadId, newStatus, error: error.message });
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
    errors.forEach((e) => console.log(`  ${e.leadId}: ${e.newStatus} → ${e.error}`));
  }

  console.log('\n完了');
}

main().catch(console.error);
