# main.py - FastAPI Phone Monitoring Dashboard
from fastapi import FastAPI, Request, HTTPException, Form, File, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import requests
import json
from datetime import datetime
from typing import Optional, List
import os
from database import get_db, init_db
from crud import (
    get_all_users, get_active_sessions, create_session, 
    end_session, get_user_latest_audio, get_dashboard_stats
)
from schemas import (
    DashboardDataResponse, StartListeningResponse, StopListeningResponse,
    AudioResponse, APIResponse, LocationResponse
)

# Initialize FastAPI app
app = FastAPI(title="Phone Monitoring Dashboard", version="1.0.0")

# Add CORS middleware to allow React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React development server
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://localhost:8000",  # Self-reference (FastAPI)
        "http://localhost:5000",  # Flask server
        "http://143.244.133.125:3000",  # VPS frontend
        "http://143.244.133.125:5000",  # VPS Flask server
        "http://143.244.133.125:8000",  # VPS FastAPI server
        "http://143.244.133.125",  # VPS base
        "https://143.244.133.125",  # VPS HTTPS
        "*"  # Allow all origins for VPS setup (remove in production)
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Setup templates for HTML rendering
templates = Jinja2Templates(directory="templates")

# Create static files directory for CSS/JS
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    await init_db()

# IP Geolocation function
def get_location_from_ip(ip_address: str):
    """Get latitude and longitude from IP address"""
    try:
        if ip_address in ["127.0.0.1", "localhost"]:
            # Default location for local development (Lagos, Nigeria)
            return {"lat": 6.5244, "lng": 3.3792, "city": "Lagos", "source": "default"}
        
        response = requests.get(f"http://ipapi.co/{ip_address}/json/", timeout=5)
        data = response.json()
        
        return {
            "lat": data.get("latitude"),
            "lng": data.get("longitude"), 
            "city": data.get("city", "Unknown"),
            "country": data.get("country_name", "Unknown"),
            "source": "ip"
        }
    except Exception as e:
        print(f"Location error: {e}")
        # Fallback to Lagos coordinates
        return {"lat": 6.5244, "lng": 3.3792, "city": "Lagos", "source": "fallback"}

# ============================================
# HTML DASHBOARD ROUTES
# ============================================

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Main dashboard page"""
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/dashboard", response_class=HTMLResponse) 
async def dashboard_alt(request: Request):
    """Alternative dashboard route"""
    return templates.TemplateResponse("dashboard.html", {"request": request})

# ============================================
# API ENDPOINTS
# ============================================

@app.get("/api/dashboard-data")
async def get_dashboard_data():
    """Get all dashboard data for real-time updates"""
    try:
        db = next(get_db())
        
        # Get dashboard statistics
        stats = get_dashboard_stats(db)
        
        # Get all users with their current status
        users = get_all_users(db)
        
        # Get active sessions
        active_sessions = get_active_sessions(db)
        
        return {
            "active_sessions_count": len(active_sessions),
            "total_users": len(users),
            "connection_status": "connected",
            "users": [
                {
                    "user_id": user.user_id,
                    "status": user.status,  # listening, idle, offline
                    "location": {
                        "lat": user.latitude or 6.5244,
                        "lng": user.longitude or 3.3792
                    },
                    "last_activity": user.last_activity.isoformat() if user.last_activity else None,
                    "current_session_id": user.current_session_id,
                    "session_start": user.created_at.isoformat() if user.current_session_id else None,
                    "phone_number": getattr(user, 'phone_number', f"+234{user.user_id}"),
                    "device_info": getattr(user, 'device_info', f"Device-{user.user_id}"),
                    "latest_recording": f"/api/audio/{user.user_id}/latest" if user.current_session_id else None,
                    "recordings_count": getattr(user, 'recordings_count', 0)
                }
                for user in users
            ],
            "active_sessions": [
                {
                    "session_id": session.session_id,
                    "user_id": session.user_id,
                    "start_time": session.start_time.isoformat(),
                    "duration_minutes": int((datetime.now() - session.start_time).total_seconds() / 60)
                }
                for session in active_sessions
            ],
            "stats": stats,
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Dashboard data error: {e}")
        return {"error": str(e), "connection_status": "error"}

@app.post("/api/start-listening/{user_id}")
async def start_listening(user_id: str, request: Request):
    """Start listening to a specific user"""
    try:
        db = next(get_db())
        
        # Get client IP for location
        client_ip = request.client.host
        location = get_location_from_ip(client_ip)
        
        # Create new listening session
        session = create_session(
            db=db,
            user_id=user_id,
            location_lat=location["lat"],
            location_lng=location["lng"]
        )
        
        return {
            "status": "success",
            "message": f"Started listening to user {user_id}",
            "session_id": session.session_id,
            "user_id": user_id,
            "location": location
        }
    except Exception as e:
        print(f"Start listening error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stop-listening/{user_id}")
async def stop_listening(user_id: str):
    """Stop listening to a specific user"""
    try:
        db = next(get_db())
        
        # End the active session
        session = end_session(db=db, user_id=user_id)
        
        if session:
            return {
                "status": "success",
                "message": f"Stopped listening to user {user_id}",
                "session_id": session.session_id,
                "duration_minutes": int((datetime.now() - session.start_time).total_seconds() / 60)
            }
        else:
            raise HTTPException(status_code=404, detail="No active session found")
            
    except Exception as e:
        print(f"Stop listening error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/audio/{user_id}/latest")
async def get_latest_audio(user_id: str):
    """Get latest audio recording for a user"""
    try:
        db = next(get_db())
        audio_info = get_user_latest_audio(db, user_id)
        
        if audio_info:
            return {
                "user_id": user_id,
                "audio_url": f"/api/audio/stream/{audio_info.session_id}",
                "duration": audio_info.duration_seconds,
                "recorded_at": audio_info.created_at.isoformat(),
                "file_size": audio_info.file_size_bytes
            }
        else:
            raise HTTPException(status_code=404, detail="No audio found")
            
    except Exception as e:
        print(f"Get audio error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-recording")
async def upload_recording(
    request: Request,
    user_id: str = Form(...),
    audio_file: UploadFile = File(...)
):
    """Upload new audio recording with automatic location detection"""
    try:
        # Get location from IP
        client_ip = request.client.host
        location = get_location_from_ip(client_ip)
        
        # Save audio file
        audio_filename = f"recording_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp3"
        audio_path = f"recordings/{audio_filename}"
        
        # Create recordings directory if it doesn't exist
        os.makedirs("recordings", exist_ok=True)
        
        # Save uploaded file
        with open(audio_path, "wb") as buffer:
            content = await audio_file.read()
            buffer.write(content)
        
        # TODO: Save to database with location
        # This will be implemented when database is connected
        
        return {
            "status": "success",
            "message": "Recording uploaded successfully",
            "user_id": user_id,
            "filename": audio_filename,
            "location": location,
            "file_size": len(content)
        }
        
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users")
async def get_users():
    """Get all users for search/filtering"""
    try:
        db = next(get_db())
        users = get_all_users(db)
        
        return {
            "users": [
                {
                    "user_id": user.user_id,
                    "status": user.status,
                    "last_activity": user.last_activity.isoformat() if user.last_activity else None,
                    "phone_number": getattr(user, 'phone_number', f"+234{user.user_id}")
                }
                for user in users
            ]
        }
    except Exception as e:
        print(f"Get users error: {e}")
        return {"error": str(e)}

@app.get("/api/sessions/active")
async def get_active_sessions_api():
    """Get only active listening sessions"""
    try:
        db = next(get_db())
        sessions = get_active_sessions(db)
        
        return {
            "active_sessions": [
                {
                    "session_id": session.session_id,
                    "user_id": session.user_id,
                    "start_time": session.start_time.isoformat(),
                    "location": {
                        "lat": session.location_lat,
                        "lng": session.location_lng
                    },
                    "duration_minutes": int((datetime.now() - session.start_time).total_seconds() / 60)
                }
                for session in sessions
            ]
        }
    except Exception as e:
        print(f"Get active sessions error: {e}")
        return {"error": str(e)}

@app.get("/api/dashboard/stats")
async def get_dashboard_stats_api():
    """Get dashboard statistics"""
    try:
        db = next(get_db())
        stats = get_dashboard_stats(db)
        users = get_all_users(db)
        active_sessions = get_active_sessions(db)
        
        return {
            "total_users": len(users),
            "active_sessions": len(active_sessions),
            "total_recordings": stats.get("total_recordings", 0),
            "online_users": len([u for u in users if u.status != "offline"]),
            "avg_session_duration": 25,  # Mock data for now
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Get dashboard stats error: {e}")
        return {"error": str(e)}

@app.get("/api/recordings/recent")
async def get_recent_recordings(limit: int = 10):
    """Get recent recordings"""
    try:
        db = next(get_db())
        # Mock recent recordings data for Day 1
        recordings = []
        for i in range(min(limit, 5)):  # Return up to 5 mock recordings
            recordings.append({
                "id": f"rec_{i+1}",
                "user_id": f"user{i+1}",
                "filename": f"recording_user{i+1}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp3",
                "duration": 120 + (i * 30),
                "created_at": (datetime.now().replace(hour=datetime.now().hour - i)).isoformat(),
                "file_size": 1024 * (i + 1)
            })
        
        return {
            "recordings": recordings,
            "total": len(recordings),
            "limit": limit
        }
    except Exception as e:
        print(f"Get recent recordings error: {e}")
        return {"error": str(e)}

@app.get("/api/analytics/hourly-activity")
async def get_hourly_activity():
    """Get hourly activity analytics"""
    try:
        # Mock hourly activity data for Day 1
        hours = []
        activity = []
        current_hour = datetime.now().hour
        
        for i in range(24):
            hour = (current_hour - 23 + i) % 24
            hours.append(f"{hour:02d}:00")
            # Mock activity data with some variation
            base_activity = 10 if 8 <= hour <= 18 else 3  # Higher during work hours
            activity.append(base_activity + (i % 5))
        
        return {
            "labels": hours,
            "data": activity,
            "total_today": sum(activity),
            "peak_hour": f"{hours[activity.index(max(activity))]}",
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Get hourly activity error: {e}")
        return {"error": str(e)}

@app.post("/api/sessions/{session_id}/end")
async def end_session_by_id(session_id: str):
    """End a specific session by ID"""
    try:
        db = next(get_db())
        # Mock implementation for Day 1 - in real implementation, you'd find and end the session
        return {
            "status": "success",
            "message": f"Session {session_id} ended successfully",
            "session_id": session_id,
            "ended_at": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"End session error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# HEALTH CHECK
# ============================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    # Create required directories
    os.makedirs("templates", exist_ok=True)
    os.makedirs("static", exist_ok=True)
    os.makedirs("recordings", exist_ok=True)
    
    # Run the server
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )