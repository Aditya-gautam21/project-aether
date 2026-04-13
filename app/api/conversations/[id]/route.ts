import { NextResponse } from "next/server";
import { getAetherApiBase } from "@/lib/server-proxy";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export async function GET(_request: Request, { params }: Ctx) {
    try {
        const r = await fetch(`${getAetherApiBase()}/api/conversations/${encodeURIComponent(params.id)}`, {
            cache: "no-store",
        });
        const j = await r.json();
        return NextResponse.json(j, { status: r.status });
    } catch {
        return NextResponse.json({ error: "FastAPI unreachable" }, { status: 503 });
    }
}

export async function PUT(request: Request, { params }: Ctx) {
    try {
        const body = await request.text();
        const r = await fetch(`${getAetherApiBase()}/api/conversations/${encodeURIComponent(params.id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body,
        });
        const j = await r.json();
        return NextResponse.json(j, { status: r.status });
    } catch {
        return NextResponse.json({ error: "FastAPI unreachable" }, { status: 503 });
    }
}

export async function DELETE(_request: Request, { params }: Ctx) {
    try {
        const r = await fetch(`${getAetherApiBase()}/api/conversations/${encodeURIComponent(params.id)}`, {
            method: "DELETE",
            cache: "no-store",
        });
        const j = await r.json().catch(() => ({}));
        return NextResponse.json(j, { status: r.status });
    } catch {
        return NextResponse.json({ error: "FastAPI unreachable" }, { status: 503 });
    }
}
