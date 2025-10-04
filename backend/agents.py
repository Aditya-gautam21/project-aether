from langchain.agents import initialize_agent, AgentType
from langchain_community.llms import LlamaCpp
from langchain.prompts import PromptTemplate
import os
from dotenv import load_dotenv
import logging
from datetime import datetime, timedelta

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

llm = LlamaCpp(
    model_path=r"C:\Users\ASUS\models\Llama-3.2-3B-Instruct-f16.gguf",
    n_gpu_layers=20,
    n_batch=32,
    temperature=0.3,
    max_tokens=512,
    verbose=True,
    mmap=False
)

def parse_casual_datetime(text: str) -> str:
    """Helper function to convert casual time references to ISO format."""
    now = datetime.now()
    text_lower = text.lower()
    
    # Handle "tomorrow"
    if "tomorrow" in text_lower:
        target_date = now + timedelta(days=1)
    # Handle "today"
    elif "today" in text_lower:
        target_date = now
    # Handle "next monday", "next tuesday", etc.
    elif "next" in text_lower:
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        for i, day in enumerate(days):
            if day in text_lower:
                days_ahead = i - now.weekday()
                if days_ahead <= 0:
                    days_ahead += 7
                target_date = now + timedelta(days=days_ahead)
                break
        else:
            target_date = now
    else:
        target_date = now
    
    # Extract time
    import re
    
    # Try to find time like "10", "10am", "10:30", "2 PM", etc.
    time_patterns = [
        r'(\d{1,2}):(\d{2})\s*(am|pm)?',  # 10:30 AM
        r'(\d{1,2})\s*(am|pm)',            # 10 AM
        r'(\d{1,2})\s*(?:o\'?clock)?',     # 10 or 10 o'clock
    ]
    
    hour = 10  # default
    minute = 0
    
    for pattern in time_patterns:
        match = re.search(pattern, text_lower)
        if match:
            hour = int(match.group(1))
            if len(match.groups()) > 1 and match.group(2) and match.group(2).isdigit():
                minute = int(match.group(2))
            if len(match.groups()) > 2 and match.group(3):
                if match.group(3) == 'pm' and hour < 12:
                    hour += 12
                elif match.group(3) == 'am' and hour == 12:
                    hour = 0
            break
    
    # Create ISO datetime
    result_dt = target_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
    return result_dt.isoformat()

def automate_task(command: str) -> str:
    """Main agent function that processes user commands and executes appropriate tools."""
    try:
        from tools import book_appointment, get_events, create_task, get_tasks

        tools = [book_appointment, get_events, create_task, get_tasks]
        
        # Enhanced system prompt to help the agent understand context
        prefix = """You are a helpful AI assistant that helps users manage their calendar and tasks.

Current date and time: {current_datetime}

When users give casual commands like "book a meeting tomorrow at 10", you should:
1. Understand what they want (book an appointment)
2. Extract or infer missing information:
   - Meeting title (default to "Meeting" if not specified)
   - Date (convert "tomorrow" to actual date)
   - Time (convert "10" to "10:00 AM" or 10:00:00)
   - Duration (default to 1 hour if not specified)
3. Format the information properly for the tool

For book_appointment tool, format input as: "TITLE | START_ISO | END_ISO | EMAILS"
Example: "Meeting | 2025-10-05T10:00:00 | 2025-10-05T11:00:00 | "

You have access to the following tools:"""

        suffix = """Begin! Remember to format dates as ISO format (YYYY-MM-DDTHH:MM:SS).

Question: {input}
Thought: {agent_scratchpad}"""

        agent = initialize_agent(
            tools,
            llm,
            agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True,
            max_iterations=5,
            early_stopping_method="generate",
            handle_parsing_errors=True,
            agent_kwargs={
                'prefix': prefix.format(current_datetime=datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
                'suffix': suffix
            }
        )
        
        logger.info(f"Processing command: {command}")
        
        # Pre-process casual datetime references
        enhanced_command = command
        if any(word in command.lower() for word in ["tomorrow", "today", "next"]):
            try:
                # Try to extract and convert casual time to ISO
                start_iso = parse_casual_datetime(command)
                end_dt = datetime.fromisoformat(start_iso) + timedelta(hours=1)
                end_iso = end_dt.isoformat()
                
                # Add hint to the command
                enhanced_command = f"{command} (Hint: start={start_iso}, end={end_iso})"
                logger.info(f"Enhanced command with datetime: {enhanced_command}")
            except Exception as e:
                logger.warning(f"Could not parse casual datetime: {e}")
        
        result = agent.run(enhanced_command)
        logger.info(f"Command completed successfully")
        return result
        
    except Exception as e:
        logger.error(f"Error in automate_task: {str(e)}")
        return f"I encountered an error while processing your request: {str(e)}. Please try rephrasing your command."

if __name__ == "__main__":
    test_command = "Book a team meeting on 2025-10-02 from 2PM to 3PM with example@email.com"
    print(automate_task(test_command))
