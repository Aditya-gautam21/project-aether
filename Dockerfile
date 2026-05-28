# Production Dockerfile for Aether AI
# Build:  docker build -t aether-ai .
# Run:    docker run -p 3000:3000 -p 8000:8000 --env-file backend/.env aether-ai

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including Node.js 18
RUN apt-get update && apt-get install -y \
    curl gcc gnupg ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (cached layer)
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Install Node.js dependencies (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build frontend
COPY . .
RUN npm run build

# Copy backend source (overwrite any stale copies)
COPY backend/ ./backend/

# Create non-root user
RUN useradd --create-home --shell /bin/bash aether && \
    chown -R aether:aether /app
USER aether

EXPOSE 3000 8000

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh
CMD ["/app/start.sh"]
