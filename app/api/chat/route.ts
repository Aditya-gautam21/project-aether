import { getAetherApiBase } from "@/lib/server-proxy";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
    const base = getAetherApiBase();
    const body = await request.text();
    try {
        const r = await fetch(`${base}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
        });
        return new Response(r.body, {
            status: r.status,
            headers: {
                "Content-Type": r.headers.get("content-type") || "text/plain; charset=utf-8",
            },
        });
    } catch {
        const encoder = new TextEncoder();
        const msg = "FastAPI backend unreachable — run `uvicorn main:app --reload --port 8000` from the `backend` folder.";
        const body =
            `data: ${JSON.stringify({ content: msg })}\n\n` + `data: [DONE]\n\n`;
        return new Response(encoder.encode(body), {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
    }
}
