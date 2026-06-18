import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sender = {
  email: process.env.RESEND_SENDER_EMAIL || 'onboarding@resend.dev',
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

export { resend };
export default { sendEmail, sendNewAssessmentEmail, sendNewMessageEmail, sendStatusChangeEmail, sendAssignedEmail };
