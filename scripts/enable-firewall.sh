#!/bin/bash

enableFirewall() {
	echo "Enabling firewall..."
	sudo apt install ufw
	sudo ufw allow 22
	sudo ufw enable
	sudo ufw status

sudo echo "-A ufw-before-input -p icmp --icmp-type echo-request -j DROP" >> /etc/ufw/before.rules
	sudo reboot
}

sudo ss -tupln

read -p "Do you want to enable the firewall? (Y/N) " ans
if [[ $ans = 'y' || $ans = 'Y' ]]; then
	enableFirewall
else 
	echo "Aborting..."
fi
