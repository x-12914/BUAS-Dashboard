# BUAS Phone Monitoring Dashboard

A real-time phone monitoring dashboard with dual backend architecture for handling phone data uploads and providing interactive dashboard functionality.

## 🏗️ Architecture

- **FastAPI Backend (Port 8000):** Database operations and phone monitoring logic
- **Flask Server (Port 5000):** File uploads, audio processing, and API bridge  
- **React Frontend (Port 3000):** Interactive dashboard with real-time updates

## 🚀 Quick Start

### VPS Deployment (Recommended)
All services run on VPS for optimal performance and data synchronization.

```bash
# 1. Upload project to VPS
scp -r . root@143.244.133.125:/opt/buas-dashboard/

# 2. SSH into VPS and deploy
ssh root@143.244.133.125
cd /opt/buas-dashboard
chmod +x deploy-vps.sh
./deploy-vps.sh
```

### Local Development
```bash
# FastAPI Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Flask Server (separate terminal)
cd BUAS
pip install -r requirements.txt  
python server.py

# Frontend (separate terminal)
cd frontend
npm install
npm start
```

## 🌐 Access Points (After VPS Deployment)

- **Dashboard:** http://143.244.133.125:3000
- **Flask API:** http://143.244.133.125:5000
- **FastAPI Docs:** http://143.244.133.125:8000/docs

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

```
BUAS-Dashboard/
├── backend/          # FastAPI server
├── frontend/         # React dashboard
├── BUAS/            # Flask server (separate workspace)
├── deploy-vps.sh    # VPS deployment script
└── ecosystem.config.js  # PM2 configuration
```
- Session management and monitoring
- RESTful API endpoints
- Responsive web interface

## 🛠️ Tech Stack

- **Backend:** Flask, FastAPI, SQLAlchemy, SQLite
- **Frontend:** React, Leaflet Maps, Chart.js
- **Optional:** Celery, Redis (for background tasks)

## 📄 License

MIT License
