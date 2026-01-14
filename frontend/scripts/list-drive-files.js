// サービスアカウントが所有するDriveファイルを一覧表示
require('@next/env').loadEnvConfig(process.cwd());
const { google } = require('googleapis');

async function listFiles() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });
  
  // サービスアカウントが所有するファイルを一覧
  const response = await drive.files.list({
    q: "'me' in owners",
    fields: 'files(id, name, createdTime, size)',
    pageSize: 50,
  });
  
  console.log('Files owned by service account:');
  response.data.files?.forEach(file => {
    console.log(`  - ${file.name} (ID: ${file.id}, Created: ${file.createdTime})`);
  });
  console.log(`Total: ${response.data.files?.length || 0} files`);
  
  return response.data.files;
}

async function deletePreviewFiles() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });
  
  // _preview_で始まるファイルを検索
  const response = await drive.files.list({
    q: "name contains '_preview_'",
    fields: 'files(id, name)',
    pageSize: 100,
  });
  
  const files = response.data.files || [];
  console.log(`\nFound ${files.length} preview files to delete:`);
  
  for (const file of files) {
    try {
      await drive.files.delete({ fileId: file.id });
      console.log(`  Deleted: ${file.name}`);
    } catch (err) {
      console.log(`  Failed to delete ${file.name}: ${err.message}`);
    }
  }
}

// 実行
listFiles()
  .then(() => deletePreviewFiles())
  .catch(err => console.error('Error:', err.message));
