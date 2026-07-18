import { strict as assert } from 'assert';

const API_URL = process.env.API_URL || 'https://kreatixtech.fly.dev';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL;
const CLIENT_PASSWORD = process.env.CLIENT_PASSWORD;
const REQUEST_ID = process.env.REQUEST_ID;

async function login(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  assert(res.ok, `Login failed for ${email}: ${data.error || res.statusText}`);
  return data.token;
}

async function uploadFileAsAdmin(adminToken, requestId) {
  const pdfContent = new Blob(['%PDF-1.4 test upload flow'], { type: 'application/pdf' });
  const fd = new FormData();
  fd.append('files', pdfContent, 'e2e-test.pdf');

  const res = await fetch(`${API_URL}/api/service-uploads/request/${requestId}?skipMessage=true`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: fd,
  });
  const data = await res.json();
  assert(res.ok, `Admin upload failed: ${data.error || res.statusText}`);
  assert(data.attachments?.length === 1, 'Expected one attachment');
  const att = data.attachments[0];
  assert(att.fileUrl, 'Attachment missing fileUrl');
  assert(att.fileUrl.startsWith('https://'), `Expected Cloudinary URL, got: ${att.fileUrl}`);
  return att;
}

async function fetchAttachmentsAsClient(clientToken, requestId) {
  const res = await fetch(`${API_URL}/api/service-uploads/request/${requestId}`, {
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const data = await res.json();
  assert(res.ok, `Client list attachments failed: ${data.error || res.statusText}`);
  return data;
}

async function downloadFile(url) {
  const res = await fetch(url);
  assert(res.ok, `Download failed: ${res.status} ${res.statusText} for ${url}`);
  const text = await res.text();
  assert(text.includes('%PDF-1.4'), 'Downloaded file does not contain expected content');
  return text.length;
}

async function cleanup(adminToken, attId) {
  try {
    await fetch(`${API_URL}/api/service-uploads/${attId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  } catch (e) {
    console.log('Cleanup warning:', e.message);
  }
}

async function run() {
  assert(ADMIN_EMAIL && ADMIN_PASSWORD, 'Set ADMIN_EMAIL and ADMIN_PASSWORD');
  assert(CLIENT_EMAIL && CLIENT_PASSWORD, 'Set CLIENT_EMAIL and CLIENT_PASSWORD');
  assert(REQUEST_ID, 'Set REQUEST_ID');

  console.log('1. Logging in as admin...');
  const adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);

  console.log('2. Admin uploading file to request', REQUEST_ID);
  const att = await uploadFileAsAdmin(adminToken, REQUEST_ID);
  console.log('   Uploaded:', att.fileName, '->', att.fileUrl);

  console.log('3. Logging in as client...');
  const clientToken = await login(CLIENT_EMAIL, CLIENT_PASSWORD);

  console.log('4. Client listing attachments...');
  const attachments = await fetchAttachmentsAsClient(clientToken, REQUEST_ID);
  assert(attachments.some(a => a.id === att.id), 'Uploaded attachment not visible to client');

  console.log('5. Client downloading file from', att.fileUrl);
  const length = await downloadFile(att.fileUrl);
  console.log('   Downloaded', length, 'bytes successfully');

  console.log('6. Cleaning up test file...');
  await cleanup(adminToken, att.id);

  console.log('\nE2E upload/download test passed');
}

run().catch(err => {
  console.error('\nE2E test failed:', err.message);
  process.exit(1);
});
