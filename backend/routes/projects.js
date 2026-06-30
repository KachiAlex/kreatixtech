import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { requireAdmin, authenticateToken } from '../middleware/auth.js';

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
