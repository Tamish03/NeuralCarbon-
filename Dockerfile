FROM python:3.10

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgomp1 \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade build tools
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Install numpy and pandas first (needed for river compilation)
RUN pip install --no-cache-dir numpy pandas

# Copy requirements and install the rest
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all code
COPY . .

# Set working directory to backend for the app
WORKDIR /app/backend

ENV PYTHONPATH=/app/backend
ENV PORT=8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
