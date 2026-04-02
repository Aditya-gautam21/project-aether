"use client";

import { useChat } from "@ai-sdk/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyScreen } from "./empty-screen";
import { MessageBubble } from "./message-bubble";
import { Send, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useLocalStorage } from "@/lib/hooks";

export function ChatInterface({ id }: { id: string }) {
    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
        api: "/api/chat",
        id,
        initialMessages: [],
        // Since our backend emits custom SSE, we might need a custom fetcher if useChat fails.
        // simpler approach: useChat standard, if it fails we debug. 
        // Standard AI SDK usually expects text stream or specific parts.
        // Our backend sends "data: {content: ...}". This might need parsing.
        onError: (e) => console.error("Chat Error", e),
    });

    const scrollRef = useRef<HTMLDivElement>(null);
    const [history, setHistory] = useLocalStorage<any[]>("chat-history", []);

    // Save to history when messages change
    useEffect(() => {
        if (messages.length > 0) {
            const title = messages[0].content.substring(0, 30) + "...";
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

    // Auto scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full w-full">
            {/* Messages */}
            <div className="flex-1 overflow-hidden p-6 relative">
                {messages.length === 0 ? (
                    <EmptyScreen setInput={(val) => handleInputChange({ target: { value: val } } as any)} />
                ) : (
                    <ScrollArea className="h-full pr-4" ref={scrollRef}>
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
                        </div>
                    </ScrollArea>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-card/80 backdrop-blur-sm border-t border-border/40">
                <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
                    <Input
                        value={input}
                        onChange={handleInputChange}
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
