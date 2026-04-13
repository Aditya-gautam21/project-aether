"use client";

import { FinanceInteractive } from "@/components/finance-interactive";
import { InfoPanel } from "@/components/info-panel";
import { useDashboard } from "@/app/context/DashboardContext";

export default function FinancePage() {
    const { state } = useDashboard();
    const totalBudget = state.finances.reduce((s, f) => s + f.limit, 0);
    const totalSpent = state.finances.reduce((s, f) => s + f.spent, 0);
    const overCount = state.finances.filter((f) => f.spent > f.limit).length;

    return (
        <div className="w-full px-2 pb-12 lg:px-4">
            <div className="mb-6 px-2">
                <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-zinc-900">Finance</h1>
                <p className="text-zinc-500 mt-2 max-w-2xl text-sm lg:text-base">
                    Edit envelopes and spending in real time — changes sync to your FastAPI store. Category budgets help
                    you see leakage early (e.g. a flexible 50/30/20-style split, tuned to your situation).
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 max-w-6xl">
                <div className="lg:col-span-2 space-y-4">
                    <FinanceInteractive />
                    <InfoPanel title="Reading your bars">
                        <p>
                            When a bar hits 100%, you are at the cap; above 100% means you exceeded the envelope.
                            Revisit weekly: trim discretionary categories before cutting savings if possible.
                        </p>
                    </InfoPanel>
                </div>
                <div className="space-y-4">
                    <InfoPanel title="Snapshot">
                        <p>
                            <span className="font-medium text-zinc-800">Tracked categories:</span> {state.finances.length}
                        </p>
                        <p>
                            <span className="font-medium text-zinc-800">Total envelopes:</span> ₹
                            {totalBudget.toLocaleString()}
                        </p>
                        <p>
                            <span className="font-medium text-zinc-800">Recorded spend:</span> ₹
                            {totalSpent.toLocaleString()}
                        </p>
                        <p>
                            <span className="font-medium text-zinc-800">Over budget:</span> {overCount}{" "}
                            {overCount === 1 ? "category" : "categories"}
                        </p>
                    </InfoPanel>
                    <InfoPanel title="Next step">
                        <p>
                            Pick one category to automate (subscription audit or grocery list). Automation removes
                            willpower from the hardest moments.
                        </p>
                    </InfoPanel>
                </div>
            </div>
        </div>
    );
}
