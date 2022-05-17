#!/bin/bash
param[1]="PermitRootLogin"
param[2] = "Port"
param[3] = "AddressFamily"
param[4] = "PasswordAuthentication"
param[5] = "Protocol2"
param[6] = "IgnoreRhosts"
param[7] = "HostBasedAtuhentication"
param[8] = "PermitEmptyPasswords"
param[9] = "X11Forwarding"
param[10] = "MaxAuthTries"
param[11] = "Ciphers"
param[12] = "ClientAliveInterval"
param[13] = "ClientAliveCountMax"
param[14] = "usePAM"
file = "$1"
for PARAM in ${param[@]}
	do
		sed -i '/^'"${PARAM}"'/d' ${file}
	done
echo "${param[1]} no" >> ${file}
echo "${param[2]} 2222" >> ${file}
echo "${param[3]} inet" >> ${file}
echo "${param[4]}" >> ${file}
echo "${param[5]}" >> ${file}
echo "${param[6]} to yes" >> ${file}
echo "${param[7]} no" >> ${file}
echo "${param[8]} no" >> ${file}
echo "${param[9]} no" >> ${file}
echo "${param[10]} 1" >> ${file}
echo "${param[11]} aes128-ctr, aes192-ctr, aes256" >> ${file}
echo "${param[12]} 900" >> ${file}
echo "${param[13]} 0" >> ${file}
echo "${param[14]} yes" >> ${file}

chown root:root /etc/ssh/sshd_config
chmod 600 /etc/ssh/sshd_config
systemctl restart sshd