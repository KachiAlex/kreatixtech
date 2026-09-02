#!/bin/sh
# Allow Docker bridge network to connect to PostgreSQL on port 5433
# Docker typically uses 172.17.0.0/16 and 172.18.0.0/16
# Add host all all 172.16.0.0/12 trust to pg_hba.conf if not already present

HBA=/etc/postgresql/16/main/pg_hba.conf

if ! grep -q "172.16.0.0/12" "$HBA"; then
  echo "host    all             all             172.16.0.0/12            scram-sha-256" >> "$HBA"
  echo "Added Docker network range to pg_hba.conf"
else
  echo "Docker network range already in pg_hba.conf"
fi

systemctl reload postgresql
sleep 2
echo "PostgreSQL reloaded"
