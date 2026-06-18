import SibApiV3Sdk from '@getbrevo/brevo';

const brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();

if (process.env.BREVO_API_KEY) {
  const apiKey = brevoClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY;
}

const sender = {
  email: process.env.BREVO_SENDER_EMAIL || 'noreply@kreatixtech.com',
  name: process.env.BREVO_SENDER_NAME || 'Kreatix Technologies'
};

export async function sendEmail({ to, subject, htmlContent, textContent }) {
  if (!process.env.BREVO_API_KEY) {
    console.warn('BREVO_API_KEY not set, skipping email');
    return;
  }

  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = sender;
    sendSmtpEmail.to = Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    if (textContent) sendSmtpEmail.textContent = textContent;

    const response = await brevoClient.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent:', response.messageId);
    return response;
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
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF6B35;">New Assessment Submitted</h2>
        <p>A new vulnerability assessment has been submitted by <strong>${organizationName}</strong>.</p>
        <p><strong>Title:</strong> ${assessmentTitle}</p>
        <p><a href="${portalUrl}" style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">View Assessment</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #999; font-size: 12px;">Kreatix Technologies VAPT Portal</p>
      </div>
    `,
    textContent: `New assessment submitted: ${assessmentTitle} by ${organizationName}. View at ${portalUrl}`
  });
}

export async function sendNewMessageEmail({ to, senderName, assessmentTitle, messagePreview, assessmentId }) {
  const portalUrl = `${process.env.FRONTEND_URL || 'https://kreatixtech.vercel.app'}/portal/assessment/${assessmentId}`;

  return sendEmail({
    to,
    subject: `New message on ${assessmentTitle}`,
    htmlContent: `
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
    textContent: `${senderName}: ${messagePreview}\nView at ${portalUrl}`
  });
}

export async function sendStatusChangeEmail({ to, assessmentTitle, oldStatus, newStatus, assessmentId }) {
  const portalUrl = `${process.env.FRONTEND_URL || 'https://kreatixtech.vercel.app'}/portal/assessment/${assessmentId}`;

  return sendEmail({
    to,
    subject: `Status Update: ${assessmentTitle}`,
    htmlContent: `
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
    textContent: `Status changed from ${oldStatus} to ${newStatus} for ${assessmentTitle}. View at ${portalUrl}`
  });
}

export async function sendAssignedEmail({ to, assessmentTitle, adminName, assessmentId }) {
  const portalUrl = `${process.env.FRONTEND_URL || 'https://kreatixtech.vercel.app'}/portal/assessment/${assessmentId}`;

  return sendEmail({
    to,
    subject: `Assessment Assigned: ${assessmentTitle}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF6B35;">Assessment Assigned to You</h2>
        <p><strong>${assessmentTitle}</strong> has been assigned to <strong>${adminName}</strong>.</p>
        <p><a href="${portalUrl}" style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">View Assessment</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #999; font-size: 12px;">Kreatix Technologies VAPT Portal</p>
      </div>
    `,
    textContent: `${assessmentTitle} assigned to ${adminName}. View at ${portalUrl}`
  });
}

export { brevoClient };
export default { sendEmail, sendNewAssessmentEmail, sendNewMessageEmail, sendStatusChangeEmail, sendAssignedEmail };
