#!/bin/bash
set -e

# Create a clean config file with default_server
cat > /tmp/kreatixtech.conf << 'NGINXEOF'
server {
    listen 80 default_server;
    server_name kreatixtech.com www.kreatixtech.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl default_server;
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

# Move it to sites-available
sudo mv /tmp/kreatixtech.conf /etc/nginx/sites-available/kreatixtech

# Ensure the symlink exists
sudo ln -sf /etc/nginx/sites-available/kreatixtech /etc/nginx/sites-enabled/kreatixtech

# Test and reload
sudo nginx -t
sudo systemctl reload nginx || sudo systemctl restart nginx
