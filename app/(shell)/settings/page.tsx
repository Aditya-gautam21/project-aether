"use client";

import { InfoPanel } from "@/components/info-panel";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/app/context/DashboardContext";

export default function SettingsPage() {
    const { refresh } = useDashboard();

    return (
        <div className="mx-auto w-full max-w-lg px-2 pb-12 lg:px-4">
            <div className="mb-8 px-2">
                <h1 className="text-3xl font-light tracking-tight text-zinc-900 lg:text-4xl">Settings</h1>
                <p className="mt-2 text-sm text-zinc-500 lg:text-base">
                    Personal preferences for Aether. Your tasks, habits, budgets, journal, and chats stay in sync when
                    you refresh.
                </p>
            </div>

            <div className="space-y-4">
                <InfoPanel title="Data sync">
                    <p>
                        Pull the latest Life OS data from the server (tasks, habits, finance, journal). Use this if you
                        edited something in another tab or on another device.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        className="mt-4 rounded-full border-zinc-300 bg-white"
                        onClick={() => void refresh()}
                    >
                        Refresh my data
                    </Button>
                </InfoPanel>

                <InfoPanel title="About">
                    <p className="text-zinc-600">
                        <span className="font-medium text-zinc-800">Aether</span> is your life OS: plan on Life OS, chat
                        with AI, track money and habits, and journal — in one calm interface.
                    </p>
                </InfoPanel>
            </div>
        </div>
    );
}
