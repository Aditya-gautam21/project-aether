"""Multi-provider streaming chat (OpenAI, Google Gemini)."""
from __future__ import annotations

import json
import logging
import os
from typing import Generator, List

import openai

logger = logging.getLogger(__name__)

OPENAI_MODELS = frozenset(
    {
        "gpt-3.5-turbo",
        "gpt-4o-mini",
        "gpt-4o",
        "gpt-4-turbo",
    }
)

GEMINI_MODELS = frozenset(
    {
        "gemini-2.0-flash",
        "gemini-2.0-flash-001",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
    }
)

DEFAULT_OPENAI = "gpt-4o-mini"
DEFAULT_GEMINI = "gemini-2.0-flash"


def sse_chunk(content: str) -> str:
    return f"data: {json.dumps({'content': content})}\n\n"


def stream_openai(
    *,
    model: str,
    system_text: str,
    messages: List[dict],
) -> Generator[str, None, None]:
    openai_messages = [{"role": m["role"], "content": m["content"]} for m in messages]
    response = openai.ChatCompletion.create(
        model=model,
        messages=[{"role": "system", "content": system_text}] + openai_messages,
        max_tokens=4096,
        temperature=0.7,
        stream=True,
    )
    for chunk in response:
        try:
            delta = chunk.choices[0].delta
            piece = getattr(delta, "content", None) if delta is not None else None
            if piece:
                yield sse_chunk(piece)
        except (AttributeError, IndexError, KeyError):
            continue
    yield "data: [DONE]\n\n"


def stream_gemini(
    *,
    model: str,
    system_text: str,
    messages: List[dict],
) -> Generator[str, None, None]:
    import google.generativeai as genai

    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        yield from _error_stream("Set GOOGLE_API_KEY (or GEMINI_API_KEY) for Gemini models.")
        return

    genai.configure(api_key=api_key)

    contents: List[dict] = []
    for m in messages:
        if m.get("role") == "system":
            continue
        role = m["role"]
        if role not in ("user", "assistant"):
            continue
        gemini_role = "user" if role == "user" else "model"
        contents.append({"role": gemini_role, "parts": [m["content"]]})

    if not contents:
        yield from _error_stream("No messages to send.")
        return

    try:
        gm = genai.GenerativeModel(model_name=model, system_instruction=system_text)
        response = gm.generate_content(contents, stream=True)
        for chunk in response:
            text = getattr(chunk, "text", None)
            if text:
                yield sse_chunk(text)
                continue
            for part in getattr(chunk, "parts", None) or []:
                t = getattr(part, "text", None)
                if t:
                    yield sse_chunk(t)
        yield "data: [DONE]\n\n"
    except Exception as e:
        logger.exception("Gemini error: %s", e)
        yield from _error_stream(f"Gemini error: {e!s}")


def _error_stream(msg: str) -> Generator[str, None, None]:
    for ch in msg:
        yield sse_chunk(ch)
    yield "data: [DONE]\n\n"


def demo_stream(message: str) -> Generator[str, None, None]:
    for ch in message:
        yield sse_chunk(ch)
    yield "data: [DONE]\n\n"


def pick_default_model() -> str:
    if os.getenv("OPENAI_API_KEY"):
        return DEFAULT_OPENAI
    if os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY"):
        return DEFAULT_GEMINI
    return DEFAULT_OPENAI


def normalize_model(requested: str | None) -> str:
    if not requested:
        return pick_default_model()
    if requested in OPENAI_MODELS or requested in GEMINI_MODELS:
        return requested
    return pick_default_model()


def stream_chat(
    *,
    model: str,
    system_text: str,
    messages: List[dict],
) -> Generator[str, None, None]:
    model = normalize_model(model)

    if model in GEMINI_MODELS:
        yield from stream_gemini(model=model, system_text=system_text, messages=messages)
        return

    google_on = bool(os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY"))
    if not openai.api_key:
        if google_on:
            hint = (
                "This model needs **OPENAI_API_KEY**. Switch to a **Gemini** model in the menu, or add an OpenAI key "
                "to `backend/.env`."
            )
        else:
            hint = (
                "Add **OPENAI_API_KEY** or **GOOGLE_API_KEY** to `backend/.env` for live chat (GPT or Gemini)."
            )
        yield from demo_stream(hint)
        return

    try:
        yield from stream_openai(model=model, system_text=system_text, messages=messages)
    except Exception as e:
        logger.exception("OpenAI error: %s", e)
        yield from _error_stream(f"OpenAI error: {e!s}")


def models_catalog() -> List[dict]:
    return [
        {"id": "gpt-4o-mini", "label": "GPT-4o mini (OpenAI)", "provider": "openai"},
        {"id": "gpt-4o", "label": "GPT-4o (OpenAI)", "provider": "openai"},
        {"id": "gpt-4-turbo", "label": "GPT-4 Turbo (OpenAI)", "provider": "openai"},
        {"id": "gpt-3.5-turbo", "label": "GPT-3.5 Turbo (OpenAI)", "provider": "openai"},
        {"id": "gemini-2.0-flash", "label": "Gemini 2.0 Flash (Google)", "provider": "google"},
        {"id": "gemini-1.5-flash", "label": "Gemini 1.5 Flash (Google)", "provider": "google"},
        {"id": "gemini-1.5-pro", "label": "Gemini 1.5 Pro (Google)", "provider": "google"},
    ]
