import type { AetherState } from "./aether-types";

export const DEFAULT_AETHER_STATE: AetherState = {
    tasks: [
        { id: "t1", title: "Morning journal entry", status: "completed", tag: "habit" },
        { id: "t2", title: "Review monthly budget", status: "completed", tag: "finance" },
        { id: "t3", title: "Reach out to Vansh", status: "pending", tag: "social" },
        { id: "t4", title: "Read for 20 min", status: "pending", tag: "habit" },
    ],
    habits: [
        { id: "h1", name: "Journaling", streak: 5 },
        { id: "h2", name: "Emotion labeling", streak: 4 },
        { id: "h3", name: "Reading", streak: 5 },
        { id: "h4", name: "Gym", streak: 4 },
    ],
    finances: [
        { id: "f1", name: "Food", spent: 3600, limit: 5000, color: "bg-[#7C63F5]" },
        { id: "f2", name: "Eating out", spent: 4800, limit: 4000, color: "bg-[#F25A5A]" },
        { id: "f3", name: "Savings", spent: 8000, limit: 10000, color: "bg-[#4AE189]" },
    ],
    social: [
        {
            id: "s1",
            name: "Vansh",
            status: "Talked 3 days ago",
            action: "Ping",
            actionColor: "text-[#4AE189] bg-[#4AE189]/10",
        },
        {
            id: "s2",
            name: "Shreya",
            status: "2 weeks ago — overdue",
            action: "Overdue",
            actionColor: "text-[#F25A5A] bg-[#F25A5A]/10",
        },
    ],
    journalEntries: [
        {
            id: "j1",
            title: "Energy check-in",
            body: "Noticed I focus best after a short walk. Scheduling one before deep work tomorrow.",
            createdAt: new Date().toISOString(),
        },
    ],
    wellness: {
        innerCalmPercent: 85,
        deepWorkLabel: "4h 20m",
        connectionLabel: "High",
        growthLabel: "+2 Skills",
        steps: 8432,
        stepsGoal: 10000,
        waterCurrent: 4,
        waterTarget: 8,
        sleepHours: 7,
        sleepMinutes: 20,
        sleepTrendLabel: "12% better",
    },
};
