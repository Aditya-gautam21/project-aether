"""
Simplified FastAPI backend with OpenAI integration
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import openai
import os
from datetime import datetime
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="Aether AI", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

# Pydantic models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    message: str
    timestamp: str

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """Streaming chat endpoint compatible with Vercel AI SDK"""
    try:
        if not openai.api_key:
            def generate_fallback():
                response_text = "Hello! I'm Aether AI. OpenAI API key not configured, but I'm here to help with basic responses."
                for char in response_text:
                    yield f"data: {json.dumps({'content': char})}\n\n"
                yield "data: [DONE]\n\n"
            
            return StreamingResponse(
                generate_fallback(),
                media_type="text/plain"
            )
        
        # Convert messages to OpenAI format
        openai_messages = [
            {"role": msg.role, "content": msg.content} 
            for msg in request.messages
        ]
        
        # Add system message
        system_message = {
            "role": "system",
            "content": "You are Aether, a helpful AI assistant. Be concise and helpful."
        }
        
        def generate_response():
            try:
                # Call OpenAI with streaming
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[system_message] + openai_messages,
                    max_tokens=1000,
                    temperature=0.7,
                    stream=True
                )
                
                for chunk in response:
                    if chunk.choices[0].delta.get('content'):
                        content = chunk.choices[0].delta.content
                        yield f"data: {json.dumps({'content': content})}\n\n"
                
                yield "data: [DONE]\n\n"
                
            except Exception as e:
                logger.error(f"OpenAI streaming error: {e}")
                error_msg = "I apologize, but I encountered an error. Please try again."
                for char in error_msg:
                    yield f"data: {json.dumps({'content': char})}\n\n"
                yield "data: [DONE]\n\n"
        
        return StreamingResponse(
            generate_response(),
            media_type="text/plain"
        )
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        def generate_error():
            error_msg = "I apologize, but I encountered an error. Please try again."
            for char in error_msg:
                yield f"data: {json.dumps({'content': char})}\n\n"
            yield "data: [DONE]\n\n"
        
        return StreamingResponse(
            generate_error(),
            media_type="text/plain"
        )

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "openai_configured": bool(openai.api_key)
    }

# Remove static file serving since we're using Next.js frontend

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)