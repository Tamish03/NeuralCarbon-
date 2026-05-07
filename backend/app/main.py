from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import predict, explain, prescribe, drift, policy, weather, feedback, report, ledger

app = FastAPI(
    title="NeuralCarbon API",
    description="Autonomous Industrial Carbon Intelligence Platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predict.router, prefix="/api/v1/predict", tags=["Prediction"])
app.include_router(explain.router, prefix="/api/v1/explain", tags=["Explainability"])
app.include_router(prescribe.router, prefix="/api/v1/prescribe", tags=["Prescription"])
app.include_router(drift.router, prefix="/api/v1/drift", tags=["Drift Monitoring"])
app.include_router(policy.router, prefix="/api/v1/simulate/policy", tags=["Policy Simulation"])
app.include_router(weather.router, prefix="/api/v1/weather", tags=["Environment"])
app.include_router(feedback.router, prefix="/api/v1/feedback", tags=["Active Learning"])
app.include_router(report.router, prefix="/api/v1/report", tags=["ESG Reporting"])
app.include_router(ledger.router, prefix="/api/v1/ledger", tags=["Blockchain Ledger"])

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "NeuralCarbon API is running"}
