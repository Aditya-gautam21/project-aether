"use client";

import { JournalWorkspace } from "@/components/journal-workspace";

export default function JournalPage() {
    return (
        <div className="w-full max-w-5xl mx-auto px-4 pb-10 page-enter">
            <div className="mb-6">
                <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-zinc-800">Journal</h1>
                <p className="text-zinc-500 mt-1.5 text-sm max-w-xl leading-relaxed">
                    Reflect, search past entries, and capture what matters. Everything saves to your Life OS.
                </p>
            </div>
            <JournalWorkspace />
        </div>
    );
}
