#!/bin/bash

sudo apt -y install zsh git neovim terminator neofetch htop tmux awesome feh

files=( ".gitconfig" ".zshrc" ".nvimrc" ".bashrc" ".tmux.conf" ".config/nvim" ".config/terminator" ".config/neofetch" ".config/htop" ".config/awesome")

[ ! -d "$HOME/.config" ] && mkdir "$HOME/.config"

for file in ${files[@]}
do
    rm -rf $HOME/$file
    ln -sf $HOME/dotfiles/$file $HOME/$file
done
