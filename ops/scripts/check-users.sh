#!/bin/sh
export PGPASSWORD='Kreatixtech$reus2660'
echo "=== Users ==="
psql -U kreatix -h 127.0.0.1 -p 5433 -d kreatixtech -c "SELECT id, email, name, role FROM users LIMIT 20;"
echo "---"
echo "=== Count ==="
psql -U kreatix -h 127.0.0.1 -p 5433 -d kreatixtech -c "SELECT count(*) FROM users;"
