#!/bin/bash

sudo add-apt-repository ppa:regolith-linux/release
sudo apt update
sudo apt -y install i3-gaps git neovim terminator neofetch polybar rofi htop xcompmgr feh tmux i3lock xss-lock

files=( ".gitconfig" ".nvimrc" ".bashrc" ".tmux.conf" ".config/i3" ".config/nvim" ".config/terminator" ".config/neofetch" ".config/polybar" ".config/rofi" ".config/htop" )

[ ! -d "$HOME/.config" ] && mkdir "$HOME/.config"

for i in ${files[@]}
do
    rm -rf $HOME/$i
    ln -sf $HOME/dotfiles/$i $HOME/$i
done