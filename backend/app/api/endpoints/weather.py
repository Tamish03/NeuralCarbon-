from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

try:
    import httpx
    HAS_HTTPX = True
except ImportError:
    HAS_HTTPX = False

router = APIRouter()

class WeatherResponse(BaseModel):
    AT: float
    AP: float
    RH: float
    location: str

@router.get("/", response_model=WeatherResponse)
async def get_current_weather(lat: float = 40.7128, lon: float = -74.0060):
    api_key = os.getenv("OPENWEATHER_API_KEY")
    
    if HAS_HTTPX and api_key:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    return WeatherResponse(
                        AT=data["main"]["temp"],
                        AP=data["main"]["pressure"],
                        RH=data["main"]["humidity"],
                        location=f"{data['name']}, {data['sys']['country']}"
                    )
        except Exception as e:
            print(f"Weather Fetch Warning: {e}")

    return WeatherResponse(
        AT=24.5,
        AP=1013.25,
        RH=60.0,
        location="Fallback (Station Offline)"
    )
