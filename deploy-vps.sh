#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Lightweight deploy script for React Frontend only
# Flask backend (BUAS) is deployed separately from its own workspace
# Run as a non-root user with sudo privileges (eg. opt).

ROOT_UID=0
if [ "$EUID" -eq "$ROOT_UID" ]; then
  echo "⚠️  Please don't run this script as root. Use a regular user with sudo access."
  exit 1
fi

echo "🚀 Starting Frontend deployment for BUAS Dashboard (cwd: $(pwd))"

# Ensure essential files are present in the current directory
if [ ! -f "ecosystem.config.js" ]; then
  echo "❌ ecosystem.config.js not found in $(pwd). Please run this script from the repository root."
  exit 1
fi
if [ ! -d "frontend" ]; then
  echo "❌ frontend directory missing in $(pwd)"
  exit 1
fi

# OPTIONAL: update system packages (asks for sudo)
echo "Updating apt packages (requires sudo)..."
sudo apt update && sudo apt upgrade -y

# Install system deps (nodejs should come from nodesource; installs npm via nodejs)
echo "Installing system packages (sudo)..."
sudo apt install -y curl build-essential || true

# Ensure nodejs is installed (if not, install NodeSource Node.js 18)
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found — installing Node 18 (Nodesource) (requires sudo)..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs
fi

# Install pm2 and serve globally (sudo because global)
if ! command -v pm2 >/dev/null 2>&1; then
  echo "Installing pm2 globally (requires sudo)..."
  sudo npm install -g pm2 serve
fi

# -------- Frontend build --------
FRONTEND_DIR="$(pwd)/frontend"
cd "$FRONTEND_DIR"
if [ -f "package.json" ]; then
  echo "Installing frontend dependencies (npm)..."
  npm install
  echo "Building frontend..."
  npm run build
else
  echo "❌ frontend/package.json not found"
  exit 1
fi
cd ..

# -------- PM2 startup (Frontend only) --------
echo "Starting Frontend service via pm2 using ecosystem.config.js"
pm2 start ecosystem.config.js --env production || {
  echo "pm2 start failed; attempt to show pm2 list"
  pm2 list || true
}

pm2 save
pm2 startup --skip-install

# Open firewall ports (sudo) - only frontend port needed
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw --force enable

echo "✅ Frontend deployment complete."
echo "Use 'pm2 status' to check the frontend app."
echo "Flask backend should be deployed separately from the BUAS workspace."

