import os
import datetime
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
def book_appointment(details: dict) -> str:
    service = get_calender_service()
    event = {
        'summary': details.get('summary', 'Appointment'),
        'start': {'dateTime': details['start_time'], 'timeZone': 'Asia/Kolkata'},
        'end': {'dateTime': details['end_time'], 'timeZone': 'Asia/Kolkata'},
        'attendees': [{'email': email} for email in details.get('attendees', [])]
    }
    event = service.events().insert(calendarId='primary', body=event).execute()
    return f"Appointment booked: {event.get('htmlLink')}"

@tool
def get_events(date: str):
    service = get_calender_service()
    start_time = datetime.datetime.fromisoformat(date).isoformat() + 'Z'
    events_result = service.events().list(calendarId='primary', timeMin=start_time, maxResults=10, singleEvents=True).execute()
    events = events_result.get('items', [])
    return [f"{event['summary']} at {event['start'].get('dateTime')}" for event in events]

if __name__ == "__main__":
    details = {
        'summary': 'Test Meeting',
        'start_time': '2025-10-02T14:00:00',
        'end_time': '2025-10-02T15:00:00',
        'attendees': ['example@email.com']
    }
    print(book_appointment(details))
    print(get_events('2025-10-02'))