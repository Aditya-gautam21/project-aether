import { NextResponse } from "next/server";
import { getAetherApiBase } from "@/lib/server-proxy";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const r = await fetch(`${getAetherApiBase()}/api/chat/models`, { cache: "no-store" });
        const j = await r.json();
        return NextResponse.json(j, { status: r.status });
    } catch {
        return NextResponse.json(
            {
                models: [
                    { id: "gpt-4o-mini", label: "GPT-4o mini (OpenAI)", provider: "openai" },
                    { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash (Google)", provider: "google" },
                    { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Google)", provider: "google" },
                ],
            },
            { status: 200 },
        );
    }
}
