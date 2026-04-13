"""
Aether FastAPI backend: Life OS state, AI chat (streaming), conversation persistence.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

import openai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from aether_store import patch_aether_state, read_aether_state
from chat_providers import models_catalog, stream_chat
from conversation_store import (
    create_conversation,
    delete_conversation,
    get_conversation,
    list_conversation_meta,
    save_conversation,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Aether AI", version="3.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai.api_key = os.getenv("OPENAI_API_KEY")

DEFAULT_SYSTEM = (
    "You are Aether, a capable AI copilot for someone's life operating system. "
    "Be clear and concise. Use markdown when it helps. Prefer actionable, kind guidance."
)


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    model: Optional[str] = Field(default=None)
    system_prompt: Optional[str] = None


class ConversationCreate(BaseModel):
    id: Optional[str] = None
    title: str = "New chat"


@app.get("/api/health")
async def health_check():
    google_on = bool(os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY"))
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "openai_configured": bool(openai.api_key),
        "google_configured": google_on,
    }


# --- Life OS (dashboard) ---


@app.get("/api/aether/dashboard")
async def aether_dashboard_get():
    return read_aether_state()


@app.patch("/api/aether/dashboard")
async def aether_dashboard_patch(body: Dict[str, Any]):
    try:
        return patch_aether_state(body)
    except Exception as e:
        logger.exception("patch aether failed")
        raise HTTPException(status_code=400, detail=str(e)) from e


# --- Chat (OpenAI + Gemini) ---


@app.get("/api/chat/models")
async def chat_models():
    return {"models": models_catalog()}


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    system_text = (request.system_prompt or "").strip() or DEFAULT_SYSTEM
    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    def generate():
        yield from stream_chat(
            model=request.model,
            system_text=system_text,
            messages=messages,
        )

    return StreamingResponse(generate(), media_type="text/plain; charset=utf-8")


# --- Conversations ---


@app.get("/api/conversations")
async def conversations_list():
    return {"conversations": list_conversation_meta()}


@app.post("/api/conversations")
async def conversations_create(body: ConversationCreate):
    conv = create_conversation(cid=body.id, title=body.title)
    return conv


@app.get("/api/conversations/{conversation_id}")
async def conversations_get(conversation_id: str):
    conv = get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Not found")
    return conv


@app.put("/api/conversations/{conversation_id}")
async def conversations_put(conversation_id: str, body: Dict[str, Any]):
    if body.get("id") and body["id"] != conversation_id:
        raise HTTPException(status_code=400, detail="id mismatch")
    body["id"] = conversation_id
    return save_conversation(body)


@app.delete("/api/conversations/{conversation_id}")
async def conversations_delete(conversation_id: str):
    if not delete_conversation(conversation_id):
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
