from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import logging
import os

try:
    from agents import automate_task
except ImportError:
    def automate_task(text):
        return f"I received your request: {text}. The AI agent is currently being set up."

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Agentic AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Command(BaseModel):
    text: str

class ChatRequest(BaseModel):
    text: str
    chat_id: Optional[str] = None

@app.post("/api/chat")
def chat(request: ChatRequest):
    try:
        logger.info(f"Chat request from {request.chat_id}: {request.text}")
        result = automate_task(request.text)
        return {
            "id": f"msg_{int(datetime.now().timestamp() * 1000)}",
            "content": result,
            "isUser": False,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return {
            "id": f"msg_{int(datetime.now().timestamp() * 1000)}",
            "content": f"I apologize, but I encountered an error: {str(e)}. Please try again.",
            "isUser": False,
            "timestamp": datetime.now().isoformat()
        }

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "service": "Agentic AI"
    }

if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
