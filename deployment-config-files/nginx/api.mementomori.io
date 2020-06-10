server
{
    listen 443;
    listen [::]:443;
    server_name api.mementomori.io;

    location /
    {
        proxy_pass https://127.0.0.1:1111;
    }

    ssl_certificate /etc/letsencrypt/live/api.mementomori.io/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.mementomori.io/privkey.pem; # managed by Certbot
}
