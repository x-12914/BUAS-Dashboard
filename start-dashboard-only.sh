#!/bin/bash
# Startup script for BUAS-Dashboard only (without Flask server)

echo "Starting BUAS Dashboard (Dashboard + FastAPI only)..."
echo "===================================================="

# Install Python dependencies for FastAPI server
echo "Installing FastAPI server dependencies..."
cd backend
pip3 install -r requirements.txt
cd ..

# Install Node.js dependencies for frontend
echo "Installing frontend dependencies..."
cd frontend
npm install
npm run build
cd ..

# Start FastAPI and Frontend only (Flask server should be started separately)
echo "Starting Dashboard services..."
pm2 start ecosystem.config.js --only phone-dashboard-fastapi,phone-dashboard-frontend

# Show status
echo "Dashboard services started! Status:"
pm2 status

echo ""
echo "Services running:"
echo "- FastAPI Server: http://143.244.133.125:8000" 
echo "- Frontend: http://143.244.133.125:3000"
echo ""
echo "NOTE: Flask server should be started separately from BUAS folder"
echo "To check logs: pm2 logs"
echo "To stop services: pm2 stop phone-dashboard-fastapi phone-dashboard-frontend"
