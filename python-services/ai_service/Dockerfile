FROM python:3.11-slim

# System deps needed for torch, faiss, sentence-transformers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy service code
COPY . .

# Render injects $PORT at runtime
EXPOSE 8001

# Health check (no requests lib; use stdlib)
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-8001}/health')"

# Start command — reads $PORT from environment
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8001} --workers 1 --log-level info
