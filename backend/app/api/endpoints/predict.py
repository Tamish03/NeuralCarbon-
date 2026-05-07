from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.ml_service import ml_service
from app.core.db import get_db, PredictionLog

router = APIRouter()

@router.post("/", response_model=PredictionResponse)
async def make_prediction(request: PredictionRequest, db: Session = Depends(get_db)):
    try:
        features_dict = request.model_dump()
        result = ml_service.predict(features_dict)
        
        # Check current drift status
        import json
        import os
        drift_active = False
        try:
            state_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "workers", "drift_state.json")
            if os.path.exists(state_file):
                with open(state_file, "r") as f:
                    drift_active = json.load(f).get("drift_detected", False)
        except:
            pass

        # Log to database (Optional Failsafe)
        try:
            log_entry = PredictionLog(
                AT=features_dict.get("AT"),
                V=features_dict.get("V"),
                AP=features_dict.get("AP"),
                RH=features_dict.get("RH"),
                predicted_co2=result["co2_kg"],
                lower_bound=result["lower_bound"],
                upper_bound=result["upper_bound"],
                cluster_id=result["cluster_id"],
                risk_level=result["risk_level"],
                drift_active=drift_active
            )
            db.add(log_entry)
            db.commit()
        except Exception as db_err:
            print(f"DB Logging failed: {db_err}")
            db.rollback()
        
        return PredictionResponse(**result)
    except Exception as e:
        print(f"Global Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
