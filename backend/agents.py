import logging
from datetime import datetime, timedelta
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def handle_general_chat(message: str) -> str:
    """Handle general chat messages and questions"""
    message_lower = message.lower()
    
    # Greetings
    if any(word in message_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']):
        return "Hello! I'm your AI assistant. I can help you with booking meetings, creating tasks, managing your calendar, and answering questions. How can I assist you today?"
    
    # About the assistant
    if any(word in message_lower for word in ['what are you', 'who are you', 'what can you do']):
        return "I'm an AI assistant that specializes in productivity and automation. I can help you:\n• Book meetings and appointments\n• Create and manage tasks\n• View calendar events\n• Answer questions and have conversations\n\nWhat would you like to do?"
    
    # How questions
    if message_lower.startswith('how'):
        if 'meeting' in message_lower or 'appointment' in message_lower:
            return "To book a meeting, just tell me: 'Book a [meeting name] on [date] at [time] with [email]'\n\nExample: 'Book a team standup tomorrow at 2 PM with john@example.com'"
        elif 'task' in message_lower:
            return "To create a task, just say: 'Create a [priority] task to [description]'\n\nExample: 'Create a high priority task to review the project proposal'"
        else:
            return "I can help you with various tasks! Try asking me to book meetings, create tasks, or view your calendar. You can also ask me questions and I'll do my best to help."
    
    # What questions
    if message_lower.startswith('what'):
        return "I can help you with productivity tasks like scheduling, task management, and general questions. What specific thing would you like to know about?"
    
    # Thank you
    if any(word in message_lower for word in ['thank', 'thanks']):
        return "You're welcome! I'm here to help whenever you need assistance with your tasks and schedule."
    
    # General questions - provide helpful response
    return f"I understand you're asking about: '{message}'. While I specialize in calendar and task management, I'm happy to help! Could you provide more details or let me know if you'd like to book a meeting or create a task instead?"

def parse_datetime(text: str) -> tuple:
    """Parse casual datetime from text"""
    now = datetime.now()
    text_lower = text.lower()
    
    # Handle date
    if "tomorrow" in text_lower:
        target_date = now + timedelta(days=1)
    elif "today" in text_lower:
        target_date = now
    else:
        target_date = now + timedelta(days=1)  # default to tomorrow
    
    # Handle time
    time_match = re.search(r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)?', text_lower)
    if time_match:
        hour = int(time_match.group(1))
        minute = int(time_match.group(2)) if time_match.group(2) else 0
        if time_match.group(3) == 'pm' and hour < 12:
            hour += 12
        elif time_match.group(3) == 'am' and hour == 12:
            hour = 0
    else:
        hour, minute = 10, 0  # default 10 AM
    
    start_dt = target_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
    end_dt = start_dt + timedelta(hours=1)
    
    return start_dt.isoformat(), end_dt.isoformat()

def automate_task(command: str) -> str:
    """Agent function that processes user commands and executes tools."""
    try:
        logger.info(f"Processing command: {command}")
        command_lower = command.lower()
        
        # Import tools with fallback
        try:
            from tools import book_appointment, get_events, create_task, get_tasks
            tools_available = True
        except ImportError:
            tools_available = False
        
        # Handle general chat/questions first
        if not any(keyword in command_lower for keyword in ['book', 'create', 'show', 'list', 'schedule', 'task', 'meeting', 'appointment', 'event', 'calendar']):
            return handle_general_chat(command)
        
        # Book meeting/appointment
        if "book" in command_lower and ("meeting" in command_lower or "appointment" in command_lower):
            # Check for missing details
            missing_details = []
            
            # Check for time
            has_time = any(word in command_lower for word in ['tomorrow', 'today', 'am', 'pm', ':', 'at']) or re.search(r'\d{1,2}', command)
            if not has_time:
                missing_details.append("⏰ What time would you like to schedule it?")
            
            # Check for attendees
            has_attendees = '@' in command or any(word in command_lower for word in ['with', 'attendees', 'invite'])
            if not has_attendees:
                missing_details.append("👥 Who should I invite? (provide email addresses)")
            
            # Check for meeting purpose/title
            has_purpose = len(command.replace('book', '').replace('meeting', '').replace('appointment', '').strip()) > 10
            if not has_purpose:
                missing_details.append("📝 What's the meeting about? (meeting title/purpose)")
            
            if missing_details:
                return f"I'd be happy to book that meeting! I need a few more details:\n\n" + "\n".join(missing_details) + "\n\nExample: 'Book a project review meeting tomorrow at 2 PM with john@example.com'"
            
            if not tools_available:
                start_iso, end_iso = parse_datetime(command)
                return f"✅ Meeting scheduled for {start_iso} to {end_iso}. (Google Calendar integration needs setup - check credentials.json)"
            
            try:
                title = "Meeting"
                if "meeting" in command_lower:
                    parts = command.split("meeting")
                    if len(parts) > 1 and parts[0].strip():
                        title = parts[0].strip().replace("book", "").replace("a", "").strip() + " Meeting"
                
                start_iso, end_iso = parse_datetime(command)
                emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', command)
                email_str = ",".join(emails) if emails else ""
                
                tool_input = f"{title} | {start_iso} | {end_iso} | {email_str}"
                return book_appointment(tool_input)
            except Exception as e:
                return f"❌ Error booking meeting: {str(e)}"
        
        # Create task
        elif "create" in command_lower and "task" in command_lower:
            if not tools_available:
                task_name = command.replace("create", "").replace("task", "").replace("to", "").strip()
                return f"✅ Task '{task_name}' created successfully! (Task storage needs setup)"
            
            try:
                return create_task(command)
            except Exception as e:
                return f"❌ Error creating task: {str(e)}"
        
        # Show/list tasks
        elif ("show" in command_lower or "list" in command_lower) and "task" in command_lower:
            try:
                return get_tasks(command)
            except Exception as e:
                return f"❌ Error fetching tasks: {str(e)}"
        
        # Show/list events
        elif ("show" in command_lower or "list" in command_lower) and ("event" in command_lower or "calendar" in command_lower):
            try:
                return get_events(command)
            except Exception as e:
                return f"❌ Error fetching events: {str(e)}"
        
        # Help
        elif "help" in command_lower:
            return """I can help you with:
• Book meetings: "book a meeting tomorrow at 2 PM"
• Create tasks: "create a high priority task to review code"
• View calendar: "show my events for today"
• List tasks: "show all my tasks"

Just tell me what you need!"""
        
        else:
            return f"I understand you said: '{command}'. Try commands like:\n• 'book a meeting tomorrow at 2 PM'\n• 'create a task to review code'\n• 'show my events for today'\n• 'list my tasks'"
        
    except Exception as e:
        logger.error(f"Error in automate_task: {str(e)}")
        return f"❌ I encountered an error: {str(e)}. Please try again."

if __name__ == "__main__":
    test_command = "Book a team meeting tomorrow at 2 PM"
    print(automate_task(test_command))