import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { DashboardProvider } from "./context/DashboardContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Aether AI",
    description: "Dynamic AI Chat Interface",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={cn(inter.className, "flex min-h-dvh flex-col overflow-hidden")}>
                <DashboardProvider>
                    <div className="flex min-h-0 flex-1 flex-col">{children}</div>
                    <Toaster position="top-center" />
                </DashboardProvider>
            </body>
        </html>
    );
}
