"""
Integration Manager
Coordinates all external platform integrations
"""

from .slack_integration import slack_integration
from .teams_integration import teams_integration
from .google_workspace_integration import google_workspace

class IntegrationManager:
    def __init__(self):
        self.slack = slack_integration
        self.teams = teams_integration
        self.google_workspace = google_workspace
    
    def get_available_integrations(self) -> Dict[str, bool]:
        """Get status of all integrations"""
        return {
            'slack': self.slack.is_configured(),
            'teams': self.teams.is_configured(),
            'google_workspace': self.google_workspace.is_authenticated()
        }
    
    def send_meeting_notification(self, meeting_details: Dict, platforms: List[str] = None) -> Dict:
        """Send meeting notification to multiple platforms"""
        if platforms is None:
            platforms = ['slack', 'teams', 'google_workspace']
        
        results = {}
        
        for platform in platforms:
            try:
                if platform == 'slack' and self.slack.is_configured():
                    results['slack'] = self.slack.post_meeting_notification(meeting_details)
                elif platform == 'teams' and self.teams.is_configured():
                    results['teams'] = self.teams.create_meeting_card(meeting_details)
                elif platform == 'google_workspace' and self.google_workspace.is_authenticated():
                    # Send email notification
                    if meeting_details.get('email'):
                        results['gmail'] = self.google_workspace.send_meeting_email(meeting_details)
                    # Create meeting document
                    results['docs'] = self.google_workspace.create_meeting_document(meeting_details)
            except Exception as e:
                results[platform] = {'success': False, 'error': str(e)}
        
        return results
    
    def send_task_notification(self, task_details: Dict, platforms: List[str] = None) -> Dict:
        """Send task notification to multiple platforms"""
        if platforms is None:
            platforms = ['slack', 'teams']
        
        results = {}
        
        for platform in platforms:
            try:
                if platform == 'slack' and self.slack.is_configured():
                    results['slack'] = self.slack.send_task_notification(task_details)
                elif platform == 'teams' and self.teams.is_configured():
                    results['teams'] = self.teams.create_task_card(task_details)
            except Exception as e:
                results[platform] = {'success': False, 'error': str(e)}
        
        return results

# Global instance
integration_manager = IntegrationManager()
