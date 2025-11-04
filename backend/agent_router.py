import os
import logging
from typing import Any, Dict, List, Optional

from datetime import datetime

logger = logging.getLogger(__name__)

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except Exception:
    OPENAI_AVAILABLE = False


def _get_tools_spec() -> List[Dict[str, Any]]:
    return [
        {
            "type": "function",
            "function": {
                "name": "book_appointment",
                "description": "Book an appointment on Google Calendar. Input format: 'TITLE | START_ISO | END_ISO | EMAILS'",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "input_str": {"type": "string"}
                    },
                    "required": ["input_str"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_events",
                "description": "Get calendar events for a date like 'today', 'tomorrow', or 'YYYY-MM-DD'",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "date_str": {"type": "string"}
                    },
                    "required": ["date_str"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "create_task",
                "description": "Create a task with optional priority language in the description",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_description": {"type": "string"}
                    },
                    "required": ["task_description"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_tasks",
                "description": "List tasks, optionally filtered by 'pending', 'completed', 'high'",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "nullable": True}
                    }
                }
            }
        }
    ]


def _call_tool(tool_name: str, args: Dict[str, Any]) -> str:
    try:
        from .tools import book_appointment, get_events, create_task, get_tasks
    except Exception:
        # Fallback if tools not importable
        return "Tools are not available. Please ensure backend/tools.py is accessible."

    if tool_name == "book_appointment":
        return book_appointment(args.get("input_str", ""))
    if tool_name == "get_events":
        return get_events(args.get("date_str", ""))
    if tool_name == "create_task":
        return create_task(args.get("task_description", ""))
    if tool_name == "get_tasks":
        return get_tasks(args.get("query", ""))
    return f"Unknown tool: {tool_name}"


SYSTEM_PROMPT = (
    "You are Aether, a smart productivity assistant. "
    "Understand the user's intent and either respond helpfully or call a tool. "
    "When scheduling, extract a good title, infer times, and include attendees when given. "
    "Prefer concise, friendly responses. If you need more info, ask a direct follow-up question."
)


def run_agent(message: str, chat_id: Optional[str] = None) -> str:
    """LLM-backed intent router with tool-calling. Returns a final text response."""
    if not OPENAI_AVAILABLE or not os.getenv("OPENAI_API_KEY"):
        # Fallback: use legacy rule-based agent
        try:
            from .agents import automate_task
            return automate_task(message)
        except Exception:
            return f"I received your request: {message}. Configure OPENAI_API_KEY to enable advanced reasoning."

    client = OpenAI()

    tools_spec = _get_tools_spec()

    messages: List[Dict[str, str]] = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": message},
    ]

    for _ in range(3):
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=messages,
            tools=tools_spec,
            tool_choice="auto",
            temperature=0.2,
        )

        choice = response.choices[0]
        msg = choice.message

        if msg.tool_calls:
            # Take the first tool call (sequentially handle multiple if present)
            tool_call = msg.tool_calls[0]
            tool_name = tool_call.function.name
            import json
            try:
                args = json.loads(tool_call.function.arguments or "{}")
            except Exception:
                args = {}
            tool_result = _call_tool(tool_name, args)

            # Feed tool result back to the model
            messages.append({"role": "user", "content": message}) if len(messages) == 1 else None
            messages.append({"role": "assistant", "content": msg.content or "", "tool_calls": []})
            messages.append({
                "role": "tool",
                "content": tool_result,
                "name": tool_name,
            })
            # Continue loop to let model produce final response
            continue

        return msg.content or "(No response)"

    # If we somehow looped without a final message
    return "I couldn't complete that. Could you rephrase or provide more details?"


