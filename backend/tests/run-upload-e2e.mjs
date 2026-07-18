import { strict as assert } from 'assert';

const API_URL = process.env.API_URL || 'https://kreatixtech.fly.dev';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL;
const CLIENT_PASSWORD = process.env.CLIENT_PASSWORD;

assert(ADMIN_EMAIL && ADMIN_PASSWORD, 'Set ADMIN_EMAIL and ADMIN_PASSWORD');
assert(CLIENT_EMAIL && CLIENT_PASSWORD, 'Set CLIENT_EMAIL and CLIENT_PASSWORD');

async function login(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  assert(res.ok, `Login failed for ${email}: ${data.error || res.statusText}`);
  return { token: data.token, user: data.user };
}

async function findRequest(adminToken, orgId) {
  const res = await fetch(`${API_URL}/api/requests?page=1&limit=20`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const data = await res.json();
  assert(res.ok, `Failed to list requests: ${data.error || res.statusText}`);
  const req = data.requests?.find(r => r.orgId === orgId) || data.requests?.[0];
  assert(req, 'No service requests found for admin');
  return req.id;
}

async function uploadFileAsAdmin(adminToken, requestId) {
  const pdf = new Blob(['%PDF-1.4 e2e test upload flow'], { type: 'application/pdf' });
  const fd = new FormData();
  fd.append('files', pdf, 'e2e-test.pdf');

  const res = await fetch(`${API_URL}/api/service-uploads/request/${requestId}?skipMessage=true`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: fd,
  });
  const data = await res.json();
  assert(res.ok, `Admin upload failed: ${data.error || res.statusText}${data.detail ? ` | ${data.detail}` : ''}`);
  assert(data.attachments?.length === 1, 'Expected one attachment');
  const att = data.attachments[0];
  assert(att.fileUrl, 'Attachment missing fileUrl');
  assert(att.fileUrl.startsWith('https://'), `Expected HTTPS URL, got: ${att.fileUrl}`);
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
  console.log('1. Client login (to get orgId)...');
  const { token: clientToken, user: clientUser } = await login(CLIENT_EMAIL, CLIENT_PASSWORD);
  const clientOrgId = clientUser.orgId || clientUser.organization?.id;
  console.log('   Client orgId:', clientOrgId);

  console.log('2. Admin login...');
  const { token: adminToken } = await login(ADMIN_EMAIL, ADMIN_PASSWORD);

  console.log('3. Finding a service request for client org...');
  const requestId = await findRequest(adminToken, clientOrgId);
  console.log('   Using request:', requestId);

  console.log('4. Admin uploading file...');
  const att = await uploadFileAsAdmin(adminToken, requestId);
  console.log('   Uploaded:', att.fileName, '->', att.fileUrl);

  console.log('5. Client listing attachments...');
  const attachments = await fetchAttachmentsAsClient(clientToken, requestId);
  assert(attachments.some(a => a.id === att.id), 'Uploaded attachment not visible to client');

  console.log('6. Client downloading file...');
  const length = await downloadFile(att.fileUrl);
  console.log('   Downloaded', length, 'bytes successfully');

  console.log('7. Cleaning up test file...');
  await cleanup(adminToken, att.id);

  console.log('\nE2E upload/download test passed');
}

run().catch(err => {
  console.error('\nE2E test failed:', err.message);
  process.exit(1);
});
