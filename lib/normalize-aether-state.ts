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

function asHabits(raw: unknown): AetherHabit[] {
    if (!Array.isArray(raw)) return DEFAULT_AETHER_STATE.habits;
    return raw.map((h, i) => {
        const row = h as Record<string, unknown>;
        const streakRaw = row.streak ?? row.streak_count;
        const streak = Math.max(0, Math.min(366, Number(streakRaw) || 0));
        return {
            id: String(row.id ?? `h-${i}`),
            name: String(row.name ?? "Habit"),
            streak,
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
