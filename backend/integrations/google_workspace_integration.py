"""
Google Workspace Integration Module
Features:
- Gmail integration
- Google Drive file operations
- Google Docs collaboration
- Google Sheets data management
"""

import os
import json
import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow

logger = logging.getLogger(__name__)

class GoogleWorkspaceIntegration:
    def __init__(self):
        self.credentials_file = os.getenv('GOOGLE_CREDENTIALS_FILE', 'credentials.json')
        self.token_file = 'google_workspace_token.json'
        self.scopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/documents',
            'https://www.googleapis.com/auth/spreadsheets'
        ]
        self.gmail_service = None
        self.drive_service = None
        self.docs_service = None
        self.sheets_service = None
        
    def authenticate(self) -> bool:
        """Authenticate with Google Workspace APIs"""
        try:
            creds = None
            
            # Load existing token
            if os.path.exists(self.token_file):
                creds = Credentials.from_authorized_user_file(self.token_file, self.scopes)
            
            # If no valid credentials, get new ones
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    if not os.path.exists(self.credentials_file):
                        logger.error(f"Credentials file not found: {self.credentials_file}")
                        return False
                    
                    flow = InstalledAppFlow.from_client_secrets_file(
                        self.credentials_file, self.scopes)
                    creds = flow.run_local_server(port=0)
                
                # Save credentials for next run
                with open(self.token_file, 'w') as token:
                    token.write(creds.to_json())
            
            # Build services
            self.gmail_service = build('gmail', 'v1', credentials=creds)
            self.drive_service = build('drive', 'v3', credentials=creds)
            self.docs_service = build('docs', 'v1', credentials=creds)
            self.sheets_service = build('sheets', 'v4', credentials=creds)
            
            return True
            
        except Exception as e:
            logger.error(f"Google Workspace authentication error: {e}")
            return False
    
    def is_authenticated(self) -> bool:
        """Check if authenticated with Google Workspace"""
        return all([
            self.gmail_service,
            self.drive_service,
            self.docs_service,
            self.sheets_service
        ])
    
    def send_email(self, to: str, subject: str, body: str, cc: Optional[List[str]] = None) -> Dict:
        """Send an email via Gmail"""
        if not self.is_authenticated():
            if not self.authenticate():
                return {'success': False, 'error': 'Authentication failed'}
        
        try:
            import base64
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            
            message = MIMEMultipart()
            message['to'] = to
            message['subject'] = subject
            
            if cc:
                message['cc'] = ', '.join(cc)
            
            message.attach(MIMEText(body, 'html'))
            
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            
            send_message = self.gmail_service.users().messages().send(
                userId='me',
                body={'raw': raw_message}
            ).execute()
            
            return {
                'success': True,
                'message_id': send_message['id'],
                'thread_id': send_message['threadId']
            }
            
        except Exception as e:
            logger.error(f"Gmail send email error: {e}")
            return {'success': False, 'error': str(e)}
    
    def create_document(self, title: str, content: str = '') -> Dict:
        """Create a Google Doc"""
        if not self.is_authenticated():
            if not self.authenticate():
                return {'success': False, 'error': 'Authentication failed'}
        
        try:
            document = {
                'title': title
            }
            
            doc = self.docs_service.documents().create(body=document).execute()
            document_id = doc['documentId']
            
            # Add content if provided
            if content:
                requests = [
                    {
                        'insertText': {
                            'location': {
                                'index': 1
                            },
                            'text': content
                        }
                    }
                ]
                
                self.docs_service.documents().batchUpdate(
                    documentId=document_id,
                    body={'requests': requests}
                ).execute()
            
            return {
                'success': True,
                'document_id': document_id,
                'document_url': f"https://docs.google.com/document/d/{document_id}/edit"
            }
            
        except Exception as e:
            logger.error(f"Google Docs create error: {e}")
            return {'success': False, 'error': str(e)}
    
    def create_spreadsheet(self, title: str, headers: List[str] = None) -> Dict:
        """Create a Google Sheet"""
        if not self.is_authenticated():
            if not self.authenticate():
                return {'success': False, 'error': 'Authentication failed'}
        
        try:
            spreadsheet_body = {
                'properties': {
                    'title': title
                },
                'sheets': [
                    {
                        'properties': {
                            'title': 'Sheet1'
                        }
                    }
                ]
            }
            
            spreadsheet = self.sheets_service.spreadsheets().create(
                body=spreadsheet_body
            ).execute()
            
            spreadsheet_id = spreadsheet['spreadsheetId']
            
            # Add headers if provided
            if headers:
                values = [headers]
                body = {
                    'values': values
                }
                
                self.sheets_service.spreadsheets().values().update(
                    spreadsheetId=spreadsheet_id,
                    range='Sheet1!A1',
                    valueInputOption='RAW',
                    body=body
                ).execute()
            
            return {
                'success': True,
                'spreadsheet_id': spreadsheet_id,
                'spreadsheet_url': f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit"
            }
            
        except Exception as e:
            logger.error(f"Google Sheets create error: {e}")
            return {'success': False, 'error': str(e)}
    
    def upload_to_drive(self, file_path: str, name: str, folder_id: str = None) -> Dict:
        """Upload a file to Google Drive"""
        if not self.is_authenticated():
            if not self.authenticate():
                return {'success': False, 'error': 'Authentication failed'}
        
        try:
            from googleapiclient.http import MediaFileUpload
            
            file_metadata = {
                'name': name
            }
            
            if folder_id:
                file_metadata['parents'] = [folder_id]
            
            media = MediaFileUpload(file_path, resumable=True)
            
            file = self.drive_service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id'
            ).execute()
            
            return {
                'success': True,
                'file_id': file.get('id'),
                'file_url': f"https://drive.google.com/file/d/{file.get('id')}/view"
            }
            
        except Exception as e:
            logger.error(f"Google Drive upload error: {e}")
            return {'success': False, 'error': str(e)}
    
    def send_meeting_email(self, meeting_details: Dict) -> Dict:
        """Send meeting details via email"""
        to = meeting_details.get('email')
        if not to:
            return {'success': False, 'error': 'Email address required'}
        
        subject = f"Meeting: {meeting_details.get('title', 'Meeting')}"
        
        body = f"""
        <h2>Meeting Details</h2>
        <p><strong>Title:</strong> {meeting_details.get('title', 'Meeting')}</p>
        <p><strong>Date:</strong> {meeting_details.get('date', 'N/A')}</p>
        <p><strong>Time:</strong> {meeting_details.get('time', 'N/A')}</p>
        <p><strong>Duration:</strong> {meeting_details.get('duration', 'N/A')}</p>
        """
        
        if meeting_details.get('attendees'):
            body += f"<p><strong>Attendees:</strong> {', '.join(meeting_details['attendees'])}</p>"
        
        if meeting_details.get('description'):
            body += f"<p><strong>Description:</strong> {meeting_details['description']}</p>"
        
        if meeting_details.get('meeting_link'):
            body += f"<p><strong>Meeting Link:</strong> <a href='{meeting_details['meeting_link']}'>{meeting_details['meeting_link']}</a></p>"
        
        body += "<p>Best regards,<br>Agentic AI Automator</p>"
        
        return self.send_email(to, subject, body)
    
    def create_meeting_document(self, meeting_details: Dict) -> Dict:
        """Create a meeting notes document"""
        title = f"Meeting Notes - {meeting_details.get('title', 'Meeting')}"
        
        content = f"""
        Meeting: {meeting_details.get('title', 'Meeting')}
        Date: {meeting_details.get('date', 'N/A')}
        Time: {meeting_details.get('time', 'N/A')}
        Duration: {meeting_details.get('duration', 'N/A')}
        
        Attendees:
        {chr(10).join(f"- {attendee}" for attendee in meeting_details.get('attendees', []))}
        
        Agenda:
        - [ ] Agenda item 1
        - [ ] Agenda item 2
        - [ ] Agenda item 3
        
        Notes:
        - 
        - 
        - 
        
        Action Items:
        - [ ] 
        - [ ] 
        - [ ] 
        
        Next Meeting:
        - Date: 
        - Time: 
        - Agenda:
        """
        
        return self.create_document(title, content)

# Global instance
google_workspace = GoogleWorkspaceIntegration()
