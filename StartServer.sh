#!/bin/bash
rm -f save_pid.txt
nohup nodejs start app.js &
echo $! > save_pid.txt