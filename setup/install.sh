#!/usr/bin/env bash
# =============================================================================
# ITMP — Plug-and-Play Installation Script
# Tested on Ubuntu 22.04 / 24.04 LTS (fresh or shared server)
#
# Usage (run from anywhere in the repo):
#   sudo bash setup/install.sh
#
# What it does:
#   1. Installs nginx, MySQL, Node.js 20, Python3
#   2. Configures MySQL and applies the schema
#   3. Writes back-end/node-server/.env
#   4. Installs npm dependencies
#   5. Creates a systemd service (itmp-api) that auto-starts on boot
#   6. Configures nginx to serve the frontend and proxy /api/ to Node
# =============================================================================

set -euo pipefail

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
die()     { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "Run with sudo: sudo bash setup/install.sh"

# ── Resolve absolute paths from wherever the script is invoked ────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

NODE_SERVER_DIR="$PROJECT_ROOT/back-end/node-server"
PYTHON_SCRIPTS_DIR="$PROJECT_ROOT/back-end/scripting/python-scripts"
SCHEMA_FILE="$PROJECT_ROOT/back-end/scripting/mysql-scripts/schema.sql"
NGINX_CONF_SRC="$SCRIPT_DIR/nginx.conf"
NGINX_SITE_FILE="/etc/nginx/sites-available/itmp"
FRONTEND_ROOT="$PROJECT_ROOT/front-end"
STORAGE_DIR="$NODE_SERVER_DIR/storage"
ENV_FILE="$NODE_SERVER_DIR/.env"
LOG_DIR="$PROJECT_ROOT/logs"
SYSTEMD_UNIT="/etc/systemd/system/itmp-api.service"

echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   ITMP — Intelligent Talent Matching Platform Setup      ${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════${NC}"
echo ""
info "Project root: $PROJECT_ROOT"
echo ""

# ── Prompt for MySQL root password ───────────────────────────────────────────
read -rsp "MySQL root password to set (Enter = use 'root'): " DB_PASS
echo ""
DB_PASS="${DB_PASS:-root}"
DB_NAME="itmp_db"
DB_USER="root"

# ── 1. System packages ────────────────────────────────────────────────────────
info "Updating package lists…"
apt-get update -qq
success "Package lists updated."

info "Installing nginx, MySQL, Python3, curl, build tools…"
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    nginx mysql-server python3 python3-venv python3-pip \
    curl git build-essential
success "System packages installed."

# ── 2. Node.js 20 LTS ────────────────────────────────────────────────────────
NODE_MAJOR=$(node --version 2>/dev/null | grep -oP '(?<=v)\d+' || echo 0)
if [[ "$NODE_MAJOR" -lt 18 ]]; then
    info "Installing Node.js 20 LTS…"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
    apt-get install -y -qq nodejs
fi
success "Node.js $(node --version) ready."

# ── 3. MySQL setup ────────────────────────────────────────────────────────────
info "Starting MySQL…"
systemctl enable mysql --quiet
systemctl start mysql

info "Creating database and applying schema…"
mysql -u root --connect-expired-password 2>/dev/null <<SQL
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASS}';
FLUSH PRIVILEGES;
SQL

mysql -u root -p"${DB_PASS}" 2>/dev/null < "$SCHEMA_FILE" \
    && success "Schema applied to '${DB_NAME}'." \
    || warn "Schema may already exist — skipping."

# ── 4. Write .env ─────────────────────────────────────────────────────────────
info "Writing .env…"
cat > "$ENV_FILE" <<ENV
DB_HOST=localhost
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
DB_NAME=${DB_NAME}
PORT=3000
ENV
chmod 600 "$ENV_FILE"
success ".env → $ENV_FILE"

# ── 5. npm install ────────────────────────────────────────────────────────────
info "Installing Node.js dependencies…"
cd "$NODE_SERVER_DIR"
npm install --silent
success "npm dependencies installed."

# ── 6. Storage directories ────────────────────────────────────────────────────
info "Creating storage and log directories…"
mkdir -p "$STORAGE_DIR/resumes" "$STORAGE_DIR/avatars" "$LOG_DIR"
chmod -R 775 "$STORAGE_DIR" "$LOG_DIR"
success "Directories ready."

# ── Allow nginx (www-data) to traverse the project path ──────────────────────
# nginx workers run as www-data and can't enter /root (mode 700) by default.
# Adding o+x to each ancestor directory lets them traverse without listing.
info "Ensuring nginx can traverse project path…"
TRAVERSE_PATH="$PROJECT_ROOT"
while [[ "$TRAVERSE_PATH" != "/" ]]; do
    chmod o+x "$TRAVERSE_PATH" 2>/dev/null || true
    TRAVERSE_PATH="$(dirname "$TRAVERSE_PATH")"
done
success "Path traversal permissions set."

# ── 7. Python venv for resume scanner ────────────────────────────────────────
VENV_DIR="$PYTHON_SCRIPTS_DIR/venv"
if [[ ! -d "$VENV_DIR" ]]; then
    info "Setting up Python venv for resume scanner…"
    python3 -m venv "$VENV_DIR"
    "$VENV_DIR/bin/pip" install --upgrade pip --quiet
    "$VENV_DIR/bin/pip" install spacy pdfminer.six --quiet
    "$VENV_DIR/bin/python" -m spacy download en_core_web_sm --quiet
    success "Python venv ready."
else
    success "Python venv already exists — skipping."
fi

# ── 8. systemd service ────────────────────────────────────────────────────────
info "Installing itmp-api systemd service…"
NODE_BIN="$(command -v node)"
cat > "$SYSTEMD_UNIT" <<UNIT
[Unit]
Description=ITMP API Server
After=network.target mysql.service

[Service]
Type=simple
WorkingDirectory=${NODE_SERVER_DIR}
EnvironmentFile=${ENV_FILE}
ExecStart=${NODE_BIN} server.js
Restart=on-failure
RestartSec=5s
StandardOutput=append:${LOG_DIR}/node.log
StandardError=append:${LOG_DIR}/node.log

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable itmp-api --quiet
success "itmp-api service installed and enabled."

# ── 9. nginx ─────────────────────────────────────────────────────────────────
info "Configuring nginx…"

# Substitute the real frontend path into the template
sed "s|__FRONTEND_ROOT__|${FRONTEND_ROOT}|g" "$NGINX_CONF_SRC" > "$NGINX_SITE_FILE"

ln -sf "$NGINX_SITE_FILE" /etc/nginx/sites-enabled/itmp
# Remove default site only if it is the stock Ubuntu placeholder
[[ -L /etc/nginx/sites-enabled/default ]] && rm -f /etc/nginx/sites-enabled/default || true

nginx -t -q && systemctl enable nginx --quiet && systemctl restart nginx
success "nginx configured and restarted."

# ── 10. Make helper scripts executable ───────────────────────────────────────
chmod +x "$SCRIPT_DIR/server.sh"
chmod +x "$PROJECT_ROOT/back-end/scripting/bash-scripts/"*.sh 2>/dev/null || true

# ── 11. Start the API server now ─────────────────────────────────────────────
info "Starting ITMP API server…"
systemctl restart itmp-api
sleep 2
if systemctl is-active --quiet itmp-api; then
    success "itmp-api is running."
else
    warn "itmp-api failed to start. Run: journalctl -u itmp-api -n 40"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
SERVER_IP=$(hostname -I | awk '{print $1}')
echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Installation complete!                                  ${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Open in browser:       ${CYAN}http://${SERVER_IP}/pages/login.html${NC}"
echo ""
echo -e "  Manage the API server:"
echo -e "    Start:               ${CYAN}systemctl start  itmp-api${NC}"
echo -e "    Stop:                ${CYAN}systemctl stop   itmp-api${NC}"
echo -e "    Restart:             ${CYAN}systemctl restart itmp-api${NC}"
echo -e "    Status:              ${CYAN}systemctl status  itmp-api${NC}"
echo -e "    Logs:                ${CYAN}journalctl -u itmp-api -f${NC}"
echo ""
echo -e "  Or use the helper:     ${CYAN}./setup/server.sh {start|stop|restart|status|logs}${NC}"
echo ""
echo -e "  .env:                  ${CYAN}${ENV_FILE}${NC}"
echo -e "  nginx config:          ${CYAN}${NGINX_SITE_FILE}${NC}"
echo -e "  Database:              ${CYAN}${DB_NAME}${NC} (user: ${DB_USER})"
echo ""
