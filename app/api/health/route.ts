import { NextResponse } from "next/server";
import { getAetherApiBase } from "@/lib/server-proxy";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const r = await fetch(`${getAetherApiBase()}/api/health`, { cache: "no-store" });
        const j = await r.json();
        return NextResponse.json(j, { status: r.status });
    } catch {
        return NextResponse.json(
            { status: "error", openai_configured: false, detail: "FastAPI unreachable" },
            { status: 503 },
        );
    }
}
