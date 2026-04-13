"use client";

import { Activity, ArrowUpRight, Droplet, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/app/context/DashboardContext";

export function VitalityHeader({ showWelcome = true }: { showWelcome?: boolean }) {
    const { state } = useDashboard();
    const w = state.wellness;
    const stepsPct = Math.min(100, Math.round((w.steps / w.stepsGoal) * 100));

    return (
        <div className="flex flex-wrap justify-between items-end mb-6 lg:mb-8 px-2 lg:px-4 gap-6 lg:gap-8 shrink-0">
            <div className="flex-1 min-w-[240px]">
                {showWelcome && (
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight mb-6 lg:mb-8">
                        Life OS — welcome in, Nixtio
                    </h1>
                )}

                <div className="flex flex-wrap gap-3 lg:gap-4 items-center">
                    <div className="flex flex-col gap-2 flex-1 min-w-[120px] lg:min-w-[140px] group cursor-default">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-zinc-500 text-[10px] lg:text-xs font-semibold tracking-wider uppercase group-hover:text-teal-600 transition-colors">
                                Inner Calm
                            </span>
                            <span className="text-teal-700 font-medium text-[10px] lg:text-xs">{w.innerCalmPercent}%</span>
                        </div>
                        <div className="h-2 bg-white/50 rounded-full overflow-hidden shadow-inner border border-white/40">
                            <div
                                className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full relative overflow-hidden transition-all duration-300"
                                style={{ width: `${w.innerCalmPercent}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 w-full h-full mix-blend-overlay" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-1 min-w-[120px] lg:min-w-[140px] group cursor-default">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-zinc-500 text-[10px] lg:text-xs font-semibold tracking-wider uppercase group-hover:text-purple-600 transition-colors">
                                Deep Work
                            </span>
                            <span className="text-purple-700 font-medium text-[10px] lg:text-xs">{w.deepWorkLabel}</span>
                        </div>
                        <div className="h-2 bg-white/50 rounded-full overflow-hidden shadow-inner border border-white/40">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-[70%] relative overflow-hidden group-hover:from-purple-400 group-hover:to-indigo-400 transition-all duration-300">
                                <div className="absolute inset-0 bg-white/20 w-full h-full mix-blend-overlay" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-1 min-w-[120px] lg:min-w-[140px] group cursor-default">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-zinc-500 text-[10px] lg:text-xs font-semibold tracking-wider uppercase group-hover:text-rose-500 transition-colors">
                                Connection
                            </span>
                            <span className="text-rose-600 font-medium text-[10px] lg:text-xs">{w.connectionLabel}</span>
                        </div>
                        <div className="h-2 bg-white/50 rounded-full overflow-hidden shadow-inner border border-white/40">
                            <div className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full w-[90%] relative overflow-hidden group-hover:from-rose-300 group-hover:to-pink-400 transition-all duration-300">
                                <div className="absolute inset-0 bg-white/20 w-full h-full mix-blend-overlay" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-1 min-w-[120px] lg:min-w-[140px] group cursor-default">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-zinc-500 text-[10px] lg:text-xs font-semibold tracking-wider uppercase group-hover:text-amber-600 transition-colors">
                                Growth
                            </span>
                            <span className="text-amber-700 font-medium text-[10px] lg:text-xs">{w.growthLabel}</span>
                        </div>
                        <div className="h-2 bg-white/50 rounded-full overflow-hidden shadow-inner border border-white/40">
                            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full w-[40%] relative overflow-hidden group-hover:from-amber-300 group-hover:to-orange-300 transition-all duration-300">
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMiI+PGxpbmUgeDE9IjAiIHkxPSIyMCIgeDI9IjIwIiB5Mj0iMCIvPjwvZz48L3N2Zz4=')] opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 lg:gap-8 bg-white/40 p-4 lg:p-6 rounded-[2rem] border border-white/50 backdrop-blur-md shadow-sm relative overflow-hidden group w-full lg:w-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                <div className="flex flex-col justify-center gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="bg-orange-500/20 text-orange-600 p-1.5 rounded-xl">
                            <Activity className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] lg:text-xs font-semibold text-zinc-500 uppercase tracking-wider">Steps</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl lg:text-4xl font-semibold tracking-tighter text-zinc-900">
                            {w.steps.toLocaleString()}
                        </span>
                    </div>
                    <div className="w-full bg-zinc-200/60 h-2 rounded-full overflow-hidden mt-1 backdrop-blur-sm">
                        <div className="bg-orange-500 h-full rounded-full relative transition-all" style={{ width: `${stepsPct}%` }}>
                            <div className="absolute inset-0 bg-white/20 w-full h-full" />
                        </div>
                    </div>
                </div>

                <div className="w-px bg-gradient-to-b from-transparent via-zinc-300 to-transparent opacity-60 hidden sm:block" />

                <div className="flex flex-col justify-center gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="bg-blue-500/20 text-blue-600 p-1.5 rounded-xl">
                            <Droplet className="w-4 h-4 fill-blue-500/20" />
                        </div>
                        <span className="text-[10px] lg:text-xs font-semibold text-zinc-500 uppercase tracking-wider">Water</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl lg:text-4xl font-semibold tracking-tighter text-zinc-900">{w.waterCurrent}</span>
                        <span className="text-lg font-medium text-zinc-400">/{w.waterTarget}</span>
                    </div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                        {Array.from({ length: w.waterTarget }, (_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-2 w-3 rounded-full transition-all duration-500",
                                    i < w.waterCurrent
                                        ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                        : "bg-blue-500/10",
                                )}
                            />
                        ))}
                    </div>
                </div>

                <div className="w-px bg-gradient-to-b from-transparent via-zinc-300 to-transparent opacity-60 hidden sm:block" />

                <div className="flex flex-col justify-center gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="bg-indigo-500/20 text-indigo-600 p-1.5 rounded-xl">
                            <Moon className="w-4 h-4 fill-indigo-500/20" />
                        </div>
                        <span className="text-[10px] lg:text-xs font-semibold text-zinc-500 uppercase tracking-wider">Sleep</span>
                    </div>
                    <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="text-2xl lg:text-4xl font-semibold tracking-tighter text-zinc-900">
                            {w.sleepHours}
                            <span className="text-lg font-medium text-zinc-500">h</span> {w.sleepMinutes}
                            <span className="text-lg font-medium text-zinc-500">m</span>
                        </span>
                    </div>
                    <div className="text-[10px] lg:text-xs font-medium text-indigo-600 mt-1 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 shrink-0" /> {w.sleepTrendLabel}
                    </div>
                </div>
            </div>
        </div>
    );
}
