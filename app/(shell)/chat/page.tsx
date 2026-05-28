"use client";

import { ChatWorkspace } from "@/components/chat/chat-workspace";

export default function ChatPage() {
    return (
        <div className="flex flex-col flex-1 min-h-0 px-4 page-enter">
            <div className="mb-3 shrink-0">
                <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-zinc-800">Chat</h1>
                <p className="text-zinc-500 mt-1 text-sm max-w-xl leading-relaxed">
                    Multi-model AI with conversation history, streaming responses, and export.
                </p>
            </div>
            <ChatWorkspace />
        </div>
    );
}
