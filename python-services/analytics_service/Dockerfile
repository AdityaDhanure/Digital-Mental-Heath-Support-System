FROM python:3.11-slim

# System deps for uvicorn standard extras
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy service code
COPY . .

# Render injects $PORT at runtime; expose a sensible default for local docker run
EXPOSE 8002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-8002}/health')"

# Start command — reads $PORT from environment (Render sets this automatically)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8002} --workers 1 --log-level info
