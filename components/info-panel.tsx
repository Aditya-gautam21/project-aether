import { cn } from "@/lib/utils";

export function InfoPanel({
    title,
    children,
    className,
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                "bg-white/80 backdrop-blur rounded-[2rem] p-6 lg:p-8 shadow-sm border border-white/60 text-zinc-700 leading-relaxed",
                className,
            )}
        >
            <h2 className="text-lg font-medium text-zinc-900 mb-3">{title}</h2>
            <div className="text-sm space-y-3">{children}</div>
        </section>
    );
}
