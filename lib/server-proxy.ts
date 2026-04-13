/** Base URL for the FastAPI backend (server-side only). */
export function getAetherApiBase(): string {
    return process.env.AETHER_API_BASE?.replace(/\/$/, "") || "http://127.0.0.1:8000";
}
