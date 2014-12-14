#!/bin/bash
rm -f save_pid.txt
nohup nodejs app.js &
echo $! > save_pid.txt