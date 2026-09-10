#!/bin/bash
set -e

echo "=== Starting TOTAL NGINX ISOLATION (Revised) ==="

# 1. Clean up ALL existing default_server references in ALL site configs
echo "Stripping all existing default_server markers..."
find /etc/nginx/sites-available -type f -exec sed -i 's/default_server//g' {} +

# 2. Create the Catch-All (Blackhole) config
echo "Creating blackhole config (00-default)..."
cat > /etc/nginx/sites-available/00-default << 'NGINXEOF'
# Catch-all for HTTP
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 444;
}

# Catch-all for HTTPS
server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    server_name _;
    
    # We need a cert for the 443 catch-all, we'll reuse the self-signed one
    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
    
    return 444;
}
NGINXEOF

# Enable 00-default
ln -sf /etc/nginx/sites-available/00-default /etc/nginx/sites-enabled/00-default

# 3. Ensure KreatixTech is enabled and clean
echo "Enabling KreatixTech..."
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

    root /opt/kreatixtech/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:5100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads/ {
        alias /opt/kreatixtech/uploads/;
    }

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1000;
}
NGINXEOF

ln -sf /etc/nginx/sites-available/kreatixtech /etc/nginx/sites-enabled/kreatixtech

# 4. Verify Academy config has no default_server
echo "Cleaning Academy config..."
sed -i 's/default_server//g' /etc/nginx/sites-available/academy.kreatixtech.com || true

# 5. Reload and Verify
echo "Testing Nginx syntax..."
nginx -t
echo "Reloading Nginx..."
systemctl reload nginx

echo "=== ISOLATION VERIFIED ==="
echo "Port 80/443 default_server is now:"
grep -r "default_server" /etc/nginx/sites-enabled/
