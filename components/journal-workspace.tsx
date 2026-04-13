"use client";

import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { format } from "date-fns";
import { FilePlus2, Pencil, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDashboard } from "@/app/context/DashboardContext";
import type { JournalEntry } from "@/lib/aether-types";
import { cn } from "@/lib/utils";

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
                e.id === selectedId ? { ...e, title: t, body: b, createdAt: e.createdAt } : e,
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

    return (
        <div className="flex min-h-[480px] flex-col gap-4 lg:flex-row lg:gap-6">
            <aside className="flex w-full shrink-0 flex-col rounded-[2rem] border border-white/10 bg-[#171717] text-white lg:w-[300px]">
                <div className="border-b border-white/10 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <h2 className="text-sm font-medium text-gray-400">History</h2>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 rounded-full text-xs text-gray-300 hover:bg-white/10"
                            onClick={startNew}
                        >
                            <FilePlus2 className="h-3.5 w-3.5" />
                            New
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search entries…"
                            className="h-9 rounded-full border-gray-700 bg-[#252525] pl-9 text-sm text-gray-200 placeholder:text-gray-500"
                        />
                    </div>
                </div>
                <ScrollArea className="h-[min(360px,50dvh)] lg:h-[min(560px,calc(100dvh-14rem))]">
                    <div className="space-y-1 p-2">
                        {sorted.length === 0 && (
                            <p className="px-2 py-6 text-center text-sm text-gray-500">No entries match your search.</p>
                        )}
                        {sorted.map((e) => (
                            <div
                                key={e.id}
                                className={cn(
                                    "group flex items-start gap-2 rounded-2xl p-2 transition-colors",
                                    selectedId === e.id ? "bg-white/15" : "hover:bg-white/5",
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={() => loadEntry(e)}
                                    className="min-w-0 flex-1 text-left"
                                >
                                    <div className="truncate text-sm font-medium text-gray-100">{e.title}</div>
                                    <div className="text-[10px] text-gray-500">
                                        {format(new Date(e.createdAt), "MMM d, yyyy · h:mm a")}
                                    </div>
                                </button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0 text-gray-500 opacity-0 hover:text-red-400 group-hover:opacity-100"
                                    onClick={() => void deleteEntry(e.id)}
                                    aria-label="Delete entry"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </aside>

            <div className="min-w-0 flex-1 space-y-4">
                <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur lg:p-8">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <Pencil className="h-4 w-4 text-zinc-500" />
                        <h2 className="text-lg font-medium text-zinc-900">
                            {selectedId ? "Edit entry" : "New entry"}
                        </h2>
                    </div>
                    <div className="space-y-4">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title"
                            className="h-12 rounded-xl border-white/80 bg-white/90"
                        />
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="What stood out today? What do you want to carry forward?"
                            rows={12}
                            className="min-h-[220px] w-full resize-y rounded-2xl border border-zinc-200/80 bg-white/90 px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10"
                        />
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                onClick={() => void saveEntry()}
                                disabled={saving || !title.trim() || !body.trim()}
                                className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800"
                            >
                                {saving ? "Saving…" : selectedId ? "Update entry" : "Save entry"}
                            </Button>
                            {selectedId && (
                                <Button type="button" variant="outline" className="rounded-full" onClick={startNew}>
                                    Discard &amp; new
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
