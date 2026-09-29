# White-label mail deployment

One codebase, per-tenant configuration. Everything below is for the
`pisairtel.com` tenant on their own VPS — same steps apply to any tenant.

## Architecture

```
Internet MTA ──SMTP:25──> mail-smtp (smtp-receiver)
                              │ POST raw RFC822 + X-Inbound-Secret + X-Envelope-To
                              ▼
nginx :443 ──> mail-server :3020 ──> SQLite + Brevo API (outbound)
                              └── serves the SPA from /opt/mail/public
```

The receiver accepts recipients on `ALLOWED_DOMAINS` only, never relays.

## Prerequisites

- VPS with Node.js >= 20.6, npm, nginx, ufw, `pm2` (`npm i -g pm2`), certbot
- Port 25 reachable from the internet (some providers block it — open a
  ticket with the host if inbound TCP/25 is filtered)
- Tenant Brevo account with the sending domain verified (API key + sender)

## DNS records (Namecheap → Advanced DNS)

```
Type    Host    Value                                   TTL
A       mail    <VPS_PUBLIC_IP>                         300
MX      @       mail.pisairtel.com                      300   (priority 10)
TXT     @       v=spf1 include:spf.brevo.com mx ~all    300
TXT     mail._domainkey   <from Brevo domain auth>      300
TXT     brevo._domainkey  <from Brevo domain auth>      300   (if Brevo shows it)
TXT     _dmarc  v=DMARC1; p=quarantine; rua=mailto:dmarc@pisairtel.com  300
```

Remove the stale records first: the existing MX/SPF point at the old shared
host (`192.250.227.18`, `spf.mysecurecloudhost.com`). Use exactly the DKIM
hostnames/values Brevo displays — do not guess them.

At the VPS provider: set PTR (reverse DNS) for the VPS IP to
`mail.pisairtel.com` — improves deliverability.

## Install

```bash
# 1. Copy this repo's email-service/ directory to the VPS (e.g. /tmp/email-service)
# 2. Fill in deploy/client.env (branding for the web build)
# 3. Run:
cd /tmp/email-service
sudo bash deploy/install.sh
# 4. Edit secrets:
nano /opt/mail/server/.env
nano /opt/mail/smtp-receiver/.env        # INBOUND_EMAIL_SECRET must match server
pm2 restart all && pm2 save
# 5. TLS:
certbot --nginx -d mail.pisairtel.com
#    then add TLS_KEY/TLS_CERT to smtp-receiver/.env and `pm2 restart mail-smtp`
pm2 startup    # follow printed instructions for boot persistence
```

## Verify

```bash
curl -I https://mail.pisairtel.com                    # 200, SPA
swaks --to test@pisairtel.com --server mail.pisairtel.com \
      --from you@gmail.com                            # 250 accept
swaks --to test@other.com    --server mail.pisairtel.com \
      --from you@gmail.com                            # 550 reject (not open relay)
pm2 logs mail-smtp --lines 50                         # delivered/rejected events
```

Then in the web UI: create a mailbox, send outbound mail (goes via Brevo),
check headers for SPF/DKIM/DMARC pass.

## Mailboxes

Admin API: `GET https://mail.pisairtel.com/api/admin/users` with
`X-Admin-Secret: <ADMIN_SECRET>`, or the admin panel in the app.

## Logs

- `pm2 logs mail-smtp` — inbound SMTP events (connect, rcpt_rejected, delivered, deliver_failed)
- `pm2 logs mail-server` — API + auth
- SQLite DB at `/opt/mail/server/data/` — back up with `sqlite3 .backup` or copy while quiescent
