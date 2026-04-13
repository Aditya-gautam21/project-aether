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

async function saveConversationRemote(conv: {
    id: string;
    title: string;
    messages: UiMsg[];
}) {
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

    const bootstrapConversation = useCallback(async () => {
        const id = nanoid();
        try {
            await createConversation(id, "New chat");
            await refreshList();
            setActiveId(id);
            setTitle("New chat");
            titleRef.current = "New chat";
            setMessages([]);
        } catch {
            toast.error("Could not reach conversation API", {
                description: "Ensure FastAPI is running on port 8000.",
            });
            setActiveId(id);
            setTitle("New chat");
            titleRef.current = "New chat";
            setMessages([]);
        }
    }, [refreshList]);

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
            await bootstrapConversation();
        })();
        return () => {
            cancelled = true;
        };
    }, [bootstrapConversation]);

    const selectConversation = useCallback(
        async (id: string) => {
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
        },
        [],
    );

    const persist = useCallback(
        async (nextMessages: UiMsg[], nextTitle: string) => {
            if (!activeId) return;
            const ok = await saveConversationRemote({
                id: activeId,
                title: nextTitle,
                messages: nextMessages,
            });
            if (ok) void refreshList();
        },
        [activeId, refreshList],
    );

    const stop = () => {
        abortRef.current?.abort();
        abortRef.current = null;
        setStreaming(false);
    };

    const runAssistant = useCallback(
        async (historyForModel: UiMsg[], assistantId: string) => {
            const ctrl = new AbortController();
            abortRef.current = ctrl;
            setStreaming(true);
            const apiMsgs = toApiMessages(historyForModel.filter((m) => m.id !== assistantId));
            try {
                let acc = "";
                for await (const chunk of streamChat(apiMsgs, {
                    signal: ctrl.signal,
                    model,
                    systemPrompt: systemPrompt || null,
                })) {
                    acc += chunk;
                    setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)));
                }
                const finalMsgs = historyForModel.map((m) =>
                    m.id === assistantId ? { ...m, content: acc } : m,
                );
                const suggested = nextTitleFromMessages(finalMsgs);
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
        },
        [model, persist, systemPrompt],
    );

    function nextTitleFromMessages(msgs: UiMsg[]): string | null {
        const first = msgs.find((m) => m.role === "user" && m.content.trim());
        if (!first) return null;
        const t = first.content.trim().replace(/\s+/g, " ");
        return t.length > 56 ? `${t.slice(0, 53)}…` : t;
    }

    const submitUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || streaming || !activeId) return;

        const userMsg: UiMsg = { id: nanoid(), role: "user", content: text };
        const assistantId = nanoid();
        const assistantPlaceholder: UiMsg = { id: assistantId, role: "assistant", content: "" };
        const next = [...messages, userMsg, assistantPlaceholder];
        setMessages(next);
        setInput("");

        const derived = nextTitleFromMessages(next);
        if (derived && (titleRef.current === "New chat" || titleRef.current.length < 4)) {
            titleRef.current = derived;
            setTitle(derived);
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
        } catch {
            toast.error("Could not copy");
        }
    };

    const exportChat = () => {
        const blob = new Blob([JSON.stringify({ id: activeId, title, messages }, null, 2)], {
            type: "application/json",
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `aether-chat-${activeId?.slice(0, 8) || "export"}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast.success("Download started");
    };

    const onNewChat = async () => {
        stop();
        setInput("");
        await bootstrapConversation();
    };

    const onDeleteChat = async () => {
        if (!activeId) return;
        stop();
        if (list.some((c) => c.id === activeId)) {
            await deleteConversationRemote(activeId);
            await refreshList();
        }
        await bootstrapConversation();
    };

    const Sidebar = (
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-900 text-zinc-100">
            <div className="p-3 border-b border-white/10 flex items-center gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex-1 justify-start gap-2 rounded-full text-white hover:bg-white/10"
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
                                "w-full text-left rounded-2xl px-3 py-2.5 text-sm transition-colors",
                                c.id === activeId ? "bg-white/15 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200",
                            )}
                        >
                            <div className="truncate font-medium">{c.title}</div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">{c.messageCount} messages</div>
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );

    return (
        <div className="flex flex-1 min-h-0 gap-3 lg:gap-4 px-1 lg:px-2 pb-4">
            {/* Desktop sidebar */}
            {sidebarOpen && (
                <div className="hidden md:flex w-[260px] shrink-0 flex-col min-h-0">{Sidebar}</div>
            )}

            <div className="flex-1 flex flex-col min-h-0 bg-zinc-900 rounded-[2rem] border-4 border-zinc-900 shadow-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-zinc-900 shrink-0 flex-wrap">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-white hover:bg-white/10 rounded-full"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hidden md:inline-flex text-white hover:bg-white/10 rounded-full"
                        onClick={() => setSidebarOpen((v) => !v)}
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
                    </Button>

                    <div className="flex-1 min-w-[120px]">
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full max-w-[220px] rounded-full border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                        >
                            {models.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-zinc-300 hover:text-white hover:bg-white/10 rounded-full"
                        onClick={() => setShowSystem((s) => !s)}
                    >
                        Instructions
                    </Button>

                    {streaming ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full border-red-400/50 text-red-200 hover:bg-red-950/50"
                            onClick={stop}
                        >
                            <Square className="w-3 h-3 mr-1 fill-current" />
                            Stop
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-zinc-300 hover:text-white rounded-full"
                            onClick={() => void regenerate()}
                            disabled={messages.length < 2}
                        >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Regenerate
                        </Button>
                    )}

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-zinc-300 hover:text-white rounded-full"
                        onClick={() => void copyLastAssistant()}
                    >
                        <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-zinc-300 hover:text-white rounded-full"
                        onClick={exportChat}
                    >
                        <Download className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-zinc-300 hover:text-red-300 rounded-full"
                        onClick={() => void onDeleteChat()}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                {showSystem && (
                    <div className="px-4 py-2 bg-zinc-950/80 border-b border-white/10 shrink-0">
                        <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">
                            Custom system instructions (optional)
                        </label>
                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            rows={2}
                            placeholder="e.g. Keep answers under 5 sentences; prefer bullet lists."
                            className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 resize-y min-h-[52px]"
                        />
                    </div>
                )}

                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent
                        side="left"
                        className="flex h-[100dvh] max-h-[100dvh] w-[min(100vw,280px)] flex-col border-zinc-800 bg-zinc-950 p-0"
                    >
                        <SheetHeader className="shrink-0 border-b border-zinc-800 p-4">
                            <SheetTitle className="text-left text-base font-medium text-white">Conversations</SheetTitle>
                        </SheetHeader>
                        <div className="min-h-0 flex-1 overflow-hidden p-2">{Sidebar}</div>
                    </SheetContent>
                </Sheet>

                <div className="flex-1 min-h-0 bg-zinc-50 rounded-b-[1.75rem] m-2 mt-0 mb-2 flex flex-col overflow-hidden">
                    <ScrollArea className="flex-1 min-h-0 p-4">
                        <div className="flex flex-col gap-4 max-w-3xl mx-auto pb-8">
                            {messages.length === 0 && (
                                <p className="text-center text-zinc-500 text-sm py-12">
                                    Ask anything — answers stream like ChatGPT. Use the sidebar for multiple threads,
                                    stop generation anytime, or regenerate the last reply.
                                </p>
                            )}
                            {messages.map((m) => (
                                <MessageBubble key={m.id} role={m.role} content={m.content} />
                            ))}
                            {streaming && messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1]?.content && (
                                <div className="flex gap-2 items-center text-zinc-500 text-sm pl-4">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Thinking…
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <form
                        ref={formRef}
                        onSubmit={submitUser}
                        className="p-3 border-t border-zinc-200/80 bg-white/90 backdrop-blur-sm"
                    >
                        <div className="max-w-3xl mx-auto relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                placeholder="Message Aether… (Enter to send, Shift+Enter for newline)"
                                rows={2}
                                disabled={streaming}
                                className="w-full rounded-2xl border border-zinc-200 bg-white pl-4 pr-14 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10 resize-none min-h-[52px] max-h-40"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute right-2 bottom-2 rounded-full h-9 w-9"
                                disabled={streaming || !input.trim()}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
