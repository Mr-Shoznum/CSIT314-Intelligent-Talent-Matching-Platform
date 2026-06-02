#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"

echo "Creating virtual environment at $VENV_DIR..."
python3 -m venv "$VENV_DIR"

echo "Installing dependencies..."
"$VENV_DIR/bin/pip" install --upgrade pip --quiet
"$VENV_DIR/bin/pip" install pdfminer.six spacy --quiet

echo "Downloading spaCy model (en_core_web_sm)..."
"$VENV_DIR/bin/python" -m spacy download en_core_web_sm --quiet

echo "Done. Activate with: source $VENV_DIR/bin/activate"
