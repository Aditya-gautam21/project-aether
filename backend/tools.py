import os
import datetime
import json
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from langchain.tools import tool

SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_calender_service():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)

        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return build('calendar', 'v3', credentials=creds)

@tool
def book_appointment(input_str: str) -> str:
    """Book an appointment on Google Calendar. 
    Use this tool when the user wants to schedule, book, or create a calendar event/meeting/appointment.
    
    The input should contain meeting details. You MUST extract and format:
    - Meeting title/summary (what is the meeting about)
    - Start date and time in ISO format: YYYY-MM-DDTHH:MM:SS
    - End date and time in ISO format: YYYY-MM-DDTHH:MM:SS
    - Attendee emails (optional)
    
    For casual inputs like "book a meeting tomorrow at 10":
    1. Infer the meeting title (e.g., "Meeting")
    2. Calculate tomorrow's date and format as ISO (e.g., 2025-10-05T10:00:00)
    3. Default to 1 hour duration (e.g., end at 2025-10-05T11:00:00)
    
    Format your input as: "TITLE | START_ISO | END_ISO | EMAILS"
    Example: "Team Standup | 2025-10-05T10:00:00 | 2025-10-05T11:00:00 | john@example.com"
    """
    try:
        import re
        from datetime import datetime, timedelta
        
        # Parse the formatted input from the agent
        parts = input_str.split('|')
        
        if len(parts) >= 3:
            # Agent provided structured format
            summary = parts[0].strip()
            start_time = parts[1].strip()
            end_time = parts[2].strip()
            emails = []
            if len(parts) > 3 and parts[3].strip():
                emails = [e.strip() for e in parts[3].split(',')]
        else:
            # Fallback: try to parse unstructured input
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            emails = re.findall(email_pattern, input_str)
            
            iso_pattern = r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}'
            times = re.findall(iso_pattern, input_str)
            
            if len(times) >= 2:
                start_time = times[0]
                end_time = times[1]
                summary = input_str.split(times[0])[0].strip() or "Meeting"
            elif len(times) == 1:
                start_time = times[0]
                start_dt = datetime.fromisoformat(start_time)
                end_dt = start_dt + timedelta(hours=1)
                end_time = end_dt.isoformat()
                summary = input_str.split(times[0])[0].strip() or "Meeting"
            else:
                return "❌ I need more information. Please provide the date and time in format like '2025-10-05T10:00:00' or tell me 'tomorrow at 10 AM' and I'll format it."
        
        # Validate ISO format
        try:
            datetime.fromisoformat(start_time)
            datetime.fromisoformat(end_time)
        except:
            return f"❌ Invalid time format. Please use ISO format: YYYY-MM-DDTHH:MM:SS"
        
        service = get_calender_service()
        attendee_list = [{'email': email} for email in emails if email]
        
        event = {
            'summary': summary,
            'start': {'dateTime': start_time, 'timeZone': 'Asia/Kolkata'},
            'end': {'dateTime': end_time, 'timeZone': 'Asia/Kolkata'},
            'attendees': attendee_list
        }
        event = service.events().insert(calendarId='primary', body=event).execute()
        
        attendee_info = f" with {', '.join(emails)}" if emails else ""
        return f"✅ Appointment '{summary}' booked successfully from {start_time} to {end_time}{attendee_info}! Link: {event.get('htmlLink')}"
    except Exception as e:
        return f"❌ Failed to book appointment: {str(e)}"

@tool
def get_events(date_str: str) -> str:
    """Get calendar events for a specific date.
    Use this tool when user wants to see, view, list, or check their calendar events.
    
    Input can be:
    - 'today' or 'today's events'
    - 'tomorrow'
    - A specific date in ISO format: '2025-10-05'
    - Casual reference like 'next monday'
    
    You should convert casual date references to ISO format (YYYY-MM-DD) before calling this tool.
    """
    try:
        from datetime import datetime as dt, timedelta
        import re
        
        date_str_lower = date_str.lower()
        
        # Handle casual date references
        if 'today' in date_str_lower:
            date = dt.now().date().isoformat()
        elif 'tomorrow' in date_str_lower:
            date = (dt.now() + timedelta(days=1)).date().isoformat()
        else:
            # Extract date from string
            date_pattern = r'\d{4}-\d{2}-\d{2}'
            dates = re.findall(date_pattern, date_str)
            if dates:
                date = dates[0]
            else:
                # Default to today if can't parse
                date = dt.now().date().isoformat()
        
        service = get_calender_service()
        start_time = datetime.datetime.fromisoformat(date).isoformat() + 'Z'
        events_result = service.events().list(
            calendarId='primary', 
            timeMin=start_time, 
            maxResults=10, 
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        events = events_result.get('items', [])
        
        if not events:
            return f"📅 No events found for {date}"
        
        event_list = [f"📅 Events for {date}:"]
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            event_list.append(f"• {event['summary']} at {start}")
        
        return "\n".join(event_list)
    except Exception as e:
        return f"❌ Failed to fetch events: {str(e)}"

@tool
def create_task(task_description: str) -> str:
    """Create a new task in the task list.
    Input should be a task description, optionally including priority (high, medium, low).
    Example: 'high priority task to review code' or 'update documentation'
    """
    try:
        # Extract priority from description
        priority = "medium"
        task_name = task_description
        
        if "high priority" in task_description.lower():
            priority = "high"
            task_name = task_description.lower().replace("high priority", "").strip()
        elif "low priority" in task_description.lower():
            priority = "low"
            task_name = task_description.lower().replace("low priority", "").strip()
        elif "medium priority" in task_description.lower():
            priority = "medium"
            task_name = task_description.lower().replace("medium priority", "").strip()
        
        # Clean up task name
        task_name = task_name.replace("task to", "").replace("task:", "").strip()
        
        tasks_file = 'tasks.json'
        tasks = []
        if os.path.exists(tasks_file):
            with open(tasks_file, 'r') as f:
                tasks = json.load(f)
        
        new_task = {
            'id': len(tasks) + 1,
            'name': task_name,
            'priority': priority,
            'status': 'pending',
            'created_at': datetime.datetime.now().isoformat()
        }
        tasks.append(new_task)
        
        with open(tasks_file, 'w') as f:
            json.dump(tasks, f, indent=2)
        
        return f"✅ Task '{task_name}' created with {priority} priority"
    except Exception as e:
        return f"❌ Failed to create task: {str(e)}"

@tool
def get_tasks(query: str = "") -> str:
    """Get all tasks from the task list.
    Input can be empty or contain filters like 'pending', 'completed', 'high priority'.
    """
    try:
        tasks_file = 'tasks.json'
        if not os.path.exists(tasks_file):
            return "No tasks found. Create your first task!"
        
        with open(tasks_file, 'r') as f:
            tasks = json.load(f)
        
        if not tasks:
            return "No tasks found."
        
        # Filter tasks based on query
        filtered_tasks = tasks
        if query:
            query_lower = query.lower()
            if "pending" in query_lower:
                filtered_tasks = [t for t in tasks if t['status'] == 'pending']
            elif "completed" in query_lower:
                filtered_tasks = [t for t in tasks if t['status'] == 'completed']
            elif "high" in query_lower:
                filtered_tasks = [t for t in tasks if t['priority'] == 'high']
        
        if not filtered_tasks:
            return f"No tasks found matching '{query}'"
        
        task_list = ["📋 Your Tasks:"]
        for task in filtered_tasks:
            status_icon = "✅" if task['status'] == 'completed' else "⏳"
            task_list.append(f"{status_icon} [{task['priority'].upper()}] {task['name']}")
        
        return "\n".join(task_list)
    except Exception as e:
        return f"❌ Failed to fetch tasks: {str(e)}"

if __name__ == "__main__":
    details = {
        'summary': 'Test Meeting',
        'start_time': '2025-10-02T14:00:00',
        'end_time': '2025-10-02T15:00:00',
        'attendees': ['example@email.com']
    }
    print(book_appointment(details))
    print(get_events('2025-10-02'))