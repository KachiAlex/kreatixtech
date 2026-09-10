#!/bin/sh
echo "=== Login test ==="
curl -s -X POST http://127.0.0.1:5180/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"akoma@kreatixtech.com","password":"dikaoliver2660"}'
echo ""
echo "---"
echo "=== Users in DB ==="
export PGPASSWORD='Kreatixtech$reus2660'
psql -U kreatix -h 127.0.0.1 -p 5433 -d kreatixtech -c "SELECT id, email, name, role FROM users;"
