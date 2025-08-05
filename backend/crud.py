# crud.py - Database CRUD Operations
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
from database import User, Session as SessionModel, Recording, SystemLog
from datetime import datetime, timedelta
import uuid
from typing import List, Optional

# ============================================
# USER OPERATIONS
# ============================================

def get_all_users(db: Session) -> List[User]:
    """Get all users with their current status"""
    return db.query(User).order_by(User.last_activity.desc()).all()

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Get specific user by ID"""
    return db.query(User).filter(User.user_id == user_id).first()

def update_user_status(db: Session, user_id: str, status: str, session_id: str = None):
    """Update user status and current session"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if user:
        user.status = status
        user.last_activity = datetime.now()
        user.current_session_id = session_id
        user.updated_at = datetime.now()
        db.commit()
        db.refresh(user)
    return user

def update_user_location(db: Session, user_id: str, latitude: float, longitude: float):
    """Update user location"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if user:
        user.latitude = latitude
        user.longitude = longitude
        user.updated_at = datetime.now()
        db.commit()
        db.refresh(user)
    return user

def create_user_if_not_exists(db: Session, user_id: str, phone_number: str = None) -> User:
    """Create user if doesn't exist"""
    user = get_user_by_id(db, user_id)
    if not user:
        user = User(
            user_id=user_id,
            phone_number=phone_number or f"+234{user_id}",
            status="offline"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

# ============================================
# SESSION OPERATIONS  
# ============================================

def create_session(db: Session, user_id: str, location_lat: float = None, location_lng: float = None) -> SessionModel:
    """Create new listening session"""
    # Generate unique session ID
    session_id = f"sess_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}"
    
    # End any existing active sessions for this user
    end_session(db, user_id)
    
    # Create new session
    session = SessionModel(
        session_id=session_id,
        user_id=user_id,
        status="active",
        start_time=datetime.now(),
        location_lat=location_lat,
        location_lng=location_lng
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    # Update user status
    update_user_status(db, user_id, "listening", session_id)
    
    # Log the action
    log_system_action(db, "start_listening", user_id, session_id)
    
    return session

def end_session(db: Session, user_id: str) -> Optional[SessionModel]:
    """End active session for user"""
    # Find active session
    session = db.query(SessionModel).filter(
        and_(
            SessionModel.user_id == user_id,
            SessionModel.status == "active"
        )
    ).first()
    
    if session:
        # Update session
        session.status = "completed"
        session.end_time = datetime.now()
        session.duration_seconds = int((session.end_time - session.start_time).total_seconds())
        session.updated_at = datetime.now()
        
        # Update user status
        update_user_status(db, user_id, "idle", None)
        
        db.commit()
        db.refresh(session)
        
        # Log the action
        log_system_action(db, "stop_listening", user_id, session.session_id)
    
    return session

def get_active_sessions(db: Session) -> List[SessionModel]:
    """Get all currently active sessions"""
    return db.query(SessionModel).filter(SessionModel.status == "active").order_by(SessionModel.start_time.desc()).all()

def get_user_sessions(db: Session, user_id: str, limit: int = 10) -> List[SessionModel]:
    """Get recent sessions for specific user"""
    return db.query(SessionModel).filter(SessionModel.user_id == user_id).order_by(SessionModel.start_time.desc()).limit(limit).all()

def get_session_by_id(db: Session, session_id: str) -> Optional[SessionModel]:
    """Get specific session by ID"""
    return db.query(SessionModel).filter(SessionModel.session_id == session_id).first()

# ============================================
# RECORDING OPERATIONS
# ============================================

def create_recording(db: Session, session_id: str, user_id: str, file_path: str, 
                    file_size: int = 0, duration: int = 0) -> Recording:
    """Create new recording entry"""
    recording = Recording(
        session_id=session_id,
        user_id=user_id,
        file_path=file_path,
        file_size_bytes=file_size,
        duration_seconds=duration
    )
    
    db.add(recording)
    db.commit()
    db.refresh(recording)
    
    # Update session with audio file path
    session = get_session_by_id(db, session_id)
    if session:
        session.audio_file_path = file_path
        session.duration_seconds = duration
        db.commit()
    
    return recording

def get_user_latest_audio(db: Session, user_id: str) -> Optional[Recording]:
    """Get latest audio recording for user"""
    return db.query(Recording).filter(Recording.user_id == user_id).order_by(Recording.created_at.desc()).first()

def get_session_recordings(db: Session, session_id: str) -> List[Recording]:
    """Get all recordings for a session"""
    return db.query(Recording).filter(Recording.session_id == session_id).order_by(Recording.created_at.asc()).all()

# ============================================
# ANALYTICS & STATISTICS
# ============================================

def get_dashboard_stats(db: Session) -> dict:
    """Get comprehensive dashboard statistics"""
    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    
    stats = {
        # Current status
        "total_users": db.query(User).count(),
        "active_sessions": db.query(SessionModel).filter(SessionModel.status == "active").count(),
        "online_users": db.query(User).filter(User.status.in_(["listening", "idle"])).count(),
        
        # Today's activity
        "sessions_today": db.query(SessionModel).filter(SessionModel.created_at >= today_start).count(),
        "recordings_today": db.query(Recording).filter(Recording.created_at >= today_start).count(),
        
        # Weekly activity
        "sessions_this_week": db.query(SessionModel).filter(SessionModel.created_at >= week_start).count(),
        
        # Average metrics
        "avg_session_duration": get_average_session_duration(db),
        "total_recordings": db.query(Recording).count(),
        
        # Status breakdown
        "users_by_status": get_users_by_status(db)
    }
    
    return stats

def get_users_by_status(db: Session) -> dict:
    """Get count of users by status"""
    status_counts = {}
    
    results = db.query(User.status, func.count(User.id)).group_by(User.status).all()
    
    for status, count in results:
        status_counts[status] = count
    
    return status_counts

def get_average_session_duration(db: Session) -> float:
    """Get average session duration in minutes"""
    completed_sessions = db.query(SessionModel).filter(
        and_(
            SessionModel.status == "completed",
            SessionModel.duration_seconds.isnot(None)
        )
    ).all()
    
    if not completed_sessions:
        return 0.0
    
    total_duration = sum(session.duration_seconds for session in completed_sessions)
    avg_seconds = total_duration / len(completed_sessions)
    
    return round(avg_seconds / 60, 2)  # Convert to minutes

def get_hourly_activity(db: Session, days: int = 7) -> dict:
    """Get activity breakdown by hour"""
    start_date = datetime.now() - timedelta(days=days)
    
    sessions = db.query(SessionModel).filter(SessionModel.created_at >= start_date).all()
    
    hourly_counts = {hour: 0 for hour in range(24)}
    
    for session in sessions:
        hour = session.created_at.hour
        hourly_counts[hour] += 1
    
    return hourly_counts

# ============================================
# SYSTEM LOGGING
# ============================================

def log_system_action(db: Session, action: str, user_id: str = None, session_id: str = None, 
                     ip_address: str = None, details: str = None):
    """Log system actions for audit trail"""
    log_entry = SystemLog(
        action=action,
        user_id=user_id,
        session_id=session_id,
        ip_address=ip_address,
        details=details
    )
    
    db.add(log_entry)
    db.commit()

def get_recent_logs(db: Session, limit: int = 100) -> List[SystemLog]:
    """Get recent system logs"""
    return db.query(SystemLog).order_by(SystemLog.timestamp.desc()).limit(limit).all()

# ============================================
# SEARCH & FILTERING
# ============================================

def search_users(db: Session, query: str) -> List[User]:
    """Search users by ID or phone number"""
    return db.query(User).filter(
        db.or_(
            User.user_id.contains(query),
            User.phone_number.contains(query)
        )
    ).all()

def filter_users_by_status(db: Session, status: str) -> List[User]:
    """Filter users by status"""
    return db.query(User).filter(User.status == status).all()

def get_sessions_by_date_range(db: Session, start_date: datetime, end_date: datetime) -> List[SessionModel]:
    """Get sessions within date range"""
    return db.query(SessionModel).filter(
        and_(
            SessionModel.created_at >= start_date,
            SessionModel.created_at <= end_date
        )
    ).order_by(SessionModel.created_at.desc()).all()

def get_recordings_by_date_range(db: Session, start_date: datetime, end_date: datetime) -> List[Recording]:
    """Get recordings within date range"""
    return db.query(Recording).filter(
        and_(
            Recording.created_at >= start_date,
            Recording.created_at <= end_date
        )
    ).order_by(Recording.created_at.desc()).all()

def search_sessions(db: Session, query: str) -> List[SessionModel]:
    """Search sessions by user ID or session ID"""
    return db.query(SessionModel).filter(
        db.or_(
            SessionModel.user_id.contains(query),
            SessionModel.session_id.contains(query)
        )
    ).order_by(SessionModel.created_at.desc()).all()

def get_user_activity_summary(db: Session, user_id: str, days: int = 30) -> dict:
    """Get activity summary for a specific user"""
    start_date = datetime.now() - timedelta(days=days)
    
    total_sessions = db.query(SessionModel).filter(
        and_(
            SessionModel.user_id == user_id,
            SessionModel.created_at >= start_date
        )
    ).count()
    
    total_recordings = db.query(Recording).filter(
        and_(
            Recording.user_id == user_id,
            Recording.created_at >= start_date
        )
    ).count()
    
    # Calculate total listening time
    completed_sessions = db.query(SessionModel).filter(
        and_(
            SessionModel.user_id == user_id,
            SessionModel.status == "completed",
            SessionModel.created_at >= start_date,
            SessionModel.duration_seconds.isnot(None)
        )
    ).all()
    
    total_listening_time = sum(session.duration_seconds for session in completed_sessions)
    
    return {
        "user_id": user_id,
        "period_days": days,
        "total_sessions": total_sessions,
        "total_recordings": total_recordings,
        "total_listening_time_seconds": total_listening_time,
        "total_listening_time_minutes": round(total_listening_time / 60, 2),
        "average_session_duration_minutes": round((total_listening_time / total_sessions) / 60, 2) if total_sessions > 0 else 0
    }

def cleanup_old_data(db: Session, days_to_keep: int = 30) -> dict:
    """Clean up old data based on retention policy"""
    cutoff_date = datetime.now() - timedelta(days=days_to_keep)
    
    # Count records to be deleted
    old_logs_count = db.query(SystemLog).filter(SystemLog.timestamp < cutoff_date).count()
    old_sessions_count = db.query(SessionModel).filter(
        and_(
            SessionModel.created_at < cutoff_date,
            SessionModel.status == "completed"
        )
    ).count()
    
    # Delete old system logs
    db.query(SystemLog).filter(SystemLog.timestamp < cutoff_date).delete()
    
    # Delete old completed sessions (keep active ones regardless of date)
    db.query(SessionModel).filter(
        and_(
            SessionModel.created_at < cutoff_date,
            SessionModel.status == "completed"
        )
    ).delete()
    
    db.commit()
    
    return {
        "cutoff_date": cutoff_date.isoformat(),
        "deleted_logs": old_logs_count,
        "deleted_sessions": old_sessions_count
    }

def get_system_health_check(db: Session) -> dict:
    """Get system health metrics"""
    now = datetime.now()
    last_hour = now - timedelta(hours=1)
    
    # Check for stuck sessions (active for more than 6 hours)
    stuck_sessions = db.query(SessionModel).filter(
        and_(
            SessionModel.status == "active",
            SessionModel.start_time < now - timedelta(hours=6)
        )
    ).count()
    
    # Check recent activity
    recent_sessions = db.query(SessionModel).filter(SessionModel.created_at >= last_hour).count()
    recent_recordings = db.query(Recording).filter(Recording.created_at >= last_hour).count()
    
    # Check for orphaned recordings (recordings without sessions)
    orphaned_recordings = db.query(Recording).outerjoin(SessionModel).filter(SessionModel.session_id.is_(None)).count()
    
    return {
        "timestamp": now.isoformat(),
        "stuck_sessions": stuck_sessions,
        "recent_sessions_last_hour": recent_sessions,
        "recent_recordings_last_hour": recent_recordings,
        "orphaned_recordings": orphaned_recordings,
        "total_active_sessions": db.query(SessionModel).filter(SessionModel.status == "active").count(),
        "database_responsive": True  # If we got this far, DB is responsive
    }