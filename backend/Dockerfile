FROM python:3.10

WORKDIR /app

# Install system dependencies for LightGBM/scikit-learn
RUN apt-get update && apt-get install -y \
    libgomp1 \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade build tools
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Install numpy and pandas first
RUN pip install --no-cache-dir numpy pandas

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Environment variables
ENV PYTHONPATH=/app
ENV PORT=8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
