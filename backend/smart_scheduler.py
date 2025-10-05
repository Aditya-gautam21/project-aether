"""
Smart Scheduling Module
Features:
- Timezone detection
- Conflict resolution
- Optimal meeting time suggestions
- Working hours awareness
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import pytz
from zoneinfo import ZoneInfo
import logging

logger = logging.getLogger(__name__)

class SmartScheduler:
    def __init__(self, timezone: str = "Asia/Kolkata"):
        self.timezone = timezone
        self.working_hours_start = 9  # 9 AM
        self.working_hours_end = 18   # 6 PM
        self.working_days = [0, 1, 2, 3, 4]  # Monday to Friday
        
    def detect_timezone(self) -> str:
        """Detect user's timezone (placeholder - would use IP geolocation in production)"""
        # In production, use IP geolocation or browser timezone
        return self.timezone
    
    def is_working_hours(self, dt: datetime) -> bool:
        """Check if datetime is within working hours"""
        return (
            dt.weekday() in self.working_days and
            self.working_hours_start <= dt.hour < self.working_hours_end
        )
    
    def check_conflicts(self, start: datetime, end: datetime, existing_events: List[Dict]) -> List[Dict]:
        """Check for scheduling conflicts"""
        conflicts = []
        
        for event in existing_events:
            event_start = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
            event_end = datetime.fromisoformat(event['end'].replace('Z', '+00:00'))
            
            # Check for overlap
            if (start < event_end and end > event_start):
                conflicts.append({
                    'event': event,
                    'overlap_start': max(start, event_start),
                    'overlap_end': min(end, event_end)
                })
        
        return conflicts
    
    def suggest_optimal_times(
        self, 
        duration_minutes: int = 60,
        preferred_date: Optional[datetime] = None,
        existing_events: List[Dict] = None
    ) -> List[Dict]:
        """Suggest optimal meeting times"""
        if preferred_date is None:
            preferred_date = datetime.now()
        
        if existing_events is None:
            existing_events = []
        
        suggestions = []
        
        # Try to find slots for the next 5 working days
        current_date = preferred_date.replace(hour=self.working_hours_start, minute=0, second=0, microsecond=0)
        days_checked = 0
        max_days = 10
        
        while len(suggestions) < 5 and days_checked < max_days:
            # Skip weekends
            if current_date.weekday() not in self.working_days:
                current_date += timedelta(days=1)
                days_checked += 1
                continue
            
            # Check each hour slot
            for hour in range(self.working_hours_start, self.working_hours_end):
                slot_start = current_date.replace(hour=hour, minute=0)
                slot_end = slot_start + timedelta(minutes=duration_minutes)
                
                # Check if slot is in working hours
                if not self.is_working_hours(slot_start):
                    continue
                
                # Check for conflicts
                conflicts = self.check_conflicts(slot_start, slot_end, existing_events)
                
                if not conflicts:
                    suggestions.append({
                        'start': slot_start.isoformat(),
                        'end': slot_end.isoformat(),
                        'score': self.calculate_time_score(slot_start),
                        'reason': self.get_suggestion_reason(slot_start)
                    })
                    
                    if len(suggestions) >= 5:
                        break
            
            current_date += timedelta(days=1)
            days_checked += 1
        
        # Sort by score (higher is better)
        suggestions.sort(key=lambda x: x['score'], reverse=True)
        
        return suggestions
    
    def calculate_time_score(self, dt: datetime) -> float:
        """Calculate score for a time slot (0-100)"""
        score = 50.0  # Base score
        
        # Prefer mid-morning (10-11 AM) and early afternoon (2-3 PM)
        if 10 <= dt.hour <= 11:
            score += 20
        elif 14 <= dt.hour <= 15:
            score += 15
        elif 9 <= dt.hour <= 10 or 15 <= dt.hour <= 16:
            score += 10
        
        # Prefer Tuesday, Wednesday, Thursday
        if dt.weekday() in [1, 2, 3]:
            score += 10
        elif dt.weekday() in [0, 4]:
            score += 5
        
        # Prefer not too far in the future
        days_ahead = (dt.date() - datetime.now().date()).days
        if days_ahead <= 2:
            score += 10
        elif days_ahead <= 5:
            score += 5
        
        return min(score, 100.0)
    
    def get_suggestion_reason(self, dt: datetime) -> str:
        """Get human-readable reason for suggestion"""
        reasons = []
        
        if 10 <= dt.hour <= 11:
            reasons.append("optimal morning time")
        elif 14 <= dt.hour <= 15:
            reasons.append("good afternoon slot")
        
        if dt.weekday() in [1, 2, 3]:
            reasons.append("mid-week")
        
        days_ahead = (dt.date() - datetime.now().date()).days
        if days_ahead == 0:
            reasons.append("today")
        elif days_ahead == 1:
            reasons.append("tomorrow")
        elif days_ahead <= 3:
            reasons.append("this week")
        
        return ", ".join(reasons) if reasons else "available slot"
    
    def resolve_conflict(
        self, 
        desired_start: datetime,
        desired_end: datetime,
        existing_events: List[Dict]
    ) -> Dict:
        """Resolve scheduling conflict by suggesting alternatives"""
        conflicts = self.check_conflicts(desired_start, desired_end, existing_events)
        
        if not conflicts:
            return {
                'has_conflict': False,
                'message': '✅ No conflicts found',
                'alternatives': []
            }
        
        # Generate alternative times
        duration_minutes = int((desired_end - desired_start).total_seconds() / 60)
        alternatives = self.suggest_optimal_times(
            duration_minutes=duration_minutes,
            preferred_date=desired_start,
            existing_events=existing_events
        )
        
        conflict_details = []
        for conflict in conflicts:
            event = conflict['event']
            conflict_details.append(f"• {event.get('summary', 'Event')} from {conflict['overlap_start'].strftime('%I:%M %p')} to {conflict['overlap_end'].strftime('%I:%M %p')}")
        
        return {
            'has_conflict': True,
            'message': f"⚠️ Scheduling conflict detected:\n" + "\n".join(conflict_details),
            'alternatives': alternatives[:3],  # Top 3 alternatives
            'conflicts': conflicts
        }
    
    def format_time_suggestion(self, suggestion: Dict) -> str:
        """Format time suggestion for display"""
        start = datetime.fromisoformat(suggestion['start'])
        end = datetime.fromisoformat(suggestion['end'])
        
        return f"{start.strftime('%A, %B %d at %I:%M %p')} - {end.strftime('%I:%M %p')} ({suggestion['reason']}, score: {suggestion['score']:.0f}/100)"

# Global instance
scheduler = SmartScheduler()
