#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-5173}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${ROOT_DIR}/phone-notifications"

cd "${APP_DIR}"

URL="http://localhost:${PORT}"
echo "Opening phone notifications at: ${URL}"

# Start a simple local server. (Use Ctrl+C to stop.)
python3 -m http.server "${PORT}" > /tmp/phone-notifications-server.log 2>&1 &
SERVER_PID=$!

# Best-effort browser launch (works on macOS).
if command -v open >/dev/null 2>&1; then
  open "${URL}" || true
fi

wait "${SERVER_PID}"

