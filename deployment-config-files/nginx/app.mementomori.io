server {
   server_name 134.122.65.31 app.mementomori.io www.app.mementomori.io;
   root /var/www/cra-memento-mori/MementoMori/FrontEnd/mementomori/build;
   index index.html index.htm;
   location / {
   try_files $uri /index.html =404;
   }


    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/app.mementomori.io/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/app.mementomori.io/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = app.mementomori.io) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


   server_name 134.122.65.31 app.mementomori.io www.app.mementomori.io;
    listen 80;
    return 404; # managed by Certbot


}