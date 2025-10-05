# 🤖 Agentic AI Automator

An intelligent conversational AI assistant that automates calendar management, task tracking, and productivity workflows using natural language processing and autonomous agent capabilities.

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-121212?style=for-the-badge)
![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)

## ✨ Key Features

### 🎤 **Voice Interaction** (NEW!)
- **Speech-to-Text**: Talk to your AI assistant naturally
- **Text-to-Speech**: Hear AI responses with auto-speak
- **Voice Controls**: Easy microphone and speaker controls
- **Mobile Voice**: Optimized voice interface for mobile devices

### 🤖 **Smart Scheduling** (NEW!)
- **Timezone Detection**: Automatic timezone handling
- **Conflict Resolution**: Intelligent meeting conflict detection
- **Optimal Suggestions**: AI-powered best time recommendations
- **Working Hours**: Respects business hours and preferences

### 📋 **Task Prioritization** (NEW!)
- **Algorithmic Scoring**: Multi-factor priority calculation
- **Deadline Awareness**: Automatic urgent task detection
- **Smart Ordering**: Intelligent task sequencing
- **Productivity Insights**: Performance analytics and suggestions

### 🔗 **Cross-Platform Integration** (NEW!)
- **Slack Integration**: Send messages, reminders, notifications
- **Microsoft Teams**: Adaptive cards and meeting notifications
- **Google Workspace**: Gmail, Docs, Sheets, Drive integration
- **Unified Management**: Centralized platform coordination

### 📱 **Responsive Design** (NEW!)
- **Mobile Optimized**: Touch-friendly mobile interface
- **Tablet Support**: Perfect tablet experience
- **Desktop Enhanced**: Full-featured desktop version
- **Adaptive UI**: Components that work on any screen size

### ♿ **Accessibility** (NEW!)
- **WCAG Compliance**: Full accessibility standards compliance
- **Screen Reader**: Complete screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **ARIA Support**: Comprehensive ARIA labels and roles

### 💬 **Natural Language Understanding**
- **Casual Commands**: Just say "book a meeting tomorrow at 10" - no formal syntax needed!
- **Context Inference**: Agent automatically fills in missing details (duration, full dates, etc.)
- **Smart Parsing**: Understands "tomorrow", "next monday", "at 10 AM", and more
- **Conversational**: Ask follow-up questions and refine your requests

### 🎯 **Intelligent Agent System**
- **ReAct Pattern**: Reasoning + Acting agent architecture for autonomous decision-making
- **Local LLM**: Llama-3.2-3B model running locally for privacy and speed
- **Tool Selection**: Automatic tool selection based on user intent
- **Error Recovery**: Robust error handling with graceful fallbacks

### 📅 **Calendar Management**
- Book appointments with natural language commands
- View upcoming events for any date
- Automatic attendee management
- Google Calendar integration with OAuth2

### ✅ **Task Management**
- Create tasks with priority levels (low, medium, high)
- Track task status (pending, completed)
- List and filter tasks
- Persistent JSON storage

### 💬 **Modern Chat Interface**
- Real-time conversational UI inspired by ChatGPT
- Multi-chat support with history
- Loading states and status indicators
- Dark mode optimized design
- Responsive layout for all devices

### 📊 **Analytics Dashboard**
- Task statistics visualization
- Quick action shortcuts
- Real-time metrics updates
- Performance tracking

### 🔔 **User Feedback System** (NEW!)
- **Smart Notifications**: Toast notifications for all interactions
- **Loading States**: Visual feedback during processing
- **Error Handling**: Comprehensive error messages and recovery
- **Confirmation Dialogs**: User action confirmations

## 🏗️ Architecture

```
┌─────────────┐      HTTP/REST      ┌──────────────┐
│   React     │ ◄─────────────────► │   FastAPI    │
│  Frontend   │                     │   Backend    │
└─────────────┘                     └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │  LangChain   │
                                    │    Agent     │
                                    └──────┬───────┘
                                           │
                        ┌──────────────────┼──────────────────┐
                        ▼                  ▼                  ▼
                 ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
                 │   Google    │   │    Task     │   │   LlamaCpp  │
                 │  Calendar   │   │  Manager    │   │     LLM     │
                 └─────────────┘   └─────────────┘   └─────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- Docker & Docker Compose (optional)
- Google Calendar API credentials
- Llama model file (Llama-3.2-3B-Instruct-f16.gguf)

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd project-oriface
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up Google Calendar API
# 1. Go to Google Cloud Console
# 2. Create a new project
# 3. Enable Google Calendar API
# 4. Create OAuth 2.0 credentials
# 5. Download credentials.json to backend/

# Update model path in agents.py
# Edit line 14 with your model path
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env
```

### Running the Application

#### Option 1: Local Development
```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### Option 2: Docker
```bash
docker-compose up --build
```

Access the application at `http://localhost:5173`

## 💡 Usage Examples

### 🎤 Voice Commands (NEW!)
```
"Hey AI, book a meeting tomorrow at 2 PM"
[Voice input automatically converts to text]
```

### 📅 Smart Scheduling (NEW!)
```
"Book a team meeting next Tuesday"
→ AI suggests optimal times and checks for conflicts
→ "I found a conflict at 2 PM, how about 3 PM instead?"
```

### 📋 Task Prioritization (NEW!)
```
"Create a high priority task to finish the project report"
→ AI automatically prioritizes based on deadline and importance
→ Shows urgency level: 🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low
```

### 🔗 Cross-Platform Integration (NEW!)
```
"Send this meeting to the team Slack channel"
→ Automatically posts to Slack with rich formatting
→ Creates Google Doc with meeting notes
→ Sends email notification to attendees
```

### 💬 Natural Language Commands
```
"Book a team meeting on 2025-10-05 from 2PM to 3PM with john@example.com"
"Show my calendar events for 2025-10-04"
"Create a high priority task to finish the project report"
"Show all my tasks"
```

### 📱 Mobile Voice Commands
```
[Tap microphone] "Schedule dentist appointment next Friday"
[Voice recognition] → [AI processes] → [Auto-speaks response]
```

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **LangChain**: Framework for developing LLM-powered applications
- **LlamaCpp**: Python bindings for llama.cpp (local LLM inference)
- **Google Calendar API**: Calendar integration
- **Pydantic**: Data validation using Python type annotations

### Frontend
- **React 18**: UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Material-UI**: React component library
- **Vite**: Next-generation frontend tooling
- **Axios**: Promise-based HTTP client

### AI/ML
- **Llama 3.2 3B**: Instruction-tuned language model
- **ReAct Agent**: Reasoning and Acting in language models
- **Tool Calling**: Autonomous function execution

## 📁 Project Structure

```
project-oriface/
├── backend/
│   ├── main.py              # FastAPI application & routes
│   ├── agents.py            # LangChain agent configuration
│   ├── tools.py             # Tool definitions (@tool decorators)
│   ├── requirements.txt     # Python dependencies
│   └── credentials.json     # Google OAuth credentials
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript definitions
│   │   └── theme/           # MUI theme configuration
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables
```bash
# Optional: Add to backend/.env
GOOGLE_CALENDAR_CREDENTIALS=credentials.json
MODEL_PATH=/path/to/your/model.gguf
```

### Frontend Environment Variables
```bash
# frontend/.env
VITE_API_URL=http://localhost:8000
```

## 🎨 Features Showcase

### Intelligent Agent
- Autonomous tool selection based on user intent
- Multi-step reasoning for complex tasks
- Context-aware responses
- Error handling and recovery

### Modern UI/UX
- ChatGPT-inspired interface
- Real-time loading indicators
- Smooth animations and transitions
- Responsive design
- Dark mode optimized

### Productivity Tools
- Calendar integration
- Task management
- Quick actions
- Analytics dashboard

## 🔒 Security

- OAuth2 authentication for Google Calendar
- Local LLM inference (no data sent to external APIs)
- CORS protection
- Input validation with Pydantic
- Secure token storage

## 📈 Performance

- Local LLM inference for fast responses
- GPU acceleration support (configurable)
- Efficient token management
- Optimized React rendering
- Lazy loading and code splitting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- LangChain for the agent framework
- Meta AI for Llama models
- Google for Calendar API
- Material-UI team for the component library

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ using React, FastAPI, and LangChain**
