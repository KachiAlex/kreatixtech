// ── Brevo email notifications for server monitor ────────────────────────────
// Uses Brevo's REST API directly — no SDK dependency needed.

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'akoma@kreatixtech.com';
const NOTIFY_EMAIL_CC = (process.env.NOTIFY_EMAIL_CC || 'onyedika.akoma@gmail.com')
  .split(',').map(s => s.trim()).filter(Boolean);
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'hello@kreatixtech.com';
const SENDER_NAME = 'Kreatix Monitor';

async function sendEmail(to, cc, subject, html) {
  if (!BREVO_API_KEY) {
    console.warn('[notifier] BREVO_API_KEY not set — skipping email');
    return false;
  }
  try {
    const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: to }],
        cc: cc.map(email => ({ email })),
        subject,
        html,
      }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error('[notifier] Brevo API error:', resp.status, text);
    }
    return resp.ok;
  } catch (e) {
    console.error('[notifier] Failed to send email:', e.message);
    return false;
  }
}

export async function sendDowntimeAlert(service) {
  const subject = `[ALERT] ${service.name} is DOWN`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #dc2626; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 18px;">⚠️ Service Down</h2>
      </div>
      <div style="background: #fef2f2; padding: 24px; border: 1px solid #fecaca; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 12px; font-size: 15px;"><strong>${service.name}</strong> is currently down.</p>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; color: #6b7280;">Service:</td><td style="padding: 4px 0; font-weight: bold;">${service.name}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Description:</td><td style="padding: 4px 0;">${service.description}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">URL:</td><td style="padding: 4px 0;"><a href="${service.publicUrl || service.url}">${service.publicUrl || service.url}</a></td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Time:</td><td style="padding: 4px 0;">${new Date().toISOString()}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">HTTP Status:</td><td style="padding: 4px 0;">${service.http?.httpCode || 'No response'}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Error:</td><td style="padding: 4px 0; color: #dc2626;">${service.http?.error || 'Unknown'}</td></tr>
        </table>
        <p style="margin: 16px 0 0; font-size: 13px; color: #6b7280;">
          The auto-restart system will attempt to recover this service. You will receive a recovery email when it's back online.
        </p>
        <p style="margin: 8px 0 0; font-size: 13px; color: #6b7280;">
          Monitor dashboard: <a href="https://kreatixtech.com/portal/admin">https://kreatixtech.com/portal/admin</a>
        </p>
      </div>
    </div>
  `;
  return sendEmail(NOTIFY_EMAIL, NOTIFY_EMAIL_CC, subject, html);
}

export async function sendRecoveryAlert(service, durationSeconds) {
  const duration = formatDuration(durationSeconds);
  const subject = `[RECOVERED] ${service.name} is back UP`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #16a34a; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 18px;">✅ Service Recovered</h2>
      </div>
      <div style="background: #f0fdf4; padding: 24px; border: 1px solid #bbf7d0; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 12px; font-size: 15px;"><strong>${service.name}</strong> is back online.</p>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; color: #6b7280;">Service:</td><td style="padding: 4px 0; font-weight: bold;">${service.name}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Downtime:</td><td style="padding: 4px 0;">${duration}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Recovered at:</td><td style="padding: 4px 0;">${new Date().toISOString()}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">HTTP Status:</td><td style="padding: 4px 0; color: #16a34a;">${service.http?.httpCode || 'OK'}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Latency:</td><td style="padding: 4px 0;">${service.http?.latency ?? '—'}ms</td></tr>
        </table>
      </div>
    </div>
  `;
  return sendEmail(NOTIFY_EMAIL, NOTIFY_EMAIL_CC, subject, html);
}

export async function sendRestartNotification(service, reason, triggeredBy = 'auto') {
  const subject = `[RESTART] ${service.name} was restarted${triggeredBy === 'auto' ? ' automatically' : ' manually'}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f59e0b; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 18px;">🔄 Service Restarted</h2>
      </div>
      <div style="background: #fffbeb; padding: 24px; border: 1px solid #fde68a; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; color: #6b7280;">Service:</td><td style="padding: 4px 0; font-weight: bold;">${service.name}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Triggered by:</td><td style="padding: 4px 0;">${triggeredBy === 'auto' ? 'Auto-restart system' : triggeredBy}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Reason:</td><td style="padding: 4px 0;">${reason}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Time:</td><td style="padding: 4px 0;">${new Date().toISOString()}</td></tr>
        </table>
      </div>
    </div>
  `;
  return sendEmail(NOTIFY_EMAIL, NOTIFY_EMAIL_CC, subject, html);
}

function formatDuration(seconds) {
  if (!seconds) return 'Unknown';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
