import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { getIo } from '../lib/socket.js';
import { sendEmail, sendNewAssessmentEmail, sendAssessmentConfirmationEmail } from '../services/email.js';

const router = express.Router();

// ── Public: create service request (no auth required) ───────────────────────
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('company').trim().optional({ checkFalsy: true }).isLength({ max: 200 }),
  body('phone').trim().optional({ checkFalsy: true }).isLength({ max: 50 }),
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('scopeDescription').trim().isLength({ min: 10, max: 5000 }),
  body('targetUrls').isArray().optional(),
  body('ipRanges').isArray().optional(),
  body('testingType').isIn(['BLACK_BOX', 'GREY_BOX', 'WHITE_BOX']).optional(),
  body('specialReqs').trim().optional({ checkFalsy: true }),
  body('serviceType').isIn(['SOFTWARE_DEV', 'CYBERSECURITY', 'CLOUD', 'CONSULTING']).optional(),
  // Honeypot — must be empty for real users
  body('website').trim().optional({ checkFalsy: true }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Honeypot check — bots fill hidden fields
  if (req.body.website) {
    return res.status(201).json({ success: true }); // pretend success, discard
  }

  try {
    const {
      name, email, company, phone,
      title, scopeDescription,
      targetUrls, ipRanges,
      testingType = 'GREY_BOX',
      specialReqs,
      serviceType = 'CYBERSECURITY',
    } = req.body;

    // Find or create a default "Public Inbound" organization for unauthenticated requests
    let publicOrg = await prisma.organization.findFirst({
      where: { subdomain: 'public-inbound' },
    });

    if (!publicOrg) {
      publicOrg = await prisma.organization.create({
        data: {
          subdomain: 'public-inbound',
          name: 'Public Inbound Requests',
          contactEmail: 'info@kreatixtech.com',
        },
      });
    }

    const request = await prisma.serviceRequest.create({
      data: {
        orgId: publicOrg.id,
        serviceType,
        title,
        description: scopeDescription,
        metadata: {
          targetUrls: targetUrls || [],
          ipRanges: ipRanges || [],
          testingType: testingType || 'GREY_BOX',
          specialReqs: specialReqs || null,
          // Prospect contact info (no user account)
          prospect: {
            name,
            email,
            company: company || null,
            phone: phone || null,
          },
          source: 'public-form',
        },
        status: 'SUBMITTED',
      },
      include: {
        organization: {
          select: { id: true, name: true, subdomain: true }
        }
      }
    });

    // Emit socket event for real-time admin notification
    try {
      getIo().emit('new-service-request', request);
    } catch {}

    // Send email notification to info@kreatixtech.com with CC to Akoma and BCC to Gmail for instant delivery
    try {
      await sendNewAssessmentEmail({
        to: 'info@kreatixtech.com',
        cc: ['akoma@kreatixtech.com', 'onyedika.akoma@gmail.com'],
        assessmentTitle: title,
        organizationName: `${name}${company ? ' (' + company + ')' : ''}`,
        assessmentId: request.id,
      });
    } catch (emailErr) {
      console.error('Admin notification email failed:', emailErr.message);
    }

    // Send confirmation email to the prospect
    try {
      await sendAssessmentConfirmationEmail({
        to: email,
        name,
        assessmentTitle: title,
        requestId: request.id,
      });
    } catch (emailErr) {
      console.error('Prospect confirmation email failed:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      id: request.id,
      message: 'Your request has been submitted successfully.',
    });
  } catch (error) {
    console.error('Public service request error:', error);
    res.status(500).json({ error: 'Failed to submit request. Please try again.' });
  }
});

export default router;
