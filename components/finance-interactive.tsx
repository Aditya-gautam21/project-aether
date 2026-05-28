"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { Plus, Trash2, Circle, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboard } from "@/app/context/DashboardContext";
import type { AetherFinance } from "@/lib/aether-types";
import { cn } from "@/lib/utils";

const COLOR_PRESETS = [
    { bar: "bg-gradient-to-r from-violet-400 to-violet-500", dot: "bg-violet-500", ring: "ring-violet-500/20" },
    { bar: "bg-gradient-to-r from-rose-400 to-rose-500", dot: "bg-rose-500", ring: "ring-rose-500/20" },
    { bar: "bg-gradient-to-r from-emerald-400 to-emerald-500", dot: "bg-emerald-500", ring: "ring-emerald-500/20" },
    { bar: "bg-gradient-to-r from-amber-400 to-amber-500", dot: "bg-amber-500", ring: "ring-amber-500/20" },
    { bar: "bg-gradient-to-r from-sky-400 to-sky-500", dot: "bg-sky-500", ring: "ring-sky-500/20" },
    { bar: "bg-gradient-to-r from-indigo-400 to-indigo-500", dot: "bg-indigo-500", ring: "ring-indigo-500/20" },
];

export function FinanceInteractive() {
    const { state, patch } = useDashboard();
    const [name, setName] = useState("");
    const [limitVal, setLimitVal] = useState("");
    const [spentVal, setSpentVal] = useState("");
    const [editingSpent, setEditingSpent] = useState<Record<string, string>>({});

    const persist = async (next: AetherFinance[]) => {
        await patch({ finances: next });
    };

    const addCategory = async () => {
        const n = name.trim();
        const lim = Math.max(1, parseInt(limitVal, 10) || 5000);
        const sp = Math.max(0, parseInt(spentVal, 10) || 0);
        if (!n) return;
        const preset = COLOR_PRESETS[state.finances.length % COLOR_PRESETS.length];
        await persist([
            ...state.finances,
            { id: nanoid(), name: n, spent: sp, limit: lim, color: preset.bar },
        ]);
        setName("");
        setLimitVal("");
        setSpentVal("");
    };

    const updateName = async (id: string, raw: string) => {
        await persist(
            state.finances.map((f) => (f.id === id ? { ...f, name: String(raw) } : f)),
        );
    };

    const cycleColor = async (id: string) => {
        const next = state.finances.map((f) => {
            if (f.id !== id) return f;
            const ci = COLOR_PRESETS.findIndex((c) => c.bar === f.color);
            const ni = ci < 0 ? 0 : (ci + 1) % COLOR_PRESETS.length;
            return { ...f, color: COLOR_PRESETS[ni].bar };
        });
        await persist(next);
    };

    const commitSpent = async (id: string) => {
        const raw = editingSpent[id];
        if (raw === undefined) return;
        const num = Math.max(0, parseInt(raw, 10) || 0);
        const nextEdits = { ...editingSpent };
        delete nextEdits[id];
        setEditingSpent(nextEdits);
        await persist(
            state.finances.map((f) => (f.id === id ? { ...f, spent: num } : f)),
        );
    };

    const remove = async (id: string) => {
        await persist(state.finances.filter((f) => f.id !== id));
    };

    const totalBudget = state.finances.reduce((s, f) => s + f.limit, 0);
    const totalSpent = state.finances.reduce((s, f) => s + f.spent, 0);
    const remaining = totalBudget - totalSpent;
    const overCount = state.finances.filter((f) => f.spent > f.limit).length;
    const spentPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    return (
        <div className="space-y-5">
            {/* summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-4 h-4 text-violet-500" />
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Budget</span>
                    </div>
                    <div className="text-2xl font-semibold text-zinc-800">₹{totalBudget.toLocaleString()}</div>
                </div>
                <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-rose-500" />
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Spent</span>
                    </div>
                    <div className="text-2xl font-semibold text-zinc-800">₹{totalSpent.toLocaleString()}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{spentPct}% of budget</div>
                </div>
                <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Remaining</span>
                    </div>
                    <div className={cn("text-2xl font-semibold", remaining >= 0 ? "text-emerald-600" : "text-rose-600")}>
                        ₹{remaining.toLocaleString()}
                    </div>
                </div>
                <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Circle className="w-4 h-4 text-amber-500" />
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Over Budget</span>
                    </div>
                    <div className="text-2xl font-semibold text-zinc-800">{overCount}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{overCount === 1 ? "category" : "categories"}</div>
                </div>
            </div>

            {/* category list */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/80 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-800">Budget Categories</h3>
                    <span className="text-[11px] text-zinc-400">{state.finances.length} categories</span>
                </div>

                <div className="divide-y divide-zinc-100">
                    {state.finances.length === 0 && (
                        <div className="px-5 py-12 text-center">
                            <p className="text-sm text-zinc-400">No budget categories yet.</p>
                            <p className="text-xs text-zinc-400 mt-1">Add one below to start tracking.</p>
                        </div>
                    )}
                    {state.finances.map((f) => {
                        const pct = f.limit > 0 ? Math.min((f.spent / f.limit) * 100, 100) : 0;
                        const over = f.spent > f.limit;
                        return (
                            <div key={f.id} className="px-5 py-4 hover:bg-zinc-50/50 transition-colors group">
                                <div className="flex items-center gap-3 mb-2.5">
                                    <button
                                        type="button"
                                        onClick={() => cycleColor(f.id)}
                                        className={cn("w-3 h-3 rounded-full shrink-0 ring-4 transition-transform hover:scale-125", f.color.replace("bg-gradient-to-r from-", "").split(" ")[0])}
                                        style={{
                                            background: f.color.includes("violet") ? "#a78bfa"
                                                : f.color.includes("rose") ? "#fb7185"
                                                : f.color.includes("emerald") ? "#34d399"
                                                : f.color.includes("amber") ? "#fbbf24"
                                                : f.color.includes("sky") ? "#38bdf8"
                                                : "#818cf8",
                                        }}
                                        title="Cycle color"
                                    />
                                    <Input
                                        value={f.name}
                                        onChange={(e) => updateName(f.id, e.target.value)}
                                        className="h-8 flex-1 min-w-[100px] rounded-lg border-zinc-200 bg-transparent text-sm font-medium text-zinc-800 hover:border-zinc-300 focus:bg-white transition-all"
                                    />
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-zinc-400">₹</span>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={editingSpent[f.id] ?? String(f.spent)}
                                            onChange={(e) =>
                                                setEditingSpent((s) => ({ ...s, [f.id]: e.target.value }))
                                            }
                                            onBlur={() => commitSpent(f.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                            }}
                                            className="h-8 w-20 rounded-lg border-zinc-200 bg-transparent text-xs font-mono text-zinc-600 hover:border-zinc-300 focus:bg-white transition-all"
                                        />
                                        <span className="text-[10px] text-zinc-400 mr-1">/ ₹{f.limit.toLocaleString()}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0 text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                        onClick={() => remove(f.id)}
                                        aria-label="Remove category"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            f.color,
                                        )}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className={cn("text-[10px]", over ? "text-rose-500 font-medium" : "text-zinc-400")}>
                                        {Math.round(pct)}%
                                    </span>
                                    {over && (
                                        <span className="text-[10px] font-medium text-rose-500">
                                            Over by ₹{(f.spent - f.limit).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* add new category */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/80 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-zinc-800 mb-4">Add Category</h3>
                <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[140px] flex-1">
                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                            Name
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Groceries"
                            className="h-10 rounded-xl border-zinc-200 bg-white"
                            onKeyDown={(e) => e.key === "Enter" && void addCategory()}
                        />
                    </div>
                    <div className="w-28">
                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                            Cap ₹
                        </label>
                        <Input
                            type="number"
                            min={0}
                            value={limitVal}
                            onChange={(e) => setLimitVal(e.target.value)}
                            placeholder="5000"
                            className="h-10 rounded-xl border-zinc-200 bg-white"
                        />
                    </div>
                    <div className="w-28">
                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                            Spent ₹
                        </label>
                        <Input
                            type="number"
                            min={0}
                            value={spentVal}
                            onChange={(e) => setSpentVal(e.target.value)}
                            placeholder="0"
                            className="h-10 rounded-xl border-zinc-200 bg-white"
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={() => void addCategory()}
                        disabled={!name.trim()}
                        className="h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white gap-1.5 px-4"
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </Button>
                </div>
            </div>
        </div>
    );
}
