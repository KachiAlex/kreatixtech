import express from 'express';

let app;
let initError = null;

try {
  const mod = await import('../backend/server.js');
  app = mod.default || mod;
} catch (err) {
  initError = err;
  app = express();
  app.all('*', (req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: initError?.message,
      stack: initError?.stack?.split('\n').slice(0, 6)
    });
  });
}

export default app;
