"""
Unit tests for enhanced agent functionality
"""

import pytest
import json
import os
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, mock_open

# Test Enhanced Agent
class TestEnhancedAgent:
    def setup_method(self):
        from enhanced_agent import EnhancedAgent
        self.agent = EnhancedAgent()
    
    def test_load_context_new_file(self):
        with patch('os.path.exists', return_value=False):
            agent = EnhancedAgent()
            assert agent.context == {
                'last_commands': [],
                'preferences': {},
                'frequent_contacts': [],
                'typical_meeting_times': []
            }
    
    def test_load_context_existing_file(self):
        test_context = {
            'last_commands': ['test command'],
            'preferences': {'theme': 'dark'},
            'frequent_contacts': ['john@example.com'],
            'typical_meeting_times': ['10:00', '14:00']
        }
        
        with patch('os.path.exists', return_value=True):
            with patch('builtins.open', mock_open(read_data=json.dumps(test_context))):
                agent = EnhancedAgent()
                assert agent.context == test_context
    
    def test_save_context(self):
        test_context = {'last_commands': ['test']}
        self.agent.context = test_context
        
        with patch('builtins.open', mock_open()) as mock_file:
            self.agent.save_context()
            mock_file.assert_called_once_with(self.agent.context_file, 'w')
    
    def test_log_command(self):
        with patch('os.path.exists', return_value=False):
            with patch('builtins.open', mock_open()) as mock_file:
                self.agent.log_command('test command', 'book_appointment', True)
                mock_file.assert_called()
    
    def test_parse_datetime_tomorrow(self):
        text = "tomorrow at 10 AM"
        start, end = self.agent.parse_datetime(text)
        
        # Should be tomorrow at 10 AM
        expected_start = (datetime.now() + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
        expected_end = expected_start + timedelta(hours=1)
        
        assert datetime.fromisoformat(start).hour == 10
        assert datetime.fromisoformat(end).hour == 11
    
    def test_parse_datetime_today(self):
        text = "today at 2 PM"
        start, end = self.agent.parse_datetime(text)
        
        expected_start = datetime.now().replace(hour=14, minute=0, second=0, microsecond=0)
        expected_end = expected_start + timedelta(hours=1)
        
        assert datetime.fromisoformat(start).hour == 14
        assert datetime.fromisoformat(end).hour == 15
    
    def test_parse_datetime_next_monday(self):
        text = "next monday at 9"
        start, end = self.agent.parse_datetime(text)
        
        start_dt = datetime.fromisoformat(start)
        # Should be a Monday
        assert start_dt.weekday() == 0  # Monday is 0
        assert start_dt.hour == 9
    
    def test_detect_intent_book_appointment(self):
        intents = [
            "book a meeting",
            "schedule an appointment",
            "create event",
            "set up a meeting"
        ]
        
        for intent in intents:
            result = self.agent.detect_intent(intent)
            assert result == "book_appointment"
    
    def test_detect_intent_get_events(self):
        intents = [
            "show my events",
            "list calendar events",
            "view my schedule",
            "what's on my calendar"
        ]
        
        for intent in intents:
            result = self.agent.detect_intent(intent)
            assert result == "get_events"
    
    def test_detect_intent_create_task(self):
        intents = [
            "create a task",
            "add a new task",
            "make a task"
        ]
        
        for intent in intents:
            result = self.agent.detect_intent(intent)
            assert result == "create_task"
    
    def test_detect_intent_get_tasks(self):
        intents = [
            "show my tasks",
            "list tasks",
            "view tasks",
            "get all tasks"
        ]
        
        for intent in intents:
            result = self.agent.detect_intent(intent)
            assert result == "get_tasks"
    
    def test_get_smart_suggestions_morning(self):
        with patch('datetime.datetime') as mock_datetime:
            mock_now = Mock()
            mock_now.hour = 9
            mock_datetime.now.return_value = mock_now
            
            suggestions = self.agent.get_smart_suggestions()
            assert any("Good morning" in s for s in suggestions)
    
    def test_get_smart_suggestions_lunch(self):
        with patch('datetime.datetime') as mock_datetime:
            mock_now = Mock()
            mock_now.hour = 12
            mock_datetime.now.return_value = mock_now
            
            suggestions = self.agent.get_smart_suggestions()
            assert any("Lunch time" in s for s in suggestions)
    
    def test_get_smart_suggestions_evening(self):
        with patch('datetime.datetime') as mock_datetime:
            mock_now = Mock()
            mock_now.hour = 17
            mock_datetime.now.return_value = mock_now
            
            suggestions = self.agent.get_smart_suggestions()
            assert any("End of day" in s for s in suggestions)
    
    def test_get_productivity_insights_no_data(self):
        with patch('os.path.exists', return_value=False):
            insights = self.agent.get_productivity_insights()
            
            assert insights['total_commands'] == 0
            assert insights['most_used_feature'] == 'N/A'
            assert insights['productivity_score'] == 0
            assert insights['suggestions'] == []
    
    def test_get_productivity_insights_with_data(self):
        test_analytics = {
            'commands': [
                {'intent': 'book_appointment', 'success': True},
                {'intent': 'book_appointment', 'success': True},
                {'intent': 'create_task', 'success': False}
            ]
        }
        
        with patch('os.path.exists', return_value=True):
            with patch('builtins.open', mock_open(read_data=json.dumps(test_analytics))):
                insights = self.agent.get_productivity_insights()
                
                assert insights['total_commands'] == 3
                assert insights['most_used_feature'] == 'book_appointment'
                assert insights['productivity_score'] == 66  # 2/3 success rate
    
    @patch('enhanced_agent.agent.handle_book_appointment')
    def test_process_command_book_appointment(self, mock_handle):
        mock_handle.return_value = {
            'success': True,
            'message': 'Meeting booked successfully',
            'suggestions': [],
            'intent': 'book_appointment'
        }
        
        result = self.agent.process_command('book a meeting tomorrow at 2 PM')
        
        assert result['success'] == True
        assert result['intent'] == 'book_appointment'
        mock_handle.assert_called_once_with('book a meeting tomorrow at 2 PM')
    
    @patch('enhanced_agent.agent.get_help_message')
    def test_process_command_unknown(self, mock_help):
        mock_help.return_value = 'Help message'
        
        result = self.agent.process_command('random command')
        
        assert result['message'] == 'Help message'
        assert result['intent'] == 'unknown'
    
    def test_get_help_message(self):
        help_msg = self.agent.get_help_message()
        
        assert 'Calendar Management' in help_msg
        assert 'Task Management' in help_msg
        assert 'Smart Features' in help_msg
        assert 'book a meeting' in help_msg.lower()

if __name__ == '__main__':
    pytest.main([__file__])
