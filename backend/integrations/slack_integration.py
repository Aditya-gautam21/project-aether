"""
Slack Integration Module - Simplified
"""

class SlackIntegration:
    def __init__(self):
        pass
    
    def is_configured(self) -> bool:
        return False
    
    def send_message(self, channel: str, text: str) -> dict:
        return {'success': False, 'error': 'Slack not configured'}
    
    def post_meeting_notification(self, meeting_details: dict) -> dict:
        return {'success': False, 'error': 'Slack not configured'}
    
    def send_task_notification(self, task_details: dict) -> dict:
        return {'success': False, 'error': 'Slack not configured'}

slack_integration = SlackIntegration()