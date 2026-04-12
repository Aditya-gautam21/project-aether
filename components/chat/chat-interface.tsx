"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyScreen } from "./empty-screen";
import { MessageBubble } from "./message-bubble";
import { Send, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocalStorage } from "@/lib/hooks";
import { useDashboard } from "@/app/context/DashboardContext";
import { nanoid } from "nanoid";

export function ChatInterface({ id }: { id: string }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [history, setHistory] = useLocalStorage<any[]>("chat-history", []);
    const { updateDashboardState } = useDashboard();

    // Configure WebSocket
    useEffect(() => {
        // Use a generic test_user for MVP
        const ws = new WebSocket("ws://localhost:8000/ws/test_user");
        wsRef.current = ws;

        ws.onopen = () => console.log("Connected to Aether Backend");
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === "dashboard_sync") {
                    // Update React Context!
                    updateDashboardState(data.data);
                    setIsLoading(false);
                } 
                else if (data.type === "chat_message") {
                    setMessages((prev) => [...prev, {
                        id: nanoid(),
                        role: data.role || "assistant",
                        content: data.content
                    }]);
                    setIsLoading(false);
                }
                else if (data.type === "typing") {
                    setIsLoading(data.is_typing);
                }
                else if (data.type === "error") {
                    setMessages((prev) => [...prev, {
                        id: nanoid(),
                        role: "assistant",
                        content: `Error: ${data.message}`
                    }]);
                    setIsLoading(false);
                }
            } catch (e) {
                console.error("Failed to parse WS message", e);
            }
        };

        ws.onclose = () => console.log("Disconnected from Aether Backend");

        return () => ws.close();
    }, [updateDashboardState]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !wsRef.current) return;

        const outgoing = { id: nanoid(), role: "user", content: input };
        setMessages((prev) => [...prev, outgoing]);
        
        wsRef.current.send(JSON.stringify({
            type: "chat_message",
            content: input
        }));
        
        setInput("");
        setIsLoading(true);
    };

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

    // Auto scroll securely
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col h-full w-full">
            {/* Messages */}
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

            {/* Input */}
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
