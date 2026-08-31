import express from 'express';
import { body, validationResult } from 'express-validator';
import { sendEmail } from '../services/email.js';

const router = express.Router();

router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').trim().isEmail(),
  body('company').trim().optional(),
  body('subject').trim().isLength({ min: 1, max: 200 }),
  body('message').trim().isLength({ min: 5, max: 5000 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, company, subject, message } = req.body;

    await sendEmail({
      to: process.env.CONTACT_EMAIL || 'info@kreatixtech.com',
      subject: `Website Enquiry: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B35;">New Website Enquiry</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Company</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${company || 'N/A'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Subject</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${subject}</td></tr>
          </table>
          <h3 style="color: #333; margin-top: 24px;">Message</h3>
          <p style="background: #f5f5f5; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="color: #999; font-size: 12px;">Sent from kreatixtech.com contact form</p>
        </div>
      `,
      text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\nSubject: ${subject}\n\nMessage:\n${message}`
    });

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error.message);
    res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
});

export default router;
