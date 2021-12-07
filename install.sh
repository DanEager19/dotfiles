#!/bin/bash
sudo apt-get install git
sudo apt-get install neovim
sudo apt-get install i3
sudo add-apt-repository ppa:regolith-linux/release
sudo apt update
sudo apt install i3-gaps
sudo apt-get install terminator
sudo apt-get install neofetch
sudo apt-get install polybar
sudo apt-get install rofi
sudo apt-get install htop
sudo apt-get install xcompmgr
sudo apt-get install feh
sudo apt-get install tmux

sudo rm -rf ~/.gitconfig
sudo rm -rf ~/.nvimrc
sudo rm -rf ~/.bashrc
sudo rm -rf ~/.config/i3
sudo rm -rf ~/.config/nvim
sudo rm -rf ~/.config/terminatior
sudo rm -rf ~/.config/neofetch
sudo rm -rf ~/.config/polybar
sudo rm -rf ~/.config/rofi
sudo rm -rf ~/.config/htop
sudo rm -rf ~/.config/tmux

ln -sf ~/dotfiles/rider/.gitconfig ~/.gitconfig
ln -sf ~/dotfiles/rider/.nvimrc ~/.nvimrc
ln -sf ~/dotfiles/rider/.bashrc ~/.bashrc
ln -sf ~/dotfiles/rider/i3 ~/.config/i3
ln -sf ~/dotfiles/rider/nvim ~/.config/nvim
ln -sf ~/dotfiles/rider/terminatior ~/.config/terminatior
ln -sf ~/dotfiles/rider/neofetch ~/.config/neofetch
ln -sf ~/dotfiles/rider/polybar ~/.config/polybar
ln -sf ~/dotfiles/rider/rofi ~/.config/rofi
ln -sf ~/dotfiles/rider/htop ~/.config/htop
ln -sf ~/dotfiles/rider/tmux ~/.config/tmux
