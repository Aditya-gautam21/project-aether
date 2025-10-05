"""
Task Prioritization Module
Features:
- Deadline-based scoring
- Importance weighting
- User preference learning
- Smart task ordering
"""

from datetime import datetime, timedelta
from typing import List, Dict
import json
import os
import logging

logger = logging.getLogger(__name__)

class TaskPrioritizer:
    def __init__(self):
        self.preferences_file = 'user_preferences.json'
        self.load_preferences()
    
    def load_preferences(self):
        """Load user preferences"""
        if os.path.exists(self.preferences_file):
            with open(self.preferences_file, 'r') as f:
                self.preferences = json.load(f)
        else:
            self.preferences = {
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
    
    def save_preferences(self):
        """Save user preferences"""
        with open(self.preferences_file, 'w') as f:
            json.dump(self.preferences, f, indent=2)
    
    def calculate_task_score(self, task: Dict) -> float:
        """Calculate priority score for a task (0-100)"""
        score = 0.0
        weights = self.preferences
        
        # 1. Priority weight (30%)
        priority = task.get('priority', 'medium').lower()
        priority_score = self.preferences['priority_weights'].get(priority, 2.0) * 33.33
        score += priority_score * weights['priority_importance']
        
        # 2. Deadline urgency (40%)
        deadline_score = self.calculate_deadline_score(task)
        score += deadline_score * weights['deadline_importance']
        
        # 3. Task age (20%)
        age_score = self.calculate_age_score(task)
        score += age_score * weights['age_importance']
        
        # 4. Completion rate bonus (10%)
        completion_score = self.calculate_completion_score(task)
        score += completion_score * weights['completion_rate_importance']
        
        return min(score, 100.0)
    
    def calculate_deadline_score(self, task: Dict) -> float:
        """Calculate score based on deadline (0-100)"""
        deadline = task.get('deadline')
        if not deadline:
            return 30.0  # No deadline = medium urgency
        
        try:
            deadline_dt = datetime.fromisoformat(deadline)
            now = datetime.now()
            days_until = (deadline_dt - now).days
            
            if days_until < 0:
                return 100.0  # Overdue!
            elif days_until == 0:
                return 95.0  # Due today
            elif days_until == 1:
                return 85.0  # Due tomorrow
            elif days_until <= 3:
                return 70.0  # Due this week
            elif days_until <= 7:
                return 50.0  # Due next week
            elif days_until <= 14:
                return 30.0  # Due in 2 weeks
            else:
                return 10.0  # Far future
        except:
            return 30.0
    
    def calculate_age_score(self, task: Dict) -> float:
        """Calculate score based on task age (0-100)"""
        created_at = task.get('created_at')
        if not created_at:
            return 0.0
        
        try:
            created_dt = datetime.fromisoformat(created_at)
            now = datetime.now()
            days_old = (now - created_dt).days
            
            if days_old >= 30:
                return 80.0  # Very old task
            elif days_old >= 14:
                return 60.0  # Old task
            elif days_old >= 7:
                return 40.0  # Week old
            elif days_old >= 3:
                return 20.0  # Few days old
            else:
                return 10.0  # New task
        except:
            return 0.0
    
    def calculate_completion_score(self, task: Dict) -> float:
        """Calculate score based on user's completion patterns"""
        # This would analyze user's completion patterns
        # For now, return base score
        return 50.0
    
    def prioritize_tasks(self, tasks: List[Dict]) -> List[Dict]:
        """Sort tasks by priority score"""
        # Calculate scores
        for task in tasks:
            task['priority_score'] = self.calculate_task_score(task)
            task['urgency_level'] = self.get_urgency_level(task['priority_score'])
        
        # Sort by score (highest first)
        sorted_tasks = sorted(tasks, key=lambda x: x['priority_score'], reverse=True)
        
        return sorted_tasks
    
    def get_urgency_level(self, score: float) -> str:
        """Get urgency level from score"""
        if score >= 80:
            return "🔴 Critical"
        elif score >= 60:
            return "🟠 High"
        elif score >= 40:
            return "🟡 Medium"
        else:
            return "🟢 Low"
    
    def get_prioritization_explanation(self, task: Dict) -> str:
        """Explain why a task has its priority"""
        explanations = []
        
        priority = task.get('priority', 'medium')
        explanations.append(f"Priority: {priority}")
        
        deadline = task.get('deadline')
        if deadline:
            try:
                deadline_dt = datetime.fromisoformat(deadline)
                days_until = (deadline_dt - datetime.now()).days
                if days_until < 0:
                    explanations.append("⚠️ OVERDUE")
                elif days_until == 0:
                    explanations.append("⚠️ Due today")
                elif days_until == 1:
                    explanations.append("Due tomorrow")
                elif days_until <= 7:
                    explanations.append(f"Due in {days_until} days")
            except:
                pass
        
        created_at = task.get('created_at')
        if created_at:
            try:
                created_dt = datetime.fromisoformat(created_at)
                days_old = (datetime.now() - created_dt).days
                if days_old >= 14:
                    explanations.append(f"Created {days_old} days ago")
            except:
                pass
        
        return " | ".join(explanations)
    
    def suggest_next_task(self, tasks: List[Dict]) -> Optional[Dict]:
        """Suggest the next task to work on"""
        pending_tasks = [t for t in tasks if t.get('status') == 'pending']
        
        if not pending_tasks:
            return None
        
        prioritized = self.prioritize_tasks(pending_tasks)
        return prioritized[0] if prioritized else None
    
    def get_task_insights(self, tasks: List[Dict]) -> Dict:
        """Get insights about task distribution"""
        total = len(tasks)
        if total == 0:
            return {
                'total': 0,
                'by_priority': {},
                'by_urgency': {},
                'overdue': 0,
                'due_today': 0,
                'due_this_week': 0
            }
        
        by_priority = {}
        by_urgency = {}
        overdue = 0
        due_today = 0
        due_this_week = 0
        
        for task in tasks:
            # Count by priority
            priority = task.get('priority', 'medium')
            by_priority[priority] = by_priority.get(priority, 0) + 1
            
            # Calculate urgency
            score = self.calculate_task_score(task)
            urgency = self.get_urgency_level(score)
            by_urgency[urgency] = by_urgency.get(urgency, 0) + 1
            
            # Check deadlines
            deadline = task.get('deadline')
            if deadline:
                try:
                    deadline_dt = datetime.fromisoformat(deadline)
                    days_until = (deadline_dt - datetime.now()).days
                    
                    if days_until < 0:
                        overdue += 1
                    elif days_until == 0:
                        due_today += 1
                    elif days_until <= 7:
                        due_this_week += 1
                except:
                    pass
        
        return {
            'total': total,
            'by_priority': by_priority,
            'by_urgency': by_urgency,
            'overdue': overdue,
            'due_today': due_today,
            'due_this_week': due_this_week
        }

# Global instance
prioritizer = TaskPrioritizer()
