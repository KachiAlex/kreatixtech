#!/bin/sh
# Backup current pg_hba.conf
cp /etc/postgresql/16/main/pg_hba.conf /etc/postgresql/16/main/pg_hba.conf.bak

# Set trust auth temporarily
sed -i 's/^local   all             postgres                                md5/local   all             postgres                                trust/' /etc/postgresql/16/main/pg_hba.conf
sed -i 's/^local   all             all                                     md5/local   all             all                                     trust/' /etc/postgresql/16/main/pg_hba.conf

# Reload PostgreSQL
systemctl reload postgresql
sleep 2

# Reset kreatix password
runuser -u postgres -- psql -p 5433 <<'EOF'
ALTER USER kreatix WITH PASSWORD 'Kreatixtech$reus2660';
EOF

echo "Password set for kreatix"

# Restore original pg_hba.conf
cp /etc/postgresql/16/main/pg_hba.conf.bak /etc/postgresql/16/main/pg_hba.conf
systemctl reload postgresql
sleep 2

echo "---"
echo "Verifying connection..."
PGPASSWORD='Kreatixtech$reus2660' psql -U kreatix -h 127.0.0.1 -p 5433 -d kreatixtech -c "SELECT current_user;"
