import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// Get all findings for an assessment
router.get('/assessment/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await prisma.vaptAssessment.findUnique({
      where: { id: assessmentId },
      select: { orgId: true }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (req.user.role === 'CLIENT' && assessment.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const findings = await prisma.finding.findMany({
      where: { assessmentId },
      orderBy: [
        { severity: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(findings);
  } catch (error) {
    console.error('Get findings error:', error);
    res.status(500).json({ error: 'Failed to fetch findings' });
  }
});

// Create finding (admin/analyst only)
router.post('/', [
  body('assessmentId').isUUID(),
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
    const { assessmentId, title, description, severity, cvssScore, category, affectedUrl, remediation, evidence } = req.body;

    const assessment = await prisma.vaptAssessment.findUnique({
      where: { id: assessmentId },
      select: { orgId: true }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const finding = await prisma.finding.create({
      data: {
        assessmentId,
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
      resourceType: 'finding',
      resourceId: finding.id,
      details: { assessmentId, title, severity },
      req
    });

    res.status(201).json(finding);
  } catch (error) {
    console.error('Create finding error:', error);
    res.status(500).json({ error: 'Failed to create finding' });
  }
});

// Update finding (admin/analyst can update anything, client can only update status to RESOLVED/IN_PROGRESS)
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

    const finding = await prisma.finding.findUnique({
      where: { id },
      include: { assessment: true }
    });

    if (!finding) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    if (req.user.role === 'CLIENT') {
      if (finding.assessment.orgId !== req.user.orgId) {
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

    const updated = await prisma.finding.update({
      where: { id },
      data: updateData
    });

    await logAudit({
      userId: req.user.id,
      action: 'FINDING_UPDATE',
      resourceType: 'finding',
      resourceId: id,
      details: updateData,
      req
    });

    res.json(updated);
  } catch (error) {
    console.error('Update finding error:', error);
    res.status(500).json({ error: 'Failed to update finding' });
  }
});

// Delete finding (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const finding = await prisma.finding.findUnique({ where: { id } });
    if (!finding) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    await prisma.finding.delete({ where: { id } });

    await logAudit({
      userId: req.user.id,
      action: 'FINDING_DELETE',
      resourceType: 'finding',
      resourceId: id,
      req
    });

    res.json({ message: 'Finding deleted' });
  } catch (error) {
    console.error('Delete finding error:', error);
    res.status(500).json({ error: 'Failed to delete finding' });
  }
});

// Get severity summary for an assessment
router.get('/assessment/:assessmentId/summary', async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await prisma.vaptAssessment.findUnique({
      where: { id: assessmentId },
      select: { orgId: true }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (req.user.role === 'CLIENT' && assessment.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const findings = await prisma.finding.groupBy({
      by: ['severity', 'status'],
      where: { assessmentId },
      _count: true
    });

    const totalFindings = await prisma.finding.count({ where: { assessmentId } });
    const resolvedCount = await prisma.finding.count({
      where: { assessmentId, status: 'RESOLVED' }
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
