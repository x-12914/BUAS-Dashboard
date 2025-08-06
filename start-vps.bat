@echo off
echo 🚀 Starting Phone Monitoring Dashboard on VPS...

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate

REM Install backend dependencies
echo 📚 Installing Python dependencies...
pip install -r backend\requirements.txt

REM Create necessary directories
echo 📁 Creating directories...
if not exist "backend\recordings" mkdir backend\recordings
if not exist "backend\templates" mkdir backend\templates
if not exist "backend\static" mkdir backend\static

REM Set default environment variables if not set
if not defined DATABASE_URL set DATABASE_URL=sqlite:///./phone_monitoring.db
if not defined HOST set HOST=0.0.0.0
if not defined PORT set PORT=8000

REM Start FastAPI server
echo 🏃 Starting FastAPI server on %HOST%:%PORT%...
cd backend
uvicorn main:app --host %HOST% --port %PORT% --reload

echo ✅ Dashboard is running at http://%HOST%:%PORT%
echo 📊 Health check: http://%HOST%:%PORT%/health
echo 🎯 API endpoints: http://%HOST%:%PORT%/docs
