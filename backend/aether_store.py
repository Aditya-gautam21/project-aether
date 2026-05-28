"""File-backed Life OS state (JSON)."""
from __future__ import annotations

import copy
import json
import os
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List

from default_aether_state import DEFAULT_AETHER_STATE

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
AETHER_PATH = os.path.join(DATA_DIR, "aether-store.json")


def _ensure_dir() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)


def _compute_streak(logs: List[str]) -> int:
    """Calculate current streak from a sorted list of YYYY-MM-DD log strings."""
    if not logs:
        return 0
    unique = sorted(set(logs), reverse=True)  # newest first
    today = date.today().isoformat()
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    streak = 0
    expected = today
    if unique[0] != today:
        if unique[0] != yesterday:
            return 0
        expected = yesterday
    for d in unique:
        if d == expected:
            streak += 1
            expected = (date.fromisoformat(expected) - timedelta(days=1)).isoformat()
        elif d < expected:
            break
    return streak


def _compute_longest_streak(logs: List[str]) -> int:
    if not logs:
        return 0
    unique = sorted(set(logs))
    longest = 1
    current = 1
    for i in range(1, len(unique)):
        prev = date.fromisoformat(unique[i - 1])
        cur = date.fromisoformat(unique[i])
        if (cur - prev).days == 1:
            current += 1
        else:
            longest = max(longest, current)
            current = 1
    return max(longest, current)


def _normalize_habits(habits: list) -> list:
    """Ensure each habit has logs, streak, and longestStreak computed."""
    for h in habits:
        if "logs" not in h or not isinstance(h["logs"], list):
            h["logs"] = []
        logs = [l for l in h["logs"] if isinstance(l, str)]
        h["logs"] = logs
        h["streak"] = _compute_streak(logs)
        h["longestStreak"] = max(
            h.get("longestStreak", 0) or 0,
            _compute_longest_streak(logs),
        )
    return habits


def _merge_file_into_defaults(raw: Dict[str, Any]) -> Dict[str, Any]:
    out = copy.deepcopy(DEFAULT_AETHER_STATE)
    if not raw:
        return out
    for key in ("tasks", "habits", "finances", "social", "journalEntries"):
        if key in raw and isinstance(raw[key], list):
            out[key] = raw[key]
    if "wellness" in raw and isinstance(raw["wellness"], dict):
        out["wellness"] = {**out["wellness"], **raw["wellness"]}
    return out


def read_aether_state() -> Dict[str, Any]:
    _ensure_dir()
    if not os.path.isfile(AETHER_PATH):
        state = copy.deepcopy(DEFAULT_AETHER_STATE)
    else:
        try:
            with open(AETHER_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            state = _merge_file_into_defaults(data)
        except (json.JSONDecodeError, OSError):
            state = copy.deepcopy(DEFAULT_AETHER_STATE)
    state["habits"] = _normalize_habits(state.get("habits", []))
    for e in state.get("journalEntries", []):
        if not e.get("createdAt"):
            e["createdAt"] = datetime.now(timezone.utc).isoformat()
    return state


def write_aether_state(state: Dict[str, Any]) -> None:
    _ensure_dir()
    with open(AETHER_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)


def patch_aether_state(patch: Dict[str, Any]) -> Dict[str, Any]:
    current = read_aether_state()
    nxt = copy.deepcopy(current)
    for key in ("tasks", "habits", "finances", "social", "journalEntries"):
        if key in patch and patch[key] is not None:
            nxt[key] = patch[key]
    if "habits" in nxt:
        nxt["habits"] = _normalize_habits(nxt["habits"])
    if "wellness" in patch and patch["wellness"] is not None:
        nxt["wellness"] = {**nxt["wellness"], **patch["wellness"]}
    write_aether_state(nxt)
    return nxt
