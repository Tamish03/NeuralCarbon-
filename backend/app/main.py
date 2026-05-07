from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api.endpoints import predict, explain, prescribe, drift, weather, policy, feedback, metrics, ledger

app = FastAPI(
    title="NeuralCarbon Intelligence API",
    description="Industrial ML core for carbon emission intelligence and operational optimization.",
    version="1.0.0"
)

# Production CORS: Allowing both Localhost and Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Neural Intelligence Routers
app.include_router(predict.router, prefix="/api/v1/predict", tags=["Prediction"])
app.include_router(explain.router, prefix="/api/v1/explain", tags=["Explainability"])
app.include_router(prescribe.router, prefix="/api/v1/prescribe", tags=["Prescription"])
app.include_router(drift.router, prefix="/api/v1/drift", tags=["Drift Detection"])
app.include_router(weather.router, prefix="/api/v1/weather", tags=["Environment"])
app.include_router(policy.router, prefix="/api/v1/simulate/policy", tags=["Policy Simulation"])
app.include_router(feedback.router, prefix="/api/v1/feedback", tags=["Active Learning"])
app.include_router(metrics.router, prefix="/api/v1/metrics", tags=["System Health"])
app.include_router(ledger.router, prefix="/api/v1/ledger", tags=["Blockchain Ledger"])

@app.get("/")
async def root():
    return {
        "status": "Operational",
        "service": "NeuralCarbon Intelligence Hub",
        "version": "1.0.0"
    }
