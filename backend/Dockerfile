FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # Railway injects PORT; default to 8000 for local Docker usage
    PORT=8000

# Install system dependencies needed for psycopg2-binary & pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create data and upload directories
RUN mkdir -p /app/data /app/uploads

EXPOSE ${PORT}

# Railway sets $PORT at runtime — uvicorn reads it via shell expansion
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
