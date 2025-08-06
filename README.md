# BUAS Phone Monitoring Dashboard

A real-time phone monitoring dashboard with dual backend architecture for handling phone data uploads and providing interactive dashboard functionality.

## 🏗️ Architecture

- **Flask Server (Port 5000):** Primary phone data handler - processes uploads, manages authentication
- **FastAPI Server (Port 8000):** Dashboard API and analytics - provides additional endpoints and documentation  
- **React Frontend (Port 3000):** Interactive UI with real-time updates, maps, and audio management

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ (for local FastAPI server only)
- VPS Access (Flask and React already running online)

### Architecture Status
- **Flask Server**: ✅ Running on VPS at `143.244.133.125:5000`
- **React Frontend**: ✅ Running on VPS at `143.244.133.125:3000`  
- **FastAPI Server**: Optional local setup for additional features

### Setup FastAPI (Optional - Local Only)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Access the System
- **Dashboard**: `http://143.244.133.125:3000` (VPS)
- **Flask API**: `http://143.244.133.125:5000` (VPS)
- **FastAPI Docs**: `http://localhost:8000/docs` (Local)

## 🌐 Access Points

- **Dashboard UI:** http://143.244.133.125:3000 (VPS)
- **Flask API:** http://143.244.133.125:5000 (VPS)
- **FastAPI Docs:** http://localhost:8000/docs (Local)

## 🔐 Authentication

- **Username:** admin
- **Password:** supersecret

## � Features

- Real-time phone location tracking
- Audio file upload and management
- Interactive map visualization
- Session management and monitoring
- RESTful API endpoints
- Responsive web interface

## 🛠️ Tech Stack

- **Backend:** Flask, FastAPI, SQLAlchemy, SQLite
- **Frontend:** React, Leaflet Maps, Chart.js
- **Optional:** Celery, Redis (for background tasks)

## 📄 License

MIT License
