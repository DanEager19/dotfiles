#!/bin/bash

git init 
git add .
git commit -m "Init commit"
git branch -M main
git remove add origin $1
git push -u origin main