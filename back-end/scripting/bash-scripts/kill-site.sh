#!/usr/bin/env bash
# Thin wrapper — delegates to setup/server.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/../../../setup/server.sh" stop
