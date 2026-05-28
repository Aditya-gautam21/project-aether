"""Default Life OS state — keep in sync with lib/aether-defaults.ts."""

from datetime import date, timedelta

def _iso(days_ago: int) -> str:
    return (date.today() - timedelta(days=days_ago)).isoformat()

DEFAULT_AETHER_STATE: dict = {
    "tasks": [
        {"id": "t1", "title": "Set up your first habit", "status": "pending", "tag": "habit"},
        {"id": "t2", "title": "Review monthly budget", "status": "completed", "tag": "finance"},
        {"id": "t3", "title": "Reach out to a friend", "status": "pending", "tag": "social"},
    ],
    "habits": [
        {
            "id": "h1", "name": "Morning journal", "streak": 3,
            "logs": [_iso(0), _iso(1), _iso(2)],
            "longestStreak": 5,
        },
        {
            "id": "h2", "name": "Exercise", "streak": 2,
            "logs": [_iso(0), _iso(1)],
            "longestStreak": 4,
        },
        {
            "id": "h3", "name": "Reading", "streak": 5,
            "logs": [_iso(0), _iso(1), _iso(2), _iso(3), _iso(4)],
            "longestStreak": 7,
        },
    ],
    "finances": [
        {"id": "f1", "name": "Food", "spent": 3200, "limit": 5000, "color": "bg-gradient-to-r from-violet-400 to-violet-500"},
        {"id": "f2", "name": "Eating out", "spent": 4800, "limit": 4000, "color": "bg-gradient-to-r from-rose-400 to-rose-500"},
        {"id": "f3", "name": "Savings", "spent": 8000, "limit": 10000, "color": "bg-gradient-to-r from-emerald-400 to-emerald-500"},
    ],
    "social": [
        {
            "id": "s1",
            "name": "Friend",
            "status": "Talked 3 days ago",
            "action": "Ping",
            "actionColor": "text-[#4AE189] bg-[#4AE189]/10",
        },
    ],
    "journalEntries": [
        {
            "id": "j1",
            "title": "Welcome to Aether",
            "body": "Today I set up my Life OS. Excited to build better habits and track what matters.",
            "createdAt": "1970-01-01T00:00:00+00:00",
        }
    ],
    "wellness": {
        "innerCalmPercent": 85,
        "deepWorkLabel": "4h 20m",
        "connectionLabel": "High",
        "growthLabel": "+2 Skills",
        "steps": 8432,
        "stepsGoal": 10000,
        "waterCurrent": 4,
        "waterTarget": 8,
        "sleepHours": 7,
        "sleepMinutes": 20,
        "sleepTrendLabel": "12% better",
    },
}
