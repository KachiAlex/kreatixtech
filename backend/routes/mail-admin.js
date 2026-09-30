import express from 'express';
import { requireAdminOnly } from '../middleware/auth.js';

const router = express.Router();

const MAIL_API = (process.env.MAIL_API_URL || 'https://mail.kreatixtech.com').replace(/\/+$/, '');
const MAIL_SECRET = process.env.MAIL_ADMIN_SECRET || '';

// Server-side proxy to the Kreatix Mail admin API. The mail admin secret lives
// only here in the backend environment — it never ships in the browser bundle.
// Only the user-management surface the panel needs is forwarded; arbitrary
// upstream paths are not reachable through this route.
router.use(requireAdminOnly);

router.all('/users/:id?', async (req, res) => {
  if (!MAIL_SECRET) {
    return res.status(503).json({ error: 'Mail admin is not configured on the server' });
  }
  try {
    const target = `${MAIL_API}/api/admin/users${req.params.id ? `/${encodeURIComponent(req.params.id)}` : ''}`;
    const upstream = await fetch(target, {
      method: req.method,
      headers: {
        'X-Admin-Secret': MAIL_SECRET,
        'Content-Type': 'application/json',
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    });
    const text = await upstream.text();
    res.status(upstream.status).type(upstream.headers.get('content-type') || 'application/json').send(text);
  } catch (err) {
    console.error('Mail admin proxy error:', err.message);
    res.status(502).json({ error: 'Mail service unreachable' });
  }
});

export default router;
