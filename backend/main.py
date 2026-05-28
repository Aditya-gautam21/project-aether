"""
Aether FastAPI backend: Life OS state, AI chat (streaming), conversation persistence,
and WebSocket real-time communication.
"""
from __future__ import annotations

import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

import openai
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
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
    prune_empty_conversations,
    save_conversation,
)

try:
    from websocket_manager import manager, websocket_handler
    _WS_AVAILABLE = True
except ImportError:
    _WS_AVAILABLE = False
    manager = None
    websocket_handler = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Aether AI", version="3.1.0")


@app.on_event("startup")
async def on_startup():
    removed = prune_empty_conversations()
    if removed:
        logger.info("Pruned %d empty conversation(s) on startup", removed)

# Parse ALLOWED_ORIGINS from env or use safe defaults
_raw_origins = os.getenv("ALLOWED_ORIGINS")
if _raw_origins:
    try:
        _allowed_origins = json.loads(_raw_origins) if _raw_origins.startswith("[") else [o.strip() for o in _raw_origins.split(",")]
    except Exception:
        _allowed_origins = ["http://localhost:3000"]
else:
    _allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
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


# --- WebSocket (real-time chat + dashboard sync) ---


@app.websocket("/ws/{user_id}/{session_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, session_id: str):
    if not _WS_AVAILABLE:
        await websocket.close(code=1011, reason="WebSocket manager not available")
        return
    await manager.connect(websocket, user_id, session_id)
    try:
        await websocket_handler.handle_message(websocket, session_id, user_id)
    except WebSocketDisconnect:
        manager.disconnect(session_id)


@app.get("/api/health")
async def health_check():
    google_on = bool(os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY"))
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "openai_configured": bool(openai.api_key),
        "google_configured": google_on,
        "websocket_available": _WS_AVAILABLE,
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
