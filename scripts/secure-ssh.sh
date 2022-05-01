#!/bin/sh
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

grantRootOwnership() {
	chown root:root /etc/ssh/sshd_config
	chmod 600 /etc/ssh/sshd_config
	systemctl restart sshd
}

changePort() {
	read -p "Enter a port number: " port
	echo "${param[2]} ${port}" >> ${file}
	echo "Changed port number to ${port}."
}

authTries() {
	read -p "Enter max authentication tries: " maxAuth
	echo "${param[10]} ${maxAuth}" >> ${file}
	echo "Set max auth tries to ${maxAuth}."
}

secureSSH() {
	for PARAM in ${param[@]}
		do
			sed -i '/^'"${PARAM}"'/d' ${file}
			echo "All lines beginning with '${PARAM}' were deleted from ${file}."
		done
	echo "${param[1]} no" >> ${file}
	echo "Turned off Root SSH connection."
	
	changePort

	echo "${param[3]} inet" >> ${file}
	echo "Changed connection type to IPv4"

	echo "${param[4]}" >> ${file}
	echo "Turned off Password Authentication."

	echo "${param[5]}" >> ${file}
	echo "Turned on Protocol 2."

	echo "${param[6]} to yes" >> ${file}
	echo "Ignoring Rhosts on yes."

	echo "${param[7]} no" >> ${file}
	echo "Turned off host based authentication."

	echo "${param[8]} no" >> ${file}
	echo "Turned off empty passwords."

	echo "${param[9]} no" >> ${file}
	echo "Turned off X11 forwarding." 

	authTries

	echo "${param[11]} aes128-ctr, aes192-ctr, aes256" >> ${file}
	echo "Improved Encryption."

	echo "${param[12]} 900" >> ${file}
	echo "ClientAliveInterval set to 900"

	echo "${param[13]} 0" >> ${file}
	echo "Set amount of connections to max 0"

	echo "${param[14]} yes" >> ${file}
	echo "Enabled PAM"
}

file = "$HOME/file.txt"

sudo su

secureSSH
