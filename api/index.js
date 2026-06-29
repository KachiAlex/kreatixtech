import express from 'express';
const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', source: 'minimal', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.json({ path: req.path, url: req.url, message: 'catch-all from minimal' });
});

export default app;
