# schemas.py - Pydantic models for API request/response validation
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    user_id: str
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    status: str  # listening, idle, offline
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    last_activity: Optional[datetime] = None
    current_session_id: Optional[str] = None
    
    class Config:
        from_attributes = True

# Session schemas
class SessionBase(BaseModel):
    user_id: str
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None

class SessionCreate(SessionBase):
    pass

class SessionResponse(SessionBase):
    session_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str  # active, completed
    duration_minutes: Optional[int] = None
    
    class Config:
        from_attributes = True

# Recording schemas
class RecordingBase(BaseModel):
    user_id: str
    session_id: str
    file_path: str

class RecordingCreate(RecordingBase):
    duration_seconds: Optional[int] = None
    file_size_bytes: Optional[int] = None

class RecordingResponse(RecordingBase):
    recording_id: str
    created_at: datetime
    duration_seconds: Optional[int] = None
    file_size_bytes: Optional[int] = None
    
    class Config:
        from_attributes = True

# Dashboard data schemas
class LocationResponse(BaseModel):
    lat: float
    lng: float
    city: Optional[str] = None
    country: Optional[str] = None
    source: str  # ip, default, fallback

class DashboardUserResponse(BaseModel):
    user_id: str
    status: str
    location: LocationResponse
    last_activity: Optional[str] = None
    current_session_id: Optional[str] = None
    phone_number: str

class ActiveSessionResponse(BaseModel):
    session_id: str
    user_id: str
    start_time: str
    duration_minutes: int

class DashboardStatsResponse(BaseModel):
    total_users: int
    active_sessions: int
    total_recordings: int

class DashboardDataResponse(BaseModel):
    active_sessions_count: int
    total_users: int
    connection_status: str
    users: List[DashboardUserResponse]
    active_sessions: List[ActiveSessionResponse]
    stats: DashboardStatsResponse
    last_updated: str

# API Response schemas
class APIResponse(BaseModel):
    status: str
    message: str

class StartListeningResponse(APIResponse):
    session_id: str
    user_id: str
    location: LocationResponse

class StopListeningResponse(APIResponse):
    session_id: str
    duration_minutes: int

class AudioResponse(BaseModel):
    user_id: str
    audio_url: str
    duration: Optional[int] = None
    recorded_at: str
    file_size: Optional[int] = None
