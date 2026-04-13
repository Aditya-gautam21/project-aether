import { ChatWorkspace } from "@/components/chat/chat-workspace";

export default function ChatPage() {
    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="px-2 lg:px-4 mb-2 shrink-0">
                <h1 className="text-2xl lg:text-3xl font-light tracking-tight text-zinc-900">Chat</h1>
                <p className="text-zinc-500 text-sm mt-1 max-w-2xl">
                    Choose GPT or Gemini, manage threads, stop or regenerate replies, export chats, and add custom
                    instructions.
                </p>
            </div>
            <ChatWorkspace />
        </div>
    );
}
