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
def book_appointment(summary: str, start_time: str, end_time: str, attendees: str = "") -> str:
    """Book an appointment on Google Calendar. 
    Args:
        summary: Title/description of the meeting
        start_time: Start time in ISO format (e.g., '2025-10-02T14:00:00')
        end_time: End time in ISO format (e.g., '2025-10-02T15:00:00')
        attendees: Comma-separated email addresses (optional)
    """
    try:
        service = get_calender_service()
        attendee_list = [{'email': email.strip()} for email in attendees.split(',') if email.strip()]
        
        event = {
            'summary': summary,
            'start': {'dateTime': start_time, 'timeZone': 'Asia/Kolkata'},
            'end': {'dateTime': end_time, 'timeZone': 'Asia/Kolkata'},
            'attendees': attendee_list
        }
        event = service.events().insert(calendarId='primary', body=event).execute()
        return f"✅ Appointment '{summary}' booked successfully! Link: {event.get('htmlLink')}"
    except Exception as e:
        return f"❌ Failed to book appointment: {str(e)}"

@tool
def get_events(date: str) -> str:
    """Get calendar events for a specific date.
    Args:
        date: Date in ISO format (e.g., '2025-10-02')
    """
    try:
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
            return f"No events found for {date}"
        
        event_list = []
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            event_list.append(f"• {event['summary']} at {start}")
        
        return "📅 Events:\n" + "\n".join(event_list)
    except Exception as e:
        return f"❌ Failed to fetch events: {str(e)}"

@tool
def create_task(task_name: str, priority: str = "medium") -> str:
    """Create a new task in the task list.
    Args:
        task_name: Name/description of the task
        priority: Priority level (low, medium, high)
    """
    try:
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
def get_tasks() -> str:
    """Get all tasks from the task list."""
    try:
        tasks_file = 'tasks.json'
        if not os.path.exists(tasks_file):
            return "No tasks found. Create your first task!"
        
        with open(tasks_file, 'r') as f:
            tasks = json.load(f)
        
        if not tasks:
            return "No tasks found."
        
        task_list = ["📋 Your Tasks:"]
        for task in tasks:
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