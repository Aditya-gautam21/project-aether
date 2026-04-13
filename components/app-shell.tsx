"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
    { href: "/", label: "Life OS" },
    { href: "/chat", label: "Chat" },
    { href: "/finance", label: "Finance" },
    { href: "/habits", label: "Habits" },
    { href: "/journal", label: "Journal" },
    { href: "/settings", label: "Settings" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isChat = pathname === "/chat";

    return (
        <div className="flex h-dvh max-h-dvh w-full max-w-[100vw] flex-col overflow-hidden bg-gradient-to-br from-[#EAEBED] via-[#FDFDF7] to-[#FFF1D0] text-foreground p-4 pb-0 lg:p-6">
            <header
                className={cn(
                    "flex shrink-0 items-center justify-between gap-3 px-2 lg:px-4",
                    isChat ? "mb-2 lg:mb-3" : "mb-4 lg:mb-6",
                )}
            >
                <div className="flex min-w-0 items-center gap-2">
                    <Link
                        href="/"
                        className="truncate rounded-full border bg-white px-4 py-2 text-lg font-semibold shadow-sm lg:px-5 lg:text-xl"
                    >
                        Aether
                    </Link>
                </div>

                <nav className="flex min-w-0 max-w-[70vw] flex-1 justify-center overflow-x-auto custom-scrollbar-hide lg:max-w-none">
                    <div className="flex w-max items-center gap-0.5 rounded-full border border-white/50 bg-white/70 p-1 shadow-sm backdrop-blur-sm lg:gap-1">
                        {NAV.map(({ href, label }) => {
                            const active =
                                href === "/"
                                    ? pathname === "/"
                                    : pathname === href || pathname.startsWith(`${href}/`);
                            return (
                                <Button
                                    key={href}
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                        "h-auto rounded-full px-3 py-2 text-xs whitespace-nowrap transition-colors duration-150 lg:px-6 lg:text-sm",
                                        active
                                            ? "bg-zinc-900 text-white hover:bg-zinc-800"
                                            : "text-zinc-600 hover:bg-white/80 hover:text-zinc-900",
                                    )}
                                    size="sm"
                                >
                                    <Link href={href}>{label}</Link>
                                </Button>
                            );
                        })}
                    </div>
                </nav>

                <div className="flex shrink-0 items-center gap-2 lg:gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled
                        className="rounded-full border-white/50 bg-white/70 shadow-sm backdrop-blur-sm opacity-50"
                        title="Notifications coming soon"
                        aria-label="Notifications (coming soon)"
                    >
                        <Bell className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled
                        className="hidden rounded-full border-white/50 bg-white/70 shadow-sm backdrop-blur-sm opacity-50 sm:inline-flex"
                        title="Profile coming soon"
                        aria-label="Profile (coming soon)"
                    >
                        <User className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            <div
                className={cn(
                    "min-h-0 flex-1 flex flex-col",
                    isChat ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden overscroll-y-contain",
                )}
            >
                {children}
            </div>
        </div>
    );
}
