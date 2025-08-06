#!/bin/bash
# VPS Startup Script for BUAS Dashboard

echo "Starting BUAS Dashboard on VPS..."
echo "=================================="

# Install Python dependencies for Flask server
echo "Installing Flask server dependencies..."
cd BUAS
pip3 install -r requirements.txt
cd ..

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

# Start all services with PM2
echo "Starting all services..."
pm2 start ecosystem.config.js

# Show status
echo "Services started! Status:"
pm2 status

echo ""
echo "Services running:"
echo "- Flask Server: http://143.244.133.125:5000"
echo "- FastAPI Server: http://143.244.133.125:8000" 
echo "- Frontend: http://143.244.133.125:3000"
echo ""
echo "To check logs: pm2 logs"
echo "To stop services: pm2 stop all"
