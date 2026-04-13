"use client";

import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function MessageBubble({ role, content }: { role: string, content: string }) {
    const isUser = role === "user";

    return (
        <div
            className={cn(
                "flex gap-3",
                isUser ? "flex-row-reverse" : "flex-row",
            )}
        >
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                isUser ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={cn(
                "rounded-3xl px-5 py-4 max-w-[85%] text-[15px] leading-relaxed shadow-sm",
                isUser
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted/40 border border-border/50 rounded-bl-sm"
            )}>
                <ReactMarkdown
                    className={cn(
                        "prose prose-sm max-w-none break-words",
                        isUser
                            ? "prose-headings:text-primary-foreground prose-p:text-primary-foreground prose-li:text-primary-foreground prose-strong:text-primary-foreground prose-a:text-primary-foreground"
                            : "prose-zinc prose-headings:text-zinc-900 prose-p:text-zinc-800",
                    )}
                    components={{
                        pre: ({ node, ...props }) => (
                            <div
                                className={cn(
                                    "my-2 w-full overflow-auto rounded-lg p-2",
                                    isUser ? "bg-black/15" : "bg-zinc-200/80",
                                )}
                            >
                                <pre {...props} className="m-0 bg-transparent p-0 text-[13px]" />
                            </div>
                        ),
                        code: ({ node, className, ...props }) => {
                            const inline = !className;
                            return inline ? (
                                <code
                                    className={cn(
                                        "rounded px-1 py-0.5 text-[0.9em]",
                                        isUser ? "bg-black/15" : "bg-zinc-200/90",
                                    )}
                                    {...props}
                                />
                            ) : (
                                <code className={className} {...props} />
                            );
                        },
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}
