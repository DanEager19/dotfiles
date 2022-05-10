#!/bin/bash

#Upgrade system
sudo apt update
sudo apt dist-upgrade

#Install tools
sudo apt-get install htop docker.io neovim ufw net-tools wget cron curl git grep tmux gcc g++ sed
