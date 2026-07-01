// Runs prisma db push then starts the actual server.
// Used as the CMD entrypoint so schema sync happens before the app starts.
import { execSync, spawn } from 'child_process';

console.log('[migrate] Running prisma db push...');
try {
  execSync('npx prisma db push --accept-data-loss --skip-generate', {
    stdio: 'inherit',
    timeout: 60000,
  });
  console.log('[migrate] prisma db push complete');
} catch (e) {
  console.warn('[migrate] prisma db push failed (non-fatal):', e.message);
  // Continue anyway — tables likely already exist
}

console.log('[migrate] Starting server...');
const server = spawn('node', ['start.mjs'], { stdio: 'inherit' });
server.on('exit', code => process.exit(code ?? 0));
