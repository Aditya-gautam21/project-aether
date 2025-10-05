"""
Enhanced Agent with Unique Features:
1. Smart Suggestions
2. Context Memory
3. Natural Language Feedback
4. Productivity Insights
"""

import re
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class EnhancedAgent:
    def __init__(self):
        self.context_file = 'context_memory.json'
        self.analytics_file = 'analytics.json'
        self.load_context()
        
    def load_context(self):
        """Load conversation context"""
        if os.path.exists(self.context_file):
            with open(self.context_file, 'r') as f:
                self.context = json.load(f)
        else:
            self.context = {
                'last_commands': [],
                'preferences': {},
                'frequent_contacts': [],
                'typical_meeting_times': []
            }
    
    def save_context(self):
        """Save conversation context"""
        with open(self.context_file, 'w') as f:
            json.dump(self.context, f, indent=2)
    
    def log_command(self, command: str, intent: str, success: bool):
        """Log command for analytics"""
        if not os.path.exists(self.analytics_file):
            analytics = {'commands': []}
        else:
            with open(self.analytics_file, 'r') as f:
                analytics = json.load(f)
        
        analytics['commands'].append({
            'command': command,
            'intent': intent,
            'success': success,
            'timestamp': datetime.now().isoformat()
        })
        
        # Keep only last 100 commands
        analytics['commands'] = analytics['commands'][-100:]
        
        with open(self.analytics_file, 'w') as f:
            json.dump(analytics, f, indent=2)
    
    def parse_datetime(self, text: str) -> Tuple[str, str]:
        """Parse datetime with smart defaults"""
        now = datetime.now()
        text_lower = text.lower()
        
        # Date parsing
        if "tomorrow" in text_lower:
            target_date = now + timedelta(days=1)
        elif "today" in text_lower:
            target_date = now
        elif "next monday" in text_lower:
            days_ahead = (0 - now.weekday() + 7) % 7 or 7
            target_date = now + timedelta(days=days_ahead)
        elif "next tuesday" in text_lower:
            days_ahead = (1 - now.weekday() + 7) % 7 or 7
            target_date = now + timedelta(days=days_ahead)
        elif "next wednesday" in text_lower:
            days_ahead = (2 - now.weekday() + 7) % 7 or 7
            target_date = now + timedelta(days=days_ahead)
        elif "next thursday" in text_lower:
            days_ahead = (3 - now.weekday() + 7) % 7 or 7
            target_date = now + timedelta(days=days_ahead)
        elif "next friday" in text_lower:
            days_ahead = (4 - now.weekday() + 7) % 7 or 7
            target_date = now + timedelta(days=days_ahead)
        else:
            iso_match = re.search(r'(\d{4}-\d{2}-\d{2})', text)
            if iso_match:
                target_date = datetime.fromisoformat(iso_match.group(1))
            else:
                target_date = now
        
        # Time parsing with smart defaults
        hour, minute = 10, 0  # default
        
        time_match = re.search(r'(\d{1,2}):(\d{2})\s*(am|pm)?', text_lower)
        if time_match:
            hour = int(time_match.group(1))
            minute = int(time_match.group(2))
            if time_match.group(3) == 'pm' and hour < 12:
                hour += 12
            elif time_match.group(3) == 'am' and hour == 12:
                hour = 0
        else:
            time_match = re.search(r'(\d{1,2})\s*(am|pm)', text_lower)
            if time_match:
                hour = int(time_match.group(1))
                if time_match.group(2) == 'pm' and hour < 12:
                    hour += 12
                elif time_match.group(2) == 'am' and hour == 12:
                    hour = 0
            else:
                time_match = re.search(r'at\s+(\d{1,2})', text_lower)
                if time_match:
                    hour = int(time_match.group(1))
        
        start_dt = target_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
        end_dt = start_dt + timedelta(hours=1)
        
        return start_dt.isoformat(), end_dt.isoformat()
    
    def detect_intent(self, command: str) -> str:
        """Detect user intent"""
        command_lower = command.lower()
        
        if any(word in command_lower for word in ["book", "schedule", "create event", "create meeting", "set up"]):
            return "book_appointment"
        elif any(word in command_lower for word in ["show", "list", "view", "what", "get", "display"]) and \
             any(word in command_lower for word in ["event", "calendar", "schedule", "meeting"]):
            return "get_events"
        elif any(word in command_lower for word in ["create", "add", "make"]) and "task" in command_lower:
            return "create_task"
        elif any(word in command_lower for word in ["show", "list", "view", "get", "display"]) and "task" in command_lower:
            return "get_tasks"
        elif any(word in command_lower for word in ["suggest", "recommend", "what should", "help me"]):
            return "get_suggestions"
        elif any(word in command_lower for word in ["insight", "productivity", "analysis", "how am i"]):
            return "get_insights"
        else:
            return "unknown"
    
    def get_smart_suggestions(self) -> List[str]:
        """Generate smart suggestions based on context"""
        suggestions = []
        now = datetime.now()
        hour = now.hour
        
        # Time-based suggestions
        if 8 <= hour < 10:
            suggestions.append("📅 Good morning! Ready to plan your day? Try: 'show my events for today'")
        elif 12 <= hour < 14:
            suggestions.append("🍽️ Lunch time! Don't forget to schedule your afternoon meetings")
        elif 16 <= hour < 18:
            suggestions.append("📊 End of day approaching. Review your tasks: 'show my tasks'")
        
        # Context-based suggestions
        if len(self.context['last_commands']) > 0:
            last_cmd = self.context['last_commands'][-1]
            if 'book' in last_cmd:
                suggestions.append("💡 Tip: You can also add attendees by including their email addresses")
        
        # Task-based suggestions
        try:
            if os.path.exists('tasks.json'):
                with open('tasks.json', 'r') as f:
                    tasks = json.load(f)
                    pending = [t for t in tasks if t['status'] == 'pending']
                    if len(pending) > 5:
                        suggestions.append(f"⚠️ You have {len(pending)} pending tasks. Time to prioritize!")
        except:
            pass
        
        return suggestions
    
    def get_productivity_insights(self) -> Dict:
        """Generate productivity insights"""
        insights = {
            'total_commands': 0,
            'most_used_feature': 'N/A',
            'productivity_score': 0,
            'suggestions': []
        }
        
        try:
            if os.path.exists(self.analytics_file):
                with open(self.analytics_file, 'r') as f:
                    analytics = json.load(f)
                    commands = analytics.get('commands', [])
                    
                    insights['total_commands'] = len(commands)
                    
                    # Count intents
                    intent_counts = {}
                    for cmd in commands:
                        intent = cmd.get('intent', 'unknown')
                        intent_counts[intent] = intent_counts.get(intent, 0) + 1
                    
                    if intent_counts:
                        insights['most_used_feature'] = max(intent_counts, key=intent_counts.get)
                    
                    # Calculate productivity score
                    success_rate = sum(1 for cmd in commands if cmd.get('success', False)) / len(commands) if commands else 0
                    insights['productivity_score'] = int(success_rate * 100)
                    
                    # Generate suggestions
                    if insights['productivity_score'] < 70:
                        insights['suggestions'].append("Try using more specific commands for better results")
                    if intent_counts.get('create_task', 0) > intent_counts.get('get_tasks', 0) * 2:
                        insights['suggestions'].append("You create many tasks but rarely review them. Try 'show my tasks' more often!")
        except Exception as e:
            logger.error(f"Error generating insights: {e}")
        
        return insights
    
    def process_command(self, command: str) -> Dict:
        """Process command with enhanced features"""
        intent = self.detect_intent(command)
        
        # Update context
        self.context['last_commands'].append(command)
        self.context['last_commands'] = self.context['last_commands'][-10:]  # Keep last 10
        self.save_context()
        
        result = {
            'success': False,
            'message': '',
            'suggestions': [],
            'intent': intent
        }
        
        try:
            if intent == "book_appointment":
                result = self.handle_book_appointment(command)
            elif intent == "get_events":
                result = self.handle_get_events(command)
            elif intent == "create_task":
                result = self.handle_create_task(command)
            elif intent == "get_tasks":
                result = self.handle_get_tasks(command)
            elif intent == "get_suggestions":
                result = self.handle_get_suggestions()
            elif intent == "get_insights":
                result = self.handle_get_insights()
            else:
                result['message'] = self.get_help_message()
                result['suggestions'] = self.get_smart_suggestions()
            
            # Log command
            self.log_command(command, intent, result['success'])
            
        except Exception as e:
            logger.error(f"Error processing command: {e}")
            result['message'] = f"❌ Error: {str(e)}"
            result['suggestions'] = ["Try rephrasing your command", "Use 'help' to see available commands"]
        
        return result
    
    def handle_book_appointment(self, command: str) -> Dict:
        """Handle booking appointments with smart scheduling"""
        try:
            from tools import book_appointment, get_events
            from smart_scheduler import scheduler
            from datetime import datetime
            
            start_iso, end_iso = self.parse_datetime(command)
            start_dt = datetime.fromisoformat(start_iso)
            end_dt = datetime.fromisoformat(end_iso)
            
            # Extract title
            title = "Meeting"
            keywords = {
                "dentist": "Dentist Appointment",
                "doctor": "Doctor Appointment",
                "team": "Team Meeting",
                "client": "Client Meeting",
                "standup": "Standup Meeting",
                "review": "Review Meeting",
                "interview": "Interview"
            }
            
            for keyword, full_title in keywords.items():
                if keyword in command.lower():
                    title = full_title
                    break
            
            # Extract emails
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            emails = re.findall(email_pattern, command)
            
            # Check for conflicts (if we can get existing events)
            try:
                # Get events for the day
                date_str = start_dt.date().isoformat()
                events_response = get_events.invoke(date_str)
                
                # Parse events (simplified - in production would parse properly)
                existing_events = []  # Would parse from events_response
                
                # Check conflicts
                conflict_result = scheduler.resolve_conflict(start_dt, end_dt, existing_events)
                
                if conflict_result['has_conflict']:
                    # Show conflict warning with alternatives
                    alternatives_text = "\n\n🔄 Suggested alternative times:"
                    for alt in conflict_result['alternatives']:
                        alternatives_text += f"\n• {scheduler.format_time_suggestion(alt)}"
                    
                    return {
                        'success': False,
                        'message': conflict_result['message'] + alternatives_text,
                        'suggestions': [
                            "Try one of the suggested times",
                            "Or specify a different time"
                        ],
                        'intent': 'book_appointment'
                    }
            except Exception as e:
                logger.warning(f"Could not check conflicts: {e}")
            
            # Format for tool
            tool_input = f"{title} | {start_iso} | {end_iso} | {','.join(emails)}"
            message = book_appointment.invoke(tool_input)
            
            # Add smart suggestions
            suggestions = [
                "💡 You can view your events with: 'show my events for today'",
                "📝 Don't forget to create a task to prepare for this meeting!"
            ]
            
            # Check if it's outside working hours
            if not scheduler.is_working_hours(start_dt):
                suggestions.insert(0, "⚠️ Note: This meeting is outside typical working hours")
            
            return {
                'success': True,
                'message': message,
                'suggestions': suggestions,
                'intent': 'book_appointment'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f"❌ Could not book appointment: {str(e)}",
                'suggestions': ["Try: 'book a meeting tomorrow at 10 AM'"],
                'intent': 'book_appointment'
            }
    
    def handle_get_events(self, command: str) -> Dict:
        """Handle getting events"""
        try:
            from tools import get_events
            
            date_str = "today"
            if "tomorrow" in command.lower():
                date_str = "tomorrow"
            elif "today" in command.lower():
                date_str = "today"
            else:
                iso_match = re.search(r'(\d{4}-\d{2}-\d{2})', command)
                if iso_match:
                    date_str = iso_match.group(1)
            
            message = get_events.invoke(date_str)
            
            return {
                'success': True,
                'message': message,
                'suggestions': [
                    "📅 Want to book another meeting? Try: 'book a meeting tomorrow at 2 PM'",
                    "📊 Check your productivity: 'show my insights'"
                ],
                'intent': 'get_events'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f"❌ Could not fetch events: {str(e)}",
                'suggestions': ["Try: 'show my events for today'"],
                'intent': 'get_events'
            }
    
    def handle_create_task(self, command: str) -> Dict:
        """Handle creating tasks"""
        try:
            from tools import create_task
            
            message = create_task.invoke(command)
            
            return {
                'success': True,
                'message': message,
                'suggestions': [
                    "✅ View all tasks: 'show my tasks'",
                    "📅 Schedule time to work on this: 'book a meeting tomorrow at 10'"
                ],
                'intent': 'create_task'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f"❌ Could not create task: {str(e)}",
                'suggestions': ["Try: 'create a high priority task to review code'"],
                'intent': 'create_task'
            }
    
    def handle_get_tasks(self, command: str) -> Dict:
        """Handle getting tasks with smart prioritization"""
        try:
            from tools import get_tasks
            from task_prioritizer import prioritizer
            import json
            import os
            
            # Get tasks
            message = get_tasks.invoke(command)
            
            # Add prioritization if tasks exist
            if os.path.exists('tasks.json'):
                with open('tasks.json', 'r') as f:
                    tasks = json.load(f)
                    
                if tasks:
                    # Prioritize tasks
                    prioritized = prioritizer.prioritize_tasks(tasks)
                    
                    # Get insights
                    insights = prioritizer.get_task_insights(tasks)
                    
                    # Suggest next task
                    next_task = prioritizer.suggest_next_task(tasks)
                    
                    # Enhanced message
                    message += f"\n\n📊 Task Insights:"
                    if insights['overdue'] > 0:
                        message += f"\n⚠️ {insights['overdue']} overdue tasks!"
                    if insights['due_today'] > 0:
                        message += f"\n🔔 {insights['due_today']} due today"
                    if insights['due_this_week'] > 0:
                        message += f"\n📅 {insights['due_this_week']} due this week"
                    
                    if next_task:
                        message += f"\n\n💡 Suggested next task: {next_task['name']} ({next_task['urgency_level']})"
            
            return {
                'success': True,
                'message': message,
                'suggestions': [
                    "➕ Add a new task: 'create a task to...'",
                    "📊 See your productivity: 'show my insights'"
                ],
                'intent': 'get_tasks'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f"❌ Could not fetch tasks: {str(e)}",
                'suggestions': ["Try: 'show my tasks'"],
                'intent': 'get_tasks'
            }
    
    def handle_get_suggestions(self) -> Dict:
        """Handle getting suggestions"""
        suggestions = self.get_smart_suggestions()
        
        message = "💡 Smart Suggestions:\n\n" + "\n".join(suggestions)
        
        return {
            'success': True,
            'message': message,
            'suggestions': [],
            'intent': 'get_suggestions'
        }
    
    def handle_get_insights(self) -> Dict:
        """Handle getting productivity insights"""
        insights = self.get_productivity_insights()
        
        message = f"""📊 Productivity Insights:

📈 Total Commands: {insights['total_tasks']}
⭐ Most Used Feature: {insights['most_used_feature']}
🎯 Productivity Score: {insights['productivity_score']}%

💡 Suggestions:
""" + "\n".join(f"• {s}" for s in insights['suggestions'])
        
        return {
            'success': True,
            'message': message,
            'suggestions': ["Keep up the good work! 🚀"],
            'intent': 'get_insights'
        }
    
    def get_help_message(self) -> str:
        """Get help message"""
        return """🤖 I can help you with:

📅 **Calendar Management**
• "book a meeting tomorrow at 10"
• "show my events for today"

✅ **Task Management**
• "create a high priority task to review code"
• "show my tasks"

💡 **Smart Features**
• "give me suggestions" - Get personalized suggestions
• "show my insights" - See productivity analytics

Just tell me what you want to do in plain English!"""

# Global instance
agent = EnhancedAgent()
