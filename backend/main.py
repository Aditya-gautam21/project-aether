from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uuid
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageRequest(BaseModel):
    content: str
    chat_id: str

class MessageResponse(BaseModel):
    id: str
    content: str
    isUser: bool
    timestamp: datetime

@app.post("/api/chat", response_model=MessageResponse)
async def send_message(request: MessageRequest):
    # AI response logic here
    response_content = f"AI response to: {request.content}"
    
    return MessageResponse(
        id=str(uuid.uuid4()),
        content=response_content,
        isUser=False,
        timestamp=datetime.now()
    )

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}