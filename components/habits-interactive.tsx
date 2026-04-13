"use client";

import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboard } from "@/app/context/DashboardContext";
import type { AetherHabit } from "@/lib/aether-types";
import { cn } from "@/lib/utils";

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

    const setStreak = async (id: string, streak: number) => {
        const s = Math.max(0, Math.min(30, streak));
        await persist(habitsRef.current.map((h) => (h.id === id ? { ...h, streak: s } : h)));
    };

    const addHabit = async () => {
        const n = newName.trim();
        if (!n) return;
        await persist([...habitsRef.current, { id: nanoid(), name: n, streak: 0 }]);
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

    return (
        <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/5 bg-[#171717] p-5 text-white">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-gray-400">Habits</h3>
                    <span className="rounded-full bg-[#C29623]/20 px-3 py-1 text-xs text-[#E7B846]">This week</span>
                </div>
                <div className="flex flex-col gap-5">
                    {state.habits.map((h) => (
                        <div key={h.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <Input
                                value={nameFor(h)}
                                onChange={(e) =>
                                    setDraftNames((s) => ({
                                        ...s,
                                        [h.id]: e.target.value,
                                    }))
                                }
                                onFocus={() => {
                                    focusedIdRef.current = h.id;
                                }}
                                onBlur={() => {
                                    focusedIdRef.current = null;
                                    void commitName(h);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        (e.target as HTMLInputElement).blur();
                                    }
                                }}
                                className="h-9 max-w-xs rounded-xl border-gray-700 bg-[#252525] text-gray-200"
                                aria-label={`Habit name: ${h.name}`}
                            />
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex gap-1.5">
                                    {[...Array(7)].map((_, j) => (
                                        <div
                                            key={j}
                                            className={cn(
                                                "h-2.5 w-2.5 rounded-full",
                                                j < h.streak
                                                    ? j === h.streak - 1
                                                        ? "bg-[#4AE189]"
                                                        : "bg-[#7C63F5]"
                                                    : "bg-gray-800",
                                            )}
                                            title={`Day ${j + 1}`}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-1 rounded-full border border-gray-700 bg-[#252525] p-0.5">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-gray-400 hover:bg-white/10 hover:text-white"
                                        onClick={() => {
                                            const cur = habitsRef.current.find((x) => x.id === h.id);
                                            if (!cur) return;
                                            void setStreak(h.id, cur.streak - 1);
                                        }}
                                        aria-label="Decrease streak"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="min-w-[1.25rem] text-center text-xs font-medium text-gray-300">
                                        {h.streak}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-gray-400 hover:bg-white/10 hover:text-white"
                                        onClick={() => {
                                            const cur = habitsRef.current.find((x) => x.id === h.id);
                                            if (!cur) return;
                                            void setStreak(h.id, cur.streak + 1);
                                        }}
                                        aria-label="Increase streak"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-500 hover:text-red-400"
                                    onClick={() => void remove(h.id)}
                                    aria-label="Remove habit"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-[2rem] border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
                <h3 className="mb-3 text-sm font-medium text-zinc-900">New habit</h3>
                <div className="flex flex-wrap gap-3">
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Habit name"
                        className="max-w-sm flex-1 rounded-xl"
                        onKeyDown={(e) => e.key === "Enter" && void addHabit()}
                    />
                    <Button
                        type="button"
                        onClick={() => void addHabit()}
                        disabled={!newName.trim()}
                        className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800"
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Add habit
                    </Button>
                </div>
            </div>
        </div>
    );
}
