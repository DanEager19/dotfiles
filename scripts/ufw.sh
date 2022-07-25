#!/bin/bash

apt-get install ufw -y

ufw allow 22
ufw allow 53/udp
ufw allow 80
ufw allow 443

ufw enable