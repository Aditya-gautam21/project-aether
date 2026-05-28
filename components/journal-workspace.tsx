"use client";

import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { format, isToday, isYesterday } from "date-fns";
import { FilePlus2, Pencil, Search, Trash2, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDashboard } from "@/app/context/DashboardContext";
import type { JournalEntry } from "@/lib/aether-types";
import { cn } from "@/lib/utils";

function fmtDate(iso: string): string {
    const d = new Date(iso);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "MMM d, yyyy");
}

export function JournalWorkspace() {
    const { state, patch } = useDashboard();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [search, setSearch] = useState("");
    const [saving, setSaving] = useState(false);

    const sorted = useMemo(() => {
        const list = [...state.journalEntries].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter(
            (e) =>
                e.title.toLowerCase().includes(q) ||
                e.body.toLowerCase().includes(q) ||
                format(new Date(e.createdAt), "MMM d yyyy").toLowerCase().includes(q),
        );
    }, [state.journalEntries, search]);

    const startNew = () => {
        setSelectedId(null);
        setTitle("");
        setBody("");
    };

    const loadEntry = (e: JournalEntry) => {
        setSelectedId(e.id);
        setTitle(e.title);
        setBody(e.body);
    };

    const saveEntry = async () => {
        const t = title.trim();
        const b = body.trim();
        if (!t || !b) return;
        setSaving(true);
        let next: JournalEntry[];
        if (selectedId) {
            next = state.journalEntries.map((e) =>
                e.id === selectedId ? { ...e, title: t, body: b } : e,
            );
        } else {
            next = [
                {
                    id: nanoid(),
                    title: t,
                    body: b,
                    createdAt: new Date().toISOString(),
                },
                ...state.journalEntries,
            ];
            setSelectedId(next[0].id);
        }
        await patch({ journalEntries: next });
        setSaving(false);
    };

    const deleteEntry = async (id: string) => {
        const next = state.journalEntries.filter((e) => e.id !== id);
        await patch({ journalEntries: next });
        if (selectedId === id) startNew();
    };

    const entryCount = state.journalEntries.length;
    const thisWeekCount = state.journalEntries.filter(
        (e) => new Date(e.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).length;

    return (
        <div className="space-y-5">
            {/* summary row */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Calendar className="w-4 h-4 text-violet-500" />
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Entries</span>
                    </div>
                    <div className="text-2xl font-semibold text-zinc-800">{entryCount}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">total</div>
                </div>
                <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">This Week</span>
                    </div>
                    <div className="text-2xl font-semibold text-zinc-800">{thisWeekCount}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">entries</div>
                </div>
                <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Pencil className="w-4 h-4 text-emerald-500" />
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Editing</span>
                    </div>
                    <div className="text-sm font-semibold text-zinc-800 truncate">
                        {selectedId ? "Existing entry" : "New entry"}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{selectedId ? "click save" : "start writing"}</div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 min-h-[480px]">
                {/* sidebar - entry list */}
                <div className="w-full lg:w-[280px] shrink-0 flex flex-col bg-white/70 backdrop-blur rounded-2xl border border-white/80 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-zinc-100">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <h3 className="text-sm font-semibold text-zinc-800">Entries</h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1.5 rounded-lg text-xs text-zinc-500 hover:text-violet-600 hover:bg-violet-50"
                                onClick={startNew}
                            >
                                <FilePlus2 className="w-3.5 h-3.5" />
                                New
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search entries…"
                                className="h-9 rounded-xl border-zinc-200 bg-white pl-9 text-sm text-zinc-800 placeholder:text-zinc-400"
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-1 max-h-[360px] lg:max-h-[520px]">
                        <div className="p-2 space-y-1">
                            {sorted.length === 0 && (
                                <p className="px-2 py-8 text-center text-sm text-zinc-400">
                                    {search ? "No entries match." : "No entries yet."}
                                </p>
                            )}
                            {sorted.map((e) => (
                                <div
                                    key={e.id}
                                    className={cn(
                                        "group flex items-start gap-2 rounded-xl p-2.5 transition-colors",
                                        selectedId === e.id
                                            ? "bg-violet-50 border border-violet-100"
                                            : "hover:bg-zinc-50 border border-transparent",
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() => loadEntry(e)}
                                        className="min-w-0 flex-1 text-left"
                                    >
                                        <div className="truncate text-sm font-medium text-zinc-800">{e.title}</div>
                                        <div className="text-[11px] text-zinc-400 mt-0.5">{fmtDate(e.createdAt)}</div>
                                    </button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 shrink-0 text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                        onClick={() => void deleteEntry(e.id)}
                                        aria-label="Delete entry"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* editor */}
                <div className="min-w-0 flex-1 bg-white/70 backdrop-blur rounded-2xl border border-white/80 shadow-sm p-5 lg:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Pencil className="w-4 h-4 text-zinc-400" />
                        <h3 className="text-sm font-semibold text-zinc-800">
                            {selectedId ? "Edit Entry" : "New Entry"}
                        </h3>
                    </div>
                    <div className="space-y-4">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Entry title"
                            className="h-12 rounded-xl border-zinc-200 bg-white text-base"
                        />
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="What's on your mind today?"
                            rows={14}
                            className="min-h-[240px] w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/20 focus-visible:border-violet-400 transition-all"
                        />
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                onClick={() => void saveEntry()}
                                disabled={saving || !title.trim() || !body.trim()}
                                className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white gap-1.5"
                            >
                                {saving ? "Saving…" : selectedId ? "Update Entry" : "Save Entry"}
                            </Button>
                            {selectedId && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl border-zinc-200 hover:bg-zinc-50"
                                    onClick={startNew}
                                >
                                    New instead
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
