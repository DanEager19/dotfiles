enable firewall (ufw)
upgrade kernel (dist-upgrade)
enable auto updates (unattended-upgrades)
create super user
check passwords

ps auxf | grep process
kill -9 process

read; for u in $(cat /etc/passwd | grep -E "/bin/.*sh" | cut -d":" -f1); do echo "$u:$REPLY" | chpasswd ; done