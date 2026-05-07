from fastapi import APIRouter, HTTPException
from app.schemas.drift import DriftStatusResponse
import json
import os

router = APIRouter()

# For Phase 2, the ADWIN background worker will write its state to a shared file or Redis.
# Here we'll read a local state file for demonstration, defaulting if it doesn't exist.
STATE_FILE = os.path.join(os.path.dirname(__file__), "../../../workers/drift_state.json")

@router.get("/status", response_model=DriftStatusResponse)
async def get_drift_status():
    try:
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE, "r") as f:
                state = json.load(f)
        else:
            state = {
                "drift_detected": False,
                "last_alarm_at": None,
                "severity": "NONE",
                "recommendation": "System stable. Continue monitoring.",
                "adwin_width": 32
            }
            
        return DriftStatusResponse(**state)
    except Exception as e:
        # FAILSAFE: Return stable status if state file reading fails
        print(f"Drift Failsafe Triggered: {e}")
        return DriftStatusResponse(
            drift_detected=False,
            last_alarm_at=None,
            severity="NONE",
            recommendation="System monitoring active (failsafe mode).",
            adwin_width=32
        )
