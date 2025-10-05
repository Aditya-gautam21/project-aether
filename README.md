# AI Chat Assistant

A modern AI-powered chat interface with voice input, calendar integration, and task management.

## Features

- 🤖 AI-powered conversational interface
- 🎤 Voice input with speech recognition
- 📅 Google Calendar integration for meeting booking
- ✅ Task creation and management
- 💬 Real-time chat with history
- 🎨 Modern Material UI design

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Usage

- **Chat**: Ask questions or have conversations
- **Book meetings**: "Book a team meeting tomorrow at 2 PM with john@example.com"
- **Create tasks**: "Create a high priority task to review code"
- **Voice input**: Click microphone button and speak

## Tech Stack

- **Backend**: FastAPI, Python
- **Frontend**: React, TypeScript, Material-UI
- **AI**: Custom agent with tool integration
- **Calendar**: Google Calendar API

## Configuration

1. Add Google Calendar credentials to `backend/credentials.json`
2. Set environment variables in `backend/.env`
3. Configure API URL in `frontend/.env`

Built with ❤️ for productivity automation.