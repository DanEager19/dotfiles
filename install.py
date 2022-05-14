#!/usr/bin/python3
import os
import sys

programs = ['~/.gitconfig', '~/.nvimrc', '~/.bashrc'] 

for program in programs:
    ftype = os.path.isfile(program)
    if ftype == True:
        os.rm(program)
    else:
        os.rmdir(program)
    os.symlink(os.join.path('dotfiles', program), program)