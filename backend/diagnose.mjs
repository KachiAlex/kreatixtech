// Run this on the fly machine to find which import is crashing:
// node diagnose.mjs
const imports = [
  'express',
  'cors',
  'dotenv',
  'http',
  'socket.io',
  'express-rate-limit',
  '@prisma/client',
  'bcryptjs',
  'jsonwebtoken',
  'multer',
  'uuid',
  'resend',
  'cloudinary',
];

for (const mod of imports) {
  try {
    await import(mod);
    console.log(`✓ ${mod}`);
  } catch (e) {
    console.error(`✗ ${mod}: ${e.message}`);
  }
}

console.log('\nDone. Now testing route imports...');

const routes = [
  './routes/auth.js',
  './routes/assessments.js',
  './routes/messages.js',
  './routes/notifications.js',
  './routes/contact.js',
  './routes/findings.js',
  './routes/blog.js',
  './routes/testimonials.js',
  './routes/audit.js',
  './routes/invitations.js',
  './middleware/auth.js',
];

for (const r of routes) {
  try {
    await import(r);
    console.log(`✓ ${r}`);
  } catch (e) {
    console.error(`✗ ${r}: ${e.message}`);
  }
}

console.log('\nAll done.');
