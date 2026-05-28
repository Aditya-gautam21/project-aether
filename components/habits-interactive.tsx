"use client";

import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { Trash2, Flame, CheckCircle2, Target, CircleCheck, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboard } from "@/app/context/DashboardContext";
import type { AetherHabit } from "@/lib/aether-types";
import { cn } from "@/lib/utils";

function todayISO(): string {
    return new Date().toISOString().split("T")[0];
}

function daysAgoISO(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split("T")[0];
}

export function HabitsInteractive() {
    const { state, patch } = useDashboard();
    const [newName, setNewName] = useState("");
    const [draftNames, setDraftNames] = useState<Record<string, string>>({});
    const focusedIdRef = useRef<string | null>(null);
    const habitsRef = useRef(state.habits);
    habitsRef.current = state.habits;

    useEffect(() => {
        if (focusedIdRef.current) return;
        setDraftNames((prev) => {
            const next: Record<string, string> = { ...prev };
            for (const h of state.habits) {
                if (next[h.id] === undefined) next[h.id] = h.name;
            }
            for (const id of Object.keys(next)) {
                if (!state.habits.some((h) => h.id === id)) delete next[id];
            }
            return next;
        });
    }, [state.habits]);

    const persist = async (next: AetherHabit[]) => {
        await patch({ habits: next });
    };

    const nameFor = (h: AetherHabit) => draftNames[h.id] ?? h.name;

    const commitName = async (h: AetherHabit) => {
        const name = nameFor(h).trim();
        if (!name) {
            setDraftNames((s) => ({ ...s, [h.id]: h.name }));
            return;
        }
        if (name === h.name) return;
        await persist(habitsRef.current.map((x) => (x.id === h.id ? { ...x, name } : x)));
    };

    const toggleCheckIn = async (h: AetherHabit) => {
        const today = todayISO();
        const logs = h.logs || [];
        const checkedIn = logs.includes(today);
        const nextLogs = checkedIn
            ? logs.filter((d) => d !== today)
            : [...logs, today];
        await persist(
            habitsRef.current.map((x) =>
                x.id === h.id ? { ...x, logs: nextLogs } : x,
            ),
        );
    };

    const addHabit = async () => {
        const n = newName.trim();
        if (!n) return;
        await persist([
            ...habitsRef.current,
            { id: nanoid(), name: n, streak: 0, logs: [], longestStreak: 0 },
        ]);
        setNewName("");
    };

    const remove = async (id: string) => {
        await persist(habitsRef.current.filter((h) => h.id !== id));
        setDraftNames((s) => {
            const next = { ...s };
            delete next[id];
            return next;
        });
    };

    const totalStreaks = state.habits.reduce((s, h) => s + (h.streak || 0), 0);
    const activeCount = state.habits.filter((h) => (h.streak || 0) > 0).length;
    const bestHabit = state.habits.reduce(
        (best, h) => ((h.longestStreak || 0) > (best?.longestStreak ?? 0) ? h : best),
        state.habits[0],
    );

    const last7Days = Array.from({ length: 7 }, (_, i) => daysAgoISO(6 - i));
    const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

    return (
        <div className="space-y-5">
            {/* summary row */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Flame className="w-4 h-4 text-amber-500" />
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Streaks</span>
                    </div>
                    <div className="text-2xl font-semibold text-zinc-800">{totalStreaks}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">total days</div>
                </div>
                <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Active</span>
                    </div>
                    <div className="text-2xl font-semibold text-zinc-800">{activeCount}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{state.habits.length} total</div>
                </div>
                <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                        <CheckCircle2 className="w-4 h-4 text-violet-500" />
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Best</span>
                    </div>
                    <div className="text-sm font-semibold text-zinc-800 truncate">{bestHabit?.name ?? "—"}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{bestHabit?.longestStreak ?? 0}d best</div>
                </div>
            </div>

            {/* weekly overview */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/80 shadow-sm p-4">
                <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">This Week</h3>
                <div className="flex items-end gap-2 h-16">
                    {last7Days.map((d, i) => {
                        const count = state.habits.filter((h) => (h.logs || []).includes(d)).length;
                        const total = state.habits.length || 1;
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        const isToday = d === todayISO();
                        return (
                            <div key={d} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                                <span className="text-[10px] font-semibold tabular-nums text-zinc-600">{count}</span>
                                <div className="w-full rounded-full bg-zinc-100 overflow-hidden" style={{ height: "40px" }}>
                                    <div
                                        className={cn(
                                            "w-full rounded-full mt-auto transition-all",
                                            isToday ? "bg-violet-400" : "bg-violet-200",
                                        )}
                                        style={{ height: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                                    />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-medium",
                                    isToday ? "text-violet-600" : "text-zinc-400",
                                )}>
                                    {dayLabels[i]}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* habit list */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/80 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-800">Your Habits</h3>
                    <span className="text-[11px] text-zinc-400">{state.habits.length} habits</span>
                </div>

                <div className="divide-y divide-zinc-100">
                    {state.habits.length === 0 && (
                        <div className="px-5 py-12 text-center">
                            <p className="text-sm text-zinc-400">No habits yet.</p>
                            <p className="text-xs text-zinc-400 mt-1">Start by adding one below.</p>
                        </div>
                    )}
                    {state.habits.map((h) => {
                        const today = todayISO();
                        const logs = h.logs || [];
                        const checkedInToday = logs.includes(today);
                        const streak = h.streak || 0;
                        const longest = h.longestStreak || 0;
                        const isLong = streak >= 7;

                        return (
                            <div key={h.id} className="px-5 py-4 hover:bg-zinc-50/50 transition-colors group">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-3 flex-1 min-w-[150px]">
                                        <div
                                            className={cn(
                                                "w-2.5 h-2.5 rounded-full shrink-0",
                                                isLong
                                                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                                                    : checkedInToday
                                                        ? "bg-violet-400"
                                                        : "bg-zinc-300",
                                            )}
                                        />
                                        <Input
                                            value={nameFor(h)}
                                            onChange={(e) =>
                                                setDraftNames((s) => ({ ...s, [h.id]: e.target.value }))
                                            }
                                            onFocus={() => {
                                                focusedIdRef.current = h.id;
                                            }}
                                            onBlur={() => {
                                                focusedIdRef.current = null;
                                                void commitName(h);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                            }}
                                            className="h-8 flex-1 min-w-[120px] rounded-lg border-zinc-200 bg-transparent text-sm font-medium text-zinc-800 hover:border-zinc-300 focus:bg-white transition-all"
                                            aria-label={`Habit name: ${h.name}`}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* 7-day dots based on actual log dates */}
                                        <div className="flex gap-1 items-center">
                                            {last7Days.map((d, j) => {
                                                const filled = logs.includes(d);
                                                const isToday = d === today;
                                                return (
                                                    <div
                                                        key={j}
                                                        className={cn(
                                                            "w-2 h-2 rounded-full transition-all",
                                                            filled
                                                                ? isToday
                                                                    ? "bg-emerald-500 shadow-[0_0_5px_rgba(52,211,153,0.3)]"
                                                                    : "bg-violet-300"
                                                                : isToday
                                                                    ? "bg-zinc-300 ring-1 ring-zinc-400"
                                                                    : "bg-zinc-200",
                                                        )}
                                                        title={`${dayLabels[j]} — ${d}${filled ? " ✓" : ""}`}
                                                    />
                                                );
                                            })}
                                        </div>

                                        {/* streak badges */}
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className={cn(
                                                    "text-xs font-semibold tabular-nums px-2 py-0.5 rounded-md",
                                                    isLong
                                                        ? "bg-emerald-50 text-emerald-600"
                                                        : streak > 0
                                                            ? "bg-violet-50 text-violet-600"
                                                            : "bg-zinc-100 text-zinc-400",
                                                )}
                                                title={`Current streak: ${streak} day${streak !== 1 ? "s" : ""}`}
                                            >
                                                {streak}d
                                            </span>
                                            {longest > 0 && (
                                                <span
                                                    className="text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600"
                                                    title={`Longest streak: ${longest} day${longest !== 1 ? "s" : ""}`}
                                                >
                                                    best {longest}
                                                </span>
                                            )}
                                        </div>

                                        {/* check-in button */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "h-8 rounded-lg text-xs font-medium gap-1.5 transition-all",
                                                checkedInToday
                                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                                                    : "bg-violet-50 text-violet-600 border border-violet-200 hover:bg-violet-100",
                                            )}
                                            onClick={() => toggleCheckIn(h)}
                                        >
                                            {checkedInToday ? (
                                                <>
                                                    <CircleCheck className="w-3.5 h-3.5" />
                                                    Done
                                                </>
                                            ) : (
                                                <>
                                                    <Circle className="w-3.5 h-3.5" />
                                                    Check in
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 shrink-0 text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                            onClick={() => remove(h.id)}
                                            aria-label="Remove habit"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* add form */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/80 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-zinc-800 mb-4">New Habit</h3>
                <div className="flex flex-wrap gap-3">
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Morning meditation"
                        className="h-10 flex-1 max-w-md rounded-xl border-zinc-200 bg-white"
                        onKeyDown={(e) => e.key === "Enter" && void addHabit()}
                    />
                    <Button
                        type="button"
                        onClick={() => void addHabit()}
                        disabled={!newName.trim()}
                        className="h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white gap-1.5 px-4"
                    >
                        + Add habit
                    </Button>
                </div>
            </div>
        </div>
    );
}
