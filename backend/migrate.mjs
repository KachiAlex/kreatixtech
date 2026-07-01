// Runs prisma db push with a timeout, then exits so the main server can start.
// Used as a pre-start step in the Dockerfile CMD.
import { execSync } from 'child_process';

console.log('Running prisma db push...');
try {
  execSync('npx prisma db push --accept-data-loss --skip-generate', {
    stdio: 'inherit',
    timeout: 60000, // 60s max
  });
  console.log('prisma db push complete');
} catch (e) {
  console.warn('prisma db push failed (non-fatal):', e.message);
  // Don't exit — let the server start anyway (tables may already exist)
}
