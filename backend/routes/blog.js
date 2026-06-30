import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: list published posts
router.get('/', async (req, res) => {
  try {
    const { tag, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { published: true };
    if (tag) {
      where.tags = { has: tag };
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImage: true,
          author: true,
          tags: true,
          publishedAt: true,
          createdAt: true
        }
      }),
      prisma.blogPost.count({ where })
    ]);

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Public: get single post by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!post || (!post.published && req.user?.role !== 'ADMIN')) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Admin: create post
router.post('/', [
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('slug').trim().isLength({ min: 3 }).matches(/^[a-z0-9-]+$/),
  body('excerpt').trim().isLength({ min: 10, max: 500 }),
  body('content').trim().isLength({ min: 50 }),
  body('author').trim().isLength({ min: 2 }),
], requireAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, slug, excerpt, content, coverImage, author, tags, published } = req.body;

    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        author,
        tags: tags || [],
        published: published || false,
        publishedAt: published ? new Date() : null
      }
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Admin: update post
router.put('/:id', [
  param('id').isUUID()
], requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    const allowedFields = ['title', 'excerpt', 'content', 'coverImage', 'author', 'tags'];
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) updateData[key] = req.body[key];
    });

    if (req.body.published !== undefined) {
      updateData.published = req.body.published;
      if (req.body.published) {
        updateData.publishedAt = new Date();
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData
    });

    res.json(post);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Admin: delete post
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.blogPost.delete({ where: { id } });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
