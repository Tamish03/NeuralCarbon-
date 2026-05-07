from pydantic import BaseModel, Field
from typing import Optional

class PredictionRequest(BaseModel):
    AT: float = Field(..., description="Ambient Temperature in Celsius", example=23.4)
    V: float = Field(..., description="Vacuum in cm Hg", example=54.2)
    AP: float = Field(..., description="Ambient Pressure in millibars", example=1011.2)
    RH: float = Field(..., description="Relative Humidity percentage", example=73.5)
    
class PredictionResponse(BaseModel):
    co2_kg: float = Field(..., description="Predicted CO2 emission in kg/h")
    lower_bound: float = Field(..., description="Conformal prediction lower bound")
    upper_bound: float = Field(..., description="Conformal prediction upper bound")
    cluster_id: int = Field(..., description="Operational mode cluster ID (0-3)")
    risk_level: str = Field(..., description="Risk level (LOW/MODERATE/HIGH/CRITICAL)")
    model_emission_g: float = Field(0.0, description="CO2 cost of this specific inference in grams")
    total_model_emissions_g: float = Field(0.0, description="Cumulative CO2 cost of the AI system")
