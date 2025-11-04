"""Enhanced tools with better error handling and features"""
import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from sqlalchemy.orm import Session
from models import Task, CalendarEvent, User
from database import get_db
import re

logger = logging.getLogger(__name__)

SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
]

class CalendarService:
    def __init__(self):
        self.service = None
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize Google Calendar service"""
        try:
            creds = None
            if os.path.exists('token.json'):
                creds = Credentials.from_authorized_user_file('token.json', SCOPES)
            
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    if os.path.exists('credentials.json'):
                        flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                        creds = flow.run_local_server(port=0)
                    else:
                        logger.warning("Google Calendar credentials not found")
                        return
                
                with open('token.json', 'w') as token:
                    token.write(creds.to_json())
            
            self.service = build('calendar', 'v3', credentials=creds)
            logger.info("Google Calendar service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Google Calendar service: {e}")
    
    def is_available(self) -> bool:
        """Check if calendar service is available"""
        return self.service is not None

class EnhancedCalendarTools:
    def __init__(self):
        self.calendar_service = CalendarService()
    
    def parse_datetime_natural(self, text: str) -> tuple[datetime, datetime]:
        """Parse natural language datetime with better accuracy"""
        now = datetime.now()
        text_lower = text.lower()
        
        # Date parsing
        if "tomorrow" in text_lower:
            target_date = now + timedelta(days=1)
        elif "today" in text_lower:
            target_date = now
        elif "next week" in text_lower:
            target_date = now + timedelta(days=7)
        elif "monday" in text_lower:
            days_ahead = 0 - now.weekday()
            if days_ahead <= 0:
                days_ahead += 7
            target_date = now + timedelta(days=days_ahead)
        elif "tuesday" in text_lower:
            days_ahead = 1 - now.weekday()
            if days_ahead <= 0:
                days_ahead += 7
            target_date = now + timedelta(days=days_ahead)
        # Add more day parsing...
        else:
            # Try to extract date patterns
            date_patterns = [
                r'(\d{1,2})/(\d{1,2})/(\d{4})',  # MM/DD/YYYY
                r'(\d{4})-(\d{1,2})-(\d{1,2})',  # YYYY-MM-DD
            ]
            target_date = now + timedelta(days=1)  # Default to tomorrow
        
        # Time parsing with better patterns
        time_patterns = [
            r'(\d{1,2}):(\d{2})\s*(am|pm)',
            r'(\d{1,2})\s*(am|pm)',
            r'(\d{1,2}):(\d{2})',
        ]
        
        hour, minute = 10, 0  # Default 10 AM
        
        for pattern in time_patterns:
            match = re.search(pattern, text_lower)
            if match:
                hour = int(match.group(1))
                minute = int(match.group(2)) if len(match.groups()) > 2 and match.group(2) else 0
                
                if len(match.groups()) >= 3 and match.group(3):
                    if match.group(3) == 'pm' and hour < 12:
                        hour += 12
                    elif match.group(3) == 'am' and hour == 12:
                        hour = 0
                break
        
        start_dt = target_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
        
        # Duration parsing
        duration_match = re.search(r'(\d+)\s*(hour|hr|minute|min)', text_lower)
        if duration_match:
            duration_value = int(duration_match.group(1))
            duration_unit = duration_match.group(2)
            if 'hour' in duration_unit or 'hr' in duration_unit:
                end_dt = start_dt + timedelta(hours=duration_value)
            else:
                end_dt = start_dt + timedelta(minutes=duration_value)
        else:
            end_dt = start_dt + timedelta(hours=1)  # Default 1 hour
        
        return start_dt, end_dt
    
    def book_meeting(self, input_str: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Enhanced meeting booking with better parsing and validation"""
        try:
            if not self.calendar_service.is_available():
                return {
                    'success': False,
                    'message': '❌ Google Calendar is not configured. Please set up credentials.json',
                    'error_type': 'configuration'
                }
            
            # Parse input
            parts = input_str.split('|') if '|' in input_str else [input_str]
            
            if len(parts) >= 3:
                # Structured format
                title = parts[0].strip()
                start_time_str = parts[1].strip()
                end_time_str = parts[2].strip()
                emails = []
                if len(parts) > 3 and parts[3].strip():
                    emails = [e.strip() for e in parts[3].split(',')]
                
                try:
                    start_dt = datetime.fromisoformat(start_time_str)
                    end_dt = datetime.fromisoformat(end_time_str)
                except ValueError:
                    return {
                        'success': False,
                        'message': '❌ Invalid time format. Use ISO format: YYYY-MM-DDTHH:MM:SS',
                        'error_type': 'validation'
                    }
            else:
                # Natural language parsing
                start_dt, end_dt = self.parse_datetime_natural(input_str)
                
                # Extract title
                title_words = []
                for word in input_str.split():
                    if word.lower() not in ['book', 'schedule', 'create', 'meeting', 'appointment', 'at', 'on', 'with', 'tomorrow', 'today']:
                        if not re.match(r'\d+', word) and '@' not in word:
                            title_words.append(word)
                
                title = ' '.join(title_words) if title_words else 'Meeting'
                
                # Extract emails
                emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', input_str)
            
            # Validate future time
            if start_dt <= datetime.now():
                return {
                    'success': False,
                    'message': '❌ Cannot schedule meetings in the past. Please choose a future time.',
                    'error_type': 'validation'
                }
            
            # Check for conflicts
            conflicts = self._check_conflicts(start_dt, end_dt)
            if conflicts:
                return {
                    'success': False,
                    'message': f'⚠️ Time conflict detected with: {conflicts[0]["summary"]}. Please choose a different time.',
                    'error_type': 'conflict',
                    'conflicts': conflicts
                }
            
            # Create event
            attendees = [{'email': email} for email in emails if email]
            
            event = {
                'summary': title,
                'description': f'Meeting created via Aether AI Assistant',
                'start': {
                    'dateTime': start_dt.isoformat(),
                    'timeZone': 'UTC'
                },
                'end': {
                    'dateTime': end_dt.isoformat(),
                    'timeZone': 'UTC'
                },
                'attendees': attendees,
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                        {'method': 'popup', 'minutes': 15},       # 15 minutes before
                    ],
                },
            }
            
            created_event = self.calendar_service.service.events().insert(
                calendarId='primary', 
                body=event
            ).execute()
            
            # Save to database
            if user_id:
                self._save_event_to_db(created_event, user_id)
            
            attendee_info = f" with {', '.join(emails)}" if emails else ""
            
            return {
                'success': True,
                'message': f'✅ Meeting "{title}" scheduled for {start_dt.strftime("%B %d, %Y at %I:%M %p")}{attendee_info}',
                'event': {
                    'id': created_event['id'],
                    'title': title,
                    'start_time': start_dt.isoformat(),
                    'end_time': end_dt.isoformat(),
                    'attendees': emails,
                    'link': created_event.get('htmlLink')
                }
            }
            
        except Exception as e:
            logger.error(f"Error booking meeting: {e}")
            return {
                'success': False,
                'message': f'❌ Failed to book meeting: {str(e)}',
                'error_type': 'system'
            }
    
    def _check_conflicts(self, start_dt: datetime, end_dt: datetime) -> List[Dict]:
        """Check for calendar conflicts"""
        try:
            if not self.calendar_service.is_available():
                return []
            
            events_result = self.calendar_service.service.events().list(
                calendarId='primary',
                timeMin=start_dt.isoformat() + 'Z',
                timeMax=end_dt.isoformat() + 'Z',
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            conflicts = []
            
            for event in events:
                event_start = event['start'].get('dateTime', event['start'].get('date'))
                event_end = event['end'].get('dateTime', event['end'].get('date'))
                
                conflicts.append({
                    'summary': event.get('summary', 'Untitled Event'),
                    'start': event_start,
                    'end': event_end
                })
            
            return conflicts
            
        except Exception as e:
            logger.error(f"Error checking conflicts: {e}")
            return []
    
    def _save_event_to_db(self, event: Dict, user_id: str):
        """Save event to database"""
        try:
            db = next(get_db())
            
            calendar_event = CalendarEvent(
                google_event_id=event['id'],
                user_id=user_id,
                title=event.get('summary', ''),
                description=event.get('description', ''),
                start_time=datetime.fromisoformat(event['start']['dateTime'].replace('Z', '')),
                end_time=datetime.fromisoformat(event['end']['dateTime'].replace('Z', '')),
                attendees=json.dumps([att.get('email') for att in event.get('attendees', [])]),
                location=event.get('location', '')
            )
            
            db.add(calendar_event)
            db.commit()
            
        except Exception as e:
            logger.error(f"Error saving event to database: {e}")
    
    def get_events(self, query: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get calendar events with enhanced filtering"""
        try:
            if not self.calendar_service.is_available():
                return {
                    'success': False,
                    'message': '❌ Google Calendar is not configured.',
                    'error_type': 'configuration'
                }
            
            # Parse date from query
            query_lower = query.lower()
            now = datetime.now()
            
            if 'today' in query_lower:
                start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = start_date + timedelta(days=1)
                date_label = "today"
            elif 'tomorrow' in query_lower:
                start_date = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = start_date + timedelta(days=1)
                date_label = "tomorrow"
            elif 'week' in query_lower:
                start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = start_date + timedelta(days=7)
                date_label = "this week"
            else:
                start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = start_date + timedelta(days=1)
                date_label = "today"
            
            events_result = self.calendar_service.service.events().list(
                calendarId='primary',
                timeMin=start_date.isoformat() + 'Z',
                timeMax=end_date.isoformat() + 'Z',
                maxResults=20,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            if not events:
                return {
                    'success': True,
                    'message': f'📅 No events found for {date_label}',
                    'events': []
                }
            
            formatted_events = []
            for event in events:
                start = event['start'].get('dateTime', event['start'].get('date'))
                end = event['end'].get('dateTime', event['end'].get('date'))
                
                # Format datetime
                if 'T' in start:
                    start_dt = datetime.fromisoformat(start.replace('Z', ''))
                    formatted_time = start_dt.strftime('%I:%M %p')
                else:
                    formatted_time = 'All day'
                
                formatted_events.append({
                    'title': event.get('summary', 'Untitled Event'),
                    'time': formatted_time,
                    'location': event.get('location', ''),
                    'attendees': len(event.get('attendees', [])),
                    'link': event.get('htmlLink', '')
                })
            
            event_list = [f"📅 Events for {date_label}:"]
            for event in formatted_events:
                location_info = f" at {event['location']}" if event['location'] else ""
                attendee_info = f" ({event['attendees']} attendees)" if event['attendees'] > 0 else ""
                event_list.append(f"• {event['time']} - {event['title']}{location_info}{attendee_info}")
            
            return {
                'success': True,
                'message': '\n'.join(event_list),
                'events': formatted_events
            }
            
        except Exception as e:
            logger.error(f"Error fetching events: {e}")
            return {
                'success': False,
                'message': f'❌ Failed to fetch events: {str(e)}',
                'error_type': 'system'
            }

class EnhancedTaskTools:
    def create_task(self, description: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Create task with enhanced parsing and database storage"""
        try:
            # Parse priority and due date
            priority = "medium"
            due_date = None
            task_name = description
            
            # Extract priority
            if "high priority" in description.lower():
                priority = "high"
                task_name = re.sub(r'high priority\s*', '', task_name, flags=re.IGNORECASE)
            elif "low priority" in description.lower():
                priority = "low"
                task_name = re.sub(r'low priority\s*', '', task_name, flags=re.IGNORECASE)
            elif "urgent" in description.lower():
                priority = "high"
                task_name = re.sub(r'urgent\s*', '', task_name, flags=re.IGNORECASE)
            
            # Extract due date
            due_patterns = [
                r'due\s+(tomorrow|today|next week)',
                r'by\s+(tomorrow|today|next week)',
                r'deadline\s+(tomorrow|today|next week)'
            ]
            
            for pattern in due_patterns:
                match = re.search(pattern, task_name.lower())
                if match:
                    due_text = match.group(1)
                    if due_text == 'tomorrow':
                        due_date = datetime.now() + timedelta(days=1)
                    elif due_text == 'today':
                        due_date = datetime.now()
                    elif due_text == 'next week':
                        due_date = datetime.now() + timedelta(days=7)
                    
                    task_name = re.sub(pattern, '', task_name, flags=re.IGNORECASE)
                    break
            
            # Clean up task name
            task_name = re.sub(r'task\s+to\s+', '', task_name, flags=re.IGNORECASE)
            task_name = re.sub(r'create\s+', '', task_name, flags=re.IGNORECASE)
            task_name = task_name.strip()
            
            if not task_name:
                return {
                    'success': False,
                    'message': '❌ Please provide a task description',
                    'error_type': 'validation'
                }
            
            # Save to database if user_id provided
            if user_id:
                db = next(get_db())
                task = Task(
                    user_id=user_id,
                    title=task_name,
                    description=description,
                    priority=priority,
                    due_date=due_date
                )
                db.add(task)
                db.commit()
                task_id = task.id
            else:
                # Fallback to JSON file
                tasks_file = 'tasks.json'
                tasks = []
                if os.path.exists(tasks_file):
                    with open(tasks_file, 'r') as f:
                        tasks = json.load(f)
                
                task_id = len(tasks) + 1
                new_task = {
                    'id': task_id,
                    'title': task_name,
                    'description': description,
                    'priority': priority,
                    'status': 'pending',
                    'due_date': due_date.isoformat() if due_date else None,
                    'created_at': datetime.now().isoformat()
                }
                tasks.append(new_task)
                
                with open(tasks_file, 'w') as f:
                    json.dump(tasks, f, indent=2)
            
            due_info = f" (due {due_date.strftime('%B %d')})" if due_date else ""
            priority_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}[priority]
            
            return {
                'success': True,
                'message': f'✅ Task created: "{task_name}" {priority_emoji} {priority} priority{due_info}',
                'task': {
                    'id': task_id,
                    'title': task_name,
                    'priority': priority,
                    'due_date': due_date.isoformat() if due_date else None
                }
            }
            
        except Exception as e:
            logger.error(f"Error creating task: {e}")
            return {
                'success': False,
                'message': f'❌ Failed to create task: {str(e)}',
                'error_type': 'system'
            }
    
    def get_tasks(self, query: str = "", user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get tasks with enhanced filtering"""
        try:
            tasks = []
            
            if user_id:
                # Get from database
                db = next(get_db())
                db_tasks = db.query(Task).filter(Task.user_id == user_id).all()
                tasks = [
                    {
                        'id': task.id,
                        'title': task.title,
                        'priority': task.priority,
                        'status': task.status,
                        'due_date': task.due_date.isoformat() if task.due_date else None,
                        'created_at': task.created_at.isoformat()
                    }
                    for task in db_tasks
                ]
            else:
                # Fallback to JSON file
                tasks_file = 'tasks.json'
                if os.path.exists(tasks_file):
                    with open(tasks_file, 'r') as f:
                        tasks = json.load(f)
            
            if not tasks:
                return {
                    'success': True,
                    'message': '📋 No tasks found. Create your first task!',
                    'tasks': []
                }
            
            # Filter tasks
            filtered_tasks = tasks
            if query:
                query_lower = query.lower()
                if "pending" in query_lower:
                    filtered_tasks = [t for t in tasks if t['status'] == 'pending']
                elif "completed" in query_lower:
                    filtered_tasks = [t for t in tasks if t['status'] == 'completed']
                elif "high" in query_lower:
                    filtered_tasks = [t for t in tasks if t['priority'] == 'high']
                elif "overdue" in query_lower:
                    now = datetime.now()
                    filtered_tasks = [
                        t for t in tasks 
                        if t.get('due_date') and datetime.fromisoformat(t['due_date']) < now
                    ]
            
            if not filtered_tasks:
                return {
                    'success': True,
                    'message': f'📋 No tasks found matching "{query}"',
                    'tasks': []
                }
            
            # Format task list
            task_list = ["📋 Your Tasks:"]
            priority_emojis = {"high": "🔴", "medium": "🟡", "low": "🟢"}
            status_emojis = {"pending": "⏳", "in_progress": "🔄", "completed": "✅"}
            
            for task in filtered_tasks:
                priority_emoji = priority_emojis.get(task['priority'], '⚪')
                status_emoji = status_emojis.get(task['status'], '❓')
                
                due_info = ""
                if task.get('due_date'):
                    due_date = datetime.fromisoformat(task['due_date'])
                    if due_date.date() == datetime.now().date():
                        due_info = " (due today)"
                    elif due_date.date() == (datetime.now() + timedelta(days=1)).date():
                        due_info = " (due tomorrow)"
                    elif due_date < datetime.now():
                        due_info = " (overdue)"
                
                task_list.append(f"{status_emoji} {priority_emoji} {task['title']}{due_info}")
            
            return {
                'success': True,
                'message': '\n'.join(task_list),
                'tasks': filtered_tasks
            }
            
        except Exception as e:
            logger.error(f"Error fetching tasks: {e}")
            return {
                'success': False,
                'message': f'❌ Failed to fetch tasks: {str(e)}',
                'error_type': 'system'
            }

# Global instances
calendar_tools = EnhancedCalendarTools()
task_tools = EnhancedTaskTools()

# Legacy function wrappers for backward compatibility
def book_appointment(input_str: str) -> str:
    result = calendar_tools.book_meeting(input_str)
    return result['message']

def get_events(query: str) -> str:
    result = calendar_tools.get_events(query)
    return result['message']

def create_task(description: str) -> str:
    result = task_tools.create_task(description)
    return result['message']

def get_tasks(query: str = "") -> str:
    result = task_tools.get_tasks(query)
    return result['message']