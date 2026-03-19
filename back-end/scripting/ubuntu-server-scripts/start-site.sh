#!/bin/bash

# Paths to your apps
NODE_SCRIPT="backend/node_server/server.js"

# Log and PID file locations
LOG_DIR="logs"
NODE_LOG="$LOG_DIR/node_app.log"
NODE_PID="node.pid"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Start Node.js app
echo "Starting Node.js app..."
nohup node "$NODE_SCRIPT" > "$NODE_LOG" 2>&1 &
echo $! > "$NODE_PID"

echo "✅ Applications have been started."
