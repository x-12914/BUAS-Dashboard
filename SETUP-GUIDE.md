# Setup Guide

## 🚀 VPS Deployment (Recommended)

### Step 1: Prepare for Deployment
```bash
# Update database password in deployment script
sed -i 's/your_secure_password/your_actual_password/g' deploy-vps.sh
```

### Step 2: Upload to VPS
```bash
# Upload main project to VPS
scp -r . root@143.244.133.125:/opt/buas-dashboard/

# Note: BUAS Flask server is already running on VPS as separate workspace
```

### Step 3: Deploy on VPS
```bash
# SSH into VPS
ssh root@143.244.133.125

# Navigate to project and deploy
cd /opt/buas-dashboard
chmod +x deploy-vps.sh
./deploy-vps.sh
```

### Step 4: Verify Deployment
```bash
# Check services status
pm2 status

# Should show 2 services running:
# - phone-dashboard-fastapi
# - phone-dashboard-frontend  
# (BUAS Flask server runs separately)
```

## 🌐 Access After Deployment

- **Dashboard:** http://143.244.133.125:3000
- **FastAPI Documentation:** http://143.244.133.125:8000/docs
- **Flask API:** http://143.244.133.125:5000 (already running separately)

## �️ Local Development

### Start All Services
```bash
# Terminal 1: FastAPI Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Flask Server
cd BUAS
pip install -r requirements.txt
python server.py

# Terminal 3: React Frontend
cd frontend
npm install
npm start
```

## 🔍 Testing

### Test API Endpoints
```bash
# Health check
curl http://143.244.133.125:8000/

# Dashboard data (with auth)
curl -u admin:supersecret http://143.244.133.125:5000/api/dashboard-data

# Register phone
curl -X POST http://143.244.133.125:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"phone_id": "test001", "device_name": "Test Phone"}'
```

## 🔧 Troubleshooting

### Common Issues
- **Services not starting:** Check logs with `pm2 logs`
- **Database connection:** Verify DATABASE_URL in .env
- **Port conflicts:** Ensure ports 3000, 5000, 8000 are available
- **CORS errors:** Check frontend can reach Flask at correct URL

### Service Management
```bash
# Restart all services
pm2 restart all

# Stop all services
pm2 stop all

# View logs
pm2 logs [service-name]
```
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
