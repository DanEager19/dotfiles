#!/bin/bash

#Install apps use apt
sudo apt-get install git -f
sudo apt-get install neovim -f
sudo apt-get install i3 -f
sudo add-apt-repository ppa:regolith-linux/release
sudo apt update
sudo apt install i3-gaps -f
sudo apt-get install terminator -f
sudo apt-get install neofetch -f 
sudo apt-get install polybar -f
sudo apt-get install rofi -f
sudo apt-get install htop -f
sudo apt-get install xcompmgr -f
sudo apt-get install feh -f
sudo apt-get install tmux -f

#Remove default config files
sudo rm -rf ~/.gitconfig
sudo rm -rf ~/.nvimrc
sudo rm -rf ~/.bashrc
sudo rm -rf ~/.config/i3
sudo rm -rf ~/.config/nvim
sudo rm -rf ~/.config/terminator
sudo rm -rf ~/.config/neofetch
sudo rm -rf ~/.config/polybar
sudo rm -rf ~/.config/rofi
sudo rm -rf ~/.config/htop
sudo rm -rf ~/.config/tmux

#Create symbolic links between dotfiles and config files
ln -sf ~/dotfiles/rider/.gitconfig ~/.gitconfig
ln -sf ~/dotfiles/rider/.nvimrc ~/.nvimrc
ln -sf ~/dotfiles/rider/.bashrc ~/.bashrc
ln -sf ~/dotfiles/rider/i3 ~/.config/i3
ln -sf ~/dotfiles/rider/nvim ~/.config/nvim
ln -sf ~/dotfiles/rider/terminator ~/.config/terminator
ln -sf ~/dotfiles/rider/neofetch ~/.config/neofetch
ln -sf ~/dotfiles/rider/polybar ~/.config/polybar
ln -sf ~/dotfiles/rider/rofi ~/.config/rofi
ln -sf ~/dotfiles/rider/htop ~/.config/htop
ln -sf ~/dotfiles/rider/tmux ~/.config/tmux

#Install Node
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -yf nodejs

#Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

#Install Docker Engine
sudo apt-get update
sudo apt-get install \ ca-certificates \ curl \ gnupg \ lsb-release
 curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
 sudo apt-get update
 sudo apt-get install -f docker-ce docker-ce-cli containerd.io
