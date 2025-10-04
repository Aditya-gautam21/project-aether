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
    """Main chat endpoint with enhanced response"""
    try:
        logger.info(f"Chat request from {request.chat_id}: {request.text}")
        
        # Process the command
        result = automate_task(request.text)
        
        response = {
            "id": f"msg_{int(datetime.now().timestamp() * 1000)}",
            "content": result,
            "isUser": False,
            "timestamp": datetime.now().isoformat(),
            "status": "completed"
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
            "status": "error"
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