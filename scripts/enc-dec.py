#!/usr/bin/python3
import os
import sys
from cryptography.fernet import Fernet

#argv[1] = encryption/decryption; argv[2] = file name
#Quits if 2 or less arguments supplied.
if (len(sys.argv) < 3):
    sys.exit("Insufficent Arguments. Aborting...")

#Gets Home directory and joins it with 'keys'.
home = os.environ['HOME']
key_dir = os.path.join(home, 'keys')

#If keys directory does not exist, makes it.
if (os.path.isdir(key_dir) == False):
    os.mkdir(key_dir)
else:
    print('Keys directory already exists, skipping...')

#Makes a key based off of file name.
gen_key = sys.argv[2] + '.key'
key_path = os.path.join(key_dir, gen_key)

#If key does not exist, generates new key.
if(os.path.isfile(key_path) == False):
    key = Fernet.generate_key()
    with open(key_path, 'wb') as filekey:
        filekey.write(key) 
else:
    print('Key already exists, skipping...')

#Writes key to file.
try:
    with open(key_path, 'rb') as filekey:
        key = filekey.read()
except FileNotFoundError:
    sys.exit("Key not found. Aborting...")

#Sets key in program.
fernet = Fernet(key)

#Opens file to encrypt/decrypt.
try:
    with open(sys.argv[2], 'rb' ) as file:
        file = file.read()
except FileNotFoundError:
    sys.exit("File not found. Aborting...")

#Encrypts if given 'enc'. Decrypts if given 'dec'. Quits otherwise.
if(sys.argv[1] == 'enc'):
    file = fernet.encrypt(file)
elif(sys.argv[1] == 'dec'):
    file = fernet.decrypt(file)
else:
    sys.exit("Operation not recoginized. Aborting...")

#Writes changes to file.
with open(sys.argv[2], 'wb') as mod_file:
    mod_file.write(file)
