#!/usr/bin/env bash
# =============================================================================
# ITMP — Backend Server Manager
#
# Usage:
#   ./setup/server.sh [start|stop|restart|status|logs]
#
# Commands:
#   start    Start the Node.js API server in the background
#   stop     Stop the running server
#   restart  Stop then start
#   status   Show whether the server is running and its PID
#   logs     Tail the live server log
# =============================================================================

set -euo pipefail

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
die()     { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

NODE_SERVER_DIR="$PROJECT_ROOT/back-end/node-server"
LOG_DIR="$PROJECT_ROOT/logs"
LOG_FILE="$LOG_DIR/node.log"
PID_FILE="$PROJECT_ROOT/logs/node.pid"
ENV_FILE="$NODE_SERVER_DIR/.env"

# ── Helpers ───────────────────────────────────────────────────────────────────
is_running() {
    [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

cmd_start() {
    if is_running; then
        warn "Server is already running (PID $(cat "$PID_FILE"))."
        return 0
    fi

    # Load .env if present so DB credentials are available
    if [[ -f "$ENV_FILE" ]]; then
        set -a
        # shellcheck source=/dev/null
        source "$ENV_FILE"
        set +a
    else
        warn ".env not found at $ENV_FILE — using system environment."
    fi

    mkdir -p "$LOG_DIR"

    info "Starting ITMP API server…"
    cd "$NODE_SERVER_DIR"
    nohup node server.js >> "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"

    # Give it a moment then verify it stayed up
    sleep 1
    if is_running; then
        success "Server started (PID $(cat "$PID_FILE"))."
        success "Log: $LOG_FILE"
        success "API: http://localhost:3000"
    else
        die "Server failed to start. Check $LOG_FILE for details."
    fi
}

cmd_stop() {
    if ! is_running; then
        warn "Server is not running."
        rm -f "$PID_FILE"
        return 0
    fi

    local pid
    pid="$(cat "$PID_FILE")"
    info "Stopping server (PID ${pid})…"
    kill "$pid"

    # Wait up to 5 seconds for clean shutdown
    local waited=0
    while kill -0 "$pid" 2>/dev/null && [[ $waited -lt 5 ]]; do
        sleep 1; ((waited++))
    done

    # Force-kill if still alive
    if kill -0 "$pid" 2>/dev/null; then
        warn "Process did not exit cleanly — sending SIGKILL…"
        kill -9 "$pid" 2>/dev/null || true
    fi

    rm -f "$PID_FILE"
    success "Server stopped."
}

cmd_restart() {
    info "Restarting server…"
    cmd_stop || true
    sleep 1
    cmd_start
}

cmd_status() {
    if is_running; then
        local pid
        pid="$(cat "$PID_FILE")"
        echo -e "${GREEN}● Running${NC}  PID ${pid}"
        echo -e "  Log:  ${LOG_FILE}"
        echo -e "  API:  http://localhost:3000"
    else
        echo -e "${RED}● Stopped${NC}"
        [[ -f "$PID_FILE" ]] && { rm -f "$PID_FILE"; warn "Stale PID file removed."; }
    fi
}

cmd_logs() {
    if [[ ! -f "$LOG_FILE" ]]; then
        warn "No log file found at $LOG_FILE. Start the server first."
        return 1
    fi
    info "Tailing $LOG_FILE  (Ctrl+C to exit)"
    tail -f "$LOG_FILE"
}

# ── Dispatch ──────────────────────────────────────────────────────────────────
case "${1:-help}" in
    start)   cmd_start   ;;
    stop)    cmd_stop    ;;
    restart) cmd_restart ;;
    status)  cmd_status  ;;
    logs)    cmd_logs    ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "  start    Start the Node.js API server in the background"
        echo "  stop     Stop the running server"
        echo "  restart  Restart the server"
        echo "  status   Show running state and PID"
        echo "  logs     Tail the live server log"
        exit 1
        ;;
esac
