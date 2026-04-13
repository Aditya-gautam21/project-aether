"use client";
import React from "react";
import { useDashboard } from "@/app/context/DashboardContext";
import { Check } from "lucide-react";

export const TasksWidget = () => {
    const { state, patch } = useDashboard();

    const toggle = (id: string) => {
        const tasks = state.tasks.map((t) =>
            t.id === id ? { ...t, status: t.status === "completed" ? ("pending" as const) : ("completed" as const) } : t,
        );
        void patch({ tasks });
    };

    return (
        <div className="bg-[#171717] p-5 rounded-2xl border border-white/5 text-white flex flex-col gap-4 min-h-[280px]">
            <div className="flex justify-between items-center text-sm font-medium">
                <h3 className="text-gray-400">Tasks</h3>
                <span className="text-xs bg-[#4B43B0]/20 text-[#7C63F5] px-3 py-1 rounded-full">Today</span>
            </div>
            <div className="flex flex-col gap-3 mt-2">
                {state.tasks.map((t) => (
                    <button
                        type="button"
                        key={t.id}
                        onClick={() => toggle(t.id)}
                        className="flex items-center justify-between group cursor-pointer text-left w-full rounded-xl py-0.5 -mx-1 px-1 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div
                                className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${t.status === "completed" ? "bg-[#7C63F5] border-[#7C63F5]" : "border-gray-600"}`}
                            >
                                {t.status === "completed" && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            </div>
                            <span
                                className={`text-sm truncate ${t.status === "completed" ? "text-gray-500 line-through" : "text-gray-300"}`}
                            >
                                {t.title}
                            </span>
                        </div>
                        <span className="text-[10px] text-gray-600 uppercase tracking-wider shrink-0 ml-2">{t.tag}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export const HabitsWidget = () => {
    const { state } = useDashboard();
    return (
        <div className="bg-[#171717] p-5 rounded-2xl border border-white/5 text-white flex flex-col gap-4 min-h-[280px]">
            <div className="flex justify-between items-center text-sm font-medium">
                <h3 className="text-gray-400">Habits</h3>
                <span className="text-xs bg-[#C29623]/20 text-[#E7B846] px-3 py-1 rounded-full">This week</span>
            </div>
            <div className="flex flex-col gap-4 mt-2">
                {state.habits.map((h) => (
                    <div key={h.id} className="flex justify-between items-center gap-2">
                        <span className="text-sm text-gray-300 truncate">{h.name}</span>
                        <div className="flex gap-1.5 shrink-0">
                            {[...Array(7)].map((_, j) => (
                                <div
                                    key={j}
                                    className={`w-2.5 h-2.5 rounded-full ${j < h.streak ? (j === h.streak - 1 ? "bg-[#4AE189]" : "bg-[#7C63F5]") : "bg-gray-800"}`}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const FinanceWidget = () => {
    const { state } = useDashboard();
    return (
        <div className="bg-[#171717] p-5 rounded-2xl border border-white/5 text-white flex flex-col gap-4 min-h-[280px]">
            <div className="flex justify-between items-center text-sm font-medium">
                <h3 className="text-gray-400">Finance</h3>
                <span className="text-xs bg-[#4AE189]/20 text-[#4AE189] px-3 py-1 rounded-full">April</span>
            </div>
            <div className="flex flex-col gap-4 mt-2">
                {state.finances.map((f) => (
                    <div key={f.id} className="flex items-center gap-4 text-sm min-w-0">
                        <span className="text-gray-300 w-24 flex-shrink-0 truncate">{f.name}</span>
                        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden min-w-0">
                            <div
                                className={`h-full ${f.color}`}
                                style={{ width: `${Math.min((f.spent / f.limit) * 100, 100)}%` }}
                            />
                        </div>
                        <span className="text-gray-400 font-mono text-xs w-16 text-right shrink-0">₹{f.spent}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const SocialWidget = () => {
    const { state } = useDashboard();
    return (
        <div className="bg-[#171717] p-5 rounded-2xl border border-white/5 text-white flex flex-col gap-4 min-h-[280px]">
            <div className="flex justify-between items-center text-sm font-medium">
                <h3 className="text-gray-400">Social</h3>
                <span className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full">Relationships</span>
            </div>
            <div className="flex flex-col gap-3 mt-2">
                {state.social.map((s) => (
                    <div key={s.id} className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-gray-300 shrink-0">
                                {s.name[0]}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm text-gray-200 truncate">{s.name}</span>
                                <span className="text-[10px] text-gray-500 truncate">{s.status}</span>
                            </div>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full shrink-0 ${s.actionColor}`}>{s.action}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
