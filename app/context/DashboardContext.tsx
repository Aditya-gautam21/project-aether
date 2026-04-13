"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { DEFAULT_AETHER_STATE } from "@/lib/aether-defaults";
import { normalizeAetherState } from "@/lib/normalize-aether-state";
import type { AetherState } from "@/lib/aether-types";

type DashboardContextValue = {
    state: AetherState;
    loading: boolean;
    refresh: () => Promise<void>;
    patch: (partial: Partial<AetherState>) => Promise<void>;
    /** Merge partial updates into local state (e.g. legacy sync hooks). */
    updateDashboardState: (data: Partial<AetherState>) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

function mergeState(prev: AetherState, data: Partial<AetherState>): AetherState {
    return {
        tasks: data.tasks ?? prev.tasks,
        habits: data.habits ?? prev.habits,
        finances: data.finances ?? prev.finances,
        social: data.social ?? prev.social,
        journalEntries: data.journalEntries ?? prev.journalEntries,
        wellness: data.wellness ? { ...prev.wellness, ...data.wellness } : prev.wellness,
    };
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AetherState>(DEFAULT_AETHER_STATE);
    const [loading, setLoading] = useState(true);

    const reloadFromServer = useCallback(async () => {
        try {
            const res = await fetch("/api/aether/dashboard", { cache: "no-store" });
            if (res.ok) {
                const raw = await res.json();
                setState(normalizeAetherState(raw));
            } else {
                setState(DEFAULT_AETHER_STATE);
            }
        } catch (e) {
            console.error("Failed to reload dashboard:", e);
            setState(DEFAULT_AETHER_STATE);
        }
    }, []);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/aether/dashboard", { cache: "no-store" });
            if (res.ok) {
                const raw = await res.json();
                setState(normalizeAetherState(raw));
            } else {
                toast.error("Life OS API unavailable", {
                    description: "Start FastAPI: cd backend && uvicorn main:app --reload --port 8000",
                });
                setState(DEFAULT_AETHER_STATE);
            }
        } catch (e) {
            console.error("Failed to load dashboard:", e);
            toast.error("Life OS API unreachable", {
                description: "Using local defaults until the FastAPI server is running.",
            });
            setState(DEFAULT_AETHER_STATE);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const patch = useCallback(
        async (partial: Partial<AetherState>) => {
            setState((prev) => mergeState(prev, partial));
            try {
                const res = await fetch("/api/aether/dashboard", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(partial),
                });
                if (res.ok) {
                    const raw = await res.json();
                    setState(normalizeAetherState(raw));
                } else {
                    toast.error("Could not save — is FastAPI running?");
                    await reloadFromServer();
                }
            } catch (e) {
                console.error("Dashboard save failed:", e);
                toast.error("Could not save — network error.");
                await reloadFromServer();
            }
        },
        [reloadFromServer],
    );

    const updateDashboardState = useCallback((data: Partial<AetherState>) => {
        setState((prev) => normalizeAetherState(mergeState(prev, data)));
    }, []);

    return (
        <DashboardContext.Provider value={{ state, loading, refresh, patch, updateDashboardState }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const ctx = useContext(DashboardContext);
    if (!ctx) {
        throw new Error("useDashboard must be used within DashboardProvider");
    }
    return ctx;
}
