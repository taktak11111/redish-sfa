// テンプレートスプレッドシートの親フォルダを取得
require('@next/env').loadEnvConfig(process.cwd());
const { google } = require('googleapis');

async function getTemplateParent() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });
  
  const templateId = '15JYERiJcs7k3IxYwmRGTMM-8o_6Tz8t9BW6P6c-91aY';
  
  // テンプレートのメタデータを取得
  const response = await drive.files.get({
    fileId: templateId,
    fields: 'id, name, parents, owners',
    supportsAllDrives: true,
  });
  
  console.log('Template file info:');
  console.log('  ID:', response.data.id);
  console.log('  Name:', response.data.name);
  console.log('  Parents:', response.data.parents);
  console.log('  Owners:', JSON.stringify(response.data.owners, null, 2));
}

getTemplateParent().catch(err => console.error('Error:', err.message));
