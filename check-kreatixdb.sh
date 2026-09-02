#!/bin/sh
export PGPASSWORD='Kreatix2026!Secure'
echo "=== kreatixdb tables ==="
psql -U kreatix_user -d kreatixdb -h 127.0.0.1 -p 5433 -tAc "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;" 2>&1
echo "---"
echo "=== kreatixdb users ==="
psql -U kreatix_user -d kreatixdb -h 127.0.0.1 -p 5433 -c "SELECT id, email, name, role FROM users LIMIT 20;" 2>&1
echo "---"
echo "=== kreatixdb users count ==="
psql -U kreatix_user -d kreatixdb -h 127.0.0.1 -p 5433 -c "SELECT count(*) FROM users;" 2>&1
