"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell, User, ChevronDown, LogOut, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadPreferences, clearPreferences } from "@/components/onboarding-wizard";

const NAV = [
    { href: "/", label: "Home" },
    { href: "/chat", label: "Chat" },
    { href: "/finance", label: "Finance" },
    { href: "/habits", label: "Habits" },
    { href: "/journal", label: "Journal" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isChat = pathname === "/chat";
    const prefs = typeof window !== "undefined" ? loadPreferences() : null;

    return (
        <div className="flex h-dvh max-h-dvh w-full max-w-[100vw] flex-col overflow-hidden bg-gradient-to-br from-[#FFF8E7] via-[#FDFDF7] to-[#FFF1D0] text-foreground">
            {/* top bar */}
            <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 lg:px-6 lg:py-4 border-b border-white/50 bg-white/30 backdrop-blur-md">
                {/* logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2.5 group shrink-0"
                >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-md shadow-violet-200 group-hover:shadow-lg group-hover:scale-105 transition-all">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-zinc-800 hidden sm:block">
                        Aether
                    </span>
                </Link>

                {/* nav pills */}
                <nav className="flex min-w-0 flex-1 justify-center overflow-x-auto custom-scrollbar-hide">
                    <div className="flex items-center gap-1 rounded-full border border-zinc-200/50 bg-white/60 p-1 backdrop-blur-sm shadow-sm">
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
                                        "h-auto rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200",
                                        active
                                            ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm"
                                            : "text-zinc-500 hover:text-zinc-800 hover:bg-white/80",
                                    )}
                                    size="sm"
                                >
                                    <Link href={href}>{label}</Link>
                                </Button>
                            );
                        })}
                    </div>
                </nav>

                {/* right actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {prefs?.name && (
                        <span className="text-xs text-zinc-500 hidden md:block mr-1">
                            {prefs.name}
                        </span>
                    )}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-medium shadow-sm">
                        {(prefs?.name?.[0] ?? "?").toUpperCase()}
                    </div>
                </div>
            </header>

            {/* content */}
            <div
                className={cn(
                    "min-h-0 flex-1 flex flex-col",
                    isChat
                        ? "overflow-hidden"
                        : "overflow-y-auto overflow-x-hidden overscroll-y-contain",
                )}
            >
                {children}
            </div>
        </div>
    );
}
