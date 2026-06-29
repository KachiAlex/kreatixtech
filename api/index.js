import express from 'express';

let app;
let initError = null;
let debugInfo = [];

try {
  debugInfo.push('Step 1: Importing express - OK');
  debugInfo.push('Step 2: About to import server.js');
  const mod = await import('../backend/server.js');
  debugInfo.push('Step 3: server.js imported successfully');
  app = mod.default || mod;
  debugInfo.push('Step 4: App assigned, type: ' + typeof app);
} catch (err) {
  initError = err;
  console.error('SERVER_INIT_ERROR:', err);
  debugInfo.push('ERROR: ' + (err?.message || String(err)));
  app = express();
  app.all('*', (req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: initError?.message || String(initError),
      debugInfo,
      stack: initError?.stack?.split('\n').slice(0, 10)
    });
  });
}

export default app;
