#!/bin/bash
#Install Python
sudo apt install python3 pip

#Install Node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

#Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

source ~/.bash_profile
nvm install --lts
source $HOME/.cargo/env 