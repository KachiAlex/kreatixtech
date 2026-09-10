#!/bin/sh
# Make PostgreSQL listen on all interfaces so Docker can connect
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/16/main/postgresql.conf

# Reload PostgreSQL
systemctl restart postgresql
sleep 3
echo "PostgreSQL restarted"
echo "---"
grep listen_addresses /etc/postgresql/16/main/postgresql.conf
echo "---"
ss -tlnp | grep 5433
