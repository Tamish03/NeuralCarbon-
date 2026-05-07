from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import predict, explain, prescribe, drift, policy, weather, feedback, report, ledger, metrics
import logging
import traceback
import os

logging.basicConfig(
    filename=os.path.join(os.path.dirname(__file__), "../error.log"),
    level=logging.ERROR,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI(
    title="NeuralCarbon API",
    description="Autonomous Industrial Carbon Intelligence Platform",
    version="1.0.0"
)

@app.middleware("http")
async def log_errors_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logging.error(f"Error handling request {request.url}: {str(e)}")
        logging.error(traceback.format_exc())
        raise e

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="/api/v1/predict", tags=["Prediction"])
app.include_router(explain.router, prefix="/api/v1/explain", tags=["Explainability"])
app.include_router(prescribe.router, prefix="/api/v1/prescribe", tags=["Prescription"])
app.include_router(drift.router, prefix="/api/v1/drift", tags=["Drift Monitoring"])
app.include_router(policy.router, prefix="/api/v1/simulate/policy", tags=["Policy Simulation"])
app.include_router(weather.router, prefix="/api/v1/weather", tags=["Environment"])
app.include_router(feedback.router, prefix="/api/v1/feedback", tags=["Active Learning"])
app.include_router(report.router, prefix="/api/v1/report", tags=["ESG Reporting"])
app.include_router(ledger.router, prefix="/api/v1/ledger", tags=["Blockchain Ledger"])
app.include_router(metrics.router, prefix="/api/v1/metrics", tags=["System Metrics"])

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "NeuralCarbon API is running"}
