import { DEFAULT_AETHER_STATE } from "@/lib/aether-defaults";
import type { AetherFinance, AetherHabit, AetherSocial, AetherState, AetherTask, JournalEntry } from "@/lib/aether-types";

function asTasks(raw: unknown): AetherTask[] {
    if (!Array.isArray(raw)) return DEFAULT_AETHER_STATE.tasks;
    return raw.map((t, i) => ({
        id: String((t as AetherTask)?.id ?? `t-${i}`),
        title: String((t as AetherTask)?.title ?? "Task"),
        status: (t as AetherTask)?.status === "completed" ? "completed" : "pending",
        tag: String((t as AetherTask)?.tag ?? "general"),
    }));
}

/** Compute current streak from an array of "YYYY-MM-DD" log strings. */
function computeStreak(logs: string[]): number {
    if (!logs.length) return 0;
    const unique = Array.from(new Set(logs)).sort().reverse(); // newest first
    const today = new Date().toISOString().split("T")[0];
    // Streak counts from today or yesterday going backwards consecutively
    let streak = 0;
    let expected = today;
    // If today is not logged, check if yesterday was — streak can still be active
    if (unique[0] !== today) {
        // Check if the most recent log is yesterday
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        if (unique[0] !== yesterday) return 0; // streak broken
        expected = yesterday;
    }
    for (const date of unique) {
        if (date === expected) {
            streak++;
            // Move expected one day back
            const d = new Date(expected + "T00:00:00");
            d.setDate(d.getDate() - 1);
            expected = d.toISOString().split("T")[0];
        } else if (date < expected) {
            break; // gap found, streak broken
        }
    }
    return streak;
}

function computeLongestStreak(logs: string[]): number {
    if (!logs.length) return 0;
    const unique = Array.from(new Set(logs)).sort(); // oldest first
    let longest = 0;
    let current = 1;
    for (let i = 1; i < unique.length; i++) {
        const prev = new Date(unique[i - 1] + "T00:00:00");
        const cur = new Date(unique[i] + "T00:00:00");
        const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86400000);
        if (diffDays === 1) {
            current++;
        } else {
            longest = Math.max(longest, current);
            current = 1;
        }
    }
    return Math.max(longest, current);
}

function asHabits(raw: unknown): AetherHabit[] {
    if (!Array.isArray(raw)) return DEFAULT_AETHER_STATE.habits;
    return raw.map((h, i) => {
        const row = h as Record<string, unknown>;
        const logs: string[] = Array.isArray(row.logs) ? (row.logs as string[]).filter((l) => typeof l === "string") : [];
        const streak = computeStreak(logs);
        const longestStreak = Math.max(
            Number(row.longestStreak) || 0,
            computeLongestStreak(logs),
        );
        return {
            id: String(row.id ?? `h-${i}`),
            name: String(row.name ?? "Habit"),
            streak,
            logs,
            longestStreak,
        };
    });
}

function asFinances(raw: unknown): AetherFinance[] {
    if (!Array.isArray(raw)) return DEFAULT_AETHER_STATE.finances;
    return raw.map((f, i) => ({
        id: String((f as AetherFinance)?.id ?? `f-${i}`),
        name: String((f as AetherFinance)?.name ?? "Category"),
        spent: Math.max(0, Number((f as AetherFinance)?.spent) || 0),
        limit: Math.max(0, Number((f as AetherFinance)?.limit) || 0),
        color: String((f as AetherFinance)?.color ?? "bg-[#7C63F5]"),
    }));
}

function asSocial(raw: unknown): AetherSocial[] {
    if (!Array.isArray(raw)) return DEFAULT_AETHER_STATE.social;
    return raw.map((s, i) => ({
        id: String((s as AetherSocial)?.id ?? `s-${i}`),
        name: String((s as AetherSocial)?.name ?? "Contact"),
        status: String((s as AetherSocial)?.status ?? ""),
        action: String((s as AetherSocial)?.action ?? ""),
        actionColor: String((s as AetherSocial)?.actionColor ?? "text-[#4AE189] bg-[#4AE189]/10"),
    }));
}

function asJournal(raw: unknown): JournalEntry[] {
    if (!Array.isArray(raw)) return DEFAULT_AETHER_STATE.journalEntries;
    return raw.map((e, i) => ({
        id: String((e as JournalEntry)?.id ?? `j-${i}`),
        title: String((e as JournalEntry)?.title ?? ""),
        body: String((e as JournalEntry)?.body ?? ""),
        createdAt: String((e as JournalEntry)?.createdAt ?? new Date().toISOString()),
    }));
}

/** Coerce partial dashboard JSON from the API into a full AetherState. */
export function normalizeAetherState(data: unknown): AetherState {
    if (!data || typeof data !== "object") {
        return { ...DEFAULT_AETHER_STATE };
    }
    const d = data as Record<string, unknown>;
    return {
        tasks: asTasks(d.tasks),
        habits: asHabits(d.habits),
        finances: asFinances(d.finances),
        social: asSocial(d.social),
        journalEntries: asJournal(d.journalEntries),
        wellness:
            d.wellness && typeof d.wellness === "object"
                ? { ...DEFAULT_AETHER_STATE.wellness, ...(d.wellness as AetherState["wellness"]) }
                : DEFAULT_AETHER_STATE.wellness,
    };
}
