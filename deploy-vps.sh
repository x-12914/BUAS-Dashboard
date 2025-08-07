#!/bin/bash

# VPS Deployment Script for BUAS Dashboard
# Run this script on your VPS (143.244.133.125)

echo "🚀 Starting VPS deployment for BUAS Dashboard..."

# Check if running as root or with sudo access
if [ "$EUID" -eq 0 ]; then
    echo "⚠️  Please don't run this script as root. Use a regular user with sudo access."
    exit 1
fi

# Check if we have sudo access
if ! sudo -n true 2>/dev/null; then
    echo "📝 This script requires sudo access. Please ensure you have sudo privileges."
fi

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required system packages
sudo apt install -y python3 python3-pip python3-venv nodejs npm postgresql postgresql-contrib redis-server

# Install PM2 globally for process management
sudo npm install -g pm2 serve

# Create project directory
sudo mkdir -p /opt/buas-dashboard
sudo chown $USER:$USER /opt/buas-dashboard
cd /opt/buas-dashboard

# Clone or update project files
# Note: Upload your project files to this directory

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if essential files exist
if [ ! -f "ecosystem.config.js" ]; then
    echo "❌ ecosystem.config.js not found. Make sure you're in the correct directory."
    exit 1
fi

if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ backend or frontend directory not found."
    exit 1
fi

if [ ! -f "backend/main.py" ] || [ ! -f "backend/requirements.txt" ]; then
    echo "❌ Essential backend files missing (main.py or requirements.txt)."
    exit 1
fi

if [ ! -f "frontend/package.json" ]; then
    echo "❌ frontend/package.json not found."
    exit 1
fi

echo "✅ Pre-deployment checks passed"

# Setup Python virtual environment for FastAPI
python3 -m venv fastapi-env
source fastapi-env/bin/activate

# Install FastAPI dependencies
cd backend
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    echo "✅ FastAPI dependencies installed"
else
    echo "❌ requirements.txt not found in backend directory"
    exit 1
fi

# Setup PostgreSQL database
sudo -u postgres createuser -d -r -s buas_user 2>/dev/null || echo "User may already exist"
sudo -u postgres createdb buas_dashboard -O buas_user 2>/dev/null || echo "Database may already exist"
sudo -u postgres psql -c "ALTER USER buas_user PASSWORD 'your_secure_password';" 2>/dev/null || echo "Password may already be set"

# Configure environment variables
cat > .env << EOF
DATABASE_URL=postgresql://buas_user:your_secure_password@localhost:5432/buas_dashboard
HOST=0.0.0.0
PORT=8000
DEBUG=false
EOF

# Initialize FastAPI database
python -c "
import asyncio
from database import init_db

async def main():
    await init_db()
    print('✅ Database initialized successfully')

asyncio.run(main())
"

# Build React frontend
cd ../frontend
if [ -f "package.json" ]; then
    npm install
    npm run build
    echo "✅ Frontend built successfully"
else
    echo "❌ package.json not found in frontend directory"
    exit 1
fi

# Start services with PM2
echo "Starting services..."

# Start FastAPI backend
cd /opt/buas-dashboard
pm2 start ecosystem.config.js --env production

# Note: Flask server (BUAS) is already running on VPS as separate workspace
echo "📝 Note: Flask server (BUAS) should already be running on the VPS"
echo "📝 If not, start it separately from the BUAS workspace"

# Save PM2 configuration
pm2 save
pm2 startup

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw allow 5000
sudo ufw allow 8000
sudo ufw --force enable

echo "✅ Deployment complete!"
echo ""
echo "🌐 Services should be running at:"
echo "- FastAPI Backend: http://143.244.133.125:8000"
echo "- React Frontend: http://143.244.133.125:3000"
echo "- Flask Server: http://143.244.133.125:5000 (separate BUAS workspace)"
echo ""
echo "🔍 Check services status:"
echo "  pm2 status"
echo ""
echo "📊 View logs:"
echo "  pm2 logs phone-dashboard-fastapi"
echo "  pm2 logs phone-dashboard-frontend"
echo ""
echo "🔄 Restart services if needed:"
echo "  pm2 restart phone-dashboard-fastapi"
echo "  pm2 restart phone-dashboard-frontend"
echo ""
echo "⚠️  Remember:"
echo "  1. Flask server (BUAS) is managed separately - it should already be running"
echo "  2. Update database password in this script before running"
echo "  3. Test all endpoints to ensure FastAPI and Flask can communicate"
