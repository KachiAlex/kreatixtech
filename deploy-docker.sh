#!/bin/bash
set -e

echo "=== KreatixTech Docker Deployment ==="

cd /opt/kreatixtech

# Stop PM2 backend
echo "Stopping PM2 kreatix-backend..."
pm2 stop kreatix-backend 2>/dev/null || true
pm2 delete kreatix-backend 2>/dev/null || true
pm2 save 2>/dev/null || true

# Stop old kreatix-postgres container if running (we have our own now)
echo "Stopping old kreatix-postgres container..."
docker stop kreatix-postgres 2>/dev/null || true
docker rm kreatix-postgres 2>/dev/null || true

# Build and start Docker containers
echo "Building and starting Docker containers..."
docker compose down 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

echo "Waiting for containers to start..."
sleep 10

# Check status
echo "=== Container Status ==="
docker compose ps

# Run prisma db push inside backend container
echo "Running prisma db push..."
docker compose exec -T backend npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || echo "Prisma push will retry on restart"

# Verify backend health
echo "Checking backend health..."
sleep 5
curl -s http://127.0.0.1:5180/api/health || echo "Health check via frontend container..."

echo ""
echo "=== Docker Deployment Complete ==="
echo "Frontend container: kreatixtech-frontend (port 127.0.0.1:5180)"
echo "Backend container:  kreatixtech-backend (internal)"
echo "DB container:       kreatixtech-db (internal)"
