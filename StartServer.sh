#!/bin/bash
nohup sudo pm2 start app.js -i max > my.log 2>&1&
echo $! > save_pid.txt