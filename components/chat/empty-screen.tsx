import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const exampleMessages = [
    {
        heading: "Explain Quantum Physics",
        message: "Explain quantum physics to a 5 year old vs a physics major",
    },
    {
        heading: "Write a Poem",
        message: "Write a haiku about a robot learning to love",
    },
    {
        heading: "Debug Code",
        message: "Find the bug in this Python function:\n\ndef add(a, b):\n  return a - b",
    },
];

export function EmptyScreen({ setInput }: { setInput: (value: string) => void }) {
    return (
        <div className="mx-auto max-w-3xl px-4 flex flex-col justify-center h-full pb-20">
            <h1 className="mb-4 text-4xl md:text-5xl font-semibold tracking-tight text-foreground text-center">
                Hey, Need help? 👋<br/>
                <span className="text-muted-foreground font-normal">Just ask me anything!</span>
            </h1>
            <div className="w-full mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {exampleMessages.map((message, index) => (
                    <Button
                        key={index}
                        variant="outline"
                        className="h-auto p-5 flex flex-col items-start text-left rounded-3xl bg-background hover:bg-muted/50 transition-colors border-none shadow-sm whitespace-normal"
                        onClick={() => setInput(message.message)}
                    >
                        <span className="font-medium mb-2 text-foreground">{message.heading}</span>
                        <span className="text-sm text-muted-foreground leading-relaxed">{message.message}</span>
                    </Button>
                ))}
            </div>
        </div>
    );
}
