import { NextResponse } from "next/server";
import { getAetherApiBase } from "@/lib/server-proxy";

export const dynamic = "force-dynamic";

async function forward(path: string, init?: RequestInit) {
    const base = getAetherApiBase();
    return fetch(`${base}${path}`, { ...init, cache: "no-store" });
}

function parseJsonSafe(text: string): unknown {
    try {
        return text ? JSON.parse(text) : {};
    } catch {
        return null;
    }
}

export async function GET() {
    try {
        const r = await forward("/api/aether/dashboard");
        const text = await r.text();
        const data = parseJsonSafe(text);
        if (data === null) {
            return NextResponse.json({ error: "Invalid JSON from backend" }, { status: 502 });
        }
        return NextResponse.json(data, { status: r.status });
    } catch {
        return NextResponse.json({ error: "FastAPI backend unreachable" }, { status: 503 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.text();
        const r = await forward("/api/aether/dashboard", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body,
        });
        const text = await r.text();
        const data = parseJsonSafe(text);
        if (data === null) {
            return NextResponse.json({ error: "Invalid JSON from backend" }, { status: 502 });
        }
        return NextResponse.json(data, { status: r.status });
    } catch {
        return NextResponse.json({ error: "FastAPI backend unreachable" }, { status: 503 });
    }
}
