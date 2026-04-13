"use client";

import { JournalWorkspace } from "@/components/journal-workspace";
import { InfoPanel } from "@/components/info-panel";

export default function JournalPage() {
    return (
        <div className="w-full px-2 pb-12 lg:px-4">
            <div className="mb-6 px-2">
                <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-zinc-900">Journal</h1>
                <p className="text-zinc-500 mt-2 max-w-2xl text-sm lg:text-base">
                    Search history, open any entry to edit, save updates, or start a new note. Everything persists with
                    your Life OS data on the server.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 max-w-7xl">
                <div className="xl:col-span-2 min-w-0">
                    <JournalWorkspace />
                </div>
                <div className="min-w-0">
                    <InfoPanel title="Prompts to try">
                        <ul className="list-disc space-y-2 pl-4">
                            <li>One win, one friction, one adjustment for tomorrow.</li>
                            <li>Who did I appreciate quietly — did I tell them?</li>
                            <li>What would I do if this week were easy?</li>
                        </ul>
                    </InfoPanel>
                </div>
            </div>
        </div>
    );
}
