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

    const [requests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
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
      prisma.serviceRequest.count({ where })
    ]);

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get service requests error:', error);
    res.status(500).json({ error: 'Failed to fetch service requests' });
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

    const request = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        organization: {
          select: { id: true, name: true, subdomain: true, contactEmail: true }
        },
        assignedAdmin: {
          select: { id: true, name: true, email: true }
        },
        messages: {
          where: req.user.role === 'CLIENT'
            ? { messageType: { not: 'INTERNAL_NOTE' } }
            : undefined,
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
        },
        milestones: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    if (req.user.role === 'CLIENT' && request.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(request);
  } catch (error) {
    console.error('Get service request error:', error);
    res.status(500).json({ error: 'Failed to fetch service request' });
  }
});

router.post('/', [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('scopeDescription').trim().isLength({ min: 10 }),
  body('targetUrls').isArray().optional(),
  body('ipRanges').isArray().optional(),
  body('testingType').isIn(['BLACK_BOX', 'GREY_BOX', 'WHITE_BOX']).optional(),
  body('specialReqs').trim().optional(),
  body('serviceType').isIn(['SOFTWARE_DEV', 'CYBERSECURITY', 'CLOUD', 'CONSULTING']).optional(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      title,
      scopeDescription,
      targetUrls,
      ipRanges,
      testingType,
      specialReqs,
      serviceType = 'CYBERSECURITY'
    } = req.body;

    const request = await prisma.serviceRequest.create({
      data: {
        orgId: req.user.orgId,
        serviceType,
        title,
        description: scopeDescription,
        metadata: {
          targetUrls: targetUrls || [],
          ipRanges: ipRanges || [],
          testingType: testingType || 'GREY_BOX',
          specialReqs: specialReqs || null
        },
        status: 'SUBMITTED'
      },
      include: {
        organization: {
          select: { id: true, name: true, subdomain: true }
        }
      }
    });

    getIo().emit('new-service-request', request);

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
          organizationName: request.organization.name,
          assessmentId: request.id
        });
      }
    } catch (emailErr) {
      console.error('Resend service request notification failed:', emailErr.message);
    }

    res.status(201).json(request);
  } catch (error) {
    console.error('Create service request error:', error);
    res.status(500).json({ error: 'Failed to create service request' });
  }
});

router.put('/:id', [
  param('id').isUUID(),
  body('title').trim().isLength({ min: 3, max: 200 }).optional(),
  body('description').trim().isLength({ min: 10 }).optional(),
  body('status').isIn(['SUBMITTED', 'REVIEWED', 'SCOPED', 'IN_PROGRESS', 'REVIEW', 'DELIVERED', 'CLOSED', 'ON_HOLD']).optional(),
  body('assignedAdminId').isUUID().optional(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const updateData = {};

    const existingRequest = await prisma.serviceRequest.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    if (req.user.role === 'CLIENT') {
      if (existingRequest.orgId !== req.user.orgId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Clients can only update title, description, and metadata fields
      const allowedFields = ['title', 'description'];
      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
          updateData[key] = req.body[key];
        }
      });
      // Allow metadata updates for client
      if (req.body.metadata) {
        updateData.metadata = { ...existingRequest.metadata, ...req.body.metadata };
      }
    } else {
      Object.keys(req.body).forEach(key => {
        updateData[key] = req.body[key];
      });
    }

    const request = await prisma.serviceRequest.update({
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

    getIo().to(`request:${id}`).emit('request-updated', request);
    getIo().to(`org:${request.orgId}`).emit('request-updated', request);

    // Send email notification on status change
    if (updateData.status && updateData.status !== existingRequest.status) {
      try {
        const orgUsers = await prisma.user.findMany({
          where: { orgId: request.orgId },
          select: { email: true }
        });
        const emails = orgUsers.map(u => u.email);

        if (emails.length > 0) {
          await sendStatusChangeEmail({
            to: emails,
            assessmentTitle: request.title,
            oldStatus: existingRequest.status,
            newStatus: updateData.status,
            assessmentId: id
          });
        }
      } catch (emailErr) {
        console.error('Resend status change notification failed:', emailErr.message);
      }
    }

    res.json(request);
  } catch (error) {
    console.error('Update service request error:', error);
    res.status(500).json({ error: 'Failed to update service request' });
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

    const request = await prisma.serviceRequest.update({
      where: { id },
      data: { 
        assignedAdminId: adminId,
        status: 'REVIEWED'
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

    await prisma.serviceNotification.create({
      data: {
        userId: adminId,
        requestId: id,
        type: 'ASSESSMENT_ASSIGNED',
        title: 'New Service Request Assigned',
        message: `You have been assigned to: ${request.title}`
      }
    });

    // Send email to assigned admin
    try {
      if (admin.email) {
        await sendAssignedEmail({
          to: admin.email,
          assessmentTitle: request.title,
          adminName: admin.name,
          assessmentId: id
        });
      }
    } catch (emailErr) {
      console.error('Resend assignment notification failed:', emailErr.message);
    }

    getIo().to(`request:${id}`).emit('assignment-updated', request);

    res.json(request);
  } catch (error) {
    console.error('Assign service request error:', error);
    res.status(500).json({ error: 'Failed to assign service request' });
  }
});

router.delete('/:id', [
  param('id').isUUID()
], requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.serviceRequest.delete({
      where: { id }
    });

    getIo().to(`request:${id}`).emit('request-deleted', { id });

    res.json({ message: 'Service request deleted successfully' });
  } catch (error) {
    console.error('Delete service request error:', error);
    res.status(500).json({ error: 'Failed to delete service request' });
  }
});

// Stats — accurate server-side aggregates
router.get('/stats/summary', async (req, res) => {
  try {
    const where = req.user.role === 'CLIENT' ? { orgId: req.user.orgId } : {};

    const [total, submitted, reviewed, scoped, inProgress, review, delivered, closed, onHold] = await Promise.all([
      prisma.serviceRequest.count({ where }),
      prisma.serviceRequest.count({ where: { ...where, status: 'SUBMITTED' } }),
      prisma.serviceRequest.count({ where: { ...where, status: 'REVIEWED' } }),
      prisma.serviceRequest.count({ where: { ...where, status: 'SCOPED' } }),
      prisma.serviceRequest.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.serviceRequest.count({ where: { ...where, status: 'REVIEW' } }),
      prisma.serviceRequest.count({ where: { ...where, status: 'DELIVERED' } }),
      prisma.serviceRequest.count({ where: { ...where, status: 'CLOSED' } }),
      prisma.serviceRequest.count({ where: { ...where, status: 'ON_HOLD' } }),
    ]);

    let clients = 0;
    if (req.user.role !== 'CLIENT') {
      const orgs = await prisma.serviceRequest.findMany({
        where,
        select: { orgId: true },
        distinct: ['orgId'],
      });
      clients = orgs.length;
    }

    res.json({ total, submitted, reviewed, scoped, inProgress, review, delivered, closed, onHold, clients });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Upload / set final report (admin only)
router.put('/:id/report', requireAdmin, [
  param('id').isUUID(),
  body('reportUrl').optional().isURL(),
  body('reportSummary').optional().isString(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { id } = req.params;
    const { reportUrl, reportSummary } = req.body;

    const request = await prisma.serviceRequest.update({
      where: { id },
      data: {
        ...(reportUrl !== undefined && { reportUrl }),
        ...(reportSummary !== undefined && { reportSummary }),
        status: 'REVIEW',
      },
      include: {
        organization: { select: { id: true, name: true } },
        assignedAdmin: { select: { id: true, name: true } },
      }
    });

    getIo().to(`request:${id}`).emit('request-updated', request);

    // Notify org users
    const orgUsers = await prisma.user.findMany({
      where: { orgId: request.orgId },
      select: { id: true }
    });
    await Promise.all(orgUsers.map(u =>
      prisma.serviceNotification.create({
        data: {
          userId: u.id,
          requestId: id,
          type: 'STATUS_CHANGE',
          title: 'Report Available',
          message: `Your service report for "${request.title}" is now available.`
        }
      })
    ));

    res.json(request);
  } catch (error) {
    console.error('Report update error:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

export default router;
