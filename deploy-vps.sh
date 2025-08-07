#!/bin/bash

# VPS Deployment Script for BUAS Dashboard
# Run this script on your VPS (143.244.133.125)

echo "🚀 Starting VPS deployment for BUAS Dashboard..."

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

# Setup Python virtual environment for FastAPI
python3 -m venv fastapi-env
source fastapi-env/bin/activate

# Install FastAPI dependencies
cd backend
pip install -r requirements.txt

# Setup PostgreSQL database
sudo -u postgres createuser --interactive buas_user || echo "User may already exist"
sudo -u postgres createdb buas_dashboard || echo "Database may already exist"
sudo -u postgres psql -c "ALTER USER buas_user PASSWORD 'your_secure_password';"

# Configure environment variables
cat > ../backend/.env << EOF
DATABASE_URL=postgresql://buas_user:your_secure_password@localhost:5432/buas_dashboard
HOST=0.0.0.0
PORT=8000
DEBUG=false
EOF

# Initialize FastAPI database
python -c "from database import init_db; init_db()"

# Build React frontend
cd ../frontend
npm install
npm run build

# Setup Flask environment (in BUAS workspace)
cd ../BUAS
python3 -m venv flask-env
source flask-env/bin/activate
pip install -r requirements.txt

# Start services with PM2
echo "Starting services..."

# Start FastAPI backend
cd /opt/buas-dashboard
pm2 start ecosystem.config.js --env production

# Start Flask server (from BUAS directory)
cd ../BUAS
source flask-env/bin/activate
pm2 start "python3 server.py" --name "buas-flask-server"

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
echo "Services running:"
echo "- FastAPI Backend: http://143.244.133.125:8000"
echo "- Flask Server: http://143.244.133.125:5000"  
echo "- React Frontend: http://143.244.133.125:3000"
echo ""
echo "Check status with: pm2 status"
echo "View logs with: pm2 logs"
