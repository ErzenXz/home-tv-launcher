#!/bin/sh
# Serve Home on your local network so the TV (or any device) can open it.
cd "$(dirname "$0")"
PORT="${1:-8080}"
IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')"
echo ""
echo "  Home is running. On your TV's browser open:"
echo ""
echo "      http://${IP:-<this-computer-ip>}:${PORT}"
echo ""
exec python3 -m http.server "$PORT" --bind 0.0.0.0
