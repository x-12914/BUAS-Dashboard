#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Lightweight deploy script that runs from the current repo directory.
# Run as a non-root user with sudo privileges (eg. opt).
# It will create a venv for backend and build frontend, then use pm2 to start services.

ROOT_UID=0
if [ "$EUID" -eq "$ROOT_UID" ]; then
  echo "⚠️  Please don't run this script as root. Use a regular user with sudo access."
  exit 1
fi

echo "🚀 Starting VPS deployment for BUAS Dashboard (cwd: $(pwd))"

# Ensure essential files are present in the current directory
if [ ! -f "ecosystem.config.js" ]; then
  echo "❌ ecosystem.config.js not found in $(pwd). Please run this script from the repository root."
  exit 1
fi
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
  echo "❌ frontend or backend directory missing in $(pwd)"
  exit 1
fi

# OPTIONAL: update system packages (asks for sudo)
echo "Updating apt packages (requires sudo)..."
sudo apt update && sudo apt upgrade -y

# Install system deps (nodejs should come from nodesource; installs npm via nodejs)
echo "Installing system packages (sudo)..."
sudo apt install -y python3 python3-pip python3-venv curl build-essential redis-server || true

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

# -------- Backend setup (local venv) --------
BACKEND_DIR="$(pwd)/backend"
VENV_DIR="$(pwd)/fastapi-env"

echo "Setting up Python virtualenv at: $VENV_DIR"
python3 -m venv "$VENV_DIR"
# shellcheck disable=SC1090
source "$VENV_DIR/bin/activate"

cd "$BACKEND_DIR"

if [ -f "requirements.txt" ]; then
  echo "Installing backend pip requirements..."
  pip install --upgrade pip
  pip install -r requirements.txt
else
  echo "❌ backend/requirements.txt not found"
  deactivate
  exit 1
fi

# Create .env in the repo root (update password manually!)
cat > ../.env << EOF
DATABASE_URL=postgresql://buas_user:your_secure_password@localhost:5432/buas_dashboard
HOST=0.0.0.0
PORT=8000
DEBUG=false
EOF

# (Optional) Initialize DB if backend provides init function. This is safe but may vary.
if python -c "import importlib, sys, pkgutil; print('ok')" >/dev/null 2>&1; then
  # Example: adapt if your backend uses a different init routine
  if python -c "import backend, sys; print('ok')" >/dev/null 2>&1; then
    echo "Running backend DB init if available..."
    # safe - run a script if present
    if [ -f "init_db.py" ]; then
      python init_db.py || echo "init_db.py ran with errors (continuing)"
    fi
  fi
fi

deactivate
cd ..

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

# -------- PM2 startup (use ecosystem.config.js located in repo root) --------
echo "Starting services via pm2 using ecosystem.config.js"
# ensure pm2 uses this user's environment
pm2 start ecosystem.config.js --env production || {
  echo "pm2 start failed; attempt to show pm2 list"
  pm2 list || true
}

pm2 save
pm2 startup --skip-install

# Open firewall ports (sudo)
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw allow 5000
sudo ufw allow 8000
sudo ufw --force enable

echo "✅ Deployment actions finished."
echo "Use 'pm2 status' to check the apps, 'pm2 logs <name>' to view logs."
echo "Remember to replace the DB password in .env and in your DB."

