FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY dataset /app/dataset

# Train the local ML model at build time so the container starts ready.
# All AI/ML here is local scikit-learn; no external AI API is contacted.
RUN python -m app.ml.train --write-docs || true

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
