from fastapi import APIRouter, HTTPException
from app.schemas.prescribe import PrescribeRequest, PrescribeResponse
from app.services.ml_service import ml_service

router = APIRouter()

@router.post("/", response_model=PrescribeResponse)
async def get_prescription(request: PrescribeRequest):
    try:
        # Convert request to dict and extract specific prescription params
        req_dict = request.model_dump()
        target_reduction_pct = req_dict.pop('target_reduction_pct')
        max_scenarios = req_dict.pop('max_scenarios')
        
        # Call ml_service for DiCE logic
        result = ml_service.prescribe(req_dict, target_reduction_pct, max_scenarios)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return PrescribeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prescription error: {str(e)}")
