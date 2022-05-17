#!/bin/bash
#Update kernel, install helpers
sudo apt update && sudo apt dist-upgrade
sudo apt install unattended-upgrades ufw

sudo dpkg-reconfigure --priority=low unattended-upgrades
sudo ufw enable

#Change Passwords
read; for u in $(cat /etc/passwd | grep -E "/bin/.*sh" | cut -d":" -f1); do echo "$u:$REPLY" | chpasswd ; done

#Lock Boot
sudo echo "LABEL=/boot	/boot	ext2	defaults,ro	1 2" > /etc/fstab
sudo chown root:root /etc/grub.conf
sudo chmod og-rwx /etc/grub.conf
sudo sed -i "/SINGLE/s/sushell/sulogin" /etc/sysconfig/init
sudo sed -i "/PROMPT/s/yes/no/" /etc/sysconfig/init

#Secure crontabs
sudo chown root:root /etc/anacrontab
sudo chmod og-rwx /etc/anacrontab
sudo chown root:root /etc/crontab
sudo chmod og-rwx /etc/crontab
sudo chown root:root /etc/cron.hourly
sudo chmod og-rwx /etc/cron.hourly
sudo chown root:root /etc/cron.daily
sudo chmod og-rwx /etc/cron.daily
sudo chown root:root /etc/cron.weekly
sudo chmod og-rwx /etc/cron.weekly
sudo chown root:root /etc/cron.monthly
sudo chmod og-rwx /etc/cron.monthly
sudo chown root:root /etc/cron.d
sudo chmod og-rwx /etc/cron.d

reboot