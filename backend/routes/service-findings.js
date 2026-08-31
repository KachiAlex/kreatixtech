import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { logAudit } from '../middleware/audit.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all findings for a service request
router.get('/request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      select: { orgId: true }
    });

    if (!request) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    if (req.user.role === 'CLIENT' && request.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const findings = await prisma.serviceFinding.findMany({
      where: { requestId },
      orderBy: [
        { severity: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(findings);
  } catch (error) {
    console.error('Get service findings error:', error);
    res.status(500).json({ error: 'Failed to fetch service findings' });
  }
});

// Create finding (admin/analyst only)
router.post('/', requireAdmin, [
  body('requestId').isUUID(),
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('description').trim().isLength({ min: 10 }),
  body('severity').isIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']),
  body('category').trim().isLength({ min: 2 }),
  body('remediation').trim().isLength({ min: 10 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { requestId, title, description, severity, cvssScore, category, affectedUrl, remediation, evidence } = req.body;

    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      select: { orgId: true }
    });

    if (!request) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    const finding = await prisma.serviceFinding.create({
      data: {
        requestId,
        title,
        description,
        severity,
        cvssScore: cvssScore ? parseFloat(cvssScore) : null,
        category,
        affectedUrl,
        remediation,
        evidence
      }
    });

    await logAudit({
      userId: req.user.id,
      action: 'FINDING_CREATE',
      resourceType: 'service_finding',
      resourceId: finding.id,
      details: { requestId, title, severity },
      req
    });

    res.status(201).json(finding);
  } catch (error) {
    console.error('Create service finding error:', error);
    res.status(500).json({ error: 'Failed to create service finding' });
  }
});

// Update finding
router.put('/:id', [
  param('id').isUUID()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const updateData = {};

    const finding = await prisma.serviceFinding.findUnique({
      where: { id },
      include: { request: true }
    });

    if (!finding) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    if (req.user.role === 'CLIENT') {
      if (finding.request.orgId !== req.user.orgId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      // Clients can only update status
      if (req.body.status && ['IN_PROGRESS', 'RESOLVED', 'ACCEPTED_RISK'].includes(req.body.status)) {
        updateData.status = req.body.status;
        if (req.body.status === 'RESOLVED') {
          updateData.resolvedAt = new Date();
          updateData.resolvedBy = req.user.id;
        }
      }
    } else {
      // Admins/analysts can update everything
      const allowedFields = ['title', 'description', 'severity', 'cvssScore', 'category', 'affectedUrl', 'remediation', 'evidence', 'status'];
      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
          if (key === 'cvssScore') {
            updateData[key] = req.body[key] ? parseFloat(req.body[key]) : null;
          } else {
            updateData[key] = req.body[key];
          }
        }
      });
      if (req.body.status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = req.user.id;
      }
    }

    const updated = await prisma.serviceFinding.update({
      where: { id },
      data: updateData
    });

    await logAudit({
      userId: req.user.id,
      action: 'FINDING_UPDATE',
      resourceType: 'service_finding',
      resourceId: id,
      details: updateData,
      req
    });

    res.json(updated);
  } catch (error) {
    console.error('Update service finding error:', error);
    res.status(500).json({ error: 'Failed to update service finding' });
  }
});

// Delete finding (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const finding = await prisma.serviceFinding.findUnique({ where: { id } });
    if (!finding) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    await prisma.serviceFinding.delete({ where: { id } });

    await logAudit({
      userId: req.user.id,
      action: 'FINDING_DELETE',
      resourceType: 'service_finding',
      resourceId: id,
      req
    });

    res.json({ message: 'Finding deleted' });
  } catch (error) {
    console.error('Delete service finding error:', error);
    res.status(500).json({ error: 'Failed to delete service finding' });
  }
});

// Get severity summary for a service request
router.get('/request/:requestId/summary', async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      select: { orgId: true }
    });

    if (!request) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    if (req.user.role === 'CLIENT' && request.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const findings = await prisma.serviceFinding.groupBy({
      by: ['severity', 'status'],
      where: { requestId },
      _count: true
    });

    const totalFindings = await prisma.serviceFinding.count({ where: { requestId } });
    const resolvedCount = await prisma.serviceFinding.count({
      where: { requestId, status: 'RESOLVED' }
    });

    res.json({
      total: totalFindings,
      resolved: resolvedCount,
      breakdown: findings
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;
