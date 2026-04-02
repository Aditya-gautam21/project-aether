"use client";

import { useLocalStorage } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"; // We'll implement sheet or just use div for desktop

// Simplified sidebar matching new spec
export function Sidebar({
    currentId,
    onSelect,
    onNew
}: {
    currentId: string,
    onSelect: (id: string) => void,
    onNew: () => void
}) {
    const [history, setHistory] = useLocalStorage<any[]>("chat-history", []);

    const deleteChat = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setHistory((prev: any[]) => prev.filter((h: any) => h.id !== id));
        if (currentId === id) onNew();
    };

    return (
        <div className="flex flex-col h-full bg-card border rounded-[1.5rem] w-full shadow-sm overflow-hidden">
            <div className="p-4 border-b">
                <Button onClick={onNew} className="w-full justify-start gap-2 rounded-full h-11" variant="outline">
                    <Plus className="w-4 h-4" /> New Chat
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {history.length === 0 && (
                        <div className="text-xs text-muted-foreground text-center py-4">
                            No recent history
                        </div>
                    )}
                    {history.map((chat) => (
                        <div
                            key={chat.id}
                            className={cn(
                                "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted cursor-pointer transition-colors",
                                currentId === chat.id ? "bg-muted text-foreground" : "text-muted-foreground"
                            )}
                            onClick={() => onSelect(chat.id)}
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span className="flex-1 truncate">{chat.title || "Untitled"}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => deleteChat(e, chat.id)}
                            >
                                <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-4 border-t text-xs text-muted-foreground">
                Stored locally
            </div>
        </div>
    );
}
