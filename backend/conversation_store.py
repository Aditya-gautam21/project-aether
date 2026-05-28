"""File-backed AI chat conversations."""
from __future__ import annotations

import copy
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CONV_PATH = os.path.join(DATA_DIR, "conversations.json")


def _ensure_dir() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)


def _read_root() -> Dict[str, Any]:
    _ensure_dir()
    if not os.path.isfile(CONV_PATH):
        return {"conversations": {}}
    try:
        with open(CONV_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        if "conversations" not in data:
            return {"conversations": {}}
        return data
    except (json.JSONDecodeError, OSError):
        return {"conversations": {}}


def _write_root(root: Dict[str, Any]) -> None:
    _ensure_dir()
    with open(CONV_PATH, "w", encoding="utf-8") as f:
        json.dump(root, f, indent=2, ensure_ascii=False)


def list_conversation_meta() -> List[Dict[str, Any]]:
    prune_empty_conversations()
    root = _read_root()
    items = []
    for cid, c in root["conversations"].items():
        items.append(
            {
                "id": cid,
                "title": c.get("title", "Chat"),
                "updatedAt": c.get("updatedAt", ""),
                "messageCount": len(c.get("messages", [])),
            }
        )
    items.sort(key=lambda x: x.get("updatedAt") or "", reverse=True)
    return items


def get_conversation(cid: str) -> Optional[Dict[str, Any]]:
    root = _read_root()
    return copy.deepcopy(root["conversations"].get(cid))


def save_conversation(conv: Dict[str, Any]) -> Dict[str, Any]:
    cid = conv["id"]
    root = _read_root()
    conv = copy.deepcopy(conv)
    if "messages" not in conv or not isinstance(conv["messages"], list):
        conv["messages"] = []
    # Don't persist empty conversations — delete if they already exist
    has_content = any(
        m.get("role") == "user" and str(m.get("content", "")).strip()
        for m in conv["messages"]
    )
    if not has_content:
        if cid in root["conversations"]:
            del root["conversations"][cid]
            _write_root(root)
        return conv
    if "title" not in conv:
        conv["title"] = "Chat"
    conv["updatedAt"] = datetime.now(timezone.utc).isoformat()
    root["conversations"][cid] = conv
    _write_root(root)
    return conv


def create_conversation(cid: Optional[str] = None, title: str = "New chat") -> Dict[str, Any]:
    root = _read_root()
    new_id = cid or str(uuid.uuid4())
    conv = {
        "id": new_id,
        "title": title,
        "messages": [],
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }
    root["conversations"][new_id] = conv
    _write_root(root)
    return copy.deepcopy(conv)


def delete_conversation(cid: str) -> bool:
    root = _read_root()
    if cid not in root["conversations"]:
        return False
    del root["conversations"][cid]
    _write_root(root)
    return True


def prune_empty_conversations() -> int:
    """Remove conversations with zero messages. Returns count removed."""
    root = _read_root()
    to_remove = [
        cid
        for cid, c in root["conversations"].items()
        if len(c.get("messages", [])) == 0
    ]
    for cid in to_remove:
        del root["conversations"][cid]
    if to_remove:
        _write_root(root)
    return len(to_remove)
