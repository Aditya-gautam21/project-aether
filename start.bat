@echo off
echo Starting Aether AI...

echo Starting Backend...
start "Backend" cmd /k "cd backend && uvicorn main:app --reload"

timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "Frontend" cmd /k "npm run dev"

echo Both services started!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000