# BUAS Phone Monitoring Dashboard

A React-based dashboard for monitoring phone activities with Flask backend integration.

## 🏗️ Architecture

```
React Frontend (Port 3000) → Flask Backend (Port 5000) → Database
```

**Note**: This workspace contains only the **React Frontend**. The Flask backend (BUAS) is maintained as a separate workspace/repository.

## 🚀 Quick Start

### VPS Deployment (Frontend Only)
```bash
# 1. Upload frontend project to VPS
scp -r . user@143.244.133.125:/opt/buas-dashboard-frontend/

# 2. SSH into VPS and deploy frontend
ssh user@143.244.133.125
cd /opt/buas-dashboard-frontend
chmod +x deploy-vps.sh
./deploy-vps.sh
```

**Note:** Flask backend (BUAS) should be deployed separately from its own workspace.

### Local Development
```bash
# Frontend (this workspace)
cd frontend
npm install
npm start

# Make sure Flask backend is running on port 5000
# (Deploy Flask backend separately from BUAS workspace)
```

## 🌐 Access Points (After Deployment)

- **Dashboard:** http://143.244.133.125:3000  
- **Flask API:** http://143.244.133.125:5000 (from BUAS workspace)
- **Flask API:** http://143.244.133.125:5000 (separate workspace)

## 🔐 Authentication

- **Username:** admin
- **Password:** supersecret

## ✨ Features

- Real-time phone location tracking
- Audio file upload and management
- Interactive map visualization
- Session monitoring and controls
- Dual backend architecture for scalability

## 📁 Project Structure

## 📁 Project Structure

```
BUAS-Dashboard/
├── frontend/         # React dashboard
├── deploy-vps.sh    # Frontend deployment script
└── ecosystem.config.js  # PM2 configuration (frontend only)

Note: BUAS/ (Flask server) is separate workspace/repository
```

## 🔧 Configuration

### Frontend Configuration
- **API Endpoint**: Points to Flask server at `http://143.244.133.125:5000`
- **Environment Variables**: Configured in `.env.production` and `.env.development`

### Backend Configuration  
- **Flask Server**: Maintained in separate BUAS workspace/repository
- **Database**: Configured in Flask workspace
- **Authentication**: Basic auth (`admin:supersecret`)

## 🚀 Deployment Notes

1. **Frontend Deployment**: Use this workspace to deploy the React frontend
2. **Backend Deployment**: Deploy Flask backend separately from BUAS workspace  
3. **Service Communication**: Frontend → Flask → Database
4. **Ports**: Frontend (3000), Flask (5000)

## 📝 Development Workflow

1. **Frontend Changes**: Make changes in this workspace
2. **Backend Changes**: Make changes in BUAS workspace  
3. **Testing**: Ensure Flask backend is running before testing frontend
4. **Deployment**: Deploy each component from its respective workspace

## 🛠️ Tech Stack

- **Backend:** Flask, SQLAlchemy
- **Frontend:** React, Leaflet Maps, Chart.js
- **Optional:** Celery, Redis (for background tasks)

---

**Important**: This is a frontend-only workspace. The Flask backend (BUAS) is maintained separately and should be deployed from its own repository.

## 📄 License

MIT License
