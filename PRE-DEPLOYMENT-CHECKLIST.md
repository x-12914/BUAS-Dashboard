# Pre-Deployment Checklist ✅

## Before deploying to VPS, verify these configurations:

### 1. FastAPI Backend ✅
- [x] CORS configured for VPS (143.244.133.125)
- [x] Environment variable loading (dotenv)
- [x] PostgreSQL support in requirements.txt
- [x] Dynamic host/port configuration
- [x] Database URL configuration for VPS

### 2. Frontend (React) ✅
- [x] API_BASE_URL points to Flask server (143.244.133.125:5000)
- [x] Build script available in package.json
- [x] All required dependencies installed

### 3. Flask (BUAS) ✅
- [x] CORS configured for VPS and FastAPI
- [x] Server configured to bind to 0.0.0.0:5000
- [x] Upload folder configuration
- [x] All API routes properly configured

### 4. Deployment Configuration ✅
- [x] ecosystem.config.js configured for production
- [x] No --reload flag in production
- [x] Environment variables properly set
- [x] PM2 configuration for all services

### 5. Database Configuration ✅
- [x] PostgreSQL setup in deployment script
- [x] Environment variable fallback for development
- [x] Database initialization script

## Critical Steps Before Deployment:

### 1. Update Database Password
```bash
# Replace 'your_secure_password' in these files:
# - deploy-vps.sh (lines 35, 41, 42)
# - .env.production (line 2)
```

### 2. Upload Project to VPS
```bash
# Make sure all files are uploaded to: /opt/buas-dashboard/
# Including both main project and BUAS folder
```

### 3. Set Executable Permissions
```bash
chmod +x deploy-vps.sh
```

## Post-Deployment Verification:

### Check Services
```bash
pm2 status
# Should show:
# - phone-dashboard-fastapi (online)
# - phone-dashboard-frontend (online)  
# - buas-flask-server (online)
```

### Test Endpoints
```bash
# FastAPI Health Check
curl http://143.244.133.125:8000/

# Flask Health Check  
curl http://143.244.133.125:5000/api/status

# Frontend
curl http://143.244.133.125:3000/
```

### Check Logs
```bash
pm2 logs phone-dashboard-fastapi
pm2 logs buas-flask-server
pm2 logs phone-dashboard-frontend
```

## Expected Result: ✅
All three services running on VPS, communicating properly, dashboard reflecting real-time data.

## Troubleshooting:
- Database connection issues: Check DATABASE_URL in .env
- CORS issues: Verify all origins in FastAPI and Flask CORS config
- Service not starting: Check PM2 logs for error details
- Port conflicts: Ensure ports 3000, 5000, 8000 are available
