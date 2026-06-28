export default function handler(req, res) {
  res.json({ test: true, timestamp: new Date().toISOString() });
}
