import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sender = {
  email: process.env.RESEND_SENDER_EMAIL || (process.env.VERCEL ? 'onboarding@resend.dev' : 'noreply@kreatixtech.com'),
  name: process.env.RESEND_SENDER_NAME || 'Kreatix Technologies'
};

export async function sendEmail({ to, subject, html, text }) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set, skipping email');
    return;
  }

  const toList = Array.isArray(to) ? to : [to];

  try {
    const { data, error } = await resend.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: toList,
      subject,
      html,
      text
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    console.log('Email sent:', data.id);
    return data;
  } catch (error) {
    console.error('Email send failed:', error.message);
    throw error;
  }
}

export async function sendNewAssessmentEmail({ to, assessmentTitle, organizationName, assessmentId }) {
  const portalUrl = `${process.env.FRONTEND_URL || 'https://kreatixtech.vercel.app'}/portal/assessment/${assessmentId}`;

  return sendEmail({
    to,
    subject: `New VAPT Assessment: ${assessmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF6B35;">New Assessment Submitted</h2>
        <p>A new vulnerability assessment has been submitted by <strong>${organizationName}</strong>.</p>
        <p><strong>Title:</strong> ${assessmentTitle}</p>
        <p><a href="${portalUrl}" style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">View Assessment</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #999; font-size: 12px;">Kreatix Technologies VAPT Portal</p>
      </div>
    `,
    text: `New assessment submitted: ${assessmentTitle} by ${organizationName}. View at ${portalUrl}`
  });
}

export async function sendNewMessageEmail({ to, senderName, assessmentTitle, messagePreview, assessmentId }) {
  const portalUrl = `${process.env.FRONTEND_URL || 'https://kreatixtech.vercel.app'}/portal/assessment/${assessmentId}`;

  return sendEmail({
    to,
    subject: `New message on ${assessmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF6B35;">New Message</h2>
        <p><strong>${senderName}</strong> sent a message on <strong>${assessmentTitle}</strong>:</p>
        <blockquote style="background: #f5f5f5; padding: 16px; border-left: 4px solid #FF6B35; margin: 16px 0;">
          ${messagePreview}
        </blockquote>
        <p><a href="${portalUrl}" style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">Reply in Portal</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #999; font-size: 12px;">Kreatix Technologies VAPT Portal</p>
      </div>
    `,
    text: `${senderName}: ${messagePreview}\nView at ${portalUrl}`
  });
}

export async function sendStatusChangeEmail({ to, assessmentTitle, oldStatus, newStatus, assessmentId }) {
  const portalUrl = `${process.env.FRONTEND_URL || 'https://kreatixtech.vercel.app'}/portal/assessment/${assessmentId}`;

  return sendEmail({
    to,
    subject: `Status Update: ${assessmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF6B35;">Assessment Status Updated</h2>
        <p><strong>${assessmentTitle}</strong> status changed:</p>
        <p style="font-size: 18px; margin: 16px 0;">
          <span style="text-decoration: line-through; color: #999;">${oldStatus}</span>
          <span style="margin: 0 12px;">→</span>
          <span style="color: #FF6B35; font-weight: bold;">${newStatus}</span>
        </p>
        <p><a href="${portalUrl}" style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">View Assessment</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #999; font-size: 12px;">Kreatix Technologies VAPT Portal</p>
      </div>
    `,
    text: `Status changed from ${oldStatus} to ${newStatus} for ${assessmentTitle}. View at ${portalUrl}`
  });
}

export async function sendAssignedEmail({ to, assessmentTitle, adminName, assessmentId }) {
  const portalUrl = `${process.env.FRONTEND_URL || 'https://kreatixtech.vercel.app'}/portal/assessment/${assessmentId}`;

  return sendEmail({
    to,
    subject: `Assessment Assigned: ${assessmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF6B35;">Assessment Assigned to You</h2>
        <p><strong>${assessmentTitle}</strong> has been assigned to <strong>${adminName}</strong>.</p>
        <p><a href="${portalUrl}" style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">View Assessment</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #999; font-size: 12px;">Kreatix Technologies VAPT Portal</p>
      </div>
    `,
    text: `${assessmentTitle} assigned to ${adminName}. View at ${portalUrl}`
  });
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  return sendEmail({
    to,
    subject: 'Reset your Kreatix Technologies password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF6B35;">Password Reset Requested</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password for the Kreatix Technologies portal. Click the button below to set a new password:</p>
        <p><a href="${resetUrl}" style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">Reset Password</a></p>
        <p style="margin-top: 24px; color: #666;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #999; font-size: 12px;">Kreatix Technologies VAPT Portal</p>
      </div>
    `,
    text: `Hi ${name},\n\nReset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`
  });
}

const FRONTEND = () => (process.env.FRONTEND_URL || 'https://www.kreatixtech.com').split(',')[0].trim();
const requestUrl = (id) => `${FRONTEND()}/portal/request/${id}`;

const baseHtml = (title, body) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
  <div style="background:#0E0E0F;padding:24px 32px;display:flex;align-items:center;gap:12px">
    <div style="background:#F2782E;width:32px;height:32px;border-radius:8px;display:inline-block;text-align:center;line-height:32px;font-weight:bold;color:#fff;font-size:14px">K</div>
    <span style="color:#fff;font-weight:bold;font-size:16px;margin-left:10px">Kreatix Technologies</span>
  </div>
  <div style="padding:32px">
    <h2 style="color:#0E0E0F;margin:0 0 16px">${title}</h2>
    ${body}
  </div>
  <div style="background:#F7F5F2;padding:16px 32px;text-align:center">
    <p style="color:#999;font-size:12px;margin:0">You are receiving this because you have an active service request on the Kreatix portal.</p>
  </div>
</div>`;

const btn = (href, label) => `<a href="${href}" style="display:inline-block;background:#F2782E;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:20px">${label}</a>`;

export async function sendNewRequestEmail({ to, orgName, title, serviceType, requestId }) {
  return sendEmail({
    to, subject: `New Service Request: ${title}`,
    html: baseHtml('New Service Request Received', `
      <p>A new request has been submitted by <strong>${orgName}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 0;color:#666;width:120px">Title</td><td style="padding:8px 0;font-weight:bold">${title}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Service</td><td style="padding:8px 0">${serviceType.replace(/_/g,' ')}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Client</td><td style="padding:8px 0">${orgName}</td></tr>
      </table>
      ${btn(requestUrl(requestId), 'View Request')}`),
    text: `New request "${title}" from ${orgName}. View: ${requestUrl(requestId)}`
  });
}

const STATUS_LABELS_MAP = { SUBMITTED:'Submitted', REVIEWED:'Under Review', SCOPED:'Scoped', IN_PROGRESS:'In Progress', REVIEW:'Ready for Review', DELIVERED:'Delivered', CLOSED:'Closed', ON_HOLD:'On Hold' };

export async function sendRequestStatusEmail({ to, title, oldStatus, newStatus, requestId }) {
  return sendEmail({
    to, subject: `Status Update: ${title}`,
    html: baseHtml('Request Status Updated', `
      <p>Your request <strong>${title}</strong> has been updated.</p>
      <div style="background:#F7F5F2;border-radius:8px;padding:16px;margin:16px 0;text-align:center;font-size:18px">
        <span style="color:#999;text-decoration:line-through">${STATUS_LABELS_MAP[oldStatus]||oldStatus}</span>
        <span style="margin:0 16px;color:#ccc">→</span>
        <span style="color:#F2782E;font-weight:bold">${STATUS_LABELS_MAP[newStatus]||newStatus}</span>
      </div>
      ${btn(requestUrl(requestId), 'View Request')}`),
    text: `"${title}" status changed: ${oldStatus} → ${newStatus}. View: ${requestUrl(requestId)}`
  });
}

export async function sendRequestAssignedEmail({ to, title, adminName, requestId }) {
  return sendEmail({
    to, subject: `Assigned to You: ${title}`,
    html: baseHtml('Request Assigned to You', `
      <p>You have been assigned to the following service request:</p>
      <p style="font-size:18px;font-weight:bold;color:#0E0E0F;margin:16px 0">${title}</p>
      ${btn(requestUrl(requestId), 'View Request')}`),
    text: `You have been assigned to "${title}". View: ${requestUrl(requestId)}`
  });
}

export async function sendDeliverableReadyEmail({ to, title, requestId }) {
  return sendEmail({
    to, subject: `Deliverable Ready: ${title}`,
    html: baseHtml('Your Deliverable Is Ready', `
      <p>Great news! A deliverable has been uploaded for your request:</p>
      <p style="font-size:18px;font-weight:bold;color:#0E0E0F;margin:16px 0">${title}</p>
      <p style="color:#666">Please log in to the portal to review and provide your feedback.</p>
      ${btn(requestUrl(requestId), 'View & Download Deliverable')}`),
    text: `Deliverable ready for "${title}". View: ${requestUrl(requestId)}`
  });
}

export async function sendFeedbackReceivedEmail({ to, clientName, title, rating, feedback, requestId }) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  return sendEmail({
    to, subject: `Client Feedback: ${title}`,
    html: baseHtml('Client Feedback Received', `
      <p><strong>${clientName}</strong> left feedback on <strong>${title}</strong>:</p>
      <div style="background:#F7F5F2;border-radius:8px;padding:16px;margin:16px 0">
        <p style="font-size:24px;color:#F2782E;margin:0 0 8px">${stars}</p>
        ${feedback ? `<p style="color:#333;margin:0;font-style:italic">"${feedback}"</p>` : ''}
      </div>
      ${btn(requestUrl(requestId), 'View Request')}`),
    text: `${clientName} rated "${title}" ${rating}/5: ${feedback || '(no comment)'}. View: ${requestUrl(requestId)}`
  });
}

export { resend };
export default { sendEmail, sendNewAssessmentEmail, sendNewMessageEmail, sendStatusChangeEmail, sendAssignedEmail, sendPasswordResetEmail, sendNewRequestEmail, sendRequestStatusEmail, sendRequestAssignedEmail, sendDeliverableReadyEmail, sendFeedbackReceivedEmail };
