"""
Unit tests for smart scheduler functionality
"""

import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch

class TestSmartScheduler:
    def setup_method(self):
        from smart_scheduler import SmartScheduler
        self.scheduler = SmartScheduler()
    
    def test_detect_timezone(self):
        timezone = self.scheduler.detect_timezone()
        assert timezone == "Asia/Kolkata"
    
    def test_is_working_hours_weekday_working_time(self):
        # Monday at 10 AM
        test_dt = datetime(2025, 1, 13, 10, 0, 0)
        assert self.scheduler.is_working_hours(test_dt) == True
    
    def test_is_working_hours_weekday_before_work(self):
        # Monday at 8 AM (before work)
        test_dt = datetime(2025, 1, 13, 8, 0, 0)
        assert self.scheduler.is_working_hours(test_dt) == False
    
    def test_is_working_hours_weekday_after_work(self):
        # Monday at 7 PM (after work)
        test_dt = datetime(2025, 1, 13, 19, 0, 0)
        assert self.scheduler.is_working_hours(test_dt) == False
    
    def test_is_working_hours_weekend(self):
        # Saturday at 10 AM
        test_dt = datetime(2025, 1, 11, 10, 0, 0)
        assert self.scheduler.is_working_hours(test_dt) == False
    
    def test_check_conflicts_no_conflicts(self):
        start = datetime(2025, 1, 13, 10, 0, 0)
        end = datetime(2025, 1, 13, 11, 0, 0)
        existing_events = []
        
        conflicts = self.scheduler.check_conflicts(start, end, existing_events)
        assert len(conflicts) == 0
    
    def test_check_conflicts_with_conflict(self):
        start = datetime(2025, 1, 13, 10, 0, 0)
        end = datetime(2025, 1, 13, 11, 0, 0)
        
        existing_events = [
            {
                'start': '2025-01-13T10:30:00Z',
                'end': '2025-01-13T11:30:00Z',
                'summary': 'Existing Meeting'
            }
        ]
        
        conflicts = self.scheduler.check_conflicts(start, end, existing_events)
        assert len(conflicts) == 1
        assert conflicts[0]['event']['summary'] == 'Existing Meeting'
    
    def test_calculate_time_score_optimal_time(self):
        # Tuesday at 10 AM (optimal)
        test_dt = datetime(2025, 1, 14, 10, 0, 0)
        score = self.scheduler.calculate_time_score(test_dt)
        assert score >= 70  # Should be high score
    
    def test_calculate_time_score_good_time(self):
        # Wednesday at 2 PM (good)
        test_dt = datetime(2025, 1, 15, 14, 0, 0)
        score = self.scheduler.calculate_time_score(test_dt)
        assert score >= 60  # Should be good score
    
    def test_calculate_time_score_poor_time(self):
        # Friday at 8 PM (poor)
        test_dt = datetime(2025, 1, 17, 20, 0, 0)
        score = self.scheduler.calculate_time_score(test_dt)
        assert score < 50  # Should be lower score
    
    def test_get_suggestion_reason_optimal(self):
        # Tuesday at 10 AM
        test_dt = datetime(2025, 1, 14, 10, 0, 0)
        reason = self.scheduler.get_suggestion_reason(test_dt)
        assert 'optimal morning time' in reason
        assert 'mid-week' in reason
    
    def test_get_suggestion_reason_today(self):
        # Today
        test_dt = datetime.now().replace(hour=14, minute=0, second=0, microsecond=0)
        reason = self.scheduler.get_suggestion_reason(test_dt)
        assert 'today' in reason
    
    def test_suggest_optimal_times_no_events(self):
        with patch('datetime.datetime') as mock_datetime:
            # Mock current time
            mock_now = Mock()
            mock_now.weekday.return_value = 0  # Monday
            mock_now.date.return_value = datetime(2025, 1, 13).date()
            mock_now.replace.return_value = datetime(2025, 1, 13, 9, 0, 0)
            mock_datetime.now.return_value = mock_now
            
            suggestions = self.scheduler.suggest_optimal_times(
                duration_minutes=60,
                existing_events=[]
            )
            
            assert len(suggestions) > 0
            assert all(s['score'] > 0 for s in suggestions)
    
    def test_suggest_optimal_times_with_conflicts(self):
        with patch('datetime.datetime') as mock_datetime:
            # Mock current time
            mock_now = Mock()
            mock_now.weekday.return_value = 0  # Monday
            mock_now.date.return_value = datetime(2025, 1, 13).date()
            mock_now.replace.return_value = datetime(2025, 1, 13, 9, 0, 0)
            mock_datetime.now.return_value = mock_now
            
            # Mock conflicting events
            existing_events = [
                {
                    'start': '2025-01-13T10:00:00Z',
                    'end': '2025-01-13T11:00:00Z',
                    'summary': 'Busy'
                }
            ]
            
            suggestions = self.scheduler.suggest_optimal_times(
                duration_minutes=60,
                existing_events=existing_events
            )
            
            # Should still suggest times, but avoid conflicts
            assert len(suggestions) > 0
    
    def test_resolve_conflict_no_conflict(self):
        start = datetime(2025, 1, 13, 10, 0, 0)
        end = datetime(2025, 1, 13, 11, 0, 0)
        existing_events = []
        
        result = self.scheduler.resolve_conflict(start, end, existing_events)
        
        assert result['has_conflict'] == False
        assert 'No conflicts found' in result['message']
        assert len(result['alternatives']) == 0
    
    def test_resolve_conflict_with_conflict(self):
        start = datetime(2025, 1, 13, 10, 0, 0)
        end = datetime(2025, 1, 13, 11, 0, 0)
        
        existing_events = [
            {
                'start': '2025-01-13T10:30:00Z',
                'end': '2025-01-13T11:30:00Z',
                'summary': 'Conflicting Meeting'
            }
        ]
        
        with patch.object(self.scheduler, 'suggest_optimal_times') as mock_suggest:
            mock_suggest.return_value = [
                {
                    'start': '2025-01-13T14:00:00',
                    'end': '2025-01-13T15:00:00',
                    'score': 85.0,
                    'reason': 'good afternoon slot'
                }
            ]
            
            result = self.scheduler.resolve_conflict(start, end, existing_events)
            
            assert result['has_conflict'] == True
            assert 'Scheduling conflict detected' in result['message']
            assert len(result['alternatives']) > 0
    
    def test_format_time_suggestion(self):
        suggestion = {
            'start': '2025-01-13T14:00:00',
            'end': '2025-01-13T15:00:00',
            'score': 85.0,
            'reason': 'good afternoon slot'
        }
        
        formatted = self.scheduler.format_time_suggestion(suggestion)
        
        assert 'Monday, January 13 at 2:00 PM' in formatted
        assert 'good afternoon slot' in formatted
        assert '85/100' in formatted

if __name__ == '__main__':
    pytest.main([__file__])
