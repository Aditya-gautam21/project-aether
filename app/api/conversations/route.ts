import { NextResponse } from "next/server";
import { getAetherApiBase } from "@/lib/server-proxy";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const r = await fetch(`${getAetherApiBase()}/api/conversations`, { cache: "no-store" });
        const j = await r.json();
        return NextResponse.json(j, { status: r.status });
    } catch {
        return NextResponse.json({ conversations: [] }, { status: 503 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const r = await fetch(`${getAetherApiBase()}/api/conversations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
        });
        const j = await r.json();
        return NextResponse.json(j, { status: r.status });
    } catch {
        return NextResponse.json({ error: "FastAPI unreachable" }, { status: 503 });
    }
}
