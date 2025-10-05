from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict
import json
import asyncio
from agents import automate_task
from datetime import datetime
import logging
from integrations import integration_manager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Agentic AI Automator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Command(BaseModel):
    text: str

class ChatRequest(BaseModel):
    text: str
    chat_id: Optional[str] = None

class TaskStats(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int

class MeetingNotification(BaseModel):
    title: str
    date: str
    time: str
    duration: str
    attendees: Optional[List[str]] = []
    description: Optional[str] = None
    platforms: Optional[List[str]] = None

class TaskNotification(BaseModel):
    name: str
    priority: str
    status: str
    deadline: Optional[str] = None
    description: Optional[str] = None
    platforms: Optional[List[str]] = None

@app.post("/automate")
def automate(command: Command):
    """Legacy endpoint for automation tasks"""
    try:
        logger.info(f"Received automation request: {command.text}")
        result = automate_task(command.text)
        return {"result": result, "status": "success"}
    except Exception as e:
        logger.error(f"Automation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
def chat(request: ChatRequest):
    """Main chat endpoint with enhanced AI features"""
    try:
        logger.info(f"Chat request from {request.chat_id}: {request.text}")
        
        # Use enhanced agent with smart features
        from enhanced_agent import agent
        result = agent.process_command(request.text)
        
        response = {
            "id": f"msg_{int(datetime.now().timestamp() * 1000)}",
            "content": result['message'],
            "isUser": False,
            "timestamp": datetime.now().isoformat(),
            "status": "completed" if result['success'] else "error",
            "suggestions": result.get('suggestions', []),  # NEW: Smart suggestions
            "intent": result.get('intent', 'unknown')  # NEW: Detected intent
        }
        
        logger.info(f"Chat response sent successfully")
        return response
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        error_response = {
            "id": f"msg_{int(datetime.now().timestamp() * 1000)}",
            "content": f"I apologize, but I encountered an error: {str(e)}. Please try again or rephrase your request.",
            "isUser": False,
            "timestamp": datetime.now().isoformat(),
            "status": "error",
            "suggestions": ["Try rephrasing your command", "Type 'help' for available commands"]
        }
        return error_response

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "service": "Agentic AI Automator"
    }

@app.get("/api/stats")
async def get_stats():
    """Get system statistics"""
    try:
        import os
        import json
        
        tasks_file = 'tasks.json'
        total = 0
        completed = 0
        pending = 0
        
        if os.path.exists(tasks_file):
            with open(tasks_file, 'r') as f:
                tasks = json.load(f)
                total = len(tasks)
                completed = sum(1 for t in tasks if t.get('status') == 'completed')
                pending = total - completed
        
        return {
            "total_tasks": total,
            "completed_tasks": completed,
            "pending_tasks": pending,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Stats error: {str(e)}")
        return {
            "total_tasks": 0,
            "completed_tasks": 0,
            "pending_tasks": 0,
            "error": str(e)
        }

@app.get("/api/tasks")
async def list_tasks():
    """Get all tasks"""
    try:
        import os
        import json
        
        tasks_file = 'tasks.json'
        if not os.path.exists(tasks_file):
            return {"tasks": []}
        
        with open(tasks_file, 'r') as f:
            tasks = json.load(f)
        
        return {"tasks": tasks}
    except Exception as e:
        logger.error(f"List tasks error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/suggestions")
async def get_suggestions():
    """Get smart AI suggestions based on context"""
    try:
        from enhanced_agent import agent
        suggestions = agent.get_smart_suggestions()
        
        return {
            "suggestions": suggestions,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Suggestions error: {str(e)}")
        return {"suggestions": [], "error": str(e)}

@app.get("/api/insights")
async def get_insights():
    """Get productivity insights and analytics"""
    try:
        from enhanced_agent import agent
        insights = agent.get_productivity_insights()
        
        return {
            **insights,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Insights error: {str(e)}")
        return {
            "total_commands": 0,
            "most_used_feature": "N/A",
            "productivity_score": 0,
            "suggestions": [],
            "error": str(e)
        }

@app.get("/api/analytics")
async def get_analytics():
    """Get detailed usage analytics"""
    try:
        import os
        import json
        from collections import Counter
        
        analytics_file = 'analytics.json'
        if not os.path.exists(analytics_file):
            return {
                "total_commands": 0,
                "commands_by_intent": {},
                "success_rate": 0,
                "recent_activity": []
            }
        
        with open(analytics_file, 'r') as f:
            data = json.load(f)
            commands = data.get('commands', [])
        
        # Calculate metrics
        intent_counts = Counter(cmd['intent'] for cmd in commands)
        success_count = sum(1 for cmd in commands if cmd.get('success', False))
        success_rate = (success_count / len(commands) * 100) if commands else 0
        
        # Recent activity (last 10)
        recent = commands[-10:] if len(commands) > 10 else commands
        
        return {
            "total_commands": len(commands),
            "commands_by_intent": dict(intent_counts),
            "success_rate": round(success_rate, 2),
            "recent_activity": recent,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        return {
            "total_commands": 0,
            "commands_by_intent": {},
            "success_rate": 0,
            "recent_activity": [],
            "error": str(e)
        }

@app.post("/api/feedback")
async def submit_feedback(feedback: dict):
    """Submit user feedback on AI responses"""
    try:
        feedback_file = 'feedback.json'
        
        if os.path.exists(feedback_file):
            with open(feedback_file, 'r') as f:
                all_feedback = json.load(f)
        else:
            all_feedback = []
        
        feedback['timestamp'] = datetime.now().isoformat()
        all_feedback.append(feedback)
        
        with open(feedback_file, 'w') as f:
            json.dump(all_feedback, f, indent=2)
        
        return {"status": "success", "message": "Thank you for your feedback!"}
    except Exception as e:
        logger.error(f"Feedback error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/schedule/suggest")
async def suggest_meeting_times(request: dict):
    """Suggest optimal meeting times"""
    try:
        from smart_scheduler import scheduler
        from datetime import datetime
        
        duration = request.get('duration_minutes', 60)
        preferred_date = request.get('preferred_date')
        
        if preferred_date:
            preferred_dt = datetime.fromisoformat(preferred_date)
        else:
            preferred_dt = None
        
        suggestions = scheduler.suggest_optimal_times(
            duration_minutes=duration,
            preferred_date=preferred_dt
        )
        
        return {
            "suggestions": suggestions,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Schedule suggestion error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/schedule/check-conflict")
async def check_scheduling_conflict(request: dict):
    """Check for scheduling conflicts"""
    try:
        from smart_scheduler import scheduler
        from datetime import datetime
        
        start = datetime.fromisoformat(request['start'])
        end = datetime.fromisoformat(request['end'])
        existing_events = request.get('existing_events', [])
        
        result = scheduler.resolve_conflict(start, end, existing_events)
        
        return result
    except Exception as e:
        logger.error(f"Conflict check error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tasks/prioritized")
async def get_prioritized_tasks():
    """Get tasks sorted by priority"""
    try:
        from task_prioritizer import prioritizer
        import os
        import json
        
        tasks_file = 'tasks.json'
        if not os.path.exists(tasks_file):
            return {"tasks": [], "insights": {}}
        
        with open(tasks_file, 'r') as f:
            tasks = json.load(f)
        
        prioritized = prioritizer.prioritize_tasks(tasks)
        insights = prioritizer.get_task_insights(tasks)
        next_task = prioritizer.suggest_next_task(tasks)
        
        return {
            "tasks": prioritized,
            "insights": insights,
            "next_task": next_task,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Prioritized tasks error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Integration endpoints
@app.get("/api/integrations/status")
async def get_integration_status():
    """Get status of all integrations"""
    try:
        status = integration_manager.get_available_integrations()
        return {
            "integrations": status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Integration status error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/integrations/meeting")
async def send_meeting_notification(notification: MeetingNotification):
    """Send meeting notification to configured platforms"""
    try:
        meeting_details = notification.dict()
        results = integration_manager.send_meeting_notification(
            meeting_details, 
            notification.platforms
        )
        
        return {
            "success": True,
            "results": results,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Meeting notification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/integrations/task")
async def send_task_notification(notification: TaskNotification):
    """Send task notification to configured platforms"""
    try:
        task_details = notification.dict()
        results = integration_manager.send_task_notification(
            task_details, 
            notification.platforms
        )
        
        return {
            "success": True,
            "results": results,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Task notification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/integrations/slack/channels")
async def get_slack_channels():
    """Get available Slack channels"""
    try:
        if not integration_manager.slack.is_configured():
            raise HTTPException(status_code=400, detail="Slack not configured")
        
        channels = integration_manager.slack.get_channels()
        return {
            "channels": channels,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Slack channels error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/integrations/google-workspace/auth")
async def authenticate_google_workspace():
    """Authenticate with Google Workspace"""
    try:
        success = integration_manager.google_workspace.authenticate()
        return {
            "success": success,
            "message": "Authentication successful" if success else "Authentication failed",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Google Workspace auth error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))