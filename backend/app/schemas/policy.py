from pydantic import BaseModel
from typing import List, Dict

class PolicySimulationRequest(BaseModel):
    base_AT: float
    base_V: float
    base_AP: float
    base_RH: float
    
    # Sweep ranges
    v_sweep_min: float = 35.0
    v_sweep_max: float = 75.0
    v_sweep_steps: int = 10

class PolicySimulationResult(BaseModel):
    v_value: float
    predicted_co2: float
    risk_level: str

class PolicySimulationResponse(BaseModel):
    base_co2: float
    results: List[PolicySimulationResult]
    optimal_v: float
