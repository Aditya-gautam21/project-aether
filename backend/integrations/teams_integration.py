"""
Microsoft Teams Integration Module
Features:
- Send messages to Teams channels
- Create Teams meeting notifications
- Post adaptive cards
- Team collaboration features
"""

import os
import json
import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class TeamsIntegration:
    def __init__(self):
        self.webhook_url = os.getenv('TEAMS_WEBHOOK_URL')
        self.client_id = os.getenv('TEAMS_CLIENT_ID')
        self.client_secret = os.getenv('TEAMS_CLIENT_SECRET')
        self.tenant_id = os.getenv('TEAMS_TENANT_ID')
        
    def is_configured(self) -> bool:
        """Check if Teams integration is properly configured"""
        return bool(self.webhook_url or (self.client_id and self.client_secret and self.tenant_id))
    
    def send_message(self, message: str, title: Optional[str] = None) -> Dict:
        """Send a simple message to Teams"""
        if not self.webhook_url:
            return {'success': False, 'error': 'Teams webhook not configured'}
        
        try:
            payload = {
                "text": title or "Notification",
                "sections": [
                    {
                        "facts": [
                            {
                                "name": "Message",
                                "value": message
                            },
                            {
                                "name": "Time",
                                "value": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                            }
                        ]
                    }
                ]
            }
            
            response = requests.post(
                self.webhook_url,
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                return {'success': True, 'status_code': response.status_code}
            else:
                return {'success': False, 'error': f'HTTP {response.status_code}'}
                
        except Exception as e:
            logger.error(f"Teams send message error: {e}")
            return {'success': False, 'error': str(e)}
    
    def send_adaptive_card(self, card_data: Dict) -> Dict:
        """Send an adaptive card to Teams"""
        if not self.webhook_url:
            return {'success': False, 'error': 'Teams webhook not configured'}
        
        try:
            payload = {
                "type": "message",
                "attachments": [
                    {
                        "contentType": "application/vnd.microsoft.card.adaptive",
                        "content": card_data
                    }
                ]
            }
            
            response = requests.post(
                self.webhook_url,
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                return {'success': True, 'status_code': response.status_code}
            else:
                return {'success': False, 'error': f'HTTP {response.status_code}'}
                
        except Exception as e:
            logger.error(f"Teams send adaptive card error: {e}")
            return {'success': False, 'error': str(e)}
    
    def create_meeting_card(self, meeting_details: Dict) -> Dict:
        """Create and send a meeting notification card"""
        card = {
            "type": "AdaptiveCard",
            "version": "1.2",
            "body": [
                {
                    "type": "TextBlock",
                    "text": "📅 Meeting Scheduled",
                    "size": "Large",
                    "weight": "Bolder",
                    "color": "Accent"
                },
                {
                    "type": "FactSet",
                    "facts": [
                        {
                            "title": "Title",
                            "value": meeting_details.get('title', 'Meeting')
                        },
                        {
                            "title": "Date",
                            "value": meeting_details.get('date', 'N/A')
                        },
                        {
                            "title": "Time",
                            "value": meeting_details.get('time', 'N/A')
                        },
                        {
                            "title": "Duration",
                            "value": meeting_details.get('duration', 'N/A')
                        }
                    ]
                }
            ]
        }
        
        if meeting_details.get('attendees'):
            card["body"].append({
                "type": "TextBlock",
                "text": f"**Attendees:** {', '.join(meeting_details['attendees'])}",
                "wrap": True
            })
        
        if meeting_details.get('description'):
            card["body"].append({
                "type": "TextBlock",
                "text": f"**Description:** {meeting_details['description']}",
                "wrap": True
            })
        
        return self.send_adaptive_card(card)
    
    def create_task_card(self, task_details: Dict) -> Dict:
        """Create and send a task notification card"""
        priority_colors = {
            'high': 'Attention',
            'medium': 'Warning',
            'low': 'Good'
        }
        
        priority = task_details.get('priority', 'medium')
        color = priority_colors.get(priority, 'Warning')
        
        card = {
            "type": "AdaptiveCard",
            "version": "1.2",
            "body": [
                {
                    "type": "TextBlock",
                    "text": f"📋 New Task - {priority.upper()} Priority",
                    "size": "Medium",
                    "weight": "Bolder",
                    "color": color
                },
                {
                    "type": "FactSet",
                    "facts": [
                        {
                            "title": "Task",
                            "value": task_details.get('name', 'Untitled Task')
                        },
                        {
                            "title": "Priority",
                            "value": priority.upper()
                        },
                        {
                            "title": "Status",
                            "value": task_details.get('status', 'pending')
                        }
                    ]
                }
            ]
        }
        
        if task_details.get('deadline'):
            card["body"][1]["facts"].append({
                "title": "Deadline",
                "value": task_details['deadline']
            })
        
        if task_details.get('description'):
            card["body"].append({
                "type": "TextBlock",
                "text": f"**Description:** {task_details['description']}",
                "wrap": True
            })
        
        return self.send_adaptive_card(card)
    
    def send_calendar_update(self, event_details: Dict) -> Dict:
        """Send calendar event update to Teams"""
        action = event_details.get('action', 'created')  # created, updated, deleted
        
        action_emoji = {
            'created': '➕',
            'updated': '✏️',
            'deleted': '❌'
        }
        
        emoji = action_emoji.get(action, '📅')
        
        message = f"{emoji} Calendar event {action}: {event_details.get('title', 'Event')}"
        
        if action != 'deleted':
            message += f"\n📅 Date: {event_details.get('date', 'N/A')}"
            message += f"\n🕐 Time: {event_details.get('time', 'N/A')}"
            
            if event_details.get('attendees'):
                message += f"\n👥 Attendees: {', '.join(event_details['attendees'])}"
        
        return self.send_message(message, f"Calendar Update - {action.title()}")

# Global instance
teams_integration = TeamsIntegration()
