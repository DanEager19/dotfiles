#!/bin/bash
for u in $(cat /etc/passwd | cut -d':' -f1); 
    do
        echo "$u:password" | chpasswd
    done