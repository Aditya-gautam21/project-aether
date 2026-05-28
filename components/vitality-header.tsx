"use client";

import React from "react";
import { ArrowUpRight, Droplet, Moon, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/app/context/DashboardContext";
import { loadPreferences } from "@/components/onboarding-wizard";

export function VitalityHeader({ showWelcome = true }: { showWelcome?: boolean }) {
    const { state } = useDashboard();
    const w = state.wellness;
    const stepsPct = Math.min(100, Math.round((w.steps / w.stepsGoal) * 100));
    const prefs = typeof window !== "undefined" ? loadPreferences() : null;
    const showWellness = !prefs || prefs.activeModules.includes("wellness");

    if (!showWellness) return null;

    return (
        <div className="flex flex-wrap items-end gap-4 lg:gap-6 px-2 lg:px-4">
            {/* wellness cards in a row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
                {/* Steps */}
                <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm hover:shadow-md transition-shadow group cursor-default">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Footprints className="w-4 h-4 text-orange-600" />
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Steps</span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-800">
                            {w.steps.toLocaleString()}
                        </span>
                        <span className="text-sm text-zinc-400">/ {w.stepsGoal.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${stepsPct}%` }}
                        />
                    </div>
                </div>

                {/* Water */}
                <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm hover:shadow-md transition-shadow group cursor-default">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Droplet className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Water</span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-800">
                            {w.waterCurrent}
                        </span>
                        <span className="text-sm text-zinc-400">/ {w.waterTarget} glasses</span>
                    </div>
                    <div className="flex gap-1">
                        {Array.from({ length: w.waterTarget }, (_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1.5 flex-1 rounded-full transition-all duration-500",
                                    i < w.waterCurrent
                                        ? "bg-blue-500"
                                        : "bg-blue-100",
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Sleep */}
                <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm hover:shadow-md transition-shadow group cursor-default">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Moon className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Sleep</span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-800">
                            {w.sleepHours}h {w.sleepMinutes}m
                        </span>
                    </div>
                    <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        {w.sleepTrendLabel}
                    </div>
                </div>

                {/* Wellness overview - calm, deep work, connection, growth */}
                <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm hover:shadow-md transition-shadow group cursor-default flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Wellness</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span className="text-zinc-400 block text-[10px]">Calm</span>
                            <span className="font-medium text-zinc-700">{w.innerCalmPercent}%</span>
                        </div>
                        <div>
                            <span className="text-zinc-400 block text-[10px]">Focus</span>
                            <span className="font-medium text-zinc-700">{w.deepWorkLabel}</span>
                        </div>
                        <div>
                            <span className="text-zinc-400 block text-[10px]">Connection</span>
                            <span className="font-medium text-zinc-700">{w.connectionLabel}</span>
                        </div>
                        <div>
                            <span className="text-zinc-400 block text-[10px]">Growth</span>
                            <span className="font-medium text-zinc-700">{w.growthLabel}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
