"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboard } from "@/app/context/DashboardContext";
import type { AetherFinance } from "@/lib/aether-types";
import { cn } from "@/lib/utils";

const COLOR_PRESETS = [
    "bg-[#7C63F5]",
    "bg-[#F25A5A]",
    "bg-[#4AE189]",
    "bg-[#E7B846]",
    "bg-[#38BDF8]",
    "bg-[#A78BFA]",
];

export function FinanceInteractive() {
    const { state, patch } = useDashboard();
    const [name, setName] = useState("");
    const [limit, setLimit] = useState("");
    const [spent, setSpent] = useState("");

    const persist = async (next: AetherFinance[]) => {
        await patch({ finances: next });
    };

    const addCategory = async () => {
        const n = name.trim();
        const lim = Math.max(0, parseInt(limit, 10) || 0);
        const sp = Math.max(0, parseInt(spent, 10) || 0);
        if (!n) return;
        const color = COLOR_PRESETS[state.finances.length % COLOR_PRESETS.length];
        await persist([
            ...state.finances,
            { id: nanoid(), name: n, spent: sp, limit: lim, color },
        ]);
        setName("");
        setLimit("");
        setSpent("");
    };

    const updateField = async (id: string, field: keyof AetherFinance, raw: string | number) => {
        const next = state.finances.map((f) => {
            if (f.id !== id) return f;
            if (field === "name") return { ...f, name: String(raw) };
            const num = typeof raw === "number" ? raw : Math.max(0, parseInt(String(raw), 10) || 0);
            return { ...f, [field]: num };
        });
        await persist(next);
    };

    const cycleColor = async (id: string) => {
        const next = state.finances.map((f) => {
            if (f.id !== id) return f;
            const i = COLOR_PRESETS.indexOf(f.color);
            const ni = i < 0 ? 0 : (i + 1) % COLOR_PRESETS.length;
            return { ...f, color: COLOR_PRESETS[ni] };
        });
        await persist(next);
    };

    const remove = async (id: string) => {
        await persist(state.finances.filter((f) => f.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/5 bg-[#171717] p-5 text-white">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-gray-400">Budget categories</h3>
                    <span className="rounded-full bg-[#4AE189]/20 px-3 py-1 text-xs text-[#4AE189]">Editable</span>
                </div>
                <div className="flex flex-col gap-4">
                    {state.finances.map((f) => (
                        <div key={f.id} className="flex flex-wrap items-center gap-3 gap-y-2 text-sm">
                            <Input
                                value={f.name}
                                onChange={(e) => void updateField(f.id, "name", e.target.value)}
                                className="h-9 w-36 rounded-xl border-gray-700 bg-[#252525] text-gray-100 lg:w-44"
                            />
                            <button
                                type="button"
                                title="Bar color"
                                onClick={() => void cycleColor(f.id)}
                                className={cn("h-8 w-8 shrink-0 rounded-lg", f.color)}
                            />
                            <div className="flex min-w-[120px] flex-1 items-center gap-2">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-800">
                                    <div
                                        className={cn("h-full", f.color)}
                                        style={{ width: `${Math.min((f.spent / f.limit) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] uppercase text-gray-500">spent</span>
                                <Input
                                    type="number"
                                    min={0}
                                    value={f.spent}
                                    onChange={(e) => void updateField(f.id, "spent", e.target.value)}
                                    className="h-9 w-20 rounded-xl border-gray-700 bg-[#252525] font-mono text-xs text-gray-200"
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] uppercase text-gray-500">cap</span>
                                <Input
                                    type="number"
                                    min={0}
                                    value={f.limit}
                                    onChange={(e) => void updateField(f.id, "limit", e.target.value)}
                                    className="h-9 w-20 rounded-xl border-gray-700 bg-[#252525] font-mono text-xs text-gray-200"
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0 text-gray-500 hover:bg-white/10 hover:text-red-400"
                                onClick={() => void remove(f.id)}
                                aria-label="Remove category"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-[2rem] border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
                <h3 className="mb-3 text-sm font-medium text-zinc-900">Add category</h3>
                <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[140px] flex-1">
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                            Name
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Transport"
                            className="rounded-xl"
                        />
                    </div>
                    <div className="w-24">
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                            Cap ₹
                        </label>
                        <Input
                            type="number"
                            min={0}
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            placeholder="5000"
                            className="rounded-xl"
                        />
                    </div>
                    <div className="w-24">
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                            Spent ₹
                        </label>
                        <Input
                            type="number"
                            min={0}
                            value={spent}
                            onChange={(e) => setSpent(e.target.value)}
                            placeholder="0"
                            className="rounded-xl"
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={() => void addCategory()}
                        disabled={!name.trim()}
                        className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800"
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Add
                    </Button>
                </div>
            </div>
        </div>
    );
}
