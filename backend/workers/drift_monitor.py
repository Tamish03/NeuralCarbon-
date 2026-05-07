import os
import json
import time
from datetime import datetime
from river.drift import ADWIN

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
STATE_FILE = os.path.join(BASE_DIR, "backend", "workers", "drift_state.json")

class DriftMonitorWorker:
    def __init__(self):
        self.adwin = ADWIN()
        self.state = {
            "drift_detected": False,
            "last_alarm_at": None,
            "severity": "NONE",
            "recommendation": "System stable. Continue monitoring.",
            "adwin_width": self.adwin.width
        }
        
    def save_state(self):
        os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
        with open(STATE_FILE, "w") as f:
            json.dump(self.state, f, indent=4)
            
    def update(self, val: float):
        """
        Updates the ADWIN detector with a new value.
        Usually, this is the residual error (actual - predicted).
        For testing purposes, we can just feed it random data or values from a stream.
        """
        _ = self.adwin.update(val)
        
        if self.adwin.drift_detected:
            self.state["drift_detected"] = True
            self.state["last_alarm_at"] = datetime.utcnow().isoformat()
            self.state["severity"] = "HIGH"
            self.state["recommendation"] = "Significant concept drift detected. Triggering automated retraining pipeline."
            print(f"[DRIFT ALARM] Drift detected at {self.state['last_alarm_at']}")
        else:
            # Optionally reset state if conditions normalize
            # self.state["drift_detected"] = False
            pass
            
        self.state["adwin_width"] = self.adwin.width
        self.save_state()

def run_worker_loop():
    print("Starting ADWIN Drift Monitor Worker...")
    monitor = DriftMonitorWorker()
    monitor.save_state()
    
    # In a real system, this would listen to a Redis queue or DB table for new residuals.
    # We will simulate a continuous data stream.
    import random
    
    try:
        while True:
            # Simulate stable environment
            residual = random.gauss(0, 1.0)
            
            # Occasionally inject drift (mean shift) based on time to demonstrate functionality
            if time.time() % 60 > 45: # Drift for 15 seconds every minute
                residual = random.gauss(5.0, 1.5)
                
            monitor.update(residual)
            time.sleep(1) # process 1 value per second
            
    except KeyboardInterrupt:
        print("Stopping Drift Monitor Worker...")

if __name__ == "__main__":
    run_worker_loop()
