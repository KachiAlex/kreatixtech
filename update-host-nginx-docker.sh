#!/bin/bash
set -e

# Update host Nginx to proxy to the Docker frontend container
cat > /etc/nginx/sites-available/kreatixtech << 'NGINXEOF'
server {
    listen 80;
    server_name kreatixtech.com www.kreatixtech.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name kreatixtech.com www.kreatixtech.com;

    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;

    location / {
        proxy_pass http://127.0.0.1:5180;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/kreatixtech /etc/nginx/sites-enabled/kreatixtech

nginx -t
systemctl reload nginx

echo "=== Host Nginx now proxies to Docker frontend container (port 5180) ==="

# Verify containers
docker compose -f /opt/kreatixtech/docker-compose.yml ps

# Verify health
sleep 3
echo "=== Health Check ==="
curl -s http://127.0.0.1:5180/api/health || echo "Health check pending..."
