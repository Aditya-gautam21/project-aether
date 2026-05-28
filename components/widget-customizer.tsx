"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, X, Check, GripVertical, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ModuleKey } from "@/components/onboarding-wizard";

export type WidgetDefinition = {
    key: ModuleKey;
    label: string;
    visible: boolean;
};

interface Props {
    widgets: WidgetDefinition[];
    onChange: (widgets: WidgetDefinition[]) => void;
}

export function WidgetCustomizer({ widgets, onChange }: Props) {
    const [open, setOpen] = useState(false);

    const toggle = (key: ModuleKey) => {
        onChange(
            widgets.map((w) => (w.key === key ? { ...w, visible: !w.visible } : w)),
        );
    };

    const visibleCount = widgets.filter((w) => w.visible).length;

    return (
        <>
            {/* toggle button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className="gap-2 rounded-full border-zinc-200 bg-white/70 backdrop-blur text-zinc-600 hover:text-zinc-900 text-xs"
            >
                <Settings2 className="w-3.5 h-3.5" />
                Customize
                <span className="text-zinc-400 text-[10px]">({visibleCount})</span>
            </Button>

            {/* panel */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                            onClick={() => setOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, x: 300 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 300 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-white shadow-2xl border-l border-zinc-100 flex flex-col"
                        >
                            {/* header */}
                            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
                                <div>
                                    <h3 className="font-semibold text-zinc-800">Customize Dashboard</h3>
                                    <p className="text-xs text-zinc-500 mt-0.5">Toggle widgets on or off</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* widget list */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                                {widgets.map((w) => (
                                    <button
                                        key={w.key}
                                        type="button"
                                        onClick={() => toggle(w.key)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 text-left",
                                            w.visible
                                                ? "border-zinc-200 bg-white hover:border-zinc-300 shadow-sm"
                                                : "border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-200 hover:text-zinc-600",
                                        )}
                                    >
                                        <GripVertical className="w-4 h-4 shrink-0 text-zinc-300" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium">{w.label}</div>
                                        </div>
                                        {w.visible ? (
                                            <Eye className="w-4 h-4 shrink-0 text-zinc-600" />
                                        ) : (
                                            <EyeOff className="w-4 h-4 shrink-0" />
                                        )}
                                        <div
                                            className={cn(
                                                "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                                                w.visible
                                                    ? "bg-zinc-900 border-zinc-900"
                                                    : "border-zinc-200",
                                            )}
                                        >
                                            {w.visible && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* footer hint */}
                            <div className="p-4 border-t border-zinc-100">
                                <p className="text-[11px] text-zinc-400 text-center">
                                    Drag to reorder coming soon. Changes save automatically.
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
