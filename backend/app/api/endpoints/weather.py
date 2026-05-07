from fastapi import APIRouter
from pydantic import BaseModel
import random

router = APIRouter()

class WeatherResponse(BaseModel):
    AT: float # Ambient Temperature
    AP: float # Atmospheric Pressure
    RH: float # Relative Humidity
    location: str

@router.get("/", response_model=WeatherResponse)
def get_current_weather(lat: float = 40.7128, lon: float = -74.0060):
    """
    Fetches real-time environmental data (AT, AP, RH) to auto-fill the telemetry.
    Currently mocked as fallback since OpenWeatherMap API key is not provided.
    In production, this would make an HTTP request to api.openweathermap.org.
    """
    # Mocking realistic operational values for testing
    return WeatherResponse(
        AT=round(random.uniform(15.0, 35.0), 2),
        AP=round(random.uniform(1000.0, 1025.0), 2),
        RH=round(random.uniform(30.0, 85.0), 2),
        location="Mocked Sensor Location"
    )
