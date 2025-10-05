"""
Teams Integration Module - Simplified
"""

class TeamsIntegration:
    def __init__(self):
        pass
    
    def is_configured(self) -> bool:
        return False
    
    def create_meeting_card(self, meeting_details: dict) -> dict:
        return {'success': False, 'error': 'Teams not configured'}
    
    def create_task_card(self, task_details: dict) -> dict:
        return {'success': False, 'error': 'Teams not configured'}

teams_integration = TeamsIntegration()