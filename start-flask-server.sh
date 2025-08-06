#!/bin/bash
# Startup script for BUAS Flask Server only

echo "Starting BUAS Flask Server..."
echo "============================="

# Install Python dependencies
echo "Installing Flask server dependencies..."
pip3 install -r requirements.txt

# Initialize database if needed
echo "Initializing database..."
python3 init_db.py

# Start Flask server
echo "Starting Flask server on port 5000..."
python3 server.py

echo ""
echo "Flask server should now be running on:"
echo "- http://localhost:5000"
echo "- http://143.244.133.125:5000 (if on VPS)"
echo ""
echo "API endpoints available:"
echo "- POST /api/register"
echo "- POST /api/location"
echo "- POST /api/upload-audio"
echo "- GET /api/dashboard-data"
echo "- GET /api/health"
