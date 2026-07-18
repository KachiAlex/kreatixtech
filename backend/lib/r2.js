import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME;

let s3 = null;

export function getS3Client() {
  if (s3) return s3;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error('R2 credentials not configured (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME)');
  }
  s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
  return s3;
}

function keyForFile(folder, originalName) {
  const ext = path.extname(originalName) || '';
  const safeFolder = folder.replace(/^\/+|\/+$/g, '');
  return `${safeFolder}/${uuidv4()}${ext}`;
}

export function publicUrlForKey(key) {
  if (process.env.R2_PUBLIC_URL) {
    const base = process.env.R2_PUBLIC_URL.replace(/\/$/, '');
    return `${base}/${key}`;
  }
  if (!accountId || !bucket) {
    throw new Error('R2_PUBLIC_URL or R2_ACCOUNT_ID/R2_BUCKET_NAME must be configured to build public URLs');
  }
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
}

export async function uploadBufferToR2(buffer, { folder, fileName, contentType }) {
  const key = keyForFile(folder, fileName);
  const client = getS3Client();
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  return { key, publicUrl: publicUrlForKey(key) };
}

export async function deleteFileFromR2(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith('http')) return;
  const publicBase = process.env.R2_PUBLIC_URL ? process.env.R2_PUBLIC_URL.replace(/\/$/, '') : null;
  let key;
  if (publicBase && fileUrl.startsWith(publicBase)) {
    key = fileUrl.slice(publicBase.length + 1);
  } else {
    try {
      const url = new URL(fileUrl);
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments[0] === bucket) {
        segments.shift();
      }
      key = segments.join('/');
    } catch {
      return;
    }
  }
  if (!key) return;
  const client = getS3Client();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

