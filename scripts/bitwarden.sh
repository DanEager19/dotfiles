#!/bin/bash

cd $HOME/
mkdir bitwarden
cd bitwarden

touch docker-compose.yml
cat >> ./docker-compose.yml << EOF 
# docker-compose.yml
version: '3'

services:
  bitwarden:
    image: bitwardenrs/server
    restart: always
    ports:
      - 8000:80
    volumes:
      - ./bw-data:/data
    environment:
      WEBSOCKET_ENABLED: 'true' # Required to use websockets
      SIGNUPS_ALLOWED: 'true'   # set to false to disable signups
EOF

sudo docker-compose up -d
sudo docker ps

sudo apt-get install nginx
sudo apt install ufw
sudo ufw allow 'Nginx Full'
sudo ufw allow 22
sudo ufw enable
sudo systemctl restart nginx

sudo cat >> /etc/nginx/sites-enabled/default << EOF
server {
    listen 80;
    server_name passwd.deager.dev;

    location / {
        proxy_pass http://127.0.0.1:8000; # bitwarden server address
    }
}
EOF
