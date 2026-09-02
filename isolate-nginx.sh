#!/bin/bash
set -e

echo "=== Starting Total Nginx Isolation ==="

# 1. Create the Catch-All/Blackhole Config
# This will be the absolute first file Nginx reads.
# It will return 444 (Connection Closed Without Response) for any domain not explicitly defined.
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

# Enable the 00-default config
ln -sf /etc/nginx/sites-available/00-default /etc/nginx/sites-enabled/00-default

# 2. Strip 'default_server' from ALL other config files to avoid conflicts
# We search in sites-available and replace 'default_server' with nothing
grep -l "default_server" /etc/nginx/sites-available/* | xargs sed -i 's/default_server//g' || true

# 3. Re-Verify and Re-Apply KreatixTech Config (without default_server, as 00-default has it)
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

# 4. Final verification and reload
echo "Checking Nginx syntax..."
nginx -t
echo "Reloading Nginx..."
systemctl reload nginx

echo "=== Total Isolation Complete ==="
echo "Active server names:"
grep -r "server_name" /etc/nginx/sites-enabled/
