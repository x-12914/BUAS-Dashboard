#!/bin/bash

# Local Testing Script - Run this before VPS deployment
echo "🧪 Starting Local Testing Suite..."

# Test 1: Check if all required files exist
echo "📁 Checking required files..."
required_files=(
    "backend/main.py"
    "backend/requirements.txt"
    "backend/database.py"
    "frontend/package.json"
    "frontend/src/services/api.js"
    "BUAS/server.py"
    "BUAS/requirements.txt"
    "ecosystem.config.js"
    ".env.production"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Test 2: Check Python dependencies
echo "🐍 Checking Python dependencies..."
cd backend
if python -c "import fastapi, uvicorn, sqlalchemy, psycopg2" 2>/dev/null; then
    echo "✅ FastAPI dependencies available"
else
    echo "❌ Missing FastAPI dependencies. Run: pip install -r requirements.txt"
fi
cd ..

cd BUAS
if python -c "import flask, flask_cors, flask_sqlalchemy" 2>/dev/null; then
    echo "✅ Flask dependencies available"
else
    echo "❌ Missing Flask dependencies. Run: pip install -r requirements.txt"
fi
cd ..

# Test 3: Check Node.js dependencies
echo "📦 Checking Node.js dependencies..."
cd frontend
if [ -d "node_modules" ]; then
    echo "✅ Node modules installed"
else
    echo "❌ Node modules missing. Run: npm install"
fi
cd ..

# Test 4: Test configurations
echo "⚙️ Checking configurations..."

# Check if API URL is set correctly in frontend
if grep -q "143.244.133.125:5000" frontend/src/services/api.js; then
    echo "✅ Frontend API URL configured for VPS"
else
    echo "❌ Frontend API URL not configured for VPS"
fi

# Check if CORS includes VPS IP in FastAPI
if grep -q "143.244.133.125" backend/main.py; then
    echo "✅ FastAPI CORS configured for VPS"
else
    echo "❌ FastAPI CORS not configured for VPS"
fi

# Check if CORS includes VPS IP in Flask
if grep -q "143.244.133.125" BUAS/app/__init__.py; then
    echo "✅ Flask CORS configured for VPS"
else
    echo "❌ Flask CORS not configured for VPS"
fi

echo ""
echo "🎯 Testing Summary:"
echo "If all tests passed ✅, you're ready for VPS deployment!"
echo "If any tests failed ❌, fix the issues before deploying."
echo ""
echo "Next steps:"
echo "1. Update database password in deploy-vps.sh and .env.production"
echo "2. Upload project to VPS: scp -r . root@143.244.133.125:/opt/buas-dashboard/"
echo "3. Run deployment script on VPS: ./deploy-vps.sh"
