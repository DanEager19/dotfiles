#!/bin/bash

#Upgrade system
sudo apt update
sudo apt dist-upgrade

#Install tools
sudo apt-get install htop neovim ufw net-tools wget cron curl git grep tmux gcc g++ sed
