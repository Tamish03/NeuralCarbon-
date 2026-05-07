from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db, PredictionLog, DriftEvent, ActiveLearningQueue
from app.services.ml_service import ml_service
from pydantic import BaseModel
from typing import List

router = APIRouter()

class SystemMetricsResponse(BaseModel):
    total_predictions: int
    total_drift_events: int
    pending_feedback_labels: int
    total_model_emissions_g: float
    avg_prediction_co2: float

@router.get("/", response_model=SystemMetricsResponse)
def get_system_metrics(db: Session = Depends(get_db)):
    """
    Consolidates MLOps metrics for the Intelligence Hub.
    """
    total_preds = db.query(PredictionLog).count()
    total_drifts = db.query(DriftEvent).count()
    pending_labels = db.query(ActiveLearningQueue).filter(ActiveLearningQueue.processed == False).count()
    
    # Calculate average CO2 from logs
    from sqlalchemy import func
    avg_co2 = db.query(func.avg(PredictionLog.predicted_co2)).scalar() or 0.0
    
    return SystemMetricsResponse(
        total_predictions=total_preds,
        total_drift_events=total_drifts,
        pending_feedback_labels=pending_labels,
        total_model_emissions_g=ml_service.total_model_emissions_g,
        avg_prediction_co2=float(avg_co2)
    )
