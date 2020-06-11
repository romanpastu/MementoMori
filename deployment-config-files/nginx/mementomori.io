server {
   server_name 134.122.65.31 mementomori.io www.mementomori.io;
   root /var/www/cra-memento-mori/MementoMori/LandingPage/my-default-starter/public;
   index index.html index.htm;
   location / {
   try_files $uri /index.html =404;
   }



    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/mementomori.io/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/mementomori.io/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = mementomori.io) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


   server_name 134.122.65.31 mementomori.io www.mementomori.io;
    listen 80;
    return 301 https://mementomori.io$request_uri; # managed by Certbot


}
