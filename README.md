# AI Chat Application

Full-stack chat application with React frontend and FastAPI backend.

## Structure
```
├── frontend/          # React + Vite frontend
├── backend/           # FastAPI backend
├── docker-compose.yml # Docker orchestration
└── README.md
```

## Development
```bash
# Run with Docker
docker-compose up --build

# Run separately
cd frontend && npm run dev
cd backend && uvicorn main:app --reload
```

## URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:8000