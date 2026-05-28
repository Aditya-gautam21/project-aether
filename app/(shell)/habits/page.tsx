"use client";

import { HabitsInteractive } from "@/components/habits-interactive";

export default function HabitsPage() {
    return (
        <div className="w-full max-w-3xl mx-auto px-4 pb-10 page-enter">
            <div className="mb-6">
                <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-zinc-800">Habits</h1>
                <p className="text-zinc-500 mt-1.5 text-sm max-w-xl leading-relaxed">
                    Build streaks that stick. Rename habits, adjust counts, and track a 7-day window at a glance.
                </p>
            </div>
            <HabitsInteractive />
        </div>
    );
}
