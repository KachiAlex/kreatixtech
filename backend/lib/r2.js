import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME;

let s3 = null;

function getClient() {
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

function keyForFile(requestId, originalName) {
  const ext = path.extname(originalName) || '';
  return `kreatix-requests/${requestId}/${uuidv4()}${ext}`;
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

export async function uploadBufferToR2(buffer, { requestId, fileName, contentType }) {
  const key = keyForFile(requestId, fileName);
  const client = getClient();
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  return { key, publicUrl: publicUrlForKey(key) };
}

export async function deleteFileFromR2(urlOrKey) {
  const client = getClient();
  const key = urlOrKey.includes('://') ? urlOrKey.split('/').slice(3).join('/') : urlOrKey;
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
