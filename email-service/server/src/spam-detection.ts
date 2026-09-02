// ── Spam Detection & Email Security ─────────────────────────────────────────

export interface SecurityAnalysis {
  spamScore: number;        // 0-100
  isSpam: boolean;
  flags: {
    phishing: boolean;
    suspicious_links: boolean;
    spoofed_sender: boolean;
    high_risk_keywords: boolean;
    mismatched_urls: boolean;
    excessive_caps: boolean;
    suspicious_attachment: boolean;
  };
  reason: string;
}

const PHISHING_KEYWORDS = [
  'verify your account', 'confirm your password', 'account suspended',
  'click here to verify', 'update your payment', 'urgent action required',
  'account will be closed', 'verify your identity', 'security alert',
  'limited account access', 'wire transfer', 'inheritance', 'lottery winner',
  'claim your prize', 'tax refund', 'suspended immediately',
];

const SUSPICIOUS_TLDS = ['.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.click', '.download', '.stream'];

const SUSPICIOUS_ATTACHMENT_TYPES = [
  '.exe', '.scr', '.bat', '.cmd', '.com', '.pif', '.vbs', '.js',
  '.jar', '.app', '.dll', '.msi', '.hta', '.ps1',
];

export function analyzeEmailSecurity(params: {
  fromAddress: string;
  fromName: string;
  toAddress: string;
  subject: string;
  text: string;
  html: string | null;
  attachments: { filename: string; mimeType: string }[];
}): SecurityAnalysis {
  let score = 0;
  const flags = {
    phishing: false,
    suspicious_links: false,
    spoofed_sender: false,
    high_risk_keywords: false,
    mismatched_urls: false,
    excessive_caps: false,
    suspicious_attachment: false,
  };

  const { fromAddress, fromName, subject, text, html, attachments } = params;
  const combinedText = `${subject} ${text} ${html || ''}`.toLowerCase();
  const fromDomain = fromAddress.split('@')[1] || '';

  // 1. Check phishing keywords
  for (const kw of PHISHING_KEYWORDS) {
    if (combinedText.includes(kw)) {
      score += 25;
      flags.phishing = true;
      break;
    }
  }

  // 2. Suspicious TLD in sender domain
  for (const tld of SUSPICIOUS_TLDS) {
    if (fromDomain.endsWith(tld)) {
      score += 20;
      flags.spoofed_sender = true;
      break;
    }
  }

  // 3. Excessive capitalization in subject
  if (subject && subject.length > 10) {
    const caps = subject.replace(/[^A-Z]/g, '').length;
    const total = subject.replace(/[^A-Za-z]/g, '').length;
    if (total > 0 && caps / total > 0.6) {
      score += 15;
      flags.excessive_caps = true;
    }
  }

  // 4. Suspicious links — check for mismatched URLs in HTML
  if (html) {
    const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1].toLowerCase();
      const linkText = match[2].toLowerCase().trim();
      // Check if link text looks like a domain but doesn't match href
      if (linkText.includes('http') || linkText.includes('.com') || linkText.includes('.org')) {
        const hrefDomain = href.match(/https?:\/\/([^/]+)/)?.[1] || '';
        const textDomain = linkText.match(/https?:\/\/([^/]+)/)?.[1] || linkText;
        if (hrefDomain && textDomain && !hrefDomain.includes(textDomain.replace('www.', '')) && !textDomain.includes(hrefDomain.replace('www.', ''))) {
          score += 20;
          flags.mismatched_urls = true;
          flags.suspicious_links = true;
          break;
        }
      }
      // IP address URLs
      if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(href)) {
        score += 15;
        flags.suspicious_links = true;
        break;
      }
      // URL shortener
      if (/https?:\/\/(bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|is\.gd)/.test(href)) {
        score += 10;
        flags.suspicious_links = true;
      }
    }
  }

  // 5. Suspicious attachments
  for (const att of attachments) {
    const ext = att.filename.toLowerCase().substring(att.filename.lastIndexOf('.'));
    if (SUSPICIOUS_ATTACHMENT_TYPES.includes(ext)) {
      score += 25;
      flags.suspicious_attachment = true;
      break;
    }
    // Double extensions (e.g. invoice.pdf.exe)
    if (att.filename.match(/\.[a-z]{2,4}\.[a-z]{2,4}$/i)) {
      score += 20;
      flags.suspicious_attachment = true;
      break;
    }
  }

  // 6. Empty subject with attachments
  if (!subject && attachments.length > 0) {
    score += 10;
  }

  // 7. Urgency language
  if (/\b(urgent|immediately|asap|right away|expires today|final notice|last warning)\b/i.test(subject || '')) {
    score += 10;
    flags.high_risk_keywords = true;
  }

  // 8. Reply-to mismatch (would need headers — simplified check)
  if (fromName && fromAddress) {
    const nameDomain = fromName.toLowerCase().includes('@') ? fromName.split('@')[1] : '';
    if (nameDomain && nameDomain !== fromDomain) {
      score += 15;
      flags.spoofed_sender = true;
    }
  }

  // Cap at 100
  score = Math.min(score, 100);
  const isSpam = score >= 50;

  const reasons: string[] = [];
  if (flags.phishing) reasons.push('phishing keywords detected');
  if (flags.suspicious_links) reasons.push('suspicious links found');
  if (flags.spoofed_sender) reasons.push('sender domain mismatch');
  if (flags.mismatched_urls) reasons.push('URL text/link mismatch');
  if (flags.excessive_caps) reasons.push('excessive capitalization');
  if (flags.suspicious_attachment) reasons.push('dangerous attachment');
  if (flags.high_risk_keywords) reasons.push('urgency language detected');

  return {
    spamScore: score,
    isSpam,
    flags,
    reason: reasons.join('; ') || 'clean',
  };
}
