from pydantic import BaseModel, Field
from typing import List, Dict

class ExplainRequest(BaseModel):
    AT: float = Field(..., description="Ambient Temperature in Celsius")
    V: float = Field(..., description="Vacuum in cm Hg")
    AP: float = Field(..., description="Ambient Pressure in millibars")
    RH: float = Field(..., description="Relative Humidity percentage")

class FeatureContribution(BaseModel):
    feature: str
    value: float
    contribution: float

class ExplainResponse(BaseModel):
    base_value: float
    predicted_value: float
    contributions: List[FeatureContribution]
    top_driver: str
    lime_top_driver: str
    agreement_score: float
    direction: str
