"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Code2, PenLine } from "lucide-react";

const examples = [
    {
        heading: "Explain a concept",
        message: "Explain quantum physics — first to a 5 year old, then to a physics major",
        icon: BookOpen,
    },
    {
        heading: "Write something",
        message: "Write a haiku about a robot learning to love",
        icon: PenLine,
    },
    {
        heading: "Debug code",
        message: "Find the bug in this Python function:\n\ndef add(a, b):\n  return a - b",
        icon: Code2,
    },
];

export function EmptyScreen({ setInput }: { setInput: (value: string) => void }) {
    return (
        <div className="mx-auto max-w-2xl px-4 flex flex-col justify-center h-full pb-16">
            <div className="flex items-center justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-violet-500" />
                </div>
            </div>
            <h2 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-800 text-center">
                How can I help?
            </h2>
            <p className="text-center text-sm text-zinc-500 mb-8 max-w-sm mx-auto leading-relaxed">
                Ask anything — explanations, creative writing, code help, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {examples.map((ex, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setInput(ex.message)}
                        className="flex flex-col items-start gap-3 p-4 rounded-2xl bg-white/70 backdrop-blur border border-zinc-200/60 hover:border-violet-200 hover:bg-violet-50/30 transition-all text-left shadow-sm"
                    >
                        <ex.icon className="w-5 h-5 text-violet-400" />
                        <div>
                            <div className="font-medium text-sm text-zinc-700 mb-0.5">{ex.heading}</div>
                            <div className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{ex.message}</div>
                        </div>
                    </button>
                ))}
            </div>
            <p className="text-center text-xs text-zinc-400 mt-6">
                For threads, model choice, and export, open the{" "}
                <Link href="/chat" className="text-violet-500 hover:text-violet-600 font-medium underline-offset-2 hover:underline">
                    Chat
                </Link>{" "}
                page.
            </p>
        </div>
    );
}
