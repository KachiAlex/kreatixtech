import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { requireAdmin, authenticateToken } from '../middleware/auth.js';
import { uploadPortfolioImage, uploadBufferToCloudinary } from '../config/cloudinary.js';

const router = express.Router();

// ── Public: list published projects ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { featured, limit } = req.query;
    const where = { published: true };
    if (featured === 'true') where.featured = true;

    const projects = await prisma.project.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: limit ? parseInt(limit) : undefined,
    });
    res.json(projects);
  } catch (err) {
    console.error('GET /projects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// ── Public: single project ───────────────────────────────────────────────────
router.get('/:id', [param('id').isUUID()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// ── Admin: upload preview image ─────────────────────────────────────────────
router.post('/upload-image', authenticateToken, requireAdmin, uploadPortfolioImage.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'kreatix-portfolio',
      transformation: [{ width: 1200, height: 630, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Image upload error:', err.message || err, err.stack || '');
    res.status(500).json({ error: err.message || 'Failed to upload image' });
  }
});

// ── Admin: fetch OG image from a URL ─────────────────────────────────────────
router.post('/fetch-og', authenticateToken, requireAdmin, [
  body('url').isURL(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid URL' });
  try {
    const response = await fetch(req.body.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KreatixBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return res.status(422).json({ error: 'Could not fetch the page' });
    const html = await response.text();
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (!match) return res.status(404).json({ error: 'No OG image found on that page' });
    res.json({ url: match[1] });
  } catch (err) {
    console.error('fetch-og error:', err.message || err, err.stack || '');
    res.status(500).json({ error: err.message || 'Failed to fetch OG image' });
  }
});

// ── Admin: create ────────────────────────────────────────────────────────────
router.post('/', authenticateToken, requireAdmin, [
  body('title').trim().isLength({ min: 2, max: 200 }),
  body('description').trim().isLength({ min: 5 }),
  body('tags').isArray().optional(),
  body('category').trim().optional(),
  body('liveUrl').isURL().optional({ nullable: true, checkFalsy: true }),
  body('previewUrl').isURL().optional({ nullable: true, checkFalsy: true }),
  body('featured').isBoolean().optional(),
  body('published').isBoolean().optional(),
  body('sortOrder').isInt().optional(),
  body('year').isInt({ min: 2000, max: 2100 }).optional(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { title, description, tags, category, liveUrl, previewUrl, featured, published, sortOrder, year } = req.body;
    const project = await prisma.project.create({
      data: {
        title, description,
        tags: tags || [],
        category: category || null,
        liveUrl: liveUrl || null,
        previewUrl: previewUrl || null,
        featured: featured ?? false,
        published: published ?? true,
        sortOrder: sortOrder ?? 0,
        year: year || new Date().getFullYear(),
      }
    });
    res.status(201).json(project);
  } catch (err) {
    console.error('POST /projects error:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// ── Admin: update ────────────────────────────────────────────────────────────
router.put('/:id', authenticateToken, requireAdmin, [param('id').isUUID()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const allowed = ['title','description','tags','category','liveUrl','previewUrl','featured','published','sortOrder','year'];
    const data = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k]; });
    // Coerce empty strings to null for URL fields
    if (data.liveUrl === '') data.liveUrl = null;
    if (data.previewUrl === '') data.previewUrl = null;

    const project = await prisma.project.update({ where: { id: req.params.id }, data });
    res.json(project);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Project not found' });
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// ── Admin: delete ────────────────────────────────────────────────────────────
router.delete('/:id', authenticateToken, requireAdmin, [param('id').isUUID()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Project not found' });
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
