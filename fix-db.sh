#!/bin/sh
# Temporarily set trust auth
cp /etc/postgresql/16/main/pg_hba.conf /etc/postgresql/16/main/pg_hba.conf.bak2
sed -i 's/scram-sha-256/trust/g' /etc/postgresql/16/main/pg_hba.conf
sed -i 's/md5/trust/g' /etc/postgresql/16/main/pg_hba.conf
systemctl reload postgresql
sleep 2

# Reset kreatix password
psql -U postgres -h 127.0.0.1 -p 5433 <<'EOF'
ALTER USER kreatix WITH PASSWORD 'Kreatixtech$reus2660';
EOF
echo "Password reset done"

# Test connection
PGPASSWORD='Kreatixtech$reus2660' psql -U kreatix -h 127.0.0.1 -p 5433 -d kreatixtech -c "SELECT current_user;"

# Restore original pg_hba.conf
cp /etc/postgresql/16/main/pg_hba.conf.bak2 /etc/postgresql/16/main/pg_hba.conf
systemctl reload postgresql
sleep 2
echo "All done"
