#!/bin/sh
for u in kreatix kreatixtech postgres admin root familytree kreatix_user; do
  echo "Trying $u..."
  psql -U $u -d kreatixtech -tAc "SELECT current_user" 2>&1
done
echo "---"
# Also list all databases
psql -U kreatix -l 2>&1
psql -U postgres -l 2>&1
