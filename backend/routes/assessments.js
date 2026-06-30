import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { getIo } from '../lib/socket.js';
import { requireAdmin } from '../middleware/auth.js';
import { sendNewAssessmentEmail, sendStatusChangeEmail, sendAssignedEmail } from '../services/email.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let where = {};

    if (req.user.role === 'CLIENT') {
      where.orgId = req.user.orgId;
    }

    if (status) {
      where.status = status;
    }

    const [assessments, total] = await Promise.all([
      prisma.vaptAssessment.findMany({
        where,
        include: {
          organization: {
            select: { id: true, name: true, subdomain: true }
          },
          assignedAdmin: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: { messages: true, attachments: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.vaptAssessment.count({ where })
    ]);

    res.json({
      assessments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

router.get('/:id', [
  param('id').isUUID()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;

    const assessment = await prisma.vaptAssessment.findUnique({
      where: { id },
      include: {
        organization: {
          select: { id: true, name: true, subdomain: true, contactEmail: true }
        },
        assignedAdmin: {
          select: { id: true, name: true, email: true }
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, role: true }
            },
            attachments: true
          },
          orderBy: { createdAt: 'asc' }
        },
        attachments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (req.user.role === 'CLIENT' && assessment.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(assessment);
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

router.post('/', [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('scopeDescription').trim().isLength({ min: 10 }),
  body('targetUrls').isArray().optional(),
  body('ipRanges').isArray().optional(),
  body('testingType').isIn(['BLACK_BOX', 'GREY_BOX', 'WHITE_BOX']),
  body('specialReqs').trim().optional(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, scopeDescription, targetUrls, ipRanges, testingType, specialReqs } = req.body;

    const assessment = await prisma.vaptAssessment.create({
      data: {
        orgId: req.user.orgId,
        title,
        scopeDescription,
        targetUrls: targetUrls || [],
        ipRanges: ipRanges || [],
        testingType,
        specialReqs,
        status: 'PENDING'
      },
      include: {
        organization: {
          select: { id: true, name: true, subdomain: true }
        }
      }
    });

    getIo().emit('new-assessment', assessment);

    // Send email notification to all admins
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true }
      });
      const adminEmails = admins.map(a => a.email);

      if (adminEmails.length > 0) {
        await sendNewAssessmentEmail({
          to: adminEmails,
          assessmentTitle: title,
          organizationName: assessment.organization.name,
          assessmentId: assessment.id
        });
      }
    } catch (emailErr) {
      console.error('Resend assessment notification failed:', emailErr.message);
    }

    res.status(201).json(assessment);
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

router.put('/:id', [
  param('id').isUUID(),
  body('title').trim().isLength({ min: 3, max: 200 }).optional(),
  body('scopeDescription').trim().isLength({ min: 10 }).optional(),
  body('status').isIn(['PENDING', 'IN_REVIEW', 'APPROVED', 'IN_PROGRESS', 'REPORTING', 'COMPLETE', 'ON_HOLD']).optional(),
  body('assignedAdminId').isUUID().optional(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const updateData = {};

    const existingAssessment = await prisma.vaptAssessment.findUnique({
      where: { id }
    });

    if (!existingAssessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (req.user.role === 'CLIENT') {
      if (existingAssessment.orgId !== req.user.orgId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const allowedFields = ['title', 'scopeDescription', 'targetUrls', 'ipRanges', 'specialReqs'];
      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
          updateData[key] = req.body[key];
        }
      });
    } else {
      Object.keys(req.body).forEach(key => {
        updateData[key] = req.body[key];
      });
    }

    const assessment = await prisma.vaptAssessment.update({
      where: { id },
      data: updateData,
      include: {
        organization: {
          select: { id: true, name: true, subdomain: true }
        },
        assignedAdmin: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    getIo().to(`assessment:${id}`).emit('assessment-updated', assessment);
    getIo().to(`org:${assessment.orgId}`).emit('assessment-updated', assessment);

    // Send email notification on status change
    if (updateData.status && updateData.status !== existingAssessment.status) {
      try {
        const orgUsers = await prisma.user.findMany({
          where: { orgId: assessment.orgId },
          select: { email: true }
        });
        const emails = orgUsers.map(u => u.email);

        if (emails.length > 0) {
          await sendStatusChangeEmail({
            to: emails,
            assessmentTitle: assessment.title,
            oldStatus: existingAssessment.status,
            newStatus: updateData.status,
            assessmentId: id
          });
        }
      } catch (emailErr) {
        console.error('Resend status change notification failed:', emailErr.message);
      }
    }

    res.json(assessment);
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({ error: 'Failed to update assessment' });
  }
});

router.post('/:id/assign', [
  param('id').isUUID(),
  body('adminId').isUUID()
], requireAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { adminId } = req.body;

    const admin = await prisma.user.findFirst({
      where: { 
        id: adminId,
        role: { in: ['ADMIN', 'ANALYST'] }
      }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const assessment = await prisma.vaptAssessment.update({
      where: { id },
      data: { 
        assignedAdminId: adminId,
        status: 'IN_REVIEW'
      },
      include: {
        organization: {
          select: { id: true, name: true, subdomain: true }
        },
        assignedAdmin: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    await prisma.notification.create({
      data: {
        userId: adminId,
        assessmentId: id,
        type: 'ASSESSMENT_ASSIGNED',
        title: 'New Assessment Assigned',
        message: `You have been assigned to: ${assessment.title}`
      }
    });

    // Send email to assigned admin
    try {
      if (admin.email) {
        await sendAssignedEmail({
          to: admin.email,
          assessmentTitle: assessment.title,
          adminName: admin.name,
          assessmentId: id
        });
      }
    } catch (emailErr) {
      console.error('Resend assignment notification failed:', emailErr.message);
    }

    getIo().to(`assessment:${id}`).emit('assignment-updated', assessment);

    res.json(assessment);
  } catch (error) {
    console.error('Assign assessment error:', error);
    res.status(500).json({ error: 'Failed to assign assessment' });
  }
});

router.delete('/:id', [
  param('id').isUUID()
], requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.vaptAssessment.delete({
      where: { id }
    });

    getIo().to(`assessment:${id}`).emit('assessment-deleted', { id });

    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
});

export default router;
