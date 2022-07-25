#!/bin/bash
#Install Python
sudo apt install python3 pip -y

#Install Node
sudo apt install nodejs npm -y

#Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

source $HOME/.cargo/env 