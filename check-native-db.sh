#!/bin/sh
export PGPASSWORD='Kreatix2026!Secure'
echo "=== Users count ==="
psql -U kreatix -d kreatixtech -h 127.0.0.1 -p 5433 -c "SELECT count(*) FROM users;"
echo "---"
echo "=== Organizations count ==="
psql -U kreatix -d kreatixtech -h 127.0.0.1 -p 5433 -c "SELECT count(*) FROM organizations;"
echo "---"
echo "=== All tables ==="
psql -U kreatix -d kreatixtech -h 127.0.0.1 -p 5433 -tAc "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"
echo "---"
echo "=== Users list ==="
psql -U kreatix -d kreatixtech -h 127.0.0.1 -p 5433 -c "SELECT id, email, name, role FROM users LIMIT 20;"
