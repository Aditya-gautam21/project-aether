"""Database configuration and session management"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from config import settings
import redis
from typing import Generator

# SQLAlchemy setup
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Redis setup
try:
    redis_client = redis.from_url(settings.redis_url, decode_responses=True)
    redis_client.ping()  # Test connection
except Exception as e:
    print(f"Redis connection failed: {e}")
    redis_client = None

def get_db() -> Generator[Session, None, None]:
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_redis():
    """Get Redis client"""
    return redis_client

def init_db():
    """Initialize database tables"""
    from models import Base
    Base.metadata.create_all(bind=engine)