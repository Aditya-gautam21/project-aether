"""
Unit tests for FastAPI main endpoints
"""

import pytest
import json
from datetime import datetime
from unittest.mock import Mock, patch, mock_open
from fastapi.testclient import TestClient

# Import the FastAPI app
from main import app

client = TestClient(app)

class TestMainAPI:
    
    def test_health_check(self):
        response = client.get("/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "ok"
        assert "timestamp" in data
        assert data["service"] == "Agentic AI Automator"
    
    def test_get_stats_no_tasks_file(self):
        with patch('os.path.exists', return_value=False):
            response = client.get("/api/stats")
            assert response.status_code == 200
            
            data = response.json()
            assert data["total_tasks"] == 0
            assert data["completed_tasks"] == 0
            assert data["pending_tasks"] == 0
            assert "timestamp" in data
    
    def test_get_stats_with_tasks(self):
        test_tasks = [
            {"id": 1, "status": "completed"},
            {"id": 2, "status": "pending"},
            {"id": 3, "status": "pending"}
        ]
        
        with patch('os.path.exists', return_value=True):
            with patch('builtins.open', mock_open(read_data=json.dumps(test_tasks))):
                response = client.get("/api/stats")
                assert response.status_code == 200
                
                data = response.json()
                assert data["total_tasks"] == 3
                assert data["completed_tasks"] == 1
                assert data["pending_tasks"] == 2
    
    def test_get_tasks_no_file(self):
        with patch('os.path.exists', return_value=False):
            response = client.get("/api/tasks")
            assert response.status_code == 200
            
            data = response.json()
            assert data["tasks"] == []
    
    def test_get_tasks_with_file(self):
        test_tasks = [
            {"id": 1, "name": "Task 1", "status": "pending"},
            {"id": 2, "name": "Task 2", "status": "completed"}
        ]
        
        with patch('os.path.exists', return_value=True):
            with patch('builtins.open', mock_open(read_data=json.dumps(test_tasks))):
                response = client.get("/api/tasks")
                assert response.status_code == 200
                
                data = response.json()
                assert len(data["tasks"]) == 2
                assert data["tasks"][0]["name"] == "Task 1"
    
    @patch('main.integration_manager')
    def test_get_integration_status(self, mock_manager):
        mock_manager.get_available_integrations.return_value = {
            'slack': True,
            'teams': False,
            'google_workspace': True
        }
        
        response = client.get("/api/integrations/status")
        assert response.status_code == 200
        
        data = response.json()
        assert data["integrations"]["slack"] == True
        assert data["integrations"]["teams"] == False
        assert data["integrations"]["google_workspace"] == True
        assert "timestamp" in data
    
    def test_send_meeting_notification(self):
        meeting_data = {
            "title": "Test Meeting",
            "date": "2025-01-15",
            "time": "2:00 PM",
            "duration": "1 hour",
            "attendees": ["test@example.com"],
            "platforms": ["slack"]
        }
        
        with patch('main.integration_manager') as mock_manager:
            mock_manager.send_meeting_notification.return_value = {
                'slack': {'success': True}
            }
            
            response = client.post("/api/integrations/meeting", json=meeting_data)
            assert response.status_code == 200
            
            data = response.json()
            assert data["success"] == True
            assert "results" in data
            assert data["results"]["slack"]["success"] == True
    
    def test_send_task_notification(self):
        task_data = {
            "name": "Test Task",
            "priority": "high",
            "status": "pending",
            "description": "Test task description",
            "platforms": ["teams"]
        }
        
        with patch('main.integration_manager') as mock_manager:
            mock_manager.send_task_notification.return_value = {
                'teams': {'success': True}
            }
            
            response = client.post("/api/integrations/task", json=task_data)
            assert response.status_code == 200
            
            data = response.json()
            assert data["success"] == True
            assert "results" in data
            assert data["results"]["teams"]["success"] == True
    
    @patch('main.integration_manager')
    def test_get_slack_channels_not_configured(self, mock_manager):
        mock_manager.slack.is_configured.return_value = False
        
        response = client.post("/api/integrations/slack/channels")
        assert response.status_code == 400
        
        data = response.json()
        assert "Slack not configured" in data["detail"]
    
    @patch('main.integration_manager')
    def test_get_slack_channels_configured(self, mock_manager):
        mock_manager.slack.is_configured.return_value = True
        mock_manager.slack.get_channels.return_value = [
            {"id": "C123", "name": "general"},
            {"id": "C456", "name": "random"}
        ]
        
        response = client.post("/api/integrations/slack/channels")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["channels"]) == 2
        assert data["channels"][0]["name"] == "general"
    
    @patch('main.integration_manager')
    def test_authenticate_google_workspace_success(self, mock_manager):
        mock_manager.google_workspace.authenticate.return_value = True
        
        response = client.post("/api/integrations/google-workspace/auth")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "Authentication successful" in data["message"]
    
    @patch('main.integration_manager')
    def test_authenticate_google_workspace_failure(self, mock_manager):
        mock_manager.google_workspace.authenticate.return_value = False
        
        response = client.post("/api/integrations/google-workspace/auth")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == False
        assert "Authentication failed" in data["message"]
    
    def test_legacy_automate_endpoint(self):
        command_data = {"text": "test command"}
        
        with patch('main.automate_task') as mock_automate:
            mock_automate.return_value = "Test result"
            
            response = client.post("/automate", json=command_data)
            assert response.status_code == 200
            
            data = response.json()
            assert data["result"] == "Test result"
            assert data["status"] == "success"
    
    def test_legacy_automate_endpoint_error(self):
        command_data = {"text": "test command"}
        
        with patch('main.automate_task') as mock_automate:
            mock_automate.side_effect = Exception("Test error")
            
            response = client.post("/automate", json=command_data)
            assert response.status_code == 500
            
            data = response.json()
            assert "Test error" in data["detail"]

# mock_open is already imported from unittest.mock

if __name__ == '__main__':
    pytest.main([__file__])
