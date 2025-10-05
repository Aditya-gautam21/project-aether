"""
Unit tests for task prioritization functionality
"""

import pytest
import json
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, mock_open

class TestTaskPrioritizer:
    def setup_method(self):
        from task_prioritizer import TaskPrioritizer
        self.prioritizer = TaskPrioritizer()
    
    def test_load_preferences_new_file(self):
        with patch('os.path.exists', return_value=False):
            prioritizer = TaskPrioritizer()
            assert prioritizer.preferences == {
                'priority_weights': {
                    'high': 3.0,
                    'medium': 2.0,
                    'low': 1.0
                },
                'deadline_importance': 0.4,
                'priority_importance': 0.3,
                'age_importance': 0.2,
                'completion_rate_importance': 0.1
            }
    
    def test_load_preferences_existing_file(self):
        test_preferences = {
            'priority_weights': {'high': 5.0, 'medium': 3.0, 'low': 1.0},
            'deadline_importance': 0.5,
            'priority_importance': 0.3,
            'age_importance': 0.15,
            'completion_rate_importance': 0.05
        }
        
        with patch('os.path.exists', return_value=True):
            with patch('builtins.open', mock_open(read_data=json.dumps(test_preferences))):
                prioritizer = TaskPrioritizer()
                assert prioritizer.preferences == test_preferences
    
    def test_save_preferences(self):
        test_preferences = {'test': 'value'}
        self.prioritizer.preferences = test_preferences
        
        with patch('builtins.open', mock_open()) as mock_file:
            self.prioritizer.save_preferences()
            mock_file.assert_called_once_with(self.prioritizer.preferences_file, 'w')
    
    def test_calculate_deadline_score_overdue(self):
        task = {
            'deadline': (datetime.now() - timedelta(days=1)).isoformat()
        }
        
        score = self.prioritizer.calculate_deadline_score(task)
        assert score == 100.0  # Overdue should be max score
    
    def test_calculate_deadline_score_due_today(self):
        task = {
            'deadline': datetime.now().isoformat()
        }
        
        score = self.prioritizer.calculate_deadline_score(task)
        assert score == 95.0  # Due today should be high score
    
    def test_calculate_deadline_score_due_tomorrow(self):
        task = {
            'deadline': (datetime.now() + timedelta(days=1)).isoformat()
        }
        
        score = self.prioritizer.calculate_deadline_score(task)
        assert score == 85.0  # Due tomorrow should be high score
    
    def test_calculate_deadline_score_far_future(self):
        task = {
            'deadline': (datetime.now() + timedelta(days=30)).isoformat()
        }
        
        score = self.prioritizer.calculate_deadline_score(task)
        assert score == 10.0  # Far future should be low score
    
    def test_calculate_deadline_score_no_deadline(self):
        task = {}
        
        score = self.prioritizer.calculate_deadline_score(task)
        assert score == 30.0  # No deadline should be medium score
    
    def test_calculate_age_score_very_old(self):
        task = {
            'created_at': (datetime.now() - timedelta(days=35)).isoformat()
        }
        
        score = self.prioritizer.calculate_age_score(task)
        assert score == 80.0  # Very old task should be high score
    
    def test_calculate_age_score_old(self):
        task = {
            'created_at': (datetime.now() - timedelta(days=20)).isoformat()
        }
        
        score = self.prioritizer.calculate_age_score(task)
        assert score == 60.0  # Old task should be medium-high score
    
    def test_calculate_age_score_new(self):
        task = {
            'created_at': (datetime.now() - timedelta(days=1)).isoformat()
        }
        
        score = self.prioritizer.calculate_age_score(task)
        assert score == 10.0  # New task should be low score
    
    def test_calculate_age_score_no_created_at(self):
        task = {}
        
        score = self.prioritizer.calculate_age_score(task)
        assert score == 0.0  # No created_at should be 0 score
    
    def test_calculate_task_score_high_priority_overdue(self):
        task = {
            'priority': 'high',
            'deadline': (datetime.now() - timedelta(days=1)).isoformat(),
            'created_at': (datetime.now() - timedelta(days=30)).isoformat()
        }
        
        score = self.prioritizer.calculate_task_score(task)
        assert score >= 80  # High priority + overdue should be very high score
    
    def test_calculate_task_score_low_priority_far_future(self):
        task = {
            'priority': 'low',
            'deadline': (datetime.now() + timedelta(days=30)).isoformat(),
            'created_at': (datetime.now() - timedelta(days=1)).isoformat()
        }
        
        score = self.prioritizer.calculate_task_score(task)
        assert score < 50  # Low priority + far future should be low score
    
    def test_get_urgency_level_critical(self):
        assert self.prioritizer.get_urgency_level(85) == "🔴 Critical"
        assert self.prioritizer.get_urgency_level(100) == "🔴 Critical"
    
    def test_get_urgency_level_high(self):
        assert self.prioritizer.get_urgency_level(70) == "🟠 High"
        assert self.prioritizer.get_urgency_level(79) == "🟠 High"
    
    def test_get_urgency_level_medium(self):
        assert self.prioritizer.get_urgency_level(50) == "🟡 Medium"
        assert self.prioritizer.get_urgency_level(69) == "🟡 Medium"
    
    def test_get_urgency_level_low(self):
        assert self.prioritizer.get_urgency_level(30) == "🟢 Low"
        assert self.prioritizer.get_urgency_level(39) == "🟢 Low"
    
    def test_get_prioritization_explanation_high_priority_overdue(self):
        task = {
            'priority': 'high',
            'deadline': (datetime.now() - timedelta(days=1)).isoformat(),
            'created_at': (datetime.now() - timedelta(days=20)).isoformat()
        }
        
        explanation = self.prioritizer.get_prioritization_explanation(task)
        
        assert 'Priority: high' in explanation
        assert 'OVERDUE' in explanation
        assert 'Created 20 days ago' in explanation
    
    def test_get_prioritization_explanation_due_tomorrow(self):
        task = {
            'priority': 'medium',
            'deadline': (datetime.now() + timedelta(days=1)).isoformat(),
            'created_at': (datetime.now() - timedelta(days=5)).isoformat()
        }
        
        explanation = self.prioritizer.get_prioritization_explanation(task)
        
        assert 'Priority: medium' in explanation
        assert 'Due tomorrow' in explanation
    
    def test_prioritize_tasks(self):
        tasks = [
            {'id': 1, 'priority': 'low', 'created_at': datetime.now().isoformat()},
            {'id': 2, 'priority': 'high', 'deadline': datetime.now().isoformat()},
            {'id': 3, 'priority': 'medium', 'created_at': (datetime.now() - timedelta(days=20)).isoformat()}
        ]
        
        prioritized = self.prioritizer.prioritize_tasks(tasks)
        
        # Should be sorted by priority score (highest first)
        assert len(prioritized) == 3
        assert prioritized[0]['id'] == 2  # High priority + due today should be first
        assert 'priority_score' in prioritized[0]
        assert 'urgency_level' in prioritized[0]
    
    def test_suggest_next_task(self):
        tasks = [
            {'id': 1, 'priority': 'low', 'status': 'pending', 'created_at': datetime.now().isoformat()},
            {'id': 2, 'priority': 'high', 'status': 'pending', 'deadline': datetime.now().isoformat()},
            {'id': 3, 'priority': 'medium', 'status': 'completed', 'created_at': datetime.now().isoformat()}
        ]
        
        next_task = self.prioritizer.suggest_next_task(tasks)
        
        assert next_task is not None
        assert next_task['id'] == 2  # High priority + due today should be suggested
        assert next_task['status'] == 'pending'
    
    def test_suggest_next_task_no_pending(self):
        tasks = [
            {'id': 1, 'priority': 'high', 'status': 'completed'},
            {'id': 2, 'priority': 'medium', 'status': 'completed'}
        ]
        
        next_task = self.prioritizer.suggest_next_task(tasks)
        assert next_task is None
    
    def test_get_task_insights_empty(self):
        insights = self.prioritizer.get_task_insights([])
        
        assert insights['total'] == 0
        assert insights['by_priority'] == {}
        assert insights['by_urgency'] == {}
        assert insights['overdue'] == 0
        assert insights['due_today'] == 0
        assert insights['due_this_week'] == 0
    
    def test_get_task_insights_with_tasks(self):
        tasks = [
            {
                'id': 1, 
                'priority': 'high', 
                'deadline': (datetime.now() - timedelta(days=1)).isoformat(),  # Overdue
                'status': 'pending'
            },
            {
                'id': 2, 
                'priority': 'medium', 
                'deadline': datetime.now().isoformat(),  # Due today
                'status': 'pending'
            },
            {
                'id': 3, 
                'priority': 'low', 
                'deadline': (datetime.now() + timedelta(days=5)).isoformat(),  # Due this week
                'status': 'pending'
            },
            {
                'id': 4, 
                'priority': 'high', 
                'deadline': (datetime.now() + timedelta(days=20)).isoformat(),  # Far future
                'status': 'completed'
            }
        ]
        
        insights = self.prioritizer.get_task_insights(tasks)
        
        assert insights['total'] == 4
        assert insights['by_priority']['high'] == 2
        assert insights['by_priority']['medium'] == 1
        assert insights['by_priority']['low'] == 1
        assert insights['overdue'] == 1
        assert insights['due_today'] == 1
        assert insights['due_this_week'] == 1

if __name__ == '__main__':
    pytest.main([__file__])
