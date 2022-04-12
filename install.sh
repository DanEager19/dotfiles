#!/bin/sh

#Install apps use apt
sudo add-apt-repository ppa:regolith-linux/release
sudo apt update
sudo apt -f install i3-gaps git neovim terminator neofetch polybar rofi htop xcompmgr feh tmux

#Remove default config files
sudo rm -rf ~/.gitconfig
sudo rm -rf ~/.nvimrc
sudo rm -rf ~/.bashrc
sudo rm -rf ~/.tmux.conf
sudo rm -rf ~/.config/i3
sudo rm -rf ~/.config/nvim
sudo rm -rf ~/.config/terminator
sudo rm -rf ~/.config/neofetch
sudo rm -rf ~/.config/polybar
sudo rm -rf ~/.config/rofi
sudo rm -rf ~/.config/htop
sudo rm -rf ~/.config/dolphinrc

#Create symbolic links between dotfiles and config files
ln -sf ~/dotfiles/.gitconfig ~/.gitconfig
ln -sf ~/dotfiles/.nvimrc ~/.nvimrc
ln -sf ~/dotfiles/.bashrc ~/.bashrc
ln -sf ~/dotfiles/i3 ~/.config/i3
ln -sf ~/dotfiles/nvim ~/.config/nvim
ln -sf ~/dotfiles/terminator ~/.config/terminator
ln -sf ~/dotfiles/neofetch ~/.config/neofetch
ln -sf ~/dotfiles/polybar ~/.config/polybar
ln -sf ~/dotfiles/rofi ~/.config/rofi
ln -sf ~/dotfiles/htop ~/.config/htop
ln -sf ~/dotfiles/.tmux.conf ~/.tmux.conf
ln -sf ~/dotfiles/dolphinrc ~/.config/dolphinrc
