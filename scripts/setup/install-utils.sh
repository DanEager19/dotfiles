#!/bin/bash

#Upgrade system
sudo apt update
sudo apt dist-upgrade

#Install tools
sudo apt-get install htop docker.io neovim ufw net-tools wget cron curl git grep tmux gcc g++ sed

#Install apps
sudo apt-get install libreoffice firefox vlc
flatpak install flathub nz.mega.MEGAsync com.discordapp.Discord com.spotify.Client com.slack.Slack us.zoom.Zoom com.bitwarden.desktop org.signal.Signal
