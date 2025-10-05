from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import json
import asyncio
from agents import automate_task
from datetime import datetime
import logging

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