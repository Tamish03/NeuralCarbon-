from fastapi import APIRouter, HTTPException
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.ml_service import ml_service

router = APIRouter()

@router.post("/", response_model=PredictionResponse)
async def make_prediction(request: PredictionRequest):
    try:
        features_dict = request.model_dump()
        result = ml_service.predict(features_dict)
        return PredictionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
