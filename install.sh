#!/bin/bash
sudo apt install git
sudo apt install neovim
sudo apt install i3
sudo apt install terminatior
sudo apt install neofetch
sudo apt install polybar
sudo apt install rofi
sudo apt install htop
sudo apt install xcompmgr
sudo apt install feh
sudo apt install tmux

ln -s .gitconfig $HOME/.
ln -s .nvimrc $HOME/.
ln -s .bashrc $HOME/.
ln -s ./rider/i3 $HOME/.config/.
ln -s ./rider/nvim $HOME/.config/.
ln -s ./rider/terminatior $HOME/.config/.
ln -s ./rider/neofetch $HOME/.config/.
ln -s ./rider/polybar $HOME/.config/.
ln -s ./rider/rofi $HOME/.config/.
ln -s ./rider/htop $HOME/.config/.
ln 0s ./rider/tmux $HOME/.config/.
