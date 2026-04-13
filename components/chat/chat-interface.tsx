"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyScreen } from "./empty-screen";
import { MessageBubble } from "./message-bubble";
import { Send, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/lib/hooks";
import { nanoid } from "nanoid";
import { streamChat, type Message as ApiMessage } from "@/lib/api";

export function ChatInterface({ id }: { id: string }) {
    const [messages, setMessages] = useState<{ id: string; role: string; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [history, setHistory] = useLocalStorage<any[]>("chat-history", []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || isLoading) return;

        const userId = nanoid();
        const assistantId = nanoid();
        const withUser = [...messages, { id: userId, role: "user", content: text }];
        setMessages([...withUser, { id: assistantId, role: "assistant", content: "" }]);
        setInput("");
        setIsLoading(true);

        const apiMessages: ApiMessage[] = withUser
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

        try {
            let acc = "";
            for await (const chunk of streamChat(apiMessages)) {
                acc += chunk;
                setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)));
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Request failed";
            setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: `**Error:** ${msg}` } : m)),
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            const title = messages[0].content.substring(0, 30) + (messages[0].content.length > 30 ? "..." : "");
            setHistory((prev: any[]) => {
                const existing = prev.findIndex((h: any) => h.id === id);
                if (existing >= 0) {
                    const copy = [...prev];
                    copy[existing] = { id, title, messages, updatedAt: Date.now() };
                    return copy;
                }
                return [{ id, title, messages, updatedAt: Date.now() }, ...prev];
            });
        }
    }, [messages, id, setHistory]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-hidden p-6 relative">
                {messages.length === 0 ? (
                    <EmptyScreen setInput={setInput} />
                ) : (
                    <ScrollArea className="h-full pr-4">
                        <div className="flex flex-col gap-6 pb-20">
                            {messages.map((m) => (
                                <MessageBubble key={m.id} role={m.role} content={m.content} />
                            ))}
                            {isLoading && (
                                <div className="flex gap-2 items-center text-muted-foreground text-sm pl-4">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Thinking...
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>
                )}
            </div>

            <div className="p-4 bg-card/80 backdrop-blur-sm border-t border-border/40">
                <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Start typing your request..."
                        className="pr-14 h-14 rounded-full shadow-sm bg-background border-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 placeholder:text-muted-foreground transition-shadow text-base"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="absolute right-2 top-2 rounded-full h-10 w-10 shrink-0 shadow-sm transition-transform active:scale-95"
                        disabled={isLoading || !input.trim()}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
