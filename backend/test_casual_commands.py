"""
Test script for casual command parsing
Run this to test if the datetime parsing works correctly
"""

from datetime import datetime, timedelta
import re

def parse_casual_datetime(text: str) -> tuple:
    """Parse casual datetime references and return (start_iso, end_iso)"""
    now = datetime.now()
    text_lower = text.lower()
    
    # Handle date references
    if "tomorrow" in text_lower:
        target_date = now + timedelta(days=1)
    elif "today" in text_lower:
        target_date = now
    elif "next" in text_lower:
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        for i, day in enumerate(days):
            if day in text_lower:
                days_ahead = i - now.weekday()
                if days_ahead <= 0:
                    days_ahead += 7
                target_date = now + timedelta(days=days_ahead)
                break
        else:
            target_date = now
    else:
        target_date = now
    
    # Extract time
    time_patterns = [
        (r'(\d{1,2}):(\d{2})\s*(am|pm)?', 'time_with_minutes'),
        (r'(\d{1,2})\s*(am|pm)', 'time_with_ampm'),
        (r'(\d{1,2})\s*(?:o\'?clock)?', 'time_simple'),
    ]
    
    hour = 10  # default
    minute = 0
    
    for pattern, pattern_type in time_patterns:
        match = re.search(pattern, text_lower)
        if match:
            hour = int(match.group(1))
            
            if pattern_type == 'time_with_minutes':
                minute = int(match.group(2))
                if len(match.groups()) > 2 and match.group(3):
                    if match.group(3) == 'pm' and hour < 12:
                        hour += 12
                    elif match.group(3) == 'am' and hour == 12:
                        hour = 0
            elif pattern_type == 'time_with_ampm':
                if match.group(2) == 'pm' and hour < 12:
                    hour += 12
                elif match.group(2) == 'am' and hour == 12:
                    hour = 0
            
            break
    
    # Create ISO datetime
    start_dt = target_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
    end_dt = start_dt + timedelta(hours=1)
    
    return start_dt.isoformat(), end_dt.isoformat()

# Test cases
test_commands = [
    "book a meeting tomorrow at 10",
    "schedule appointment tomorrow at 2 PM",
    "book meeting today at 3:30 PM",
    "create event tomorrow at 10:00",
    "meeting next monday at 9 AM",
]

print("Testing casual datetime parsing:\n")
print(f"Current time: {datetime.now()}\n")

for cmd in test_commands:
    try:
        start, end = parse_casual_datetime(cmd)
        print(f"Command: '{cmd}'")
        print(f"  Start: {start}")
        print(f"  End:   {end}")
        print()
    except Exception as e:
        print(f"Command: '{cmd}'")
        print(f"  Error: {e}")
        print()

print("\nFormatted for book_appointment tool:")
for cmd in test_commands:
    try:
        start, end = parse_casual_datetime(cmd)
        # Extract meeting title
        title = "Meeting"
        if "dentist" in cmd.lower():
            title = "Dentist Appointment"
        elif "team" in cmd.lower():
            title = "Team Meeting"
        
        formatted = f"{title} | {start} | {end} | "
        print(f"Input:  '{cmd}'")
        print(f"Output: '{formatted}'")
        print()
    except Exception as e:
        print(f"Error: {e}")
