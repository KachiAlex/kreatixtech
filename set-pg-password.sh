#!/bin/sh
runuser -u postgres -- psql -p 5433 <<'EOF'
ALTER USER kreatix WITH PASSWORD 'Kreatixtech$reus2660';
EOF
echo "Password set for kreatix"
echo "---"
PGPASSWORD='Kreatixtech$reus2660' psql -U kreatix -h 127.0.0.1 -p 5433 -d kreatixtech -c "SELECT current_user;"
