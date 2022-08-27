#!/bin/bash

#Essentials
sudo apt update && sudo apt dist-upgrade
sudo apt install -y build-essential curl

#ida
curl -O https://out7.hex-rays.com/files/idafree80_linux.run
chmod +x ./ida*_linux.run
sudo ./ida*_linux.run
/opt/idafree-8.0/ida64

#BinaryNinja
curl -O https://cdn.binary.ninja/installers/BinaryNinja-demo.zip
unzip BinaryNinja-demo.zip
sudo mv ./binaryninja/ /opt/
sudo chown -R root:root /opt/binaryninja

#Hopper
curl -O https://d2ap6ypl1xbe4k.cloudfront.net/Hopper-v4-5.7.4-Linux-demo.deb
sudo apt install -y ./Hopper-v4-5.7.4-Linux-demo.deb

#Radare2
git clone https://github.com/radareorg/radare2
radare2/sys/install.sh

#Cutter
curl -O https://github.com/rizinorg/cutter/releases/download/v2.1.0/Cutter-v2.1.0-Linux-x86_64.AppImage
chmod +x Cutter*.AppImage

#Ghidra
sudo apt install openjdk-11-jre openjdk-11-jdk
curl -O https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_10.1.5_build/ghidra_10.1.5_PUBLIC_20220726.zip
unzip ghidra*.zip
sudo mv ./ghidra*/ /opt/

#GDB + GEF/PEDA
sudo apt install gdb
bash -c "$(curl -fsSL https://gef.blah.cat/sh)"

#binwalk, Hexeditor, CPPCheclk, Clang, AFL++
sudo apt install -y binwalk hexcurse cppcheck clang clang-tools afl++ 

#Weggli
sudo apt install cargo
cargo install weggli
source $HOME/.cargo/bin

#BinDiff
curl -O https://dl.google.com/zynamics/bindiff_7_amd64.deb
sudo apt install ./bindiff*.deb
/opt/bindiff/libexec/bindiff_config_setup --per_user
