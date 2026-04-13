export interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

export type StreamChatOptions = {
    signal?: AbortSignal;
    model?: string;
    systemPrompt?: string | null;
};

export async function* streamChat(
    messages: Message[],
    options?: StreamChatOptions,
): AsyncGenerator<string, void, unknown> {
    const payload: Record<string, unknown> = { messages };
    if (options?.model) payload.model = options.model;
    if (options?.systemPrompt?.trim()) payload.system_prompt = options.systemPrompt.trim();

    const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: options?.signal,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader available");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: true });

        let sep: number;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
            const raw = buffer.slice(0, sep).trim();
            buffer = buffer.slice(sep + 2);
            if (!raw.startsWith("data: ")) continue;
            const data = raw.slice(6);
            if (data === "[DONE]") return;
            try {
                const parsed = JSON.parse(data) as { content?: string };
                if (parsed.content) yield parsed.content;
            } catch {
                /* ignore malformed chunk */
            }
        }

        if (done) break;
    }

    if (buffer.trim().startsWith("data: ")) {
        const data = buffer.trim().slice(6);
        if (data !== "[DONE]") {
            try {
                const parsed = JSON.parse(data) as { content?: string };
                if (parsed.content) yield parsed.content;
            } catch {
                /* ignore */
            }
        }
    }
}
