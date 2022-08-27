#!/bin/bash

sudo apt update && sudo apt dist-upgrade
sudo apt install -y build-essential openjdk-11-jre openjdk-11-jdk gdb curl binwalk hexcurse cppcheck clang clang-tools cargo qt5dxcb-plugin

wget https://out7.hex-rays.com/files/idafree80_linux.run
chmod +x ./idafree80_linux.run
sudo ./idafree80_linux.run