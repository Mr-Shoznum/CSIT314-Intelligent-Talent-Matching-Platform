#!/usr/bin/env bash
# =============================================================================
# ITMP — Backend Server Manager
#
# Usage (from any directory):
#   ./setup/server.sh {start|stop|restart|status|logs}
#
# Prefers systemd (itmp-api.service) when available; falls back to
# nohup + PID file for environments without systemd.
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
die()     { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
NODE_SERVER_DIR="$PROJECT_ROOT/back-end/node-server"
ENV_FILE="$NODE_SERVER_DIR/.env"
LOG_DIR="$PROJECT_ROOT/logs"
LOG_FILE="$LOG_DIR/node.log"
PID_FILE="$LOG_DIR/node.pid"

SERVICE="itmp-api"

# ── Detect whether the systemd unit is installed ──────────────────────────────
use_systemd() {
    command -v systemctl &>/dev/null && systemctl list-unit-files "${SERVICE}.service" &>/dev/null 2>&1
}

# ── systemd helpers ───────────────────────────────────────────────────────────
sd_start() {
    info "Starting ${SERVICE} via systemd…"
    systemctl start "$SERVICE"
    sleep 1
    systemctl is-active --quiet "$SERVICE" \
        && success "${SERVICE} is running." \
        || die "${SERVICE} failed to start. Run: journalctl -u ${SERVICE} -n 40"
}

sd_stop() {
    info "Stopping ${SERVICE}…"
    systemctl stop "$SERVICE" && success "${SERVICE} stopped."
}

sd_status() {
    systemctl status "$SERVICE" --no-pager
}

sd_logs() {
    info "Streaming logs (Ctrl+C to exit)…"
    journalctl -u "$SERVICE" -f
}

# ── nohup/PID helpers ─────────────────────────────────────────────────────────
pid_is_running() {
    [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

pid_start() {
    if pid_is_running; then
        warn "Server already running (PID $(cat "$PID_FILE"))."
        return 0
    fi

    [[ -f "$ENV_FILE" ]] && { set -a; source "$ENV_FILE"; set +a; } \
        || warn ".env not found — using environment."

    mkdir -p "$LOG_DIR"
    info "Starting ITMP API server (nohup)…"
    cd "$NODE_SERVER_DIR"
    nohup node server.js >> "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"

    sleep 1
    pid_is_running \
        && success "Server started (PID $(cat "$PID_FILE")). Log: $LOG_FILE" \
        || die "Server failed to start. Check $LOG_FILE"
}

pid_stop() {
    if ! pid_is_running; then
        warn "Server is not running."
        rm -f "$PID_FILE"
        return 0
    fi

    local pid; pid="$(cat "$PID_FILE")"
    info "Stopping server (PID ${pid})…"
    kill "$pid"

    local waited=0
    while kill -0 "$pid" 2>/dev/null && [[ $waited -lt 5 ]]; do
        sleep 1; ((waited++))
    done
    kill -0 "$pid" 2>/dev/null && kill -9 "$pid" 2>/dev/null || true

    rm -f "$PID_FILE"
    success "Server stopped."
}

pid_status() {
    if pid_is_running; then
        echo -e "${GREEN}● Running${NC}  PID $(cat "$PID_FILE")"
        echo -e "  Log:  $LOG_FILE"
        echo -e "  API:  http://localhost:3000"
    else
        echo -e "${RED}● Stopped${NC}"
        [[ -f "$PID_FILE" ]] && { rm -f "$PID_FILE"; warn "Stale PID file removed."; }
    fi
}

pid_logs() {
    [[ -f "$LOG_FILE" ]] || die "No log file at $LOG_FILE. Start the server first."
    info "Tailing $LOG_FILE (Ctrl+C to exit)"
    tail -f "$LOG_FILE"
}

# ── Dispatch ──────────────────────────────────────────────────────────────────
CMD="${1:-help}"

if use_systemd; then
    case "$CMD" in
        start)   sd_start   ;;
        stop)    sd_stop    ;;
        restart) sd_stop || true; sleep 1; sd_start ;;
        status)  sd_status  ;;
        logs)    sd_logs    ;;
        *) echo "Usage: $0 {start|stop|restart|status|logs}"; exit 1 ;;
    esac
else
    case "$CMD" in
        start)   pid_start   ;;
        stop)    pid_stop    ;;
        restart) pid_stop || true; sleep 1; pid_start ;;
        status)  pid_status  ;;
        logs)    pid_logs    ;;
        *) echo "Usage: $0 {start|stop|restart|status|logs}"; exit 1 ;;
    esac
fi
