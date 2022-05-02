#!/bin/bash
echo "LABEL=/boot	/boot	ext2	defaults,ro	1 2" > /etc/fstab
sudo chown root:root /etc/grub.conf
chmod og-rwx /etc/grub.conf
sed -i "/SINGLE/s/sushell/sulogin" /etc/sysconfig/init
sed -i "/PROMPT/s/yes/no/" /etc/sysconfig/init