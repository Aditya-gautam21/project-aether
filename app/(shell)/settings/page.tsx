"use client";

import React from "react";
import { Sparkles, RotateCcw, User, Layout, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/app/context/DashboardContext";
import { loadPreferences, clearPreferences, type UserPreferences } from "@/components/onboarding-wizard";

export default function SettingsPage() {
    const { refresh } = useDashboard();
    const prefs = typeof window !== "undefined" ? loadPreferences() : null;

    const handleReset = () => {
        if (confirm("Reset your preferences? This will show the onboarding screen again.")) {
            clearPreferences();
            window.location.reload();
        }
    };

    const handleRefresh = () => {
        void refresh();
    };

    return (
        <div className="mx-auto w-full max-w-xl px-4 pb-12">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <span className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider">Settings</span>
                </div>
                <h1 className="text-3xl font-light tracking-tight text-zinc-800 lg:text-4xl">
                    Preferences
                </h1>
                <p className="mt-2 text-sm text-zinc-500">
                    Customize your Aether experience. All changes are saved to your browser.
                </p>
            </div>

            <div className="space-y-4">
                {/* profile */}
                <div className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-white/80 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-zinc-800 text-sm">Profile</h3>
                            <p className="text-xs text-zinc-500">
                                {prefs?.name ? `Hey ${prefs.name}` : "No profile set"}
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="rounded-xl border-zinc-200 bg-white hover:bg-zinc-50 text-xs gap-2"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Re-run onboarding
                    </Button>
                </div>

                {/* dashboard */}
                <div className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-white/80 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Layout className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-zinc-800 text-sm">Dashboard</h3>
                            <p className="text-xs text-zinc-500">
                                {prefs ? `${prefs.activeModules.length} modules active` : "Default setup"}
                            </p>
                        </div>
                    </div>
                    {prefs?.activeModules && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {prefs.activeModules.map((key) => (
                                <span key={key} className="text-[10px] font-medium bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full">
                                    {key}
                                </span>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-zinc-400 mb-3">
                        Customize which widgets appear on your dashboard. Click the "Customize" button on the home page.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleRefresh}
                        className="rounded-xl border-zinc-200 bg-white hover:bg-zinc-50 text-xs gap-2"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Refresh data from server
                    </Button>
                </div>

                {/* theme */}
                <div className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-white/80 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-zinc-800 text-sm">Theme</h3>
                            <p className="text-xs text-zinc-500">
                                {prefs?.themeTone ? `${prefs.themeTone} tone` : "Warm (default)"}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-400">
                        Theme preferences are set during onboarding. Re-run onboarding to change your theme.
                    </p>
                </div>

                {/* about */}
                <div className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-white/80 shadow-sm">
                    <h3 className="font-medium text-zinc-800 text-sm mb-2">About Aether</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Aether is your personal Life OS — plan your day, chat with AI, track finances and habits,
                        and journal, all in one calm, customizable interface.
                    </p>
                </div>
            </div>
        </div>
    );
}
