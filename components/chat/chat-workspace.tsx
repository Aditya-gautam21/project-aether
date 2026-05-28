"use client";

import { useCallback, useEffect, useRef, useState, useLayoutEffect } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import {
    Copy,
    Download,
    Loader2,
    Menu,
    MessageSquarePlus,
    PanelLeftClose,
    PanelLeft,
    RefreshCw,
    Send,
    Square,
    Trash2,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { MessageBubble } from "./message-bubble";
import { streamChat, type Message as ApiMessage } from "@/lib/api";
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit";

type UiMsg = { id: string; role: "user" | "assistant" | "system"; content: string };
type ConvMeta = { id: string; title: string; updatedAt: string; messageCount: number };
type ChatModel = { id: string; label: string };

async function fetchModels(): Promise<ChatModel[]> {
    try {
        const r = await fetch("/api/chat/models", { cache: "no-store" });
        const j = (await r.json()) as { models?: ChatModel[] };
        return j.models ?? [];
    } catch {
        return [{ id: "gpt-4o-mini", label: "GPT-4o mini" }];
    }
}

async function listConversations(): Promise<ConvMeta[]> {
    const r = await fetch("/api/conversations", { cache: "no-store" });
    if (!r.ok) return [];
    const j = (await r.json()) as { conversations?: ConvMeta[] };
    return j.conversations ?? [];
}

async function createConversation(id: string, title: string) {
    const r = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title }),
    });
    if (!r.ok) throw new Error("Could not create conversation");
    return r.json() as Promise<{ id: string; title: string; messages: UiMsg[] }>;
}

async function loadConversation(id: string) {
    const r = await fetch(`/api/conversations/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!r.ok) return null;
    return r.json() as Promise<{ id: string; title: string; messages: UiMsg[] }>;
}

async function saveConversationRemote(conv: { id: string; title: string; messages: UiMsg[] }) {
    const r = await fetch(`/api/conversations/${encodeURIComponent(conv.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conv),
    });
    return r.ok;
}

async function deleteConversationRemote(id: string) {
    const r = await fetch(`/api/conversations/${encodeURIComponent(id)}`, { method: "DELETE" });
    return r.ok;
}

function toApiMessages(msgs: UiMsg[]): ApiMessage[] {
    return msgs
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));
}

export function ChatWorkspace() {
    const [models, setModels] = useState<ChatModel[]>([]);
    const [model, setModel] = useState("gpt-4o-mini");
    const [systemPrompt, setSystemPrompt] = useState("");
    const [showSystem, setShowSystem] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    const [list, setList] = useState<ConvMeta[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [title, setTitle] = useState("New chat");
    const [messages, setMessages] = useState<UiMsg[]>([]);

    const [input, setInput] = useState("");
    const [streaming, setStreaming] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const titleRef = useRef("New chat");
    const { formRef, onKeyDown } = useEnterSubmit();

    const refreshList = useCallback(async () => {
        const rows = await listConversations();
        setList(rows);
    }, []);

    useLayoutEffect(() => {
        titleRef.current = title;
    }, [title]);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            const m = await fetchModels();
            if (cancelled) return;
            setModels(m);
            if (m.length) {
                setModel((prev) => (m.some((x) => x.id === prev) ? prev : m[0].id));
            }
            await refreshList();
        })();
        return () => { cancelled = true; };
    }, [refreshList]);

    const ensureConversation = useCallback(async (): Promise<string | null> => {
        if (activeId) return activeId;
        const id = nanoid();
        try {
            await createConversation(id, "New chat");
            await refreshList();
            setActiveId(id);
            setTitle("New chat");
            titleRef.current = "New chat";
            setMessages([]);
            return id;
        } catch {
            toast.error("Could not reach conversation API", {
                description: "Ensure FastAPI is running on port 8000.",
            });
            return null;
        }
    }, [activeId, refreshList]);

    const selectConversation = useCallback(async (id: string) => {
        setMobileOpen(false);
        const remote = await loadConversation(id);
        setActiveId(id);
        if (remote) {
            setTitle(remote.title);
            titleRef.current = remote.title;
            setMessages(
                (remote.messages || []).map((m) => ({
                    id: m.id || nanoid(),
                    role: m.role as UiMsg["role"],
                    content: m.content,
                })),
            );
        } else {
            setTitle("New chat");
            titleRef.current = "New chat";
            setMessages([]);
        }
    }, []);

    const persist = useCallback(async (nextMessages: UiMsg[], nextTitle: string) => {
        if (!activeId) return;
        // Don't persist empty conversations
        const hasContent = nextMessages.some((m) => m.role === "user" && m.content.trim());
        if (!hasContent) return;
        const ok = await saveConversationRemote({
            id: activeId, title: nextTitle, messages: nextMessages,
        });
        if (ok) void refreshList();
    }, [activeId, refreshList]);

    const stop = () => {
        abortRef.current?.abort();
        abortRef.current = null;
        setStreaming(false);
    };

    const runAssistant = useCallback(async (historyForModel: UiMsg[], assistantId: string) => {
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        setStreaming(true);
        const apiMsgs = toApiMessages(historyForModel.filter((m) => m.id !== assistantId));
        try {
            let acc = "";
            for await (const chunk of streamChat(apiMsgs, {
                signal: ctrl.signal, model, systemPrompt: systemPrompt || null,
            })) {
                acc += chunk;
                setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)));
            }
            const finalMsgs = historyForModel.map((m) =>
                m.id === assistantId ? { ...m, content: acc } : m,
            );
            const first = finalMsgs.find((m) => m.role === "user" && m.content.trim());
            const suggested = first
                ? first.content.trim().replace(/\s+/g, " ").slice(0, 53) + (first.content.trim().length > 53 ? "…" : "")
                : null;
            const newTitle = suggested || titleRef.current;
            titleRef.current = newTitle;
            setTitle(newTitle);
            await persist(finalMsgs, newTitle);
        } catch (e) {
            if ((e as Error).name === "AbortError") {
                toast.message("Generation stopped");
            } else {
                toast.error((e as Error).message || "Chat failed");
            }
        } finally {
            abortRef.current = null;
            setStreaming(false);
        }
    }, [model, persist, systemPrompt]);

    const submitUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || streaming) return;

        // Create conversation on first message if none active
        const cid = await ensureConversation();
        if (!cid) return;

        const userMsg: UiMsg = { id: nanoid(), role: "user", content: text };
        const assistantId = nanoid();
        const assistantPlaceholder: UiMsg = { id: assistantId, role: "assistant", content: "" };
        const next = [...messages, userMsg, assistantPlaceholder];
        setMessages(next);
        setInput("");

        const derived = next.find((m) => m.role === "user" && m.content.trim());
        if (derived && (titleRef.current === "New chat" || titleRef.current.length < 4)) {
            const suggested = derived.content.trim().slice(0, 53);
            titleRef.current = suggested;
            setTitle(suggested);
        }
        await runAssistant(next, assistantId);
    };

    const regenerate = async () => {
        if (streaming || messages.length < 2) return;
        const last = messages[messages.length - 1];
        if (last.role !== "assistant") return;
        const withoutLast = messages.slice(0, -1);
        const assistantId = nanoid();
        const placeholder: UiMsg = { id: assistantId, role: "assistant", content: "" };
        const next = [...withoutLast, placeholder];
        setMessages(next);
        await runAssistant(next, assistantId);
    };

    const copyLastAssistant = async () => {
        const last = [...messages].reverse().find((m) => m.role === "assistant" && m.content);
        if (!last) return;
        try {
            await navigator.clipboard.writeText(last.content);
            toast.success("Copied to clipboard");
        } catch { toast.error("Could not copy"); }
    };

    const exportChat = () => {
        const blob = new Blob([JSON.stringify({ id: activeId, title, messages }, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `aether-chat-${activeId?.slice(0, 8) || "export"}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast.success("Download started");
    };

    const onNewChat = () => {
        stop();
        setInput("");
        setActiveId(null);
        setTitle("New chat");
        titleRef.current = "New chat";
        setMessages([]);
    };
    const onDeleteChat = async () => {
        if (!activeId) return;
        stop();
        const existsRemotely = list.some((c) => c.id === activeId);
        if (existsRemotely) {
            await deleteConversationRemote(activeId);
            await refreshList();
        }
        setActiveId(null);
        setTitle("New chat");
        titleRef.current = "New chat";
        setMessages([]);
    };

    const Sidebar = (
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/60 backdrop-blur">
            <div className="p-3 border-b border-zinc-100">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 rounded-xl text-zinc-700 hover:bg-violet-50 hover:text-violet-600"
                    onClick={() => void onNewChat()}
                >
                    <MessageSquarePlus className="w-4 h-4" />
                    New chat
                </Button>
            </div>
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-2 space-y-1">
                    {list.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => void selectConversation(c.id)}
                            className={cn(
                                "w-full text-left rounded-xl px-3 py-2.5 text-sm transition-all",
                                c.id === activeId
                                    ? "bg-violet-50 text-violet-700 border border-violet-100"
                                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800 border border-transparent",
                            )}
                        >
                            <div className="truncate font-medium">{c.title}</div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">{c.messageCount} messages</div>
                        </button>
                    ))}
                    {list.length === 0 && (
                        <p className="px-3 py-8 text-center text-xs text-zinc-400">No conversations yet</p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );

    return (
        <div className="flex flex-1 min-h-0 gap-3 lg:gap-4 pb-4">
            {sidebarOpen && (
                <div className="hidden md:flex w-[260px] shrink-0 flex-col min-h-0">{Sidebar}</div>
            )}

            <div className="flex-1 flex flex-col min-h-0 bg-white/60 backdrop-blur rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
                {/* toolbar */}
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-100 bg-white/80 shrink-0 flex-wrap">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-zinc-500 hover:text-zinc-800 rounded-lg"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hidden md:inline-flex text-zinc-500 hover:text-zinc-800 rounded-lg"
                        onClick={() => setSidebarOpen((v) => !v)}
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
                    </Button>

                    <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/20"
                    >
                        {models.map((m) => (
                            <option key={m.id} value={m.id}>{m.label}</option>
                        ))}
                    </select>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-zinc-500 hover:text-zinc-800 rounded-lg"
                        onClick={() => setShowSystem((s) => !s)}
                    >
                        Instructions
                    </Button>

                    {streaming ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 text-xs"
                            onClick={stop}
                        >
                            <Square className="w-3 h-3 mr-1 fill-current" /> Stop
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-zinc-500 hover:text-zinc-800 rounded-lg"
                            onClick={() => void regenerate()}
                            disabled={messages.length < 2}
                        >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
                        </Button>
                    )}

                    <div className="flex-1" />

                    <Button type="button" variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-600 rounded-lg disabled:opacity-30" onClick={() => void copyLastAssistant()} disabled={!activeId || messages.length === 0}>
                        <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-600 rounded-lg disabled:opacity-30" onClick={exportChat} disabled={!activeId || messages.length === 0}>
                        <Download className="w-3.5 h-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="text-zinc-400 hover:text-rose-500 rounded-lg disabled:opacity-30" onClick={() => void onDeleteChat()} disabled={!activeId}>
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>

                {showSystem && (
                    <div className="px-4 py-3 bg-violet-50/50 border-b border-zinc-100 shrink-0">
                        <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1.5 font-semibold">
                            Custom system instructions
                        </label>
                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            rows={2}
                            placeholder="e.g. Keep answers under 5 sentences; prefer bullet lists."
                            className="w-full rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 resize-y min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/20"
                        />
                    </div>
                )}

                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent side="left" className="flex h-[100dvh] max-h-[100dvh] w-[min(100vw,280px)] flex-col border-zinc-200 bg-white p-0">
                        <SheetHeader className="shrink-0 border-b border-zinc-100 p-4">
                            <SheetTitle className="text-left text-base font-medium text-zinc-800">Conversations</SheetTitle>
                        </SheetHeader>
                        <div className="min-h-0 flex-1 overflow-hidden p-2">{Sidebar}</div>
                    </SheetContent>
                </Sheet>

                {/* messages area */}
                <ScrollArea className="flex-1 min-h-0 p-4 lg:p-6">
                    <div className="flex flex-col gap-4 max-w-3xl mx-auto pb-8">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-violet-500" />
                                </div>
                                <p className="text-sm text-zinc-500 max-w-xs">
                                    Ask anything. Use the sidebar for multiple threads, stop generation anytime.
                                </p>
                            </div>
                        )}
                        {messages.map((m) => (
                            <MessageBubble key={m.id} role={m.role} content={m.content} />
                        ))}
                        {streaming && messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1]?.content && (
                            <div className="flex gap-2 items-center text-zinc-400 text-sm pl-4">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Thinking…
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* input */}
                <form ref={formRef} onSubmit={submitUser} className="p-3 border-t border-zinc-100 bg-white/60 backdrop-blur">
                    <div className="max-w-3xl mx-auto relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Message Aether… (Enter to send, Shift+Enter for newline)"
                            rows={2}
                            disabled={streaming}
                            className="w-full rounded-2xl border border-zinc-200 bg-white pl-4 pr-12 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/20 focus-visible:border-violet-400 resize-none min-h-[52px] max-h-40 transition-all"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="absolute right-2 bottom-2 rounded-xl h-9 w-9 bg-violet-500 hover:bg-violet-600 text-white shadow-sm transition-all active:scale-95"
                            disabled={streaming || !input.trim()}
                        >
                            <Send className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
