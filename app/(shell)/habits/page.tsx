"use client";

import { HabitsInteractive } from "@/components/habits-interactive";
import { InfoPanel } from "@/components/info-panel";

export default function HabitsPage() {
    return (
        <div className="w-full px-2 pb-12 lg:px-4">
            <div className="mb-6 px-2">
                <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-zinc-900">Habits</h1>
                <p className="text-zinc-500 mt-2 max-w-2xl text-sm lg:text-base">
                    Add habits, rename them, adjust streaks with +/−, or remove what you are not tracking anymore. The
                    dots mirror a 7-day window so progress stays visible without guilt on off days.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-5xl">
                <HabitsInteractive />
                <div className="space-y-4">
                    <InfoPanel title="Design a cue">
                        <p>
                            Stack the habit after an existing anchor: &quot;After I pour coffee, I write three
                            lines.&quot; Clear cues beat vague intentions.
                        </p>
                    </InfoPanel>
                    <InfoPanel title="Recovery is part of the streak">
                        <p>
                            Missed days happen. The fastest return path is reducing scope (two minutes) rather than
                            doubling effort to &quot;catch up,&quot; which often triggers abandonment.
                        </p>
                    </InfoPanel>
                </div>
            </div>
        </div>
    );
}
