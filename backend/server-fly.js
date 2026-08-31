import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.json({ status: 'ok', source: 'fly-minimal' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', source: 'fly-minimal' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});
