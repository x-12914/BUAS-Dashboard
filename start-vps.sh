#!/bin/bash

# VPS Deployment Script for Phone Monitoring Dashboard

echo "🚀 Starting Phone Monitoring Dashboard on VPS..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install backend dependencies
echo "📚 Installing Python dependencies..."
pip install -r backend/requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/recordings
mkdir -p backend/templates
mkdir -p backend/static

# Set environment variables
export DATABASE_URL=${DATABASE_URL:-"sqlite:///./phone_monitoring.db"}
export HOST=${HOST:-"0.0.0.0"}
export PORT=${PORT:-"8000"}

# Start FastAPI server
echo "🏃 Starting FastAPI server on $HOST:$PORT..."
cd backend
uvicorn main:app --host $HOST --port $PORT --reload

echo "✅ Dashboard is running at http://$HOST:$PORT"
echo "📊 Health check: http://$HOST:$PORT/health"
echo "🎯 API endpoints: http://$HOST:$PORT/docs"
