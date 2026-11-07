const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET || 'methynix-headquarter';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-fcdacb1cbeae45269efc0e8804f4c72b.r2.dev';

if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  console.error('Missing R2 credentials in server/.env');
  process.exit(1);
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const folder = 'methynix-website (new)';
const images = [
  'company-website.jpg',
  'online-store.jpg',
  'admin-dashboard.jpg',
  'mobile-apps-ios-android.jpg',
  'mobile-money-payments.jpg',
  'offline-pos-business-tools.jpg',
  'apis-and-databases.jpg'
];

async function main() {
  const results = {};
  for (const filename of images) {
    const filePath = path.join(__dirname, '../prepared_images', filename);
    const body = fs.readFileSync(filePath);
    const key = `${folder}/${filename}`;
    
    console.log(`Uploading ${filename} to ${BUCKET}/${key}...`);
    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: 'image/jpeg',
      })
    );
    
    // Construct public URL
    // e.g. https://pub-fcdacb1cbeae45269efc0e8804f4c72b.r2.dev/methynix-website%20(new)/filename.jpg
    const encodedKey = key.split('/').map(encodeURIComponent).join('/');
    const url = `${PUBLIC_URL.replace(/\/+$/, '')}/${encodedKey}`;
    results[filename] = url;
    console.log(`Uploaded: ${url}`);
  }
  
  fs.writeFileSync(
    path.join(__dirname, '../client/src/constants/categoryImages.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('Finished uploading all images! URLs saved to client/src/constants/categoryImages.json');
}

main().catch((err) => {
  console.error('Upload failed:', err);
  process.exit(1);
});
