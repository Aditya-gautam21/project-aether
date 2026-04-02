"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Bell, User, ArrowUpRight, Play, Pause, Clock, Search, Briefcase, Users, Monitor, LayoutDashboard, CheckCircle2, ChevronDown, MoreVertical } from "lucide-react";
import { nanoid } from "nanoid";
import { DynamicDashboard } from "@/components/dynamic-dashboard";

export default function Page() {
    const [chatId, setChatId] = useState<string>(nanoid());

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-[#EAEBED] via-[#FDFDF7] to-[#FFF1D0] text-foreground flex flex-col overflow-hidden p-4 lg:p-6 pb-0">
            {/* Top Navigation */}
                <header className="flex justify-between items-center mb-8 px-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-white border rounded-full px-5 py-2 text-xl font-semibold shadow-sm">
                            Crextio
                        </div>
                    </div>
                    
                    <nav className="hidden lg:flex items-center gap-1 bg-white/70 backdrop-blur-md rounded-full p-1 shadow-sm border border-white/50">
                        <Button variant="ghost" className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800 px-6 py-2 h-auto" size="sm">Dashboard</Button>
                        <Button variant="ghost" className="rounded-full px-6 py-2 h-auto hover:bg-white/80" size="sm">People</Button>
                        <Button variant="ghost" className="rounded-full px-6 py-2 h-auto hover:bg-white/80" size="sm">Hiring</Button>
                        <Button variant="ghost" className="rounded-full px-6 py-2 h-auto hover:bg-white/80" size="sm">Devices</Button>
                        <Button variant="ghost" className="rounded-full px-6 py-2 h-auto hover:bg-white/80" size="sm">Apps</Button>
                        <Button variant="ghost" className="rounded-full px-6 py-2 h-auto hover:bg-white/80" size="sm">Salary</Button>
                        <Button variant="ghost" className="rounded-full px-6 py-2 h-auto hover:bg-white/80" size="sm">Calendar</Button>
                        <Button variant="ghost" className="rounded-full px-6 py-2 h-auto hover:bg-white/80" size="sm">Reviews</Button>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-full bg-white/70 backdrop-blur-md border-white/50 shadow-sm gap-2" size="sm">
                            <Settings className="w-4 h-4" /> Setting
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full bg-white/70 backdrop-blur-md border-white/50 shadow-sm">
                            <Bell className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full bg-white/70 backdrop-blur-md border-white/50 shadow-sm">
                            <User className="w-4 h-4" />
                        </Button>
                    </div>
                </header>

                {/* Dashboard Sub-header */}
                <div className="flex flex-wrap justify-between items-end mb-8 px-4 gap-8">
                    <div className="flex-1">
                        <h1 className="text-5xl font-light tracking-tight mb-8">Welcome in, Nixtio</h1>
                        
                        <div className="flex gap-8 items-center text-sm font-medium">
                            <div className="flex flex-col gap-2 flex-1 max-w-[200px]">
                                <span className="text-zinc-600">Interviews</span>
                                <div className="h-8 bg-zinc-900 rounded-full flex items-center px-4 text-white">15%</div>
                            </div>
                            <div className="flex flex-col gap-2 flex-1 max-w-[200px]">
                                <span className="text-zinc-600">Hired</span>
                                <div className="h-8 bg-primary rounded-full flex items-center px-4">15%</div>
                            </div>
                            <div className="flex flex-col gap-2 flex-[2]">
                                <span className="text-zinc-600">Project time</span>
                                <div className="h-8 rounded-full border border-zinc-200 overflow-hidden flex bg-white/50">
                                    <div className="h-full bg-white flex items-center px-4 w-[60%] border-r relative">
                                        60%
                                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjZTllOWU5IiBzdHJva2Utd2lkdGg9IjEiPjxsaW5lIHgxPSIwIiB5MT0iMjAiIHgyPSIyMCIgeTI9IjAiLz48L2c+PC9zdmc+')] opacity-50" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 flex-1 max-w-[200px]">
                                <span className="text-zinc-600">Output</span>
                                <div className="h-8 rounded-full border border-zinc-300 flex items-center px-4 bg-transparent">10%</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-12 bg-white/40 p-6 rounded-[2rem] border border-white/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-zinc-100 p-2 rounded-full"><Users className="w-5 h-5" /></div>
                            <div>
                                <div className="text-5xl font-light">78</div>
                                <div className="text-sm font-medium text-zinc-600">Employee</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-zinc-100 p-2 rounded-full"><Briefcase className="w-5 h-5" /></div>
                            <div>
                                <div className="text-5xl font-light">56</div>
                                <div className="text-sm font-medium text-zinc-600">Hirings</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-zinc-100 p-2 rounded-full"><LayoutDashboard className="w-5 h-5" /></div>
                            <div>
                                <div className="text-5xl font-light">203</div>
                                <div className="text-sm font-medium text-zinc-600">Projects</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Grid Content */}
                <DynamicDashboard chatId={chatId} />
            {/* Dark mode override logic if needed, but we style inline usually */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
            `}</style>
        </div>
    );
}
