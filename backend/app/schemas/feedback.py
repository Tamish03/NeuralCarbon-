from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FeedbackSubmitRequest(BaseModel):
    prediction_id: Optional[str] = None
    true_co2_kg: float
    notes: Optional[str] = None
    AT: float
    V: float
    AP: float
    RH: float

class FeedbackResponse(BaseModel):
    status: str
    message: str
    feedback_id: str
    added_to_active_learning_queue: bool
