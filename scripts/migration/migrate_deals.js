/**
 * 商談データ移行スクリプト
 * 
 * CSVファイルから商談データを読み込み、Supabaseにインポートする
 * 
 * 使用方法:
 *   node scripts/migration/migrate_deals.js <CSVファイルパス> [--dry-run] [--batch-size=100]
 * 
 * オプション:
 *   --dry-run      : 実際にはDBに書き込まず、変換結果のみ出力
 *   --batch-size=N : N件ずつバッチ処理（デフォルト: 100）
 *   --report-only  : 変換前の分析レポートのみ出力
 *   --output-json  : 変換結果をJSONファイルに出力
 * 
 * 作成日: 2026-01-18
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');

const {
  dealResultMapping,
  columnMapping,
  transformRow,
  getMappedResult,
  isUnknownResult
} = require('./mapping_config');

// ===========================================
// 設定
// ===========================================
const DEFAULT_BATCH_SIZE = 100;

// ===========================================
// 環境変数読み込み
// ===========================================

/**
 * .env.localから環境変数を読み込む
 */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex).trim();
        let value = trimmed.substring(eqIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        env[key] = value;
      }
    }
  }
  return env;
}

/**
 * Supabaseクライアントを初期化
 */
function initSupabase() {
  const envPath = path.join(__dirname, '../../frontend/.env.local');
  const env = loadEnvFile(envPath);
  
  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase環境変数が設定されていません（NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY）');
  }
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  });
}

// ===========================================
// CSVパース
// ===========================================

/**
 * CSVファイルを読み込んでパース
 * @param {string} filePath - CSVファイルのパス
 * @returns {Array<Object>} パースされた行の配列
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const records = parse(content, {
    columns: (header) => header.map(col => col.replace(/\r\n|\n/g, ' ').trim()),
    skip_empty_lines: true,
    relax_column_count: true,
    bom: true
  });
  
  return records;
}

// ===========================================
// 分析レポート生成
// ===========================================

/**
 * 移行前の分析レポートを生成
 * @param {Array<Object>} records - CSVレコード
 * @returns {Object} 分析結果
 */
function analyzeRecords(records) {
  const report = {
    totalCount: records.length,
    dealResultDistribution: {},
    unknownDealResults: [],
    missingRequiredFields: [],
    dateFormatIssues: []
  };
  
  for (const record of records) {
    const dealId = record['商談ID'];
    const dealResult = record['商談結果'];
    
    // 商談結果の分布
    if (dealResult) {
      report.dealResultDistribution[dealResult] = 
        (report.dealResultDistribution[dealResult] || 0) + 1;
      
      // 未知の商談結果
      if (isUnknownResult(dealResult)) {
        report.unknownDealResults.push({ dealId, value: dealResult });
      }
    }
    
    // 必須フィールドのチェック（商談IDのみ必須）
    if (!record['商談ID']) {
      report.missingRequiredFields.push({ dealId: '(空)', field: '商談ID' });
    }
  }
  
  return report;
}

/**
 * 分析レポートを表示
 * @param {Object} report - 分析結果
 */
function printAnalysisReport(report) {
  console.log('\n====================================');
  console.log('移行前分析レポート');
  console.log('====================================\n');
  
  console.log(`総レコード数: ${report.totalCount}\n`);
  
  console.log('【商談結果の分布】');
  console.log('-'.repeat(50));
  for (const [value, count] of Object.entries(report.dealResultDistribution).sort((a, b) => b[1] - a[1])) {
    const mapped = getMappedResult(value);
    const mappedStr = mapped 
      ? `→ meetingStatus: ${mapped.meetingStatus}, dealResult: ${mapped.dealResult || 'null'}`
      : '→ ⚠️ マッピング未定義';
    console.log(`  ${value}: ${count}件 ${mappedStr}`);
  }
  
  if (report.unknownDealResults.length > 0) {
    console.log('\n【⚠️ 未知の商談結果値】');
    console.log('-'.repeat(50));
    for (const item of report.unknownDealResults) {
      console.log(`  ${item.dealId}: "${item.value}"`);
    }
  }
  
  if (report.missingRequiredFields.length > 0) {
    console.log('\n【⚠️ 必須フィールド欠落】');
    console.log('-'.repeat(50));
    const grouped = {};
    for (const item of report.missingRequiredFields) {
      if (!grouped[item.field]) grouped[item.field] = [];
      grouped[item.field].push(item.dealId);
    }
    for (const [field, ids] of Object.entries(grouped)) {
      console.log(`  ${field}: ${ids.length}件 (${ids.slice(0, 5).join(', ')}${ids.length > 5 ? '...' : ''})`);
    }
  }
  
  console.log('\n====================================\n');
}

// ===========================================
// データ変換・バリデーション
// ===========================================

/**
 * レコードをバリデート
 * @param {Object} record - 変換後のレコード
 * @returns {Array<string>} エラーメッセージの配列
 */
function validateRecord(record) {
  const errors = [];
  
  // 必須フィールド（商談IDのみ必須）
  if (!record.deal_id) errors.push('商談IDが必要です');
  
  // IDフォーマット
  if (record.deal_id && !/^SA\d{4,}$/.test(record.deal_id)) {
    errors.push(`商談IDの形式が不正: ${record.deal_id}`);
  }
  
  return errors;
}

// ===========================================
// メイン処理
// ===========================================

/**
 * メイン関数
 */
async function main() {
  const args = process.argv.slice(2);
  
  // 引数解析
  const csvPath = args.find(arg => !arg.startsWith('--'));
  const dryRun = args.includes('--dry-run');
  const reportOnly = args.includes('--report-only');
  const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='));
  const batchSize = batchSizeArg 
    ? parseInt(batchSizeArg.split('=')[1], 10) 
    : DEFAULT_BATCH_SIZE;
  
  if (!csvPath) {
    console.error('使用方法: node migrate_deals.js <CSVファイルパス> [--dry-run] [--batch-size=100] [--report-only]');
    process.exit(1);
  }
  
  // CSVファイルの存在確認
  if (!fs.existsSync(csvPath)) {
    console.error(`ファイルが見つかりません: ${csvPath}`);
    process.exit(1);
  }
  
  console.log(`\nCSVファイル: ${csvPath}`);
  console.log(`Dry Run: ${dryRun}`);
  console.log(`バッチサイズ: ${batchSize}`);
  
  // CSV読み込み
  console.log('\nCSVを読み込み中...');
  const records = parseCSV(csvPath);
  console.log(`${records.length}件のレコードを読み込みました`);
  
  // 分析レポート
  const report = analyzeRecords(records);
  printAnalysisReport(report);
  
  if (reportOnly) {
    console.log('レポート出力のみで終了します（--report-only）');
    return;
  }
  
  // 未知の商談結果がある場合は警告
  if (report.unknownDealResults.length > 0) {
    console.warn(`\n⚠️ 警告: ${report.unknownDealResults.length}件の未知の商談結果値があります`);
    console.warn('これらのレコードは meetingStatus / dealResult が設定されません');
    console.warn('続行しますか？ (Ctrl+C でキャンセル、5秒後に続行)\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  // データ変換
  console.log('\nデータを変換中...');
  const transformedMap = new Map(); // deal_idで重複排除（後勝ち）
  const errors = [];
  
  for (const record of records) {
    try {
      const transformed = transformRow(record);
      const validationErrors = validateRecord(transformed);
      
      if (validationErrors.length > 0) {
        errors.push({
          dealId: record['商談ID'],
          errors: validationErrors
        });
      } else {
        // 重複deal_idは後勝ち（上書き）
        if (transformedMap.has(transformed.deal_id)) {
          console.log(`  重複検出: ${transformed.deal_id} - 後のレコードで上書き`);
        }
        transformedMap.set(transformed.deal_id, transformed);
      }
    } catch (err) {
      errors.push({
        dealId: record['商談ID'],
        errors: [err.message]
      });
    }
  }
  
  const transformedRecords = Array.from(transformedMap.values());
  
  console.log(`変換成功: ${transformedRecords.length}件`);
  console.log(`変換エラー: ${errors.length}件`);
  
  if (errors.length > 0) {
    console.log('\n【変換エラー詳細】');
    for (const err of errors.slice(0, 10)) {
      console.log(`  ${err.dealId}: ${err.errors.join(', ')}`);
    }
    if (errors.length > 10) {
      console.log(`  ... 他 ${errors.length - 10}件`);
    }
  }
  
  // JSON出力オプション
  const outputJson = args.includes('--output-json');
  if (outputJson) {
    const outputPath = csvPath.replace(/\.csv$/i, '_transformed.json');
    fs.writeFileSync(outputPath, JSON.stringify(transformedRecords, null, 2), 'utf-8');
    console.log(`\n変換結果をJSONファイルに出力しました: ${outputPath}`);
  }
  
  if (dryRun) {
    console.log('\n=== Dry Run モード ===');
    console.log('最初の3件の変換結果:');
    for (const record of transformedRecords.slice(0, 3)) {
      console.log(JSON.stringify(record, null, 2));
    }
    console.log('\n実際のDB書き込みはスキップされました');
    return;
  }
  
  // Supabaseへの書き込み処理
  console.log('\n=== Supabase書き込み開始 ===');
  
  let supabase;
  try {
    supabase = initSupabase();
    console.log('Supabaseクライアント初期化完了');
  } catch (err) {
    console.error('Supabase初期化エラー:', err.message);
    process.exit(1);
  }
  
  // バッチ処理
  let successCount = 0;
  let failCount = 0;
  const failedRecords = [];
  
  for (let i = 0; i < transformedRecords.length; i += batchSize) {
    const batch = transformedRecords.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(transformedRecords.length / batchSize);
    
    console.log(`バッチ ${batchNum}/${totalBatches} (${batch.length}件) 処理中...`);
    
    try {
      // upsert（deal_idで既存レコードがあれば更新、なければ挿入）
      const { data, error } = await supabase
        .from('deals')
        .upsert(batch, { 
          onConflict: 'deal_id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`  バッチ ${batchNum} エラー:`, error.message);
        failCount += batch.length;
        failedRecords.push(...batch.map(r => ({ id: r.deal_id, error: error.message })));
      } else {
        successCount += batch.length;
        console.log(`  バッチ ${batchNum} 完了: ${batch.length}件`);
      }
    } catch (err) {
      console.error(`  バッチ ${batchNum} 例外:`, err.message);
      failCount += batch.length;
      failedRecords.push(...batch.map(r => ({ id: r.deal_id, error: err.message })));
    }
  }
  
  console.log('\n=== 書き込み結果 ===');
  console.log(`成功: ${successCount}件`);
  console.log(`失敗: ${failCount}件`);
  
  if (failedRecords.length > 0) {
    console.log('\n【失敗レコード詳細】');
    for (const rec of failedRecords.slice(0, 10)) {
      console.log(`  ${rec.id}: ${rec.error}`);
    }
    if (failedRecords.length > 10) {
      console.log(`  ... 他 ${failedRecords.length - 10}件`);
    }
    
    // 失敗レコードをJSONファイルに出力
    const failedPath = csvPath.replace(/\.csv$/i, '_failed.json');
    fs.writeFileSync(failedPath, JSON.stringify(failedRecords, null, 2), 'utf-8');
    console.log(`\n失敗レコードをJSONファイルに出力しました: ${failedPath}`);
  }
  
  console.log('\n移行完了');
}

// 実行
main().catch(err => {
  console.error('エラー:', err);
  process.exit(1);
});
