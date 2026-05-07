from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Boolean, MetaData
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import os

# For demonstration, we use SQLite if SUPABASE_URL is not provided, 
# but this schema is designed for PostgreSQL / TimescaleDB
DATABASE_URL = os.getenv("SUPABASE_URL", "sqlite:///./neuralcarbon.db")

engine = create_engine(
    DATABASE_URL, 
    # check_same_thread=False is needed only for SQLite
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class PredictionLog(Base):
    __tablename__ = "prediction_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Inputs
    AT = Column(Float)
    V = Column(Float)
    AP = Column(Float)
    RH = Column(Float)
    
    # Outputs
    predicted_co2 = Column(Float)
    lower_bound = Column(Float)
    upper_bound = Column(Float)
    cluster_id = Column(Integer)
    risk_level = Column(String)
    
    # Drift
    drift_active = Column(Boolean, default=False)
    
class DriftEvent(Base):
    __tablename__ = "drift_events"
    
    id = Column(Integer, primary_key=True, index=True)
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    severity = Column(String)
    adwin_width = Column(Integer)
    resolved = Column(Boolean, default=False)

class ActiveLearningQueue(Base):
    __tablename__ = "active_learning_queue"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    prediction_id = Column(String, index=True, nullable=True)
    true_co2_kg = Column(Float)
    notes = Column(String, nullable=True)
    
    # Context features at the time of prediction
    AT = Column(Float)
    V = Column(Float)
    AP = Column(Float)
    RH = Column(Float)
    
    # Status of retraining
    processed = Column(Boolean, default=False)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
