from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import logging
try:
    from agents import automate_task
except ImportError:
    def automate_task(text):
        return f"I received your request: {text}. The AI agent is currently being set up."

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
    """Main chat endpoint"""
    try:
        logger.info(f"Chat request from {request.chat_id}: {request.text}")
        
        result = automate_task(request.text)
        
        response = {
            "id": f"msg_{int(datetime.now().timestamp() * 1000)}",
            "content": result,
            "isUser": False,
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"Chat response sent successfully")
        return response
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        error_response = {
            "id": f"msg_{int(datetime.now().timestamp() * 1000)}",
            "content": f"I apologize, but I encountered an error: {str(e)}. Please try again or rephrase your request.",
            "isUser": False,
            "timestamp": datetime.now().isoformat()
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
