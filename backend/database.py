# database.py - Database Models and Connection
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os
from typing import Generator

# Database URL - Replace with your Render PostgreSQL connection string
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://username:password@host:port/database"  # Replace with your actual Render URL
)

# For local development, you can use SQLite
if DATABASE_URL.startswith("postgresql://username"):
    DATABASE_URL = "sqlite:///./phone_monitoring.db"
    print("Using SQLite for development - Replace with Render PostgreSQL URL")

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# ============================================
# DATABASE MODELS
# ============================================

class User(Base):
    """User model for phone monitoring"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), unique=True, index=True, nullable=False)
    phone_number = Column(String(20), nullable=True)
    status = Column(String(20), default="offline")  # listening, idle, offline
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    last_activity = Column(DateTime, default=datetime.now)
    current_session_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class Session(Base):
    """Listening session model"""
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(String(50), index=True, nullable=False)
    status = Column(String(20), default="active")  # active, completed, failed
    start_time = Column(DateTime, default=datetime.now)
    end_time = Column(DateTime, nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    audio_file_path = Column(String(255), nullable=True)
    duration_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class Recording(Base):
    """Audio recording model"""
    __tablename__ = "recordings"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True, nullable=False)
    user_id = Column(String(50), index=True, nullable=False)
    file_path = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    duration_seconds = Column(Integer, default=0)
    audio_format = Column(String(10), default="mp3")
    quality = Column(String(20), default="standard")  # standard, enhanced
    created_at = Column(DateTime, default=datetime.now)

class SystemLog(Base):
    """System activity logs"""
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(50), nullable=False)  # start_listening, stop_listening, upload, error
    user_id = Column(String(50), nullable=True)
    session_id = Column(String(100), nullable=True)
    ip_address = Column(String(45), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.now)

# ============================================
# DATABASE FUNCTIONS
# ============================================

def get_db() -> Generator[Session, None, None]:
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def init_db():
    """Initialize database - create tables"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
        
        # Create sample data for development
        db = SessionLocal()
        try:
            # Check if we have any users
            existing_users = db.query(User).count()
            
            if existing_users == 0:
                # Create sample users for testing
                sample_users = [
                    User(
                        user_id="user001",
                        phone_number="+2348012345678",
                        status="idle",
                        latitude=6.5244,
                        longitude=3.3792
                    ),
                    User(
                        user_id="user002", 
                        phone_number="+2348087654321",
                        status="offline",
                        latitude=6.4474,
                        longitude=3.3903
                    ),
                    User(
                        user_id="user003",
                        phone_number="+2349012345678", 
                        status="idle",
                        latitude=6.6018,
                        longitude=3.3515
                    )
                ]
                
                for user in sample_users:
                    db.add(user)
                
                db.commit()
                print("Sample users created for development")
                
        except Exception as e:
            print(f"Error creating sample data: {e}")
            db.rollback()
        finally:
            db.close()
            
    except Exception as e:
        print(f"Database initialization error: {e}")

def get_database_stats():
    """Get database statistics"""
    try:
        db = SessionLocal()
        
        stats = {
            "total_users": db.query(User).count(),
            "active_sessions": db.query(Session).filter(Session.status == "active").count(),
            "total_sessions_today": db.query(Session).filter(
                Session.created_at >= datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            ).count(),
            "total_recordings": db.query(Recording).count()
        }
        
        db.close()
        return stats
        
    except Exception as e:
        print(f"Database stats error: {e}")
        return {
            "total_users": 0,
            "active_sessions": 0, 
            "total_sessions_today": 0,
            "total_recordings": 0
        }