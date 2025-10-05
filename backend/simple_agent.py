"""
Simplified agent that directly processes commands without complex LLM reasoning.
This is more reliable for the ZERO_SHOT_REACT_DESCRIPTION agent type.
"""

import re
from datetime import datetime, timedelta
from tools import book_appointment, get_events, create_task, get_tasks, get_calender_service
import logging

logger = logging.getLogger(__name__)

def parse_datetime_from_text(text: str) -> tuple:
    """Extract datetime information from casual text."""
    now = datetime.now()
    text_lower = text.lower()
    
    # Determine target date
    if "tomorrow" in text_lower:
        target_date = now + timedelta(days=1)
    elif "today" in text_lower:
        target_date = now
    elif "next monday" in text_lower:
        days_ahead = 0 - now.weekday() + 7
        target_date = now + timedelta(days=days_ahead)
    elif "next tuesday" in text_lower:
        days_ahead = 1 - now.weekday() + 7
        target_date = now + timedelta(days=days_ahead)
    elif "next wednesday" in text_lower:
        days_ahead = 2 - now.weekday() + 7
        target_date = now + timedelta(days=days_ahead)
    elif "next thursday" in text_lower:
        days_ahead = 3 - now.weekday() + 7
        target_date = now + timedelta(days=days_ahead)
    elif "next friday" in text_lower:
        days_ahead = 4 - now.weekday() + 7
        target_date = now + timedelta(days=days_ahead)
    else:
        # Try to find ISO date
        iso_date_match = re.search(r'(\d{4}-\d{2}-\d{2})', text)
        if iso_date_match:
            target_date = datetime.fromisoformat(iso_date_match.group(1))
        else:
            target_date = now
    
    # Extract time
    hour = 10  # default
    minute = 0
    
    # Try patterns
    time_match = re.search(r'(\d{1,2}):(\d{2})\s*(am|pm)?', text_lower)
    if time_match:
        hour = int(time_match.group(1))
        minute = int(time_match.group(2))
        if time_match.group(3) == 'pm' and hour < 12:
            hour += 12
        elif time_match.group(3) == 'am' and hour == 12:
            hour = 0
    else:
        time_match = re.search(r'(\d{1,2})\s*(am|pm)', text_lower)
        if time_match:
            hour = int(time_match.group(1))
            if time_match.group(2) == 'pm' and hour < 12:
                hour += 12
            elif time_match.group(2) == 'am' and hour == 12:
                hour = 0
        else:
            time_match = re.search(r'at\s+(\d{1,2})', text_lower)
            if time_match:
                hour = int(time_match.group(1))
    
    start_dt = target_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
    end_dt = start_dt + timedelta(hours=1)
    
    return start_dt.isoformat(), end_dt.isoformat()

def simple_automate(command: str) -> str:
    """Process command directly without complex agent reasoning."""
    try:
        command_lower = command.lower()
        
        # Detect intent
        if any(word in command_lower for word in ["book", "schedule", "create event", "create meeting", "set up"]):
            # Book appointment
            try:
                start_iso, end_iso = parse_datetime_from_text(command)
                
                # Extract title
                title = "Meeting"
                for keyword in ["dentist", "doctor", "team", "client", "standup", "review", "interview"]:
                    if keyword in command_lower:
                        title = keyword.capitalize() + " " + ("Appointment" if keyword in ["dentist", "doctor"] else "Meeting")
                        break
                
                # Extract emails
                email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
                emails = re.findall(email_pattern, command)
                
                # Format for tool
                tool_input = f"{title} | {start_iso} | {end_iso} | {','.join(emails)}"
                result = book_appointment.invoke(tool_input)
                return result
                
            except Exception as e:
                logger.error(f"Error booking appointment: {e}")
                return f"❌ Could not book appointment. Please try: 'book a meeting tomorrow at 10 AM'"
        
        elif any(word in command_lower for word in ["show", "list", "view", "what", "get", "display"]) and any(word in command_lower for word in ["event", "calendar", "schedule", "meeting"]):
            # Get events
            try:
                # Extract date
                if "today" in command_lower:
                    date_str = "today"
                elif "tomorrow" in command_lower:
                    date_str = "tomorrow"
                else:
                    iso_date_match = re.search(r'(\d{4}-\d{2}-\d{2})', command)
                    if iso_date_match:
                        date_str = iso_date_match.group(1)
                    else:
                        date_str = "today"
                
                result = get_events.invoke(date_str)
                return result
                
            except Exception as e:
                logger.error(f"Error getting events: {e}")
                return f"❌ Could not fetch events. Please try: 'show my events for today'"
        
        elif any(word in command_lower for word in ["create", "add", "make"]) and "task" in command_lower:
            # Create task
            try:
                result = create_task.invoke(command)
                return result
                
            except Exception as e:
                logger.error(f"Error creating task: {e}")
                return f"❌ Could not create task. Please try: 'create a task to review code'"
        
        elif any(word in command_lower for word in ["show", "list", "view", "get", "display"]) and "task" in command_lower:
            # Get tasks
            try:
                result = get_tasks.invoke(command)
                return result
                
            except Exception as e:
                logger.error(f"Error getting tasks: {e}")
                return f"❌ Could not fetch tasks. Please try: 'show my tasks'"
        
        else:
            return "I'm not sure what you want to do. Try:\n• 'book a meeting tomorrow at 10'\n• 'show my events for today'\n• 'create a task to review code'\n• 'show my tasks'"
    
    except Exception as e:
        logger.error(f"Error in simple_automate: {e}")
        return f"❌ Error: {str(e)}"
