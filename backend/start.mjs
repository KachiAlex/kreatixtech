// Wrapper entry point that surfaces static import errors from server.js.
// Node ESM exits silently with code 13 on static import failures — this
// catches and logs them before the process dies.
import { createRequire } from 'module';

process.on('uncaughtException', (err) => {
  process.stderr.write(`STARTUP CRASH (uncaughtException): ${err.name}: ${err.message}\n${err.stack}\n`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? `${reason.message}\n${reason.stack}` : String(reason);
  process.stderr.write(`STARTUP CRASH (unhandledRejection): ${msg}\n`);
  process.exit(1);
});

console.log('start.mjs: loading server.js...');

// Run db push in the background; it must not block HTTP startup because
// Fly's proxy health checks will fail before the server listens.
import { exec } from 'child_process';
exec('npx prisma db push --skip-generate --accept-data-loss', (err, stdout, stderr) => {
  if (err) {
    process.stderr.write(`start.mjs: prisma db push failed: ${err.message}\n`);
    return;
  }
  console.log('start.mjs: prisma db push done');
});

try {
  await import('./server.js');
} catch (err) {
  process.stderr.write(`STARTUP CRASH (import server.js): ${err.name}: ${err.message}\n${err.stack}\n`);
  process.exit(1);
}
