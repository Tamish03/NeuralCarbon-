import os
import json
import time
import numpy as np
from scipy import stats
from datetime import datetime
import sys

# Add backend to path to import app
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from app.core.db import SessionLocal, DriftEvent

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
STATE_FILE = os.path.join(BASE_DIR, "backend", "workers", "drift_state.json")

class DriftMonitorWorker:
    def __init__(self):
        # Neural Window for Drift Detection
        self.reference_window = []
        self.current_window = []
        self.window_size = 50
        
        self.state = {
            "drift_detected": False,
            "last_alarm_at": None,
            "severity": "NONE",
            "recommendation": "System stable. Continue monitoring.",
            "drift_score": 0.0
        }
        
    def save_state(self):
        os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
        with open(STATE_FILE, "w") as f:
            json.dump(self.state, f, indent=4)
            
    def update(self, val: float):
        # Build up reference window first
        if len(self.reference_window) < self.window_size:
            self.reference_window.append(val)
            return

        # Build current window
        self.current_window.append(val)
        if len(self.current_window) > self.window_size:
            self.current_window.pop(0)

        # Statistical Drift Detection (K-S Test)
        if len(self.current_window) == self.window_size:
            # Compare distributions of reference vs current
            ks_stat, p_value = stats.ks_2samp(self.reference_window, self.current_window)
            
            # If p-value is extremely low, distributions have shifted significantly
            drift_detected = p_value < 0.01 
            self.state["drift_score"] = float(ks_stat)
            
            if drift_detected:
                self.state["drift_detected"] = True
                self.state["last_alarm_at"] = datetime.utcnow().isoformat()
                self.state["severity"] = "HIGH"
                self.state["recommendation"] = "Significant distribution shift detected. Triggering recalibration."
                
                # Log to DB
                db = SessionLocal()
                try:
                    event = DriftEvent(
                        severity=self.state["severity"],
                        adwin_width=self.window_size # Logged as window size for schema compatibility
                    )
                    db.add(event)
                    db.commit()
                finally:
                    db.close()
            else:
                self.state["drift_detected"] = False
                
            self.save_state()

def run_worker_loop():
    print("Starting Scipy-Powered Drift Monitor Worker...")
    monitor = DriftMonitorWorker()
    monitor.save_state()
    
    import random
    try:
        while True:
            # Baseline residuals
            residual = random.gauss(0, 1.0)
            
            # Inject drift every minute
            if time.time() % 60 > 45:
                residual = random.gauss(3.5, 1.0)
                
            monitor.update(residual)
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("Stopping Drift Monitor Worker...")

if __name__ == "__main__":
    run_worker_loop()
