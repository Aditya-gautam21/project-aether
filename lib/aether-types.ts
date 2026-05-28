export type TaskStatus = "pending" | "completed";

export interface AetherTask {
    id: string;
    title: string;
    status: TaskStatus;
    tag: string;
}

export interface AetherHabit {
    id: string;
    name: string;
    streak: number;
    logs: string[]; // ISO date strings — each entry = habit completed on that day
    longestStreak: number;
}

export interface AetherFinance {
    id: string;
    name: string;
    spent: number;
    limit: number;
    color: string;
}

export interface AetherSocial {
    id: string;
    name: string;
    status: string;
    action: string;
    actionColor: string;
}

export interface JournalEntry {
    id: string;
    title: string;
    body: string;
    createdAt: string;
}

export interface AetherWellness {
    innerCalmPercent: number;
    deepWorkLabel: string;
    connectionLabel: string;
    growthLabel: string;
    steps: number;
    stepsGoal: number;
    waterCurrent: number;
    waterTarget: number;
    sleepHours: number;
    sleepMinutes: number;
    sleepTrendLabel: string;
}

export interface AetherState {
    tasks: AetherTask[];
    habits: AetherHabit[];
    finances: AetherFinance[];
    social: AetherSocial[];
    journalEntries: JournalEntry[];
    wellness: AetherWellness;
}
