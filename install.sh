#!/bin/bash
sudo apt -y install zsh git neovim terminator neofetch htop xcompmgr tmux 

files=( ".gitconfig" ".zshrc" ".nvimrc" ".bashrc" ".tmux.conf" ".config/nvim" ".config/terminator" ".config/neofetch" ".config/htop" )

[ ! -d "$HOME/.config" ] && mkdir "$HOME/.config"

for file in ${files[@]}
do
    rm -rf $HOME/$file
    ln -sf $HOME/dotfiles/$file $HOME/$file
done

sh -c 'curl -fLo "${XDG_DATA_HOME:-$HOME/.local/share}"/nvim/site/autoload/plug.vim --create-dirs \
       https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim'

