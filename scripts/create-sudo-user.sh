#!/bin/sh
read -p 'Super user to create: ' user
sudo adduser $user
sudo usermod -aG sudo $user