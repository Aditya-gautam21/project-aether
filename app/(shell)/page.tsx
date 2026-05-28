"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import { Sparkles, Plus, ChevronRight } from "lucide-react";
import { useDashboard } from "@/app/context/DashboardContext";
import { OnboardingWizard, loadPreferences, savePreferences, type UserPreferences, type ModuleKey } from "@/components/onboarding-wizard";
import { WidgetCustomizer, type WidgetDefinition } from "@/components/widget-customizer";
import { TasksWidget, HabitsWidget, FinanceWidget, SocialWidget } from "@/components/aether-widgets";
import { ChatbotWidget } from "@/components/dashboard-widgets";
import { VitalityHeader } from "@/components/vitality-header";
import { cn } from "@/lib/utils";

// ---------- widget registry ----------

type WidgetMeta = {
    key: ModuleKey;
    label: string;
    component: React.FC<any>;
    props?: Record<string, unknown>;
};

const WIDGET_REGISTRY: WidgetMeta[] = [
    { key: "tasks", label: "Tasks", component: TasksWidget },
    { key: "habits", label: "Habits", component: HabitsWidget },
    { key: "finance", label: "Finance", component: FinanceWidget },
    { key: "social", label: "Social", component: SocialWidget },
];

// ---------- empty state cards for modules not yet active ----------

function EmptyModuleCard({ label, description, icon: Icon, onAdd }: {
    label: string;
    description: string;
    icon: React.ElementType;
    onAdd: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur rounded-2xl border border-dashed border-zinc-200 p-6 flex flex-col items-center text-center gap-3 hover:border-zinc-300 hover:bg-white/80 transition-all duration-200 group cursor-pointer"
            onClick={onAdd}
        >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
                <Icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
            </div>
            <div>
                <h4 className="text-sm font-medium text-zinc-500 group-hover:text-zinc-700 transition-colors">{label}</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">{description}</p>
            </div>
            <span className="text-[10px] font-medium text-violet-500 bg-violet-50 px-2 py-1 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-3 h-3" /> Add
            </span>
        </motion.div>
    );
}

// ---------- main page ----------

export default function LifeOsPage() {
    const { state, loading } = useDashboard();
    const [chatId] = useState(() => nanoid());
    const [prefs, setPrefs] = useState<UserPreferences | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [hasCheckedPrefs, setHasCheckedPrefs] = useState(false);

    // Load preferences on mount
    React.useEffect(() => {
        const stored = loadPreferences();
        if (stored && stored.onboardingComplete) {
            setPrefs(stored);
        } else {
            setShowOnboarding(true);
        }
        setHasCheckedPrefs(true);
    }, []);

    // Build widget visibility from preferences
    const widgetDefs: WidgetDefinition[] = useMemo(() => {
        const active = prefs?.activeModules ?? ["tasks", "habits", "finance", "social", "wellness"];
        return [
            { key: "tasks", label: "Tasks", visible: active.includes("tasks") },
            { key: "habits", label: "Habits", visible: active.includes("habits") },
            { key: "finance", label: "Finance", visible: active.includes("finance") },
            { key: "social", label: "Social", visible: active.includes("social") },
        ];
    }, [prefs]);

    // Complete onboarding
    const handleOnboardingComplete = useCallback((newPrefs: UserPreferences) => {
        setPrefs(newPrefs);
        setShowOnboarding(false);
    }, []);

    // Skip onboarding
    const handleOnboardingSkip = useCallback(() => {
        const defaults: UserPreferences = {
            name: "Friend",
            activeModules: ["tasks", "habits", "finance", "social", "wellness"],
            themeTone: "warm",
            onboardingComplete: true,
            firstVisit: new Date().toISOString(),
        };
        savePreferences(defaults);
        setPrefs(defaults);
        setShowOnboarding(false);
    }, []);

    // Update widget visibility (from customizer)
    const handleWidgetChange = useCallback(
        (updated: WidgetDefinition[]) => {
            const activeModules = updated.filter((w) => w.visible).map((w) => w.key);
            const newPrefs = { ...prefs!, activeModules, onboardingComplete: true };
            savePreferences(newPrefs as UserPreferences);
            setPrefs(newPrefs as UserPreferences);
        },
        [prefs],
    );

    // Toggle a single widget on (from empty state card)
    const addModule = useCallback(
        (key: ModuleKey) => {
            if (!prefs) return;
            const activeModules = [...prefs.activeModules, key];
            const newPrefs = { ...prefs, activeModules };
            savePreferences(newPrefs);
            setPrefs(newPrefs);
        },
        [prefs],
    );

    // Visible widget components
    const visibleWidgets = WIDGET_REGISTRY.filter((w) =>
        widgetDefs.find((d) => d.key === w.key)?.visible,
    );

    // Module keys not yet active (for empty state cards)
    const inactiveModules = widgetDefs.filter((d) => !d.visible);

    // Greeting for returning users
    const greeting = prefs?.name
        ? `Hey ${prefs.name}`
        : "Welcome back";

    // Don't render until we've checked preferences
    if (!hasCheckedPrefs) return null;

    return (
        <>
            {/* ----- onboarding overlay ----- */}
            <AnimatePresence>
                {showOnboarding && (
                    <OnboardingWizard
                        onComplete={handleOnboardingComplete}
                        onSkip={handleOnboardingSkip}
                    />
                )}
            </AnimatePresence>

            {/* ----- dashboard content ----- */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showOnboarding ? 0.3 : 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-6 pb-8"
            >
                {/* welcoming header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 px-2 lg:px-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-violet-500" />
                            <span className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider">
                                Life OS
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-800">
                            {greeting}
                        </h1>
                        {loading && (
                            <p className="text-xs text-zinc-400 mt-1 animate-pulse">Loading your dashboard...</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {prefs && (
                            <WidgetCustomizer widgets={widgetDefs} onChange={handleWidgetChange} />
                        )}
                        <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full">
                            {visibleWidgets.length} widgets
                        </span>
                    </div>
                </div>

                {/* vitality strip — compact */}
                <VitalityHeader showWelcome={false} />

                {/* widget grid */}
                <div className="px-2 lg:px-4">
                    {visibleWidgets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
                            {visibleWidgets.map((w, i) => (
                                <motion.div
                                    key={w.key}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06, duration: 0.3 }}
                                >
                                    <w.component {...(w.props ?? {})} />
                                </motion.div>
                            ))}

                            {/* AI chat takes 1 col on xl, 1 on md, full on mobile */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: visibleWidgets.length * 0.06, duration: 0.3 }}
                                className="md:col-span-2 xl:col-span-2"
                            >
                                <ChatbotWidget chatId={chatId} />
                            </motion.div>
                        </div>
                    ) : (
                        /* empty state — no widgets selected */
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center gap-4"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-zinc-300" />
                            </div>
                            <h3 className="text-lg font-medium text-zinc-500">No widgets selected</h3>
                            <p className="text-sm text-zinc-400 max-w-xs">
                                Click <span className="font-medium text-zinc-600">Customize</span> above to add widgets to your dashboard.
                            </p>
                        </motion.div>
                    )}

                    {/* suggested modules (inactive ones shown as empty state cards) */}
                    {inactiveModules.length > 0 && visibleWidgets.length > 0 && (
                        <div className="mt-6">
                            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 px-1">
                                Available modules
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {inactiveModules.map((d) => (
                                    <EmptyModuleCard
                                        key={d.key}
                                        label={d.label}
                                        description="Click to add"
                                        icon={ChevronRight}
                                        onAdd={() => addModule(d.key)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
}
