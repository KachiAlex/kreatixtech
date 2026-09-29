#!/usr/bin/env bash
# White-label mail install — run from the uploaded email-service/ directory
# on the target VPS as root (or a sudo user):
#
#   cd email-service && sudo bash deploy/install.sh
#
# Prereqs on the VPS: node >= 20.6, npm, pm2 (npm i -g pm2), nginx, ufw.
# DNS prereq: mail.<domain> A record must already point at this VPS for certbot.
set -euo pipefail

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INSTALL_DIR=/opt/mail
BRAND_DOMAIN="${BRAND_DOMAIN:-pisairtel.com}"
MAIL_HOST="mail.${BRAND_DOMAIN}"

echo "== Installing from $SRC_DIR to $INSTALL_DIR (host: $MAIL_HOST) =="

mkdir -p "$INSTALL_DIR/public" "$INSTALL_DIR/server" "$INSTALL_DIR/smtp-receiver" /var/log/mail

# ── Server build ─────────────────────────────────────────────────────────
cd "$SRC_DIR/server"
npm ci --include=dev
npx tsc
npm prune --omit=dev
cp -r dist node_modules package.json "$INSTALL_DIR/server/"
[ -d "$INSTALL_DIR/server/dist" ] || { echo "server build failed"; exit 1; }

# ── Client build (env from deploy/client.env on the VPS) ─────────────────
cd "$SRC_DIR/client"
if [ -f "$SRC_DIR/deploy/client.env" ]; then
  set -a; . "$SRC_DIR/deploy/client.env"; set +a
else
  echo "!! deploy/client.env missing — building with default branding"
fi
npm ci --include=dev
npx vite build
cp -r dist/. "$INSTALL_DIR/public/"

# ── SMTP receiver ────────────────────────────────────────────────────────
cd "$SRC_DIR/smtp-receiver"
npm ci --omit=dev
cp -r receiver.mjs node_modules package.json "$INSTALL_DIR/smtp-receiver/"

# ── Env files ────────────────────────────────────────────────────────────
for svc in server smtp-receiver; do
  if [ "$svc" = server ]; then
    tmpl="$SRC_DIR/deploy/mail-server.env.example"
  else
    tmpl="$SRC_DIR/deploy/smtp-receiver.env.example"
  fi
  target="$INSTALL_DIR/$svc/.env"
  if [ ! -f "$target" ]; then
    cp "$tmpl" "$target"
  fi
  chmod 600 "$target"
done
echo "!! EDIT $INSTALL_DIR/server/.env and $INSTALL_DIR/smtp-receiver/.env"
echo "!! (secrets, Brevo key, ALLOWED_ORIGINS) before continuing."

# ── Firewall ─────────────────────────────────────────────────────────────
if command -v ufw >/dev/null; then
  ufw allow 25/tcp comment 'SMTP inbound' || true
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
fi

# ── nginx ────────────────────────────────────────────────────────────────
sed "s/mail\.pisairtel\.com/${MAIL_HOST}/g" "$SRC_DIR/deploy/nginx-mail.conf" \
  > /etc/nginx/sites-available/mail
ln -sf /etc/nginx/sites-available/mail /etc/nginx/sites-enabled/mail
nginx -t && systemctl reload nginx

# ── PM2 ──────────────────────────────────────────────────────────────────
cd "$INSTALL_DIR"
cp "$SRC_DIR/deploy/ecosystem.config.cjs" .
pm2 start ecosystem.config.cjs || pm2 reload ecosystem.config.cjs
pm2 save

cat <<EOF

== Done ==
Next steps:
  1. Fill in $INSTALL_DIR/server/.env and $INSTALL_DIR/smtp-receiver/.env, then: pm2 restart all
  2. TLS: certbot --nginx -d ${MAIL_HOST}   (then enable TLS_KEY/TLS_CERT in smtp-receiver/.env for STARTTLS)
  3. Verify:
       curl -I https://${MAIL_HOST}
       swaks --to test@${BRAND_DOMAIN} --server ${MAIL_HOST} --from you@gmail.com
       tail -f /var/log/pm2/mail-smtp-*.log
  4. Create mailboxes: https://${MAIL_HOST} admin panel (X-Admin-Secret = ADMIN_SECRET)
EOF
