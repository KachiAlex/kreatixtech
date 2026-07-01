import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { getIo } from '../lib/socket.js';
import { requireAdmin, authenticateToken } from '../middleware/auth.js';
import {
  sendNewRequestEmail, sendRequestStatusEmail,
  sendRequestAssignedEmail, sendDeliverableReadyEmail,
  sendFeedbackReceivedEmail,
} from '../services/email.js';

const router = express.Router();

// Creates a ServiceNotification and emits it in real-time to that user's socket room
async function notify(userId, requestId, type, title, message) {
  const notif = await prisma.serviceNotification.create({
    data: { userId, requestId, type, title, message }
  });
  getIo().to(`user:${userId}`).emit('new-notification', notif);
  return notif;
}

// ── Shared include shape ─────────────────────────────────────────────────────
const baseInclude = (userRole) => ({
  organization: { select: { id: true, name: true, subdomain: true } },
  assignedAdmin: { select: { id: true, name: true, email: true } },
  _count: { select: { messages: true, attachments: true, milestones: true } },
});

// ── GET / — paginated list ───────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, serviceType, page = 1, limit = 15 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (req.user.role === 'CLIENT') where.orgId = req.user.orgId;
    if (status) where.status = status;
    if (serviceType) where.serviceType = serviceType;

    const [requests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        include: baseInclude(req.user.role),
        orderBy: { updatedAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.serviceRequest.count({ where }),
    ]);

    res.json({ requests, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (e) {
    console.error('GET /requests', e);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// ── GET /companies — admin: all registered organizations ─────────────────────
router.get('/companies', requireAdmin, async (req, res) => {
  try {
    const companies = await prisma.organization.findMany({
      include: {
        users: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
        _count: { select: { serviceRequests: true } },
        serviceRequests: {
          select: { status: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(companies);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// ── GET /stats/summary ───────────────────────────────────────────────────────
router.get('/stats/summary', async (req, res) => {
  try {
    const where = req.user.role === 'CLIENT' ? { orgId: req.user.orgId } : {};
    const statuses = ['SUBMITTED','REVIEWED','SCOPED','IN_PROGRESS','REVIEW','DELIVERED','CLOSED','ON_HOLD'];
    const counts = await Promise.all(statuses.map(s => prisma.serviceRequest.count({ where: { ...where, status: s } })));
    const total = counts.reduce((a, b) => a + b, 0);
    let clients = 0;
    if (req.user.role !== 'CLIENT') {
      const orgs = await prisma.serviceRequest.findMany({ where, select: { orgId: true }, distinct: ['orgId'] });
      clients = orgs.length;
    }
    const byType = {};
    for (const t of ['SOFTWARE_DEV','CYBERSECURITY','CLOUD','CONSULTING']) {
      byType[t] = await prisma.serviceRequest.count({ where: { ...where, serviceType: t } });
    }
    res.json({ total, statuses: Object.fromEntries(statuses.map((s, i) => [s, counts[i]])), clients, byType });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── GET /:id ─────────────────────────────────────────────────────────────────
router.get('/:id', [param('id').isUUID()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
      include: {
        organization: { select: { id: true, name: true, subdomain: true, contactEmail: true } },
        assignedAdmin: { select: { id: true, name: true, email: true } },
        messages: {
          where: req.user.role === 'CLIENT' ? { messageType: { not: 'INTERNAL_NOTE' } } : undefined,
          include: { sender: { select: { id: true, name: true, role: true } }, attachments: true },
          orderBy: { createdAt: 'asc' },
        },
        attachments: { orderBy: { createdAt: 'desc' } },
        findings: { orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }] },
        milestones: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (req.user.role === 'CLIENT' && request.orgId !== req.user.orgId)
      return res.status(403).json({ error: 'Access denied' });
    res.json(request);
  } catch (e) {
    console.error('GET /requests/:id', e);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// ── POST / — create ──────────────────────────────────────────────────────────
router.post('/', [
  body('serviceType').isIn(['SOFTWARE_DEV','CYBERSECURITY','CLOUD','CONSULTING']),
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('description').trim().isLength({ min: 10 }),
  body('metadata').optional().isObject(),
  body('budget').optional().isString(),
  body('deadline').optional().isISO8601(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { serviceType, title, description, metadata, budget, deadline } = req.body;
    const request = await prisma.serviceRequest.create({
      data: {
        orgId: req.user.orgId,
        serviceType,
        title,
        description,
        metadata: metadata || {},
        budget: budget || null,
        deadline: deadline ? new Date(deadline) : null,
        status: 'SUBMITTED',
      },
      include: { organization: { select: { id: true, name: true } } },
    });

    getIo().emit('new-request', request);

    // Notify all admins
    const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'ANALYST'] } }, select: { id: true, email: true } });
    await Promise.all(admins.map(a =>
      notify(a.id, request.id, 'ASSESSMENT_CREATED', 'New Service Request', `${request.organization.name} submitted: ${title} (${serviceType.replace('_',' ')})`)
    ));

    // Email all admins
    try {
      const adminEmails = admins.map(a => a.email);
      if (adminEmails.length) await sendNewRequestEmail({ to: adminEmails, orgName: request.organization.name, title, serviceType, requestId: request.id });
    } catch (e) { console.error('Email(new-request):', e.message); }

    res.status(201).json(request);
  } catch (e) {
    console.error('POST /requests', e);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// ── PUT /:id — update ────────────────────────────────────────────────────────
router.put('/:id', [param('id').isUUID()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const existing = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Request not found' });
    if (req.user.role === 'CLIENT' && existing.orgId !== req.user.orgId)
      return res.status(403).json({ error: 'Access denied' });

    const allowedForClient = ['title','description','metadata','budget','deadline'];
    const data = {};
    const keys = req.user.role === 'CLIENT' ? allowedForClient : Object.keys(req.body);
    keys.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k]; });
    if (data.deadline) data.deadline = new Date(data.deadline);

    const updated = await prisma.serviceRequest.update({
      where: { id: req.params.id },
      data,
      include: baseInclude(req.user.role),
    });

    getIo().to(`request:${req.params.id}`).emit('request-updated', updated);
    getIo().to(`org:${updated.orgId}`).emit('request-updated', updated);

    // Status change notification + email
    if (data.status && data.status !== existing.status) {
      const orgUsers = await prisma.user.findMany({ where: { orgId: existing.orgId }, select: { id: true, email: true } });
      await Promise.all(orgUsers.map(u =>
        notify(u.id, existing.id, 'STATUS_CHANGE', 'Request Updated', `Your request "${existing.title}" status changed to ${data.status.replace(/_/g,' ')}`)
      ));
      try {
        const emails = orgUsers.map(u => u.email);
        if (emails.length) await sendRequestStatusEmail({ to: emails, title: existing.title, oldStatus: existing.status, newStatus: data.status, requestId: existing.id });
      } catch (e) { console.error('Email(status-change):', e.message); }
    }

    res.json(updated);
  } catch (e) {
    console.error('PUT /requests/:id', e);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// ── POST /:id/assign ─────────────────────────────────────────────────────────
router.post('/:id/assign', requireAdmin, [param('id').isUUID(), body('adminId').isUUID()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const admin = await prisma.user.findFirst({ where: { id: req.body.adminId, role: { in: ['ADMIN','ANALYST'] } } });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    const updated = await prisma.serviceRequest.update({
      where: { id: req.params.id },
      data: { assignedAdminId: req.body.adminId, status: 'REVIEWED' },
      include: baseInclude('ADMIN'),
    });

    await notify(req.body.adminId, req.params.id, 'ASSESSMENT_ASSIGNED', 'Request Assigned', `You have been assigned to: ${updated.title}`);

    // Also notify client org
    const orgUsers = await prisma.user.findMany({ where: { orgId: updated.organization?.id || updated.orgId }, select: { id: true, email: true } });
    await Promise.all(orgUsers.map(u =>
      notify(u.id, req.params.id, 'ASSESSMENT_ASSIGNED', 'Request Assigned', `Your request "${updated.title}" has been assigned to ${admin.name}`)
    ));

    getIo().to(`request:${req.params.id}`).emit('request-updated', updated);
    try {
      await sendRequestAssignedEmail({ to: admin.email, title: updated.title, adminName: admin.name, requestId: req.params.id });
    } catch (e) { console.error('Email(assign):', e.message); }
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to assign request' });
  }
});

// ── PUT /:id/report ──────────────────────────────────────────────────────────
router.put('/:id/report', requireAdmin, [param('id').isUUID()], async (req, res) => {
  try {
    const { reportUrl, reportSummary } = req.body;
    const updated = await prisma.serviceRequest.update({
      where: { id: req.params.id },
      data: {
        ...(reportUrl !== undefined && { reportUrl }),
        ...(reportSummary !== undefined && { reportSummary }),
        status: 'REVIEW',
      },
      include: baseInclude('ADMIN'),
    });
    const orgUsers = await prisma.user.findMany({ where: { orgId: updated.orgId }, select: { id: true, email: true } });
    await Promise.all(orgUsers.map(u =>
      notify(u.id, req.params.id, 'STATUS_CHANGE', 'Deliverable Ready', `A deliverable is ready for your request: ${updated.title}`)
    ));
    getIo().to(`request:${req.params.id}`).emit('request-updated', updated);
    try {
      const emails = orgUsers.map(u => u.email);
      if (emails.length) await sendDeliverableReadyEmail({ to: emails, title: updated.title, requestId: req.params.id });
    } catch (e) { console.error('Email(deliverable):', e.message); }
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// ── POST /:id/feedback — client submits feedback after delivery ──────────────
router.post('/:id/feedback', [
  param('id').isUUID(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('feedback').trim().isLength({ min: 5, max: 2000 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const existing = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Request not found' });
    if (req.user.role !== 'CLIENT' || existing.orgId !== req.user.orgId)
      return res.status(403).json({ error: 'Access denied' });
    if (existing.status !== 'DELIVERED' && existing.status !== 'CLOSED')
      return res.status(400).json({ error: 'Feedback can only be submitted after delivery' });
    if (existing.feedbackAt)
      return res.status(400).json({ error: 'Feedback already submitted' });

    const updated = await prisma.serviceRequest.update({
      where: { id: req.params.id },
      data: {
        clientFeedback: req.body.feedback,
        clientRating: req.body.rating,
        feedbackAt: new Date(),
        status: 'CLOSED',
      },
      include: baseInclude('CLIENT'),
    });
    const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'ANALYST'] } }, select: { id: true, email: true } });
    await Promise.all(admins.map(a =>
      notify(a.id, req.params.id, 'STATUS_CHANGE', 'Client Feedback Received', `${req.user.name} left ${req.body.rating}★ feedback on: ${existing.title}`)
    ));
    getIo().to(`request:${req.params.id}`).emit('request-updated', updated);
    try {
      const adminEmails = admins.map(a => a.email);
      if (adminEmails.length) await sendFeedbackReceivedEmail({ to: adminEmails, clientName: req.user.name, title: existing.title, rating: req.body.rating, feedback: req.body.feedback, requestId: req.params.id });
    } catch (e) { console.error('Email(feedback):', e.message); }
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// ── DELETE /:id ──────────────────────────────────────────────────────────────
router.delete('/:id', requireAdmin, [param('id').isUUID()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    await prisma.serviceRequest.delete({ where: { id: req.params.id } });
    getIo().to(`request:${req.params.id}`).emit('request-deleted', { id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

// ── Messages ─────────────────────────────────────────────────────────────────
router.get('/:id/messages', [param('id').isUUID()], async (req, res) => {
  try {
    const request = await prisma.serviceRequest.findUnique({ where: { id: req.params.id }, select: { orgId: true } });
    if (!request) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'CLIENT' && request.orgId !== req.user.orgId) return res.status(403).json({ error: 'Access denied' });
    const messages = await prisma.serviceMessage.findMany({
      where: {
        requestId: req.params.id,
        ...(req.user.role === 'CLIENT' ? { messageType: { not: 'INTERNAL_NOTE' } } : {}),
      },
      include: { sender: { select: { id: true, name: true, role: true } }, attachments: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch messages' }); }
});

router.post('/:id/messages', [param('id').isUUID(), body('message').trim().isLength({ min: 1, max: 5000 })], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const request = await prisma.serviceRequest.findUnique({ where: { id: req.params.id }, include: { organization: true } });
    if (!request) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'CLIENT' && request.orgId !== req.user.orgId) return res.status(403).json({ error: 'Access denied' });
    const { message, messageType = 'TEXT', attachmentIds } = req.body;
    if (req.user.role === 'CLIENT' && messageType === 'INTERNAL_NOTE') return res.status(403).json({ error: 'Forbidden' });

    const msg = await prisma.serviceMessage.create({
      data: { requestId: req.params.id, senderId: req.user.id, message, messageType },
      include: { sender: { select: { id: true, name: true, role: true } }, attachments: true },
    });

    if (attachmentIds?.length) {
      await prisma.serviceAttachment.updateMany({
        where: { id: { in: attachmentIds }, requestId: req.params.id },
        data: { messageId: msg.id },
      });
    }

    // Notify recipients
    let recipientIds = [];
    if (req.user.role === 'CLIENT') {
      if (request.assignedAdminId) recipientIds.push(request.assignedAdminId);
    } else {
      const orgUsers = await prisma.user.findMany({ where: { orgId: request.orgId }, select: { id: true } });
      recipientIds = orgUsers.map(u => u.id);
    }
    await Promise.all(recipientIds.map(uid =>
      prisma.serviceNotification.create({
        data: {
          userId: uid,
          requestId: req.params.id,
          type: 'NEW_MESSAGE',
          title: 'New Message',
          message: `${req.user.name}: ${message.substring(0, 100)}`,
        }
      })
    ));

    getIo().to(`request:${req.params.id}`).emit('new-message', msg);
    res.status(201).json(msg);
  } catch (e) {
    console.error('POST message', e);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ── Milestones ────────────────────────────────────────────────────────────────
router.get('/:id/milestones', [param('id').isUUID()], async (req, res) => {
  try {
    const milestones = await prisma.milestone.findMany({
      where: { requestId: req.params.id },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(milestones);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

router.post('/:id/milestones', requireAdmin, [param('id').isUUID(), body('title').trim().isLength({ min: 2 })], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { title, description, dueDate, sortOrder } = req.body;
    const ms = await prisma.milestone.create({
      data: {
        requestId: req.params.id,
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        sortOrder: sortOrder ?? 0,
      },
    });
    res.status(201).json(ms);
  } catch (e) { res.status(500).json({ error: 'Failed to create milestone' }); }
});

router.put('/:requestId/milestones/:milestoneId', requireAdmin, async (req, res) => {
  try {
    const allowed = ['title','description','dueDate','status','sortOrder'];
    const data = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k]; });
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    if (data.status === 'COMPLETE' && !data.completedAt) data.completedAt = new Date();
    if (data.status && data.status !== 'COMPLETE') data.completedAt = null;
    const ms = await prisma.milestone.update({ where: { id: req.params.milestoneId }, data });
    res.json(ms);
  } catch (e) { res.status(500).json({ error: 'Failed to update milestone' }); }
});

router.delete('/:requestId/milestones/:milestoneId', requireAdmin, async (req, res) => {
  try {
    await prisma.milestone.delete({ where: { id: req.params.milestoneId } });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── Findings (CYBERSECURITY only) ────────────────────────────────────────────
router.get('/:id/findings', [param('id').isUUID()], async (req, res) => {
  try {
    const findings = await prisma.serviceFinding.findMany({
      where: { requestId: req.params.id },
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(findings);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

router.post('/:id/findings', requireAdmin, [
  param('id').isUUID(),
  body('title').trim().isLength({ min: 3 }),
  body('description').trim().isLength({ min: 10 }),
  body('severity').isIn(['CRITICAL','HIGH','MEDIUM','LOW','INFO']),
  body('category').trim().isLength({ min: 2 }),
  body('remediation').trim().isLength({ min: 10 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { title, description, severity, cvssScore, category, affectedUrl, remediation, evidence } = req.body;
    const finding = await prisma.serviceFinding.create({
      data: {
        requestId: req.params.id,
        title, description, severity,
        cvssScore: cvssScore ? parseFloat(cvssScore) : null,
        category, affectedUrl: affectedUrl || null, remediation, evidence: evidence || null,
      },
    });
    res.status(201).json(finding);
  } catch (e) { res.status(500).json({ error: 'Failed to create finding' }); }
});

router.put('/:requestId/findings/:findingId', async (req, res) => {
  try {
    const finding = await prisma.serviceFinding.findUnique({ where: { id: req.params.findingId }, include: { request: true } });
    if (!finding) return res.status(404).json({ error: 'Not found' });
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'ANALYST';
    const data = {};
    if (isAdmin) {
      ['title','description','severity','cvssScore','category','affectedUrl','remediation','evidence','status'].forEach(k => {
        if (req.body[k] !== undefined) data[k] = k === 'cvssScore' ? (req.body[k] ? parseFloat(req.body[k]) : null) : req.body[k];
      });
    } else {
      if (req.body.status && ['IN_PROGRESS','RESOLVED','ACCEPTED_RISK'].includes(req.body.status)) data.status = req.body.status;
    }
    if (data.status === 'RESOLVED') { data.resolvedAt = new Date(); data.resolvedBy = req.user.id; }
    const updated = await prisma.serviceFinding.update({ where: { id: req.params.findingId }, data });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

router.delete('/:requestId/findings/:findingId', requireAdmin, async (req, res) => {
  try {
    await prisma.serviceFinding.delete({ where: { id: req.params.findingId } });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── Activity timeline ────────────────────────────────────────────────────────
router.get('/:id/timeline', [param('id').isUUID()], async (req, res) => {
  try {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
      include: {
        messages: { include: { sender: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: 'asc' } },
        attachments: { orderBy: { createdAt: 'asc' } },
        milestones: { orderBy: { createdAt: 'asc' } },
        findings: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!request) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'CLIENT' && request.orgId !== req.user.orgId) return res.status(403).json({ error: 'Forbidden' });

    const events = [];

    events.push({ id: `created-${request.id}`, type: 'CREATED', title: 'Request submitted', description: request.title, actor: null, at: request.createdAt });

    request.messages.forEach(m => {
      if (m.messageType === 'INTERNAL_NOTE') return;
      events.push({ id: `msg-${m.id}`, type: 'MESSAGE', title: `Message from ${m.sender?.name || 'Unknown'}`, description: m.content.substring(0, 120) + (m.content.length > 120 ? '…' : ''), actor: m.sender?.name, at: m.createdAt });
    });

    request.attachments.forEach(a => {
      events.push({ id: `att-${a.id}`, type: 'FILE', title: 'File uploaded', description: a.fileName || a.fileUrl?.split('/').pop() || 'Attachment', actor: null, at: a.createdAt });
    });

    request.milestones.forEach(m => {
      events.push({ id: `ms-${m.id}`, type: 'MILESTONE', title: `Milestone: ${m.title}`, description: m.status, actor: null, at: m.createdAt });
      if (m.completedAt) events.push({ id: `ms-done-${m.id}`, type: 'MILESTONE_DONE', title: `Milestone completed: ${m.title}`, description: null, actor: null, at: m.completedAt });
    });

    request.findings.forEach(f => {
      events.push({ id: `finding-${f.id}`, type: 'FINDING', title: `Finding added: ${f.title}`, description: `${f.severity} severity`, actor: null, at: f.createdAt });
      if (f.resolvedAt) events.push({ id: `finding-resolved-${f.id}`, type: 'FINDING_RESOLVED', title: `Finding resolved: ${f.title}`, description: null, actor: null, at: f.resolvedAt });
    });

    if (request.reportUrl) {
      events.push({ id: `report-${request.id}`, type: 'REPORT', title: 'Deliverable uploaded', description: 'Report/deliverable is ready for review', actor: null, at: request.updatedAt });
    }

    events.sort((a, b) => new Date(a.at) - new Date(b.at));
    res.json(events);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to fetch timeline' }); }
});

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications/mine', async (req, res) => {
  try {
    const notifs = await prisma.serviceNotification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unread = notifs.filter(n => !n.read).length;
    res.json({ notifications: notifs, unreadCount: unread });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

router.put('/notifications/:id/read', async (req, res) => {
  try {
    await prisma.serviceNotification.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: { read: true } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

export default router;
