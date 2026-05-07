from pydantic import BaseModel, Field

class DriftStatusResponse(BaseModel):
    drift_detected: bool = Field(..., description="Whether concept drift is currently active")
    last_alarm_at: str = Field(None, description="Timestamp of the last drift alarm")
    severity: str = Field(..., description="Severity of the drift (NONE/LOW/MEDIUM/HIGH)")
    recommendation: str = Field(..., description="Recommended action based on drift status")
    adwin_width: int = Field(..., description="Current width of the ADWIN window")
