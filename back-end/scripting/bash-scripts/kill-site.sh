#!/bin/bash

# Stop Node.js app
if [[ -f node.pid ]]; then
    kill "$(cat node.pid)" && echo "Stopped Node app."
    rm node.pid
else
    echo "node.pid not found."
fi

echo "Apps stopped."
