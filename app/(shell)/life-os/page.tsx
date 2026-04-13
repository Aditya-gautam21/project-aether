import { redirect } from "next/navigation";

/** Legacy URL: Life OS hub now lives at `/`; chat moved to `/chat`. */
export default function LegacyLifeOsRedirect() {
    redirect("/chat");
}
