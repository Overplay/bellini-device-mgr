#!/usr/bin/env bash

git pull origin master
npm update
cd assets
bower update
cd blueline/common
bower update
pm2 restart all