#!/bin/bash
sudo apt install git
sudo apt install neovim
sudo apt install i3
sudo apt install terminatior
sudo apt install neofetch
sudo apt install polybar
sudo apt install rofi
sudo apt install htop
sudo apt install tmux

ln -s .gitconfig $HOME/.
ln -s .nvimrc $HOME/.
ln -s .bashrc $HOME/.
ln -s ./i3 $HOME/.config/.
ln -s ./nvim $HOME/.config/.
ln -s ./terminatior $HOME/.config/.
ln -s ./neofetch $HOME/.config/.
ln -s ./polybar $HOME/.config/.
ln -s ./rofi $HOME/.config/.
ln -s ./htop $HOME/.config/.