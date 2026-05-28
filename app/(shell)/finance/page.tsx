"use client";

import { FinanceInteractive } from "@/components/finance-interactive";

export default function FinancePage() {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 pb-10 page-enter">
            <div className="mb-6">
                <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-zinc-800">Finance</h1>
                <p className="text-zinc-500 mt-1.5 text-sm max-w-xl leading-relaxed">
                    Track spending against budgets. Adjust limits and record expenses — changes sync automatically.
                </p>
            </div>
            <FinanceInteractive />
        </div>
    );
}
