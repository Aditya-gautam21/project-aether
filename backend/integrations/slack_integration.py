"""
Slack Integration Module
Features:
- Send messages to Slack channels
- Create Slack reminders
- Post meeting notifications
- Team collaboration features
"""

import os
import json
import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class SlackIntegration:
    def __init__(self):
        self.bot_token = os.getenv('SLACK_BOT_TOKEN')
        self.webhook_url = os.getenv('SLACK_WEBHOOK_URL')
        self.base_url = 'https://slack.com/api'
        
    def is_configured(self) -> bool:
        """Check if Slack integration is properly configured"""
        return bool(self.bot_token or self.webhook_url)
    
    def send_message(self, channel: str, text: str, blocks: Optional[List[Dict]] = None) -> Dict:
        """Send a message to a Slack channel"""
        if not self.is_configured():
            return {'success': False, 'error': 'Slack not configured'}
        
        try:
            headers = {'Authorization': f'Bearer {self.bot_token}'}
            payload = {
                'channel': channel,
                'text': text,
                'blocks': blocks or []
            }
            
            response = requests.post(
                f'{self.base_url}/chat.postMessage',
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('ok'):
                    return {'success': True, 'ts': result.get('ts')}
                else:
                    return {'success': False, 'error': result.get('error')}
            else:
                return {'success': False, 'error': f'HTTP {response.status_code}'}
                
        except Exception as e:
            logger.error(f"Slack send message error: {e}")
            return {'success': False, 'error': str(e)}
    
    def create_reminder(self, channel: str, text: str, time: str) -> Dict:
        """Create a Slack reminder"""
        if not self.is_configured():
            return {'success': False, 'error': 'Slack not configured'}
        
        try:
            headers = {'Authorization': f'Bearer {self.bot_token}'}
            payload = {
                'channel': channel,
                'text': f"Reminder: {text}",
                'time': time  # Format: "in 5 minutes" or "at 3pm"
            }
            
            response = requests.post(
                f'{self.base_url}/reminders.add',
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('ok'):
                    return {'success': True, 'reminder_id': result.get('reminder', {}).get('id')}
                else:
                    return {'success': False, 'error': result.get('error')}
            else:
                return {'success': False, 'error': f'HTTP {response.status_code}'}
                
        except Exception as e:
            logger.error(f"Slack create reminder error: {e}")
            return {'success': False, 'error': str(e)}
    
    def post_meeting_notification(self, meeting_details: Dict) -> Dict:
        """Post meeting notification to Slack"""
        channel = meeting_details.get('slack_channel', '#general')
        
        # Create rich message blocks
        blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "📅 Meeting Scheduled"
                }
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"*Title:* {meeting_details.get('title', 'Meeting')}"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"*Date:* {meeting_details.get('date', 'N/A')}"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"*Time:* {meeting_details.get('time', 'N/A')}"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"*Duration:* {meeting_details.get('duration', 'N/A')}"
                    }
                ]
            }
        ]
        
        if meeting_details.get('attendees'):
            attendees_text = ', '.join(meeting_details['attendees'])
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Attendees:* {attendees_text}"
                }
            })
        
        if meeting_details.get('description'):
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Description:* {meeting_details['description']}"
                }
            })
        
        return self.send_message(channel, f"Meeting: {meeting_details.get('title', 'Meeting')}", blocks)
    
    def get_channels(self) -> List[Dict]:
        """Get list of available Slack channels"""
        if not self.is_configured():
            return []
        
        try:
            headers = {'Authorization': f'Bearer {self.bot_token}'}
            response = requests.get(
                f'{self.base_url}/conversations.list',
                headers=headers,
                params={'types': 'public_channel,private_channel'}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('ok'):
                    return result.get('channels', [])
                else:
                    logger.error(f"Slack API error: {result.get('error')}")
                    return []
            else:
                logger.error(f"Slack HTTP error: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Slack get channels error: {e}")
            return []
    
    def send_task_notification(self, task_details: Dict) -> Dict:
        """Send task notification to Slack"""
        channel = task_details.get('slack_channel', '#general')
        
        priority_emoji = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🟢'
        }
        
        priority = task_details.get('priority', 'medium')
        emoji = priority_emoji.get(priority, '🟡')
        
        text = f"{emoji} *New Task:* {task_details.get('name', 'Untitled Task')}\n"
        text += f"*Priority:* {priority.upper()}\n"
        text += f"*Status:* {task_details.get('status', 'pending')}\n"
        
        if task_details.get('deadline'):
            text += f"*Deadline:* {task_details['deadline']}\n"
        
        if task_details.get('description'):
            text += f"*Description:* {task_details['description']}"
        
        return self.send_message(channel, text)

# Global instance
slack_integration = SlackIntegration()
