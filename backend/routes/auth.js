import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { sendPasswordResetEmail } from '../services/email.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      orgId: user.orgId 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  body('orgName').trim().isLength({ min: 2 }),
  body('subdomain').trim().isLength({ min: 3 }).matches(/^[a-z0-9-]+$/),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name, orgName, subdomain } = req.body;

  try {
    const existingOrg = await prisma.organization.findUnique({
      where: { subdomain }
    });

    if (existingOrg) {
      return res.status(400).json({ error: 'Subdomain already taken' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          subdomain,
          name: orgName,
          contactEmail: email,
        }
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          name,
          role: 'CLIENT',
          orgId: organization.id,
        },
        include: { organization: true }
      });

      return user;
    });

    const token = generateToken(result);

    await logAudit({
      userId: result.id,
      action: 'REGISTER',
      resourceType: 'user',
      resourceId: result.id,
      details: { email: result.email, org: result.organization.name },
      req
    });

    res.status(201).json({
      token,
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        organization: result.organization
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      resourceType: 'user',
      resourceId: user.id,
      details: { email: user.email },
      req
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/create-admin', async (req, res) => {
  const { email, password, name, adminSecret } = req.body;

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Invalid admin secret' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const kreatixOrg = await prisma.organization.findFirst({
      where: { subdomain: 'kreatix-admin' }
    }) || await prisma.organization.create({
      data: {
        subdomain: 'kreatix-admin',
        name: 'Kreatix Technologies',
        contactEmail: 'admin@kreatixtech.com',
      }
    });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        role: 'ADMIN',
        orgId: kreatixOrg.id,
      },
      include: { organization: true }
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization
      }
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ 
      error: 'Admin creation failed',
      message: error.message,
      code: error.code
    });
  }
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { organization: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization
    });
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

// Update own profile (name, email, password)
router.patch('/profile', [
  body('name').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('currentPassword').optional(),
  body('newPassword').optional().isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updateData = {};

    if (name) updateData.name = name;

    if (email && email !== user.email) {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return res.status(400).json({ error: 'Email already in use' });
      updateData.email = email;
    }

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: 'Current password required' });
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) return res.status(400).json({ error: 'Current password incorrect' });
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0)
      return res.status(400).json({ error: 'Nothing to update' });

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      include: { organization: true },
    });

    const token = generateToken(updated);
    res.json({
      token,
      user: { id: updated.id, email: updated.email, name: updated.name, role: updated.role, organization: updated.organization },
    });
  } catch (e) {
    console.error('Profile update error:', e);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Return success even if user not found (security best practice)
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'https://kreatixtech.vercel.app'}/portal/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl
      });
    } catch (emailErr) {
      console.error('Resend password reset email failed:', emailErr.message);
    }

    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Password reset: verify token and update password
router.post('/reset-password', [
  body('token').trim().isLength({ min: 1 }),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { resetToken: token }
    });

    if (!user || !user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
