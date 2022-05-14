#!/usr/bin/python3
import os

home = os.environ['HOME']
programs = ['.gitconfig', '.config/i3'] 

for program in programs:
    progam_loc = os.path.join(home, program)
    ftype = os.path.isfile(progam_loc)
    if ftype == True:
        os.remove(progam_loc)
        os.symlink(os.path.join(home, 'dotfiles', program), progam_loc)