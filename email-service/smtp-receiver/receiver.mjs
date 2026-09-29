/**
 * Inbound SMTP receiver.
 *
 * Listens on SMTP_PORT (default 25), accepts mail addressed to recipients on
 * ALLOWED_DOMAINS only, and forwards each raw RFC822 message to the mail
 * server's /api/inbound-email endpoint. Not a relay: no AUTH, no outbound.
 *
 * Env:
 *   SMTP_PORT            listen port (default 25; use 2525 behind a redirect for testing)
 *   SMTP_HOSTNAME        banner hostname (default: first ALLOWED_DOMAINS entry prefixed with mail.)
 *   ALLOWED_DOMAINS      comma-separated accepted recipient domains (required)
 *   INBOUND_URL          mail server ingest URL (default http://127.0.0.1:3020/api/inbound-email)
 *   INBOUND_EMAIL_SECRET shared secret sent as X-Inbound-Secret (required)
 *   TLS_KEY / TLS_CERT   optional file paths enabling STARTTLS
 *   MAX_MESSAGE_MB       max message size (default 25)
 *   INBOUND_TIMEOUT_MS   upstream POST timeout (default 15000)
 */

import { SMTPServer } from 'smtp-server';
import { readFileSync } from 'node:fs';

const {
  SMTP_PORT = '25',
  SMTP_HOSTNAME,
  ALLOWED_DOMAINS = '',
  INBOUND_URL = 'http://127.0.0.1:3020/api/inbound-email',
  INBOUND_EMAIL_SECRET = '',
  TLS_KEY,
  TLS_CERT,
  MAX_MESSAGE_MB = '25',
  INBOUND_TIMEOUT_MS = '15000',
} = process.env;

const allowedDomains = ALLOWED_DOMAINS.split(',')
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

if (allowedDomains.length === 0) {
  console.error('ALLOWED_DOMAINS is required (e.g. ALLOWED_DOMAINS=pisairtel.com)');
  process.exit(1);
}
if (!INBOUND_EMAIL_SECRET) {
  console.error('INBOUND_EMAIL_SECRET is required');
  process.exit(1);
}

const hostname = SMTP_HOSTNAME || `mail.${allowedDomains[0]}`;
const maxSize = Number(MAX_MESSAGE_MB) * 1024 * 1024;
const upstreamTimeout = Number(INBOUND_TIMEOUT_MS);

const log = (event, fields = {}) =>
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, ...fields }));

async function deliver(raw, recipient, session) {
  const res = await fetch(INBOUND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-Inbound-Secret': INBOUND_EMAIL_SECRET,
      'X-Envelope-To': recipient,
    },
    body: raw,
    signal: AbortSignal.timeout(upstreamTimeout),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`inbound ${res.status} ${text.slice(0, 200)}`);
  }
}

const server = new SMTPServer({
  banner: `${hostname} inbound`,
  disabledCommands: ['AUTH'],
  secure: false,
  key: TLS_KEY ? readFileSync(TLS_KEY) : undefined,
  cert: TLS_CERT ? readFileSync(TLS_CERT) : undefined,
  hideSTARTTLS: !(TLS_KEY && TLS_CERT),
  size: maxSize,
  maxClients: 100,

  onConnect(session, callback) {
    log('connect', { remote: session.remoteAddress, client: session.clientHostname });
    callback();
  },

  onMailFrom(address, session, callback) {
    callback(); // accept any MAIL FROM — we only gate recipients
  },

  onRcptTo(address, session, callback) {
    const recipient = (address.address || '').toLowerCase();
    const domain = recipient.split('@')[1] || '';
    if (!allowedDomains.includes(domain)) {
      log('rcpt_rejected', { remote: session.remoteAddress, recipient });
      return callback(new Error(`5.1.1 recipient domain not handled here`));
    }
    log('rcpt_accepted', { remote: session.remoteAddress, recipient });
    callback();
  },

  onData(stream, session, callback) {
    const chunks = [];
    let size = 0;
    let tooBig = false;

    stream.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxSize) {
        tooBig = true;
        stream.destroy();
        return;
      }
      chunks.push(chunk);
    });

    stream.on('error', (err) => {
      log('stream_error', { remote: session.remoteAddress, error: err.message });
      callback(new Error('4.5.0 read error, try again later'));
    });

    stream.on('end', async () => {
      const recipients = (session.envelope.rcptTo || [])
        .map((r) => (r.address || '').toLowerCase());
      const from = session.envelope.mailFrom?.address || '';

      if (tooBig) {
        log('message_too_large', { remote: session.remoteAddress, size });
        return callback(new Error('5.3.4 message too large'));
      }
      if (recipients.length === 0) {
        return callback(new Error('5.0.0 no recipients'));
      }

      const raw = Buffer.concat(chunks);
      const results = await Promise.allSettled(
        recipients.map((rcpt) => deliver(raw, rcpt, session))
      );
      const failed = results.filter((r) => r.status === 'rejected');

      if (failed.length > 0) {
        log('deliver_failed', {
          remote: session.remoteAddress, from, recipients,
          failures: failed.map((f) => f.reason?.message),
          size,
        });
        // tempfail so the sender retries
        return callback(new Error('4.3.0 upstream delivery failed, try again later'));
      }

      log('delivered', { remote: session.remoteAddress, from, recipients, size });
      callback();
    });
  },
});

server.on('error', (err) => log('server_error', { error: err.message }));

server.listen(Number(SMTP_PORT), () =>
  log('listening', {
    port: Number(SMTP_PORT),
    hostname,
    allowedDomains,
    inboundUrl: INBOUND_URL,
    starttls: Boolean(TLS_KEY && TLS_CERT),
  })
);
