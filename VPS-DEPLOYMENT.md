# 🚀 VPS Deployment Guide - Flask + FastAPI Dual Backend

## 📋 Overview
This project uses a **dual backend architecture**:
- **Flask Backend**: Phone data/uploads on port 5000
- **FastAPI Backend**: Dashboard API on port 8000  
- **React Frontend**: User interface on port 3000
- **VPS IP**: 143.244.133.125

## ⚠️ Architecture Understanding
✅ **Dual Backend Setup**: Flask (port 5000) + FastAPI (port 8000)
✅ **Flask Server**: Handles phone data uploads and device management
✅ **FastAPI Server**: Provides dashboard functionality and UI templates
✅ **Frontend**: Connects primarily to Flask for data, FastAPI for dashboard features

## 🔧 VPS Setup Instructions

### 1. **Server Requirements**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.9+
sudo apt install python3 python3-venv python3-pip -y

# Install Node.js 16+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install PostgreSQL (optional, can use SQLite for testing)
sudo apt install postgresql postgresql-contrib -y
```

### 2. **Backend Deployment (Both Servers)**

**Flask Server (Port 5000) - Phone Data Handler**
```bash
# This server should already be running on your VPS
# It handles phone uploads and device data
# URL: http://143.244.133.125:5000
```

**FastAPI Server (Port 8000) - Dashboard API**
```bash
# Clone repository
git clone <your-repo-url>
cd BUAS-Dashboard

# Setup Python environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start FastAPI server
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Or use the startup script:**
```bash
chmod +x start-vps.sh
./start-vps.sh
```

### 3. **Frontend Deployment (React)**
```bash
# In a new terminal
cd BUAS-Dashboard/frontend

# Install dependencies
npm install

# Start with Flask backend connection
npm run start:flask

# Or for production build
npm run build
# Serve with nginx or serve the build folder
```

### 4. **Database Setup**

**Option A: SQLite (Simple)**
```bash
# No setup needed - SQLite file will be created automatically
# Database: backend/phone_monitoring.db
```

**Option B: PostgreSQL (Production)**
```bash
# Create database
sudo -u postgres psql
CREATE DATABASE phone_monitoring;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE phone_monitoring TO your_username;
\q

# Update backend/.env
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/phone_monitoring
```

## 🌐 Access URLs

- **Flask Backend (Phone Data)**: http://143.244.133.125:5000
- **FastAPI Backend (Dashboard)**: http://143.244.133.125:8000
- **Frontend Dashboard**: http://143.244.133.125:3000
- **FastAPI Documentation**: http://143.244.133.125:8000/docs
- **Health Check**: http://143.244.133.125:8000/health

## 🔥 Process Management with PM2

```bash
# Install PM2
npm install -g pm2

# Start Flask server (should already be running)
# pm2 start flask_app.py --name "phone-flask-server" --interpreter python3

# Start FastAPI server with PM2
cd backend
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name "dashboard-fastapi"

# Start frontend with PM2 (production build)
cd ../frontend
npm run build
pm2 serve build 3000 --name "dashboard-frontend"

# Save PM2 configuration
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs
```

## 🔒 Security & Production Setup

### Nginx Reverse Proxy (Recommended)
```nginx
# /etc/nginx/sites-available/dashboard
server {
    listen 80;
    server_name 143.244.133.125;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend docs
    location /docs {
        proxy_pass http://localhost:8000;
    }
}
```

### Firewall Configuration
```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # React (if direct access needed)
sudo ufw allow 8000  # FastAPI (if direct access needed)
sudo ufw enable
```

## 🧪 Testing the Setup

### Backend Health Check
```bash
curl http://143.244.133.125:8000/health
# Expected: {"status":"healthy","timestamp":"...","version":"1.0.0"}
```

### Frontend Connection
```bash
curl http://143.244.133.125:3000
# Expected: React app HTML
```

### API Endpoints Test
```bash
curl http://143.244.133.125:8000/api/dashboard-data
curl http://143.244.133.125:8000/api/users
```

## 🐛 Troubleshooting

### Backend Issues
- Check logs: `pm2 logs dashboard-api`
- Check if port 8000 is open: `netstat -tlnp | grep 8000`
- Test database connection in Python console

### Frontend Issues
- Check logs: `pm2 logs dashboard-frontend`
- Verify API_BASE_URL in network tab of browser dev tools
- Check CORS errors in browser console

### CORS Issues
- Verify VPS IP is in `allow_origins` list in main.py
- Check browser dev tools for CORS errors
- Test with `curl` to isolate client vs server issues

## 📁 File Structure After Deployment
```
/home/user/BUAS-Dashboard/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # Database models
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables
│   ├── phone_monitoring.db  # SQLite database (if used)
│   └── recordings/          # Audio files storage
├── frontend/
│   ├── src/
│   ├── build/              # Production build
│   ├── package.json
│   └── node_modules/
├── start-vps.sh           # Linux startup script
└── start-vps.bat          # Windows startup script
```

## 🎯 Next Steps

1. **Set up SSL/HTTPS** with Let's Encrypt
2. **Configure database backups**
3. **Set up monitoring** with PM2 and system logs
4. **Add rate limiting** for API endpoints
5. **Implement proper authentication** if needed

## 📞 Support
If you encounter issues:
1. Check the logs: `pm2 logs`
2. Verify network connectivity: `ping 143.244.133.125`
3. Test individual services with `curl`
4. Check system resources: `htop`, `df -h`
