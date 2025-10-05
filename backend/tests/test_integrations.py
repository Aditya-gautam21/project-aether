"""
Unit tests for integration modules
"""

import pytest
import os
import json
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta

# Test Slack Integration
class TestSlackIntegration:
    def setup_method(self):
        from integrations.slack_integration import SlackIntegration
        self.slack = SlackIntegration()
    
    @patch.dict(os.environ, {'SLACK_BOT_TOKEN': 'test_token'})
    def test_is_configured_with_token(self):
        assert self.slack.is_configured() == True
    
    @patch.dict(os.environ, {'SLACK_WEBHOOK_URL': 'https://hooks.slack.com/test'})
    def test_is_configured_with_webhook(self):
        assert self.slack.is_configured() == True
    
    def test_is_configured_not_configured(self):
        with patch.dict(os.environ, {}, clear=True):
            slack = SlackIntegration()
            assert slack.is_configured() == False
    
    @patch('integrations.slack_integration.requests.post')
    @patch.dict(os.environ, {'SLACK_BOT_TOKEN': 'test_token'})
    def test_send_message_success(self, mock_post):
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'ok': True, 'ts': '1234567890.123456'}
        mock_post.return_value = mock_response
        
        result = self.slack.send_message('#general', 'Test message')
        
        assert result['success'] == True
        assert result['ts'] == '1234567890.123456'
        mock_post.assert_called_once()
    
    @patch('integrations.slack_integration.requests.post')
    @patch.dict(os.environ, {'SLACK_BOT_TOKEN': 'test_token'})
    def test_send_message_failure(self, mock_post):
        mock_response = Mock()
        mock_response.status_code = 400
        mock_response.json.return_value = {'ok': False, 'error': 'channel_not_found'}
        mock_post.return_value = mock_response
        
        result = self.slack.send_message('#nonexistent', 'Test message')
        
        assert result['success'] == False
        assert result['error'] == 'channel_not_found'
    
    def test_send_message_not_configured(self):
        with patch.dict(os.environ, {}, clear=True):
            slack = SlackIntegration()
            result = slack.send_message('#general', 'Test message')
            assert result['success'] == False
            assert result['error'] == 'Slack not configured'
    
    @patch('integrations.slack_integration.requests.post')
    @patch.dict(os.environ, {'SLACK_BOT_TOKEN': 'test_token'})
    def test_create_reminder_success(self, mock_post):
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'ok': True, 'reminder': {'id': 'reminder_123'}}
        mock_post.return_value = mock_response
        
        result = self.slack.create_reminder('#general', 'Test reminder', 'in 1 hour')
        
        assert result['success'] == True
        assert result['reminder_id'] == 'reminder_123'
    
    def test_post_meeting_notification(self):
        meeting_details = {
            'title': 'Team Meeting',
            'date': '2025-01-15',
            'time': '2:00 PM',
            'duration': '1 hour',
            'attendees': ['john@example.com', 'jane@example.com'],
            'description': 'Weekly team sync'
        }
        
        with patch.object(self.slack, 'send_message') as mock_send:
            mock_send.return_value = {'success': True, 'ts': '1234567890.123456'}
            
            result = self.slack.post_meeting_notification(meeting_details)
            
            assert result['success'] == True
            mock_send.assert_called_once()
            # Verify the message contains meeting details
            call_args = mock_send.call_args
            assert 'Team Meeting' in call_args[0][1]  # message text

# Test Teams Integration
class TestTeamsIntegration:
    def setup_method(self):
        from integrations.teams_integration import TeamsIntegration
        self.teams = TeamsIntegration()
    
    @patch.dict(os.environ, {'TEAMS_WEBHOOK_URL': 'https://outlook.office.com/webhook/test'})
    def test_is_configured_with_webhook(self):
        assert self.teams.is_configured() == True
    
    def test_is_configured_not_configured(self):
        with patch.dict(os.environ, {}, clear=True):
            teams = TeamsIntegration()
            assert teams.is_configured() == False
    
    @patch('integrations.teams_integration.requests.post')
    @patch.dict(os.environ, {'TEAMS_WEBHOOK_URL': 'https://outlook.office.com/webhook/test'})
    def test_send_message_success(self, mock_post):
        mock_response = Mock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response
        
        result = self.teams.send_message('Test message', 'Test Title')
        
        assert result['success'] == True
        assert result['status_code'] == 200
        mock_post.assert_called_once()
    
    def test_create_meeting_card(self):
        meeting_details = {
            'title': 'Project Review',
            'date': '2025-01-15',
            'time': '3:00 PM',
            'duration': '2 hours',
            'attendees': ['team@example.com'],
            'description': 'Quarterly project review'
        }
        
        with patch.object(self.teams, 'send_adaptive_card') as mock_send:
            mock_send.return_value = {'success': True, 'status_code': 200}
            
            result = self.teams.create_meeting_card(meeting_details)
            
            assert result['success'] == True
            mock_send.assert_called_once()

# Test Google Workspace Integration
class TestGoogleWorkspaceIntegration:
    def setup_method(self):
        from integrations.google_workspace_integration import GoogleWorkspaceIntegration
        self.google_workspace = GoogleWorkspaceIntegration()
    
    def test_is_authenticated_not_authenticated(self):
        assert self.google_workspace.is_authenticated() == False
    
    @patch('integrations.google_workspace_integration.build')
    @patch('integrations.google_workspace_integration.Credentials.from_authorized_user_file')
    def test_authenticate_success(self, mock_creds, mock_build):
        # Mock credentials
        mock_credentials = Mock()
        mock_credentials.valid = True
        mock_creds.return_value = mock_credentials
        
        # Mock services
        mock_service = Mock()
        mock_build.return_value = mock_service
        
        # Mock credentials file exists
        with patch('os.path.exists', return_value=True):
            result = self.google_workspace.authenticate()
            assert result == True
    
    @patch('integrations.google_workspace_integration.build')
    @patch('integrations.google_workspace_integration.Credentials.from_authorized_user_file')
    def test_send_email_success(self, mock_creds, mock_build):
        # Mock authentication
        mock_credentials = Mock()
        mock_credentials.valid = True
        mock_creds.return_value = mock_credentials
        
        mock_service = Mock()
        mock_build.return_value = mock_service
        
        # Mock Gmail service
        mock_gmail_service = Mock()
        mock_users = Mock()
        mock_messages = Mock()
        mock_send = Mock()
        mock_send.execute.return_value = {'id': 'msg_123', 'threadId': 'thread_456'}
        mock_messages.send.return_value = mock_send
        mock_users.messages.return_value = mock_messages
        mock_gmail_service.users.return_value = mock_users
        
        with patch('os.path.exists', return_value=True):
            self.google_workspace.gmail_service = mock_gmail_service
            
            result = self.google_workspace.send_email(
                'test@example.com',
                'Test Subject',
                'Test Body',
                ['cc@example.com']
            )
            
            assert result['success'] == True
            assert result['message_id'] == 'msg_123'
            assert result['thread_id'] == 'thread_456'

# Test Integration Manager
class TestIntegrationManager:
    def setup_method(self):
        from integrations import IntegrationManager
        self.manager = IntegrationManager()
    
    @patch.object(IntegrationManager, 'slack')
    @patch.object(IntegrationManager, 'teams')
    @patch.object(IntegrationManager, 'google_workspace')
    def test_get_available_integrations(self, mock_google, mock_teams, mock_slack):
        mock_slack.is_configured.return_value = True
        mock_teams.is_configured.return_value = False
        mock_google.is_authenticated.return_value = True
        
        result = self.manager.get_available_integrations()
        
        assert result['slack'] == True
        assert result['teams'] == False
        assert result['google_workspace'] == True
    
    @patch.object(IntegrationManager, 'slack')
    @patch.object(IntegrationManager, 'teams')
    @patch.object(IntegrationManager, 'google_workspace')
    def test_send_meeting_notification(self, mock_google, mock_teams, mock_slack):
        meeting_details = {
            'title': 'Test Meeting',
            'date': '2025-01-15',
            'time': '2:00 PM',
            'duration': '1 hour',
            'attendees': ['test@example.com']
        }
        
        mock_slack.is_configured.return_value = True
        mock_teams.is_configured.return_value = True
        mock_google.is_authenticated.return_value = True
        
        mock_slack.post_meeting_notification.return_value = {'success': True}
        mock_teams.create_meeting_card.return_value = {'success': True}
        mock_google.send_meeting_email.return_value = {'success': True}
        mock_google.create_meeting_document.return_value = {'success': True}
        
        result = self.manager.send_meeting_notification(meeting_details)
        
        assert 'slack' in result
        assert 'teams' in result
        assert 'gmail' in result
        assert 'docs' in result
        assert result['slack']['success'] == True
        assert result['teams']['success'] == True

if __name__ == '__main__':
    pytest.main([__file__])
