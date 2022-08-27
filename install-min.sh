#!/bin/bash
sudo apt update
sudo apt -y install zsh git neovim neofetch htop tmux

files=( ".gitconfig" ".zshrc" ".nvimrc" ".bashrc" ".tmux.conf" ".config/nvim" ".config/neofetch" ".config/htop" )

[ ! -d "$HOME/.config" ] && mkdir "$HOME/.config"

for file in ${files[@]}
do
    rm -rf $HOME/$file
    ln -sf $HOME/dotfiles/$file $HOME/$file
done
