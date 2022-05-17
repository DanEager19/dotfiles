enable firewall
upgrade kernel
enable auto updates
create super user
check passwordsd

ps auxf | grep process
kill -9 process

read; for u in $(cat /etc/passwd | grep -E "/bin/.*sh" | cut -d":" -f1); do echo "$u:$REPLY" | chpasswd ; done