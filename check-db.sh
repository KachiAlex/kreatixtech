#!/bin/sh
echo "=== Kreatixtech tables check ==="
psql -U kreatix_user -d kreatix_academy -tAc "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('organizations','vapt_assessments','service_requests','projects','testimonials','audit_logs','analytics_events','device_tokens','invitations') ORDER BY table_name;"
echo "---"
echo "=== Users table columns ==="
psql -U kreatix_user -d kreatix_academy -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position;" 2>&1
echo "---"
echo "=== Users count ==="
psql -U kreatix_user -d kreatix_academy -c "SELECT count(*) FROM users;" 2>&1
echo "---"
echo "=== Old .env DATABASE_URL ==="
cat /opt/kreatixtech/backend/.env 2>/dev/null | grep DATABASE
echo "---"
echo "=== PM2 logs ==="
grep -i "database\|DATABASE\|prisma" /root/.pm2/logs/kreatix-backend-out.log 2>/dev/null | tail -5
