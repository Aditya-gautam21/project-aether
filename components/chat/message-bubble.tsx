"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function MessageBubble({ role, content }: { role: string, content: string }) {
    const isUser = role === "user";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex gap-3",
                isUser ? "flex-row-reverse" : "flex-row"
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
                    className="prose dark:prose-invert prose-sm break-words"
                    components={{
                        pre: ({ node, ...props }) => (
                            <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
                                <pre {...props} />
                            </div>
                        ),
                        code: ({ node, ...props }) => (
                            <code className="bg-black/10 rounded px-1" {...props} />
                        )
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </motion.div>
    );
}
