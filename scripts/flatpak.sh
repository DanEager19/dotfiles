#!/bin/bash
sudo apt install flatpak
sudo apt install gnome-software-plugin-flatpak
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install flathub nz.mega.MEGAsync com.discordapp.Discord com.spotify.Client com.slack.Slack us.zoom.Zoom com.bitwarden.desktop org.signal.Signal
