import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: list testimonials
router.get('/', async (req, res) => {
  try {
    const { featured } = req.query;
    const where = {};
    if (featured === 'true') where.featured = true;

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(testimonials);
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Admin: create testimonial
router.post('/', [
  body('clientName').trim().isLength({ min: 2 }),
  body('quote').trim().isLength({ min: 10 }),
], requireAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const testimonial = await prisma.testimonial.create({
      data: req.body
    });
    res.status(201).json(testimonial);
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

// Admin: update testimonial
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.testimonial.update({
      where: { id },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// Admin: delete testimonial
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.testimonial.delete({ where: { id } });
    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

export default router;
