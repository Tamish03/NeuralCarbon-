from pydantic import BaseModel, Field
from typing import List, Dict, Any

class PrescribeRequest(BaseModel):
    # Current features
    AT: float = Field(..., description="Ambient Temperature")
    V: float = Field(..., description="Vacuum")
    AP: float = Field(..., description="Ambient Pressure")
    RH: float = Field(..., description="Relative Humidity")
    
    # Target definition
    target_reduction_pct: float = Field(10.0, description="Percentage to reduce CO2 by (e.g. 10.0 for 10%)")
    max_scenarios: int = Field(3, description="Number of counterfactual scenarios to generate")
    
class CounterfactualScenario(BaseModel):
    scenario_id: int
    changes: Dict[str, float]  # e.g. {"AT": -4.0, "V": +2.1}
    predicted_co2: float
    reduction_achieved_pct: float
    feasibility_score: str # High / Medium / Low

class PrescribeResponse(BaseModel):
    original_co2: float
    target_co2: float
    scenarios: List[CounterfactualScenario]
