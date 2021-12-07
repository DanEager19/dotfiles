#!/bin/bash
sudo apt-get install git
sudo apt-get install neovim
sudo apt-get install i3
sudo apt-get install terminatior
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

ln -sf rider/.gitconfig ~/.gitconfig
ln -sf rider/.nvimrc ~/.nvimrc
ln -sf rider/.bashrc ~/.bashrc
ln -sf rider/i3 ~/.config/i3
ln -sf rider/nvim ~/.config/nvim
ln -sf rider/terminatior ~/.config/terminatior
ln -sf rider/neofetch ~/.config/neofetch
ln -sf rider/polybar ~/.config/polybar
ln -sf rider/rofi ~/.config/rofi
ln -sf rider/htop ~/.config/htop
ln -sf rider/tmux ~/.config/tmux
