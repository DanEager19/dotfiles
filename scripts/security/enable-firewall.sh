#!/bin/bash
echo "Enabling firewall..."
apt install ufw
ufw allow 22
ufw enable
ss -tupln > $HOME/openports.txt
echo "-A ufw-before-input -p icmp --icmp-type echo-request -j DROP" >> /etc/ufw/before.rules
reboot