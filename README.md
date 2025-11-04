# 🚀 Aether AI - Production-Ready Chatbot Assistant

<div align="center">

![Aether AI](https://img.shields.io/badge/Aether-AI%20Assistant-blue?style=for-the-badge&logo=robot)
![Version](https://img.shields.io/badge/version-3.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

**Modern AI chatbot with Next.js frontend, FastAPI backend, and Vercel AI SDK integration**

[Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Integration Guide](#integration-guide)

</div>

## ✨ Features

### 🎨 **Modern Frontend (Next.js)**
- **Vercel AI Chatbot UI**: Exact replica of the reference design
- **Real-time Streaming**: Live AI responses with typing indicators
- **Dark Theme**: Beautiful dark interface with proper contrast
- **Responsive Design**: Works perfectly on all devices
- **TypeScript**: Full type safety throughout the application
- **Accessibility**: WCAG compliant with keyboard navigation

### 🤖 **Advanced AI Integration**
- **Vercel AI SDK**: Modern streaming AI responses
- **OpenAI GPT-4**: Primary AI service with latest models
- **Amazon Q Integration**: Enterprise-grade AI (backend)
- **Context Awareness**: Maintains conversation context across sessions
- **Markdown Support**: Rich text rendering with syntax highlighting

### 📅 **Enhanced Google Calendar (Backend)**
- **Natural Language Booking**: "Schedule a meeting tomorrow at 2 PM with john@example.com"
- **Conflict Detection**: Automatic scheduling conflict resolution
- **Smart Parsing**: Understands dates, times, and attendees from natural language
- **Event Management**: Create, view, update, and delete calendar events
- **Reminder System**: Automatic email and popup reminders

### ⚡ **Real-time Features**
- **Streaming Responses**: Real-time AI message generation
- **WebSocket Communication**: Instant message delivery (backend)
- **Live Sync**: Real-time calendar and task updates (backend)
- **Connection Management**: Automatic reconnection with exponential backoff
- **Offline Support**: Graceful degradation when services unavailable

### 🛠 **Production Ready**
- **Dual Architecture**: Next.js frontend + FastAPI backend
- **Database Persistence**: SQLite with easy PostgreSQL migration
- **Session Management**: Redis-backed user sessions and chat history
- **Security**: Input sanitization, rate limiting, and API key protection
- **Error Handling**: Comprehensive error recovery and user feedback
- **Logging**: Structured logging for debugging and monitoring

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** with npm
- **Python 3.10+** with pip (for backend)
- **Git** for version control

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd project-aether
npm install
```

### 2. Configure Environment

Create `.env.local`:
```env
# AI Provider (for frontend)
OPENAI_API_KEY=your-openai-api-key-here

# App Configuration
NEXT_PUBLIC_APP_NAME=AI Chatbot
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

For backend integration, also configure `backend/.env`:
```env
# Amazon Q (Optional)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AMAZON_Q_APPLICATION_ID=your_q_application_id

# OpenAI Fallback
OPENAI_API_KEY=your_openai_api_key
```

### 3. Start the Application

**Integrated Setup (Recommended)**
```bash
# Windows
start.bat

# Manual start
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload

# Terminal 2 - Frontend  
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/.env`)
```env
# AI Services
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AMAZON_Q_APPLICATION_ID=your_q_application_id
OPENAI_API_KEY=your_openai_api_key

# Database
DATABASE_URL=sqlite:///./aether.db
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google Calendar
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Environment
ENVIRONMENT=development
DEBUG=true
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

#### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### Google Calendar Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing one

2. **Enable Calendar API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API" and enable it

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Desktop application"
   - Download `credentials.json`

4. **Install Credentials**
   ```bash
   mv ~/Downloads/credentials.json backend/credentials.json
   ```

5. **First Authorization**
   - On first calendar action, browser will open for authorization
   - Grant permissions to access your calendar
   - `token.json` will be created automatically

## 📖 Usage Examples

### 💬 **Natural Conversations**
```
User: Hello! What can you help me with?
Aether: Hello! I'm Aether, your AI assistant. I can help you with calendar management, task creation, and general questions. How can I assist you today?
```

### 📅 **Calendar Management**
```
User: Book a team standup tomorrow at 9 AM with alice@company.com and bob@company.com
Aether: ✅ Meeting "team standup" scheduled for October 15, 2024 at 09:00 AM with alice@company.com, bob@company.com

User: Show my events for today
Aether: 📅 Events for today:
• 09:00 AM - Team Standup (2 attendees)
• 02:00 PM - Client Review at Conference Room A
• 04:30 PM - Project Planning
```

### ✅ **Task Management**
```
User: Create a high priority task to review the quarterly report by Friday
Aether: ✅ Task created: "review the quarterly report" 🔴 high priority (due October 18)

User: Show my pending tasks
Aether: 📋 Your Tasks:
⏳ 🔴 Review quarterly report (due Friday)
⏳ 🟡 Update project documentation
⏳ 🟢 Schedule team lunch
```

### 🔍 **Smart Features**
- **Conflict Detection**: "⚠️ Time conflict detected with: Team Meeting. Please choose a different time."
- **Context Awareness**: Remembers previous conversation context
- **Error Recovery**: Graceful handling of API failures with helpful messages
- **Multi-format Support**: Handles various date/time formats naturally

## 🏗 Architecture

### Integrated Full-Stack Design
- **Frontend**: Next.js 14 with Vercel AI Chatbot UI
- **Backend**: FastAPI with streaming OpenAI integration
- **Communication**: HTTP API with streaming responses
- **Styling**: Tailwind CSS with dark theme
- **AI Integration**: OpenAI GPT models via FastAPI backend

### Frontend Stack (Next.js)
- **Next.js 14**: App Router with TypeScript
- **Vercel AI SDK**: Streaming chat interface
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern component library
- **React Markdown**: Rich text rendering

### Backend Stack (FastAPI)
- **FastAPI**: Modern Python web framework
- **OpenAI Integration**: Streaming chat responses
- **CORS**: Configured for Next.js frontend
- **Pydantic**: Request/response validation
- **Uvicorn**: ASGI server for production

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

### End-to-End Tests
```bash
npm run test:e2e
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual containers
docker build -t aether-ai .
docker run -p 8000:8000 aether-ai
```

### Production Deployment

1. **Environment Setup**
   ```bash
   export ENVIRONMENT=production
   export DEBUG=false
   export DATABASE_URL=postgresql://user:pass@localhost/aether
   ```

2. **Database Migration**
   ```bash
   alembic upgrade head
   ```

3. **Start Services**
   ```bash
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

### Cloud Deployment Options
- **AWS**: ECS with RDS and ElastiCache
- **Vercel**: Frontend deployment with serverless functions
- **Railway**: Full-stack deployment with automatic scaling
- **DigitalOcean**: App Platform with managed databases

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript/Python type hints
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT integration capabilities
- **Amazon** for Q business AI service
- **Google** for Calendar API and excellent documentation
- **Vercel** for inspiration on modern web design
- **Apple** for Liquid Glass design principles

## 📞 Support

- **Documentation**: Check the `/docs` endpoint when running
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

---

<div align="center">

**Built with ❤️ for productivity automation**

[⭐ Star this repo](https://github.com/your-username/project-aether) • [🐛 Report Bug](https://github.com/your-username/project-aether/issues) • [💡 Request Feature](https://github.com/your-username/project-aether/issues)

</div>