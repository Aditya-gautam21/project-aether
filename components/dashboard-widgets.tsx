"use client";

import { ChevronDown, MoreVertical, ArrowUpRight, Play, Pause, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/chat/chat-interface";
import { GripHorizontal } from "lucide-react";

export function WidgetDragHandle({ dragHandleProps }: any) {
    return (
        <div {...dragHandleProps} className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 cursor-grab active:cursor-grabbing p-1 bg-zinc-900 text-white hover:bg-zinc-800 rounded-full backdrop-blur shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <GripHorizontal className="w-4 h-4" />
        </div>
    );
}

export function ProfileWidget() {
    return (
        <div className="bg-zinc-900 rounded-[2rem] p-6 text-white relative overflow-hidden group min-h-[300px] flex flex-col justify-end w-full mt-4">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000')] bg-cover bg-center opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/20 to-transparent" />
            <div className="relative z-10 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-medium">Lora Piterson</h2>
                    <p className="text-zinc-300 text-sm">UX/UI Designer</p>
                </div>
                <div className="bg-zinc-800/80 backdrop-blur px-4 py-2 rounded-full font-medium shadow-sm border border-zinc-600/50">
                    $1,200
                </div>
            </div>
        </div>
    );
}

export function AccordionsWidget() {
    return (
        <div className="flex flex-col gap-2 w-full mt-4">
            <div className="bg-white/80 backdrop-blur rounded-[1.5rem] p-4 flex justify-between items-center shadow-sm border border-white">
                <span className="font-medium truncate">Pension contributions</span>
                <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 ml-2" />
            </div>
            
            <div className="bg-white/80 backdrop-blur rounded-[1.5rem] p-4 flex flex-col shadow-sm border border-white">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Devices</span>
                    <ChevronDown className="w-4 h-4 text-zinc-400 rotate-180 shrink-0" />
                </div>
                <div className="bg-zinc-50 border rounded-2xl p-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white text-[10px] shrink-0">MAC</div>
                        <div className="truncate">
                            <div className="font-semibold text-sm truncate">MacBook Air</div>
                            <div className="text-xs text-zinc-500">Version M1</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-[1.5rem] p-4 flex justify-between items-center shadow-sm border border-white border-dashed">
                <span className="font-medium truncate">Compensation Summary</span>
                <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 ml-2" />
            </div>
            
            <div className="bg-white/80 backdrop-blur rounded-[1.5rem] p-4 flex justify-between items-center shadow-sm border border-white border-dashed">
                <span className="font-medium truncate">Employee Benefits</span>
                <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 ml-2" />
            </div>
        </div>
    );
}

export function ProgressWidget() {
    return (
        <div className="bg-white/90 backdrop-blur rounded-[2.5rem] p-6 shadow-sm flex flex-col relative w-full h-[280px] mt-4">
            <Button variant="ghost" size="icon" className="absolute top-6 right-6 border rounded-full h-10 w-10"><ArrowUpRight className="w-4 h-4" /></Button>
            <h3 className="text-xl font-medium mb-1 truncate mr-12">Progress</h3>
            <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl lg:text-5xl font-light">6.1 h</span>
                <span className="text-xs lg:text-sm text-zinc-500 max-w-[80px] leading-tight font-medium">Work Time this week</span>
            </div>
            <div className="flex items-end justify-between h-28 px-2 lg:px-4">
                {['S','M','T','W','T','F','S'].map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className="w-2 rounded-full bg-zinc-100 flex items-end relative" style={{ height: '70px' }}>
                            <div className={`w-2 rounded-full absolute bottom-0 ${i === 4 ? 'bg-primary h-[80%]' : i === 2 || i === 3 ? 'bg-zinc-800 h-[60%]' : i === 1 ? 'bg-zinc-800 h-[40%]' : 'bg-transparent h-0'}`}></div>
                            {i === 4 && <div className="absolute -top-8 bg-primary text-black text-[10px] lg:text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap left-1/2 -translate-x-1/2 border border-yellow-300">5h 23m</div>}
                            <div className={`w-2 h-2 rounded-full absolute -bottom-4 ${i === 4 ? 'bg-primary' : i > 0 && i < 5 ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>
                        </div>
                        <span className="text-xs font-medium text-zinc-400 mt-2">{day}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CalendarWidget() {
    return (
        <div className="bg-white/90 backdrop-blur rounded-[2.5rem] p-6 shadow-sm flex flex-col relative w-full h-[400px] mt-4">
            <div className="flex justify-between items-center mb-6 overflow-hidden">
                <span className="font-semibold text-zinc-400 hidden xl:inline-block">August</span>
                <h3 className="text-lg lg:text-xl font-medium font-serif truncate px-2">September 2024</h3>
                <span className="font-semibold text-zinc-400 hidden xl:inline-block">October</span>
            </div>

            <div className="grid grid-cols-6 gap-1 lg:gap-2 text-center text-xs lg:text-sm mb-4 border-b pb-4 shrink-0">
                <div><div className="text-zinc-400 font-medium mb-1">Mon</div><div className="font-medium">22</div></div>
                <div><div className="text-zinc-400 font-medium mb-1">Tue</div><div className="font-medium">23</div></div>
                <div><div className="text-zinc-400 font-medium mb-1">Wed</div><div className="bg-primary rounded-full w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center mx-auto text-black font-semibold">24</div></div>
                <div><div className="text-zinc-400 font-medium mb-1">Thu</div><div className="font-medium">25</div></div>
                <div><div className="text-zinc-400 font-medium mb-1">Fri</div><div className="font-medium text-zinc-400">26</div></div>
                <div><div className="text-zinc-400 font-medium mb-1">Sat</div><div className="font-medium text-zinc-400">27</div></div>
            </div>

            <div className="flex-1 overflow-y-auto relative custom-scrollbar pr-2">
                <div className="absolute top-[20px] left-[45px] right-2 bg-zinc-900 text-white rounded-2xl p-3 lg:p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center z-10 shadow-lg">
                    <div className="truncate w-full pr-2">
                        <div className="font-medium truncate text-sm lg:text-base">Weekly Team Sync</div>
                        <div className="text-zinc-400 text-[10px] lg:text-xs truncate">Discuss progress</div>
                    </div>
                </div>
                
                <div className="absolute top-[120px] left-[100px] right-2 bg-white border rounded-2xl p-3 lg:p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center z-10 shadow-sm">
                    <div className="truncate w-full pr-2">
                        <div className="font-medium truncate text-sm lg:text-base">Onboarding Session</div>
                        <div className="text-zinc-500 text-[10px] lg:text-xs truncate">Intro for new hires</div>
                    </div>
                </div>

                {/* Timeline Labels */}
                <div className="flex flex-col gap-10 mt-6 text-xs text-zinc-400 font-medium border-l border-dashed ml-[45px]">
                    <div className="-ml-[45px] relative"><span className="absolute -top-2 bg-white pr-1">8:00 am</span><div className="w-full border-b border-dashed ml-[45px]"></div></div>
                    <div className="-ml-[45px] relative"><span className="absolute -top-2 bg-white pr-1">9:00 am</span><div className="w-full border-b border-dashed ml-[45px]"></div></div>
                    <div className="-ml-[45px] relative"><span className="absolute -top-2 bg-white pr-1">10:00 am</span><div className="w-full border-b border-dashed ml-[45px]"></div></div>
                    <div className="-ml-[45px] relative"><span className="absolute -top-2 bg-white pr-1">11:00 am</span><div className="w-full border-b border-dashed ml-[45px]"></div></div>
                </div>
            </div>
        </div>
    );
}

export function MetricsWidget() {
    return (
        <div className="flex flex-col xl:flex-row gap-4 w-full mt-4">
            <div className="flex-1 bg-white/90 backdrop-blur rounded-[2.5rem] p-6 shadow-sm relative min-w-0">
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 border rounded-full shrink-0"><ArrowUpRight className="w-3 h-3" /></Button>
                <h3 className="text-base lg:text-lg font-medium mb-4 truncate pr-8">Time tracker</h3>
                
                <div className="relative w-20 h-20 lg:w-28 lg:h-28 mx-auto mb-4 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#f4f4f5" strokeWidth="8"/>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="283" strokeDashoffset="200" className="text-primary"/>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg lg:text-xl font-light">02:35</span>
                        <span className="text-[9px] text-zinc-500 font-medium">Work</span>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-auto">
                    <div className="flex gap-1 lg:gap-2">
                        <Button variant="outline" size="icon" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white shadow-sm"><Play className="w-3 h-3 lg:w-4 lg:h-4 ml-1" /></Button>
                        <Button variant="outline" size="icon" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white shadow-sm"><Pause className="w-3 h-3 lg:w-4 lg:h-4" /></Button>
                    </div>
                    <Button variant="default" size="icon" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-zinc-900 text-white shrink-0"><Clock className="w-3 h-3 lg:w-4 lg:h-4" /></Button>
                </div>
            </div>

            <div className="flex-1 bg-white/90 backdrop-blur rounded-[2.5rem] p-6 shadow-sm flex flex-col justify-between min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="text-base lg:text-lg font-medium truncate">Onboarding</h3>
                    <span className="text-xl lg:text-2xl font-light shrink-0">18%</span>
                </div>
                <div className="flex gap-1 lg:gap-2 text-[10px] lg:text-xs font-medium text-zinc-500 mt-4 mb-2">
                    <div className="flex-[0.5] truncate">30%</div>
                    <div className="flex-[0.3] truncate">25%</div>
                    <div className="flex-[0.2] text-right truncate">0%</div>
                </div>
                <div className="flex gap-1 lg:gap-2 h-8 lg:h-10">
                    <div className="bg-primary rounded-xl flex-[0.5] flex items-center px-1 lg:px-4 font-medium text-[10px] lg:text-sm overflow-hidden">
                        <span className="truncate">Task</span>
                    </div>
                    <div className="bg-zinc-800 rounded-xl flex-[0.3]"></div>
                    <div className="bg-zinc-200 rounded-xl flex-[0.2]"></div>
                </div>
            </div>
        </div>
    );
}

export function ChatbotWidget({ chatId }: { chatId: string }) {
    return (
        <div className="bg-zinc-900 relative rounded-[2.5rem] shadow-xl w-full flex flex-col overflow-hidden text-white border-4 border-zinc-900 h-[480px] mt-4 mb-4">
            <div className="p-4 pb-2 flex justify-between items-center bg-zinc-900 z-10 shrink-0">
                <h3 className="text-xl font-medium w-full text-center">AI Assistant</h3>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 absolute right-6"></div>
            </div>
            <div className="flex-1 bg-zinc-50 rounded-[2rem] overflow-hidden m-2 mt-0 flex flex-col">
                <ChatInterface id={chatId} />
            </div>
        </div>
    );
}
