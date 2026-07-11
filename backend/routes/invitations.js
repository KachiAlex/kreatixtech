import express from 'express';
import { body, param, validationResult } from 'express-validator';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../services/email.js';
import { logAudit } from '../middleware/audit.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Invite user to organization
router.post('/', [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().isLength({ min: 2 }),
  body('role').isIn(['CLIENT', 'ANALYST'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, name, role } = req.body;
    const orgId = req.user.orgId;

    // Only org admins or CLIENT users can invite (simplified — in real app, check org-level admin)
    if (req.user.role === 'CLIENT') {
      // Check if this user is the first/primary contact for the org
      const orgUsers = await prisma.user.findMany({
        where: { orgId },
        orderBy: { createdAt: 'asc' },
        take: 1
      });
      if (orgUsers[0]?.id !== req.user.id) {
        return res.status(403).json({ error: 'Only org admins can invite users' });
      }
    }

    // Check if email already in org
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.orgId === orgId) {
      return res.status(400).json({ error: 'User already in organization' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        email,
        orgId,
        invitedBy: req.user.id,
        role,
        token,
        expiresAt
      },
      include: {
        organization: true
      }
    });

    const baseUrl = (process.env.FRONTEND_URL || 'https://kreatixtech.vercel.app').replace(/\/+$/, '');
    const inviteUrl = `${baseUrl}/portal/accept-invite?token=${token}`;

    try {
      await sendEmail({
        to: email,
        subject: `You've been invited to join ${invitation.organization.name} on Kreatix Technologies`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B35;">Organization Invitation</h2>
            <p>Hi ${name},</p>
            <p>You've been invited to join <strong>${invitation.organization.name}</strong> on the Kreatix Technologies portal.</p>
            <p><a href="${inviteUrl}" style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">Accept Invitation</a></p>
            <p style="margin-top: 24px; color: #666;">This link expires in 7 days.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #999; font-size: 12px;">Kreatix Technologies</p>
          </div>
        `,
        text: `Join ${invitation.organization.name}: ${inviteUrl}`
      });
    } catch (emailErr) {
      console.error('Invite email failed:', emailErr.message);
    }

    await logAudit({
      userId: req.user.id,
      action: 'USER_INVITE',
      resourceType: 'invitation',
      resourceId: invitation.id,
      details: { email, role },
      req
    });

    res.status(201).json({
      message: 'Invitation sent',
      inviteUrl,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    console.error('Create invitation error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Accept invitation
router.post('/accept', [
  body('token').trim().isLength({ min: 1 }),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token, password } = req.body;

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { organization: true }
    });

    if (!invitation) {
      return res.status(400).json({ error: 'Invalid invitation token' });
    }

    if (invitation.acceptedAt) {
      return res.status(400).json({ error: 'Invitation already accepted' });
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ error: 'Invitation expired' });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email: invitation.email } });

    if (user) {
      // Update existing user's org if they don't have one
      if (user.orgId) {
        return res.status(400).json({ error: 'User already belongs to an organization' });
      }
      user = await prisma.user.update({
        where: { id: user.id },
        data: { orgId: invitation.orgId, role: invitation.role }
      });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email: invitation.email,
          passwordHash: hashedPassword,
          name: invitation.email.split('@')[0],
          role: invitation.role,
          orgId: invitation.orgId
        }
      });
    }

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() }
    });

    res.json({
      message: 'Invitation accepted',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Get pending invitations for org
router.get('/org', async (req, res) => {
  try {
    const invitations = await prisma.invitation.findMany({
      where: {
        orgId: req.user.orgId,
        acceptedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invitations);
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Get org members
router.get('/org/members', async (req, res) => {
  try {
    const members = await prisma.user.findMany({
      where: { orgId: req.user.orgId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Admin: list members of any org by orgId
router.get('/admin/org/:orgId/members', requireAdmin, async (req, res) => {
  try {
    const members = await prisma.user.findMany({
      where: { orgId: req.params.orgId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(members);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Admin: change a user's role
router.patch('/admin/users/:userId/role', requireAdmin, [
  body('role').isIn(['CLIENT', 'ANALYST', 'ADMIN']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const updated = await prisma.user.update({
      where: { id: req.params.userId },
      data: { role: req.body.role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Admin: remove a user from their org (deactivate by clearing orgId is not possible without schema change — instead delete)
router.delete('/admin/users/:userId', requireAdmin, async (req, res) => {
  try {
    if (req.params.userId === req.user.userId) return res.status(400).json({ error: 'Cannot remove yourself' });
    await prisma.user.delete({ where: { id: req.params.userId } });
    res.json({ message: 'User removed' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to remove user' });
  }
});

// Admin: resend invitation
router.post('/admin/:invitationId/resend', requireAdmin, async (req, res) => {
  try {
    const inv = await prisma.invitation.findUnique({
      where: { id: req.params.invitationId },
      include: { organization: true },
    });
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });
    const newToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.invitation.update({ where: { id: inv.id }, data: { token: newToken, expiresAt } });
    const baseUrl = (process.env.FRONTEND_URL || 'https://kreatixtech.vercel.app').replace(/\/+$/, '');
    const inviteUrl = `${baseUrl}/portal/accept-invite?token=${newToken}`;
    await sendEmail({
      to: inv.email,
      subject: `Invitation reminder: join ${inv.organization.name} on Kreatix Technologies`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px"><h2 style="color:#F2782E">Invitation Reminder</h2><p>You were invited to join <strong>${inv.organization.name}</strong>.</p><p><a href="${inviteUrl}" style="background:#F2782E;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block">Accept Invitation</a></p><p style="color:#666;margin-top:16px">Link expires in 7 days.</p></div>`,
      text: `Join ${inv.organization.name}: ${inviteUrl}`,
    }).catch(() => {});
    res.json({ message: 'Invitation resent', inviteUrl });
  } catch (e) {
    res.status(500).json({ error: 'Failed to resend invitation' });
  }
});

export default router;
