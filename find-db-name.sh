#!/bin/sh
echo "=== Listing databases as kreatix_user ==="
psql -U kreatix_user -d postgres -l 2>&1
echo "---"
echo "=== Trying common DB names ==="
for db in kreatixtech kreatix kreatix_technologies kreatixtech_db app; do
  echo "Trying db: $db"
  psql -U kreatix_user -d $db -tAc "SELECT current_user, current_database()" 2>&1
done
