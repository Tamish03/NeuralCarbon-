from fastapi import APIRouter, HTTPException
from app.schemas.explain import ExplainRequest, ExplainResponse
from app.services.ml_service import ml_service
from app.core.redis_cache import redis_client, get_cache_key
import json

router = APIRouter()

@router.post("/", response_model=ExplainResponse)
async def get_explanation(request: ExplainRequest):
    try:
        features_dict = request.model_dump()
        
        # Check cache first
        cache_key = get_cache_key("shap_explain", features_dict)
        cached_result = redis_client.get(cache_key)
        
        if cached_result:
            return ExplainResponse(**json.loads(cached_result))
            
        result = ml_service.explain(features_dict)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        # Cache for 1 hour (3600 seconds)
        redis_client.setex(cache_key, 3600, json.dumps(result))
            
        return ExplainResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explain error: {str(e)}")
