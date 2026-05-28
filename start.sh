#!/bin/bash
set -e

echo "=== Aether AI Starting ==="

# Start FastAPI backend in background
cd /app/backend
echo "Starting FastAPI backend on :8000"
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start Next.js frontend
cd /app
echo "Starting Next.js frontend on :3000"
node node_modules/.bin/next start -p 3000 &
FRONTEND_PID=$!

# Wait for either to exit
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' SIGTERM SIGINT
wait -n $BACKEND_PID $FRONTEND_PID 2>/dev/null
EXIT_CODE=$?
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
exit $EXIT_CODE
