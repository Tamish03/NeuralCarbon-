from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.feedback import FeedbackSubmitRequest, FeedbackResponse
from app.core.db import get_db, ActiveLearningQueue
import uuid

router = APIRouter()

@router.post("/", response_model=FeedbackResponse)
def submit_feedback(req: FeedbackSubmitRequest, db: Session = Depends(get_db)):
    """
    Submits ground-truth labels back to the system to trigger the Active Learning loop.
    Saves to the 'active_learning_queue' table.
    """
    feedback_id = str(uuid.uuid4())
    
    # Save to database
    new_feedback = ActiveLearningQueue(
        prediction_id=req.prediction_id,
        true_co2_kg=req.true_co2_kg,
        notes=req.notes,
        AT=req.AT,
        V=req.V,
        AP=req.AP,
        RH=req.RH
    )
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    
    print(f"Added ground truth to Active Learning Queue: ID {feedback_id}, CO2: {req.true_co2_kg} kg")
    
    return FeedbackResponse(
        status="success",
        message="Ground truth ingested. Active learning retraining pipeline will be scheduled.",
        feedback_id=feedback_id,
        added_to_active_learning_queue=True
    )
