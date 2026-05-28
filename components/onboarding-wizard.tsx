"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Sparkles, Check, Layout, Smile, Target, Coins, Heart, BookOpen, Activity, User, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------- user preferences (persisted in localStorage) ----------

export type ModuleKey = "tasks" | "habits" | "finance" | "social" | "journal" | "wellness";
export type ThemeTone = "warm" | "cool" | "dark" | "light";

export interface UserPreferences {
    name: string;
    activeModules: ModuleKey[];
    themeTone: ThemeTone;
    onboardingComplete: boolean;
    firstVisit: string;
}

const STORAGE_KEY = "aether-user-preferences";

export function loadPreferences(): UserPreferences | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as UserPreferences;
    } catch {
        return null;
    }
}

export function savePreferences(prefs: UserPreferences) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function clearPreferences() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
}

const DEFAULT_PREFS: UserPreferences = {
    name: "",
    activeModules: ["tasks", "habits", "finance", "social", "wellness"],
    themeTone: "warm",
    onboardingComplete: false,
    firstVisit: new Date().toISOString(),
};

// ---------- module definitions ----------

const MODULES: { key: ModuleKey; label: string; description: string; icon: React.ElementType; color: string }[] = [
    { key: "tasks", label: "Tasks", description: "Track todos and priorities", icon: Check, color: "text-violet-500 bg-violet-50 border-violet-200" },
    { key: "habits", label: "Habits", description: "Build streaks and routines", icon: Activity, color: "text-emerald-500 bg-emerald-50 border-emerald-200" },
    { key: "finance", label: "Finance", description: "Monitor spending & budgets", icon: Coins, color: "text-amber-500 bg-amber-50 border-amber-200" },
    { key: "social", label: "Social", description: "Nurture relationships", icon: Heart, color: "text-rose-500 bg-rose-50 border-rose-200" },
    { key: "journal", label: "Journal", description: "Reflect and grow", icon: BookOpen, color: "text-blue-500 bg-blue-50 border-blue-200" },
    { key: "wellness", label: "Wellness", description: "Health & vitality tracking", icon: Smile, color: "text-teal-500 bg-teal-50 border-teal-200" },
];

const THEME_TONES: { key: ThemeTone; label: string; className: string }[] = [
    { key: "warm", label: "Warm", className: "bg-gradient-to-br from-[#FFF8E7] via-[#FFF1D0] to-[#FDE9B6] text-zinc-800" },
    { key: "cool", label: "Cool", className: "bg-gradient-to-br from-[#F0F4FF] via-[#E8EEFF] to-[#DBE4FF] text-zinc-800" },
    { key: "dark", label: "Dark", className: "bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] text-white" },
    { key: "light", label: "Light", className: "bg-gradient-to-br from-[#F8F9FA] via-[#FFFFFF] to-[#F1F3F5] text-zinc-800" },
];

// ---------- onboarding wizard ----------

interface Props {
    onComplete: (prefs: UserPreferences) => void;
    onSkip: () => void;
}

const TOTAL_STEPS = 4;

export function OnboardingWizard({ onComplete, onSkip }: Props) {
    const [step, setStep] = useState(0);
    const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);
    const [nameInput, setNameInput] = useState("");

    const next = useCallback(() => {
        if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
        else {
            const final = { ...prefs, onboardingComplete: true, name: nameInput || prefs.name || "Friend" };
            savePreferences(final);
            onComplete(final);
        }
    }, [step, prefs, nameInput, onComplete]);

    const prev = () => { if (step > 0) setStep((s) => s - 1); };

    const toggleModule = (key: ModuleKey) => {
        setPrefs((p) => ({
            ...p,
            activeModules: p.activeModules.includes(key)
                ? p.activeModules.filter((k) => k !== key)
                : [...p.activeModules, key],
        }));
    };

    const selectTheme = (tone: ThemeTone) => setPrefs((p) => ({ ...p, themeTone: tone }));

    // Keyboard nav
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Enter" && step === 0 && nameInput.trim()) next();
            if (e.key === "ArrowRight" && step < TOTAL_STEPS - 1) next();
            if (e.key === "ArrowLeft" && step > 0) prev();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [step, nameInput, next]);

    return (
        <AnimatePresence>
            <motion.div
                key="onboarding-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden relative border border-zinc-100"
                >
                    {/* progress bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-100">
                        <motion.div
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                            initial={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                            animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
                            transition={{ duration: 0.4 }}
                        />
                    </div>

                    {/* close / skip */}
                    <button
                        type="button"
                        onClick={onSkip}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors z-10"
                        aria-label="Skip onboarding"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="p-8 pt-10">
                        <AnimatePresence mode="wait">
                            {/* ----- step 0: welcome + name ----- */}
                            {step === 0 && (
                                <motion.div
                                    key="s0"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex flex-col items-center text-center gap-5"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-200">
                                        <Sparkles className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight">Welcome to Aether</h2>
                                        <p className="text-zinc-500 mt-2 text-sm leading-relaxed max-w-xs mx-auto">
                                            Your personal Life OS. Let's set up your space in under a minute.
                                        </p>
                                    </div>
                                    <div className="w-full max-w-xs">
                                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-2 text-left">
                                            What should we call you?
                                        </label>
                                        <input
                                            type="text"
                                            value={nameInput}
                                            onChange={(e) => setNameInput(e.target.value)}
                                            placeholder="Your name"
                                            autoFocus
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all text-base"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* ----- step 1: choose modules ----- */}
                            {step === 1 && (
                                <motion.div
                                    key="s1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex flex-col gap-5"
                                >
                                    <div className="text-center">
                                        <h2 className="text-xl font-semibold tracking-tight">What matters to you?</h2>
                                        <p className="text-zinc-500 mt-1 text-sm">Pick the areas you want to track. Change anytime later.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {MODULES.filter((m) => m.key !== "journal").map((mod) => {
                                            const active = prefs.activeModules.includes(mod.key);
                                            return (
                                                <button
                                                    key={mod.key}
                                                    type="button"
                                                    onClick={() => toggleModule(mod.key)}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200",
                                                        active
                                                            ? `${mod.color} border-current shadow-sm`
                                                            : "border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-200 hover:text-zinc-700",
                                                    )}
                                                >
                                                    <mod.icon className="w-5 h-5 shrink-0" />
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium">{mod.label}</div>
                                                        <div className="text-[10px] opacity-70 truncate">{mod.description}</div>
                                                    </div>
                                                    {active && <Check className="w-4 h-4 ml-auto shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* ----- step 2: theme ----- */}
                            {step === 2 && (
                                <motion.div
                                    key="s2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex flex-col gap-5"
                                >
                                    <div className="text-center">
                                        <h2 className="text-xl font-semibold tracking-tight">Pick your vibe</h2>
                                        <p className="text-zinc-500 mt-1 text-sm">Choose a theme that feels like home.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {THEME_TONES.map((tone) => (
                                            <button
                                                key={tone.key}
                                                type="button"
                                                onClick={() => selectTheme(tone.key)}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 text-center transition-all duration-200",
                                                    tone.className,
                                                    prefs.themeTone === tone.key
                                                        ? "border-zinc-800 shadow-md scale-[1.03]"
                                                        : "border-zinc-100 opacity-70 hover:opacity-100 hover:border-zinc-300",
                                                )}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-sm font-semibold">{tone.label}</span>
                                                    {prefs.themeTone === tone.key && (
                                                        <Check className="w-4 h-4" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* ----- step 3: summary & finish ----- */}
                            {step === 3 && (
                                <motion.div
                                    key="s3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex flex-col items-center text-center gap-5"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                                        <Layout className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight">
                                            You're all set{nameInput ? `, ${nameInput}` : ""}
                                        </h2>
                                        <p className="text-zinc-500 mt-2 text-sm max-w-xs mx-auto">
                                            Your Life OS is ready. You can always tweak things from the dashboard.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {prefs.activeModules.map((key) => {
                                            const mod = MODULES.find((m) => m.key === key);
                                            if (!mod) return null;
                                            return (
                                                <span
                                                    key={key}
                                                    className={cn("text-xs font-medium px-3 py-1.5 rounded-full border flex items-center gap-1.5", mod.color)}
                                                >
                                                    <mod.icon className="w-3 h-3" />
                                                    {mod.label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* footer */}
                    <div className="px-8 pb-6 flex items-center justify-between gap-3">
                        <div>
                            {step > 0 && (
                                <Button variant="ghost" onClick={prev} className="gap-1.5 text-zinc-500 hover:text-zinc-700">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-zinc-400">{step + 1} of {TOTAL_STEPS}</span>
                            {step === 0 && (
                                <Button variant="ghost" onClick={onSkip} className="text-zinc-400 hover:text-zinc-600 text-sm">
                                    Skip
                                </Button>
                            )}
                            <Button
                                onClick={next}
                                disabled={step === 0 && !nameInput.trim()}
                                className="gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white"
                            >
                                {step === TOTAL_STEPS - 1 ? (
                                    <>Let's go <Sparkles className="w-4 h-4" /></>
                                ) : (
                                    <>Next <ArrowRight className="w-4 h-4" /></>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* step dots */}
                    <div className="flex justify-center gap-1.5 pb-4">
                        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                    i === step ? "bg-zinc-800 w-3" : "bg-zinc-200",
                                )}
                            />
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
