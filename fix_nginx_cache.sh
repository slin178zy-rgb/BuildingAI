#!/bin/bash
cat > /etc/nginx/sites-enabled/remiopen.com << 'EOF'
server {
    listen 80;
    server_name remiopen.com www.remiopen.com;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl;
    server_name remiopen.com www.remiopen.com;
    ssl_certificate     /etc/nginx/ssl/remiopen.com/remiopen.com.crt;
    ssl_certificate_key /etc/nginx/ssl/remiopen.com/remiopen.com.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_prefer_server_ciphers on;
    client_max_body_size 100m;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_min_length 256;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/atom+xml image/svg+xml font/opentype application/vnd.ms-fontobject application/x-font-ttf;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|otf)$ {
        proxy_pass         http://127.0.0.1:4090;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
        access_log off;
    }

    location ~* \.html$ {
        proxy_pass         http://127.0.0.1:4090;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires off;
    }

    location / {
        proxy_pass         http://127.0.0.1:4090;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }
}
EOF
nginx -t && systemctl reload nginx
