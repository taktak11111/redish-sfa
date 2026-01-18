const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// .env.localから環境変数を読み込む
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

const env = {};
for (const line of envLines) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let value = match[2].trim();
    // クォートを除去
    if ((value.startsWith("'") && value.endsWith("'")) || 
        (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1);
    }
    env[match[1].trim()] = value;
  }
}

async function analyzeDuplicates() {
  const privateKey = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n');
  
  const auth = new google.auth.JWT(
    env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    privateKey,
    ['https://www.googleapis.com/auth/spreadsheets.readonly']
  );

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '16zy6JsMGEXFhfBYROQwyyKwZs0g64Dt99YL8AVxWpoc';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: '12.TEMPOS!A:AZ',  // より広い範囲を取得
  });

  const rows = response.data.values || [];
  console.log('取得行数:', rows.length);

  // ヘッダー行を確認
  console.log('Row 4 (ヘッダー):', rows[4]);
  console.log('Row 5 (データ1):', rows[5]);
  console.log('Row 6 (データ2):', rows[6]);
  
  // 連携フラグの値のバリエーションを収集
  const linkedValues = new Map();
  
  const dataRows = [];
  for (let i = 5; i < rows.length; i++) {
    const row = rows[i] || [];
    const leadSource = (row[1] || '').trim();
    const leadId = (row[2] || '').trim();
    const linkedD = (row[3] || '').trim();  // D列
    const linkedE = (row[4] || '').trim();  // E列
    const phone = (row[12] || '').trim();
    
    // 連携フラグの値を収集
    if (leadSource === 'TEMPOS') {
      linkedValues.set(linkedD, (linkedValues.get(linkedD) || 0) + 1);
    }
    
    // リードソースがTEMPOSで、IDがあり、電話番号があれば連携対象
    // （実際のインポートロジックに合わせる）
    if (leadSource === 'TEMPOS' && leadId && phone) {
      dataRows.push({ leadId, phone, rowNum: i + 1 });
    }
  }
  
  console.log('\\n連携フラグ(D列)の値の分布:');
  for (const [value, count] of linkedValues.entries()) {
    console.log(`  "${value}": ${count}件`);
  }
  
  console.log('連携TRUE件数:', dataRows.length);
  
  const phoneMap = new Map();
  for (const row of dataRows) {
    if (!row.phone) continue;
    const normalizedPhone = row.phone.replace(/[-\s]/g, '');
    if (!phoneMap.has(normalizedPhone)) {
      phoneMap.set(normalizedPhone, []);
    }
    phoneMap.get(normalizedPhone).push(row);
  }
  
  const duplicates = [];
  for (const [phone, rows] of phoneMap.entries()) {
    if (rows.length > 1) {
      duplicates.push({ phone, rows });
    }
  }
  
  console.log('重複電話番号数:', duplicates.length);
  console.log('');
  console.log('=== 重複データ一覧（電話番号: 残ったID ← 統合されたID）===');
  
  for (const dup of duplicates) {
    const sortedRows = dup.rows.sort((a, b) => a.leadId.localeCompare(b.leadId));
    const lastId = sortedRows[sortedRows.length - 1].leadId;
    const mergedIds = sortedRows.slice(0, -1).map(r => r.leadId).join(', ');
    console.log(`${dup.phone}: ${lastId} ← ${mergedIds}`);
  }
}

analyzeDuplicates().catch(e => console.error('Error:', e.message, e.stack));
