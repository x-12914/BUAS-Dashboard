# Setup & Troubleshooting Guide

## 🚀 How to Start the Servers

### Current Architecture
- **Flask Server**: Already running online at `143.244.133.125:5000` (VPS)
- **React Frontend**: Already running online at `143.244.133.125:3000` (VPS)
- **FastAPI Server**: Run locally for additional dashboard features (optional)

### Step 1: Start FastAPI Server (Optional - Local Only)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
**Expected Output:** `Uvicorn running on http://0.0.0.0:8000`

### Step 2: Access Online Services
- **Flask Server**: `http://143.244.133.125:5000` (already running online)
- **React Frontend**: `http://143.244.133.125:3000` (already running online)

## 🔍 How to Use the System

### Access the Dashboard
1. Open browser to `http://143.244.133.125:3000` (VPS frontend)
2. You'll see the phone monitoring dashboard with:
   - Real-time user list from VPS Flask server
   - Interactive map showing phone locations
   - Session controls for each device

### Test API Endpoints
```bash
# Check VPS Flask server
curl http://143.244.133.125:5000/api/health

# Check local FastAPI server (if running)
curl http://localhost:8000/health

# Get dashboard data from VPS Flask (with auth)
curl -u admin:supersecret http://143.244.133.125:5000/api/dashboard-data
```

### Upload Audio from Phone
```bash
# Register a phone device (VPS Flask server)
curl -X POST http://143.244.133.125:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"phone_id": "test001", "device_name": "Test Phone"}'

# Upload audio file (VPS Flask server with auth)
curl -X POST http://143.244.133.125:5000/api/upload-audio \
  -u admin:supersecret \
  -F "phone_id=test001" \
  -F "audio=@your_audio_file.wav"
```

## 🛠️ Common Issues & Fixes

### ❌ 502 Bad Gateway Error
**Problem:** VPS Flask server not responding

**Solutions:**
1. **Check if VPS Flask server is running:**
   ```bash
   # Test VPS Flask server
   curl http://143.244.133.125:5000/api/health
   
   # If timeout/502 error, Flask server is down on VPS
   ```

2. **Contact VPS administrator to restart Flask server**
   - Flask server needs to be restarted on the VPS
   - React frontend will automatically reconnect once Flask is running

3. **Check VPS status:**
   ```bash
   # SSH into VPS (if you have access)
   ssh your-username@143.244.133.125
   
   # Check if Flask process is running
   ps aux | grep flask
   netstat -tulpn | grep :5000
   ```

### ❌ Import/Dependency Errors
**Problem:** Missing Python packages for local FastAPI server

**Solutions:**
```bash
# For local FastAPI server only
cd backend
pip install --upgrade pip
pip install -r requirements.txt

# Note: Flask server dependencies are managed on VPS
# Note: React frontend dependencies are managed on VPS
```

### ❌ CORS Errors in Browser
**Problem:** Browser blocks requests between VPS services

**Solution:** Already fixed in code, but if issues persist:
- Check browser console for specific CORS errors
- Ensure VPS Flask server is running at 143.244.133.125:5000
- VPS React frontend automatically configured for VPS Flask server

### ❌ Database Errors
**Problem:** VPS SQLite database issues

**Solutions:**
- **Contact VPS administrator** - Database files are on VPS server
- VPS Flask server manages database automatically
- Local FastAPI can have separate database if needed

### ❌ Frontend Shows No Data
**Problem:** React frontend can't connect to Flask server

**Solutions:**
1. **Verify Flask server is responding:**
   ```bash
   curl http://143.244.133.125:5000/api/dashboard-data
   ```

2. **Check CORS settings** - Flask server must allow requests from frontend

3. **Browser console** - Check for network errors or authentication issues

### ❌ Redis/Celery Warnings
**Problem:** Background task system not available

**Solution:** This is normal! The system works without Redis/Celery
- Warnings like "Celery not available" are expected
- Audio uploads still work, just without background processing
- To enable: Install Redis and restart Flask server

## 🌐 Server Locations

| Service | Location | URL | Purpose |
|---------|----------|-----|---------|
| Flask Server | VPS | `http://143.244.133.125:5000` | Phone data, uploads |
| React Frontend | VPS | `http://143.244.133.125:3000` | User interface |
| FastAPI Server | Local | `http://localhost:8000` | Dashboard features |

## ✅ Health Check Commands

```bash
# Check VPS services (online)
curl http://143.244.133.125:5000/api/health     # Flask
curl http://143.244.133.125:3000                # React (HTML response)

# Check local service  
curl http://localhost:8000/health                # FastAPI

# Test with authentication (Flask)
curl -u admin:supersecret http://143.244.133.125:5000/api/dashboard-data
```

## 📞 Need Help?

1. **502 Errors**: Flask server down on VPS - contact VPS admin
2. **CORS Errors**: Check browser console, ensure Flask server allows frontend domain
3. **No Data**: Verify Flask server API endpoints are responding
4. **FastAPI Local**: Only needed for additional dashboard features
