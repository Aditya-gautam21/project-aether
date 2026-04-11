"use client";
import React from 'react';
import { useDashboard } from '@/app/context/DashboardContext';
import { Check, Circle } from 'lucide-react';

export const TasksWidget = () => {
   const { state } = useDashboard();
   return (
       <div className="bg-[#171717] p-5 rounded-2xl border border-white/5 text-white flex flex-col gap-4 min-h-[280px]">
           <div className="flex justify-between items-center text-sm font-medium">
               <h3 className="text-gray-400">Tasks</h3>
               <span className="text-xs bg-[#4B43B0]/20 text-[#7C63F5] px-3 py-1 rounded-full">Today</span>
           </div>
           <div className="flex flex-col gap-3 mt-2">
               {/* Fixed dummy tasks mimicking screenshot if state is empty */}
               {((state.tasks && state.tasks.length > 0) ? state.tasks : [
                   {id: 1, title: 'Morning journal entry', status: 'completed', tag: 'habit'},
                   {id: 2, title: 'Review monthly budget', status: 'completed', tag: 'finance'},
                   {id: 3, title: 'Reach out to Vansh', status: 'pending', tag: 'social'},
                   {id: 4, title: 'Read for 20 min', status: 'pending', tag: 'habit'}
               ]).map((t: any) => (
                 <div key={t.id} className="flex items-center justify-between group cursor-pointer">
                     <div className="flex items-center gap-3">
                         <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${t.status === 'completed' ? 'bg-[#7C63F5] border-[#7C63F5]' : 'border-gray-600'}`}>
                            {t.status === 'completed' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                         </div>
                         <span className={`text-sm ${t.status === 'completed' ? "text-gray-500 line-through" : "text-gray-300"}`}>{t.title}</span>
                     </div>
                     <span className="text-[10px] text-gray-600 uppercase tracking-wider">{t.tag}</span>
                 </div>
               ))}
           </div>
       </div>
   );
};

export const HabitsWidget = () => {
   const { state } = useDashboard();
   return (
       <div className="bg-[#171717] p-5 rounded-2xl border border-white/5 text-white flex flex-col gap-4 min-h-[280px]">
           <div className="flex justify-between items-center text-sm font-medium">
               <h3 className="text-gray-400">Habits</h3>
               <span className="text-xs bg-[#C29623]/20 text-[#E7B846] px-3 py-1 rounded-full">This week</span>
           </div>
           <div className="flex flex-col gap-4 mt-2">
               {/* Dummy Habits matching screenshot */}
               {[
                   {name: 'Journaling', streak: 5},
                   {name: 'Emotion labeling', streak: 4},
                   {name: 'Reading', streak: 5},
                   {name: 'Gym', streak: 4}
               ].map((h, i) => (
                   <div key={i} className="flex justify-between items-center">
                       <span className="text-sm text-gray-300">{h.name}</span>
                       <div className="flex gap-1.5">
                           {[...Array(7)].map((_, j) => (
                               <div key={j} className={`w-2.5 h-2.5 rounded-full ${j < h.streak ? (j === h.streak -1 ? 'bg-[#4AE189]' : 'bg-[#7C63F5]') : 'bg-gray-800'}`} />
                           ))}
                       </div>
                   </div>
               ))}
           </div>
       </div>
   );
};

export const FinanceWidget = () => {
   const { state } = useDashboard();
   return (
       <div className="bg-[#171717] p-5 rounded-2xl border border-white/5 text-white flex flex-col gap-4 min-h-[280px]">
           <div className="flex justify-between items-center text-sm font-medium">
               <h3 className="text-gray-400">Finance</h3>
               <span className="text-xs bg-[#4AE189]/20 text-[#4AE189] px-3 py-1 rounded-full">April</span>
           </div>
           <div className="flex flex-col gap-4 mt-2">
               {[
                   {name: 'Food', spent: 3600, limit: 5000, color: 'bg-[#7C63F5]'},
                   {name: 'Eating out', spent: 4800, limit: 4000, color: 'bg-[#F25A5A]'},
                   {name: 'Savings', spent: 8000, limit: 10000, color: 'bg-[#4AE189]'}
               ].map((f, i) => (
                   <div key={i} className="flex items-center gap-4 text-sm">
                       <span className="text-gray-300 w-24 flex-shrink-0">{f.name}</span>
                       <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                           <div className={`h-full ${f.color}`} style={{width: `${Math.min((f.spent/f.limit)*100, 100)}%`}} />
                       </div>
                       <span className="text-gray-400 font-mono text-xs w-16 text-right">₹{f.spent}</span>
                   </div>
               ))}
           </div>
       </div>
   );
};

export const SocialWidget = () => {
   const { state } = useDashboard();
   return (
       <div className="bg-[#171717] p-5 rounded-2xl border border-white/5 text-white flex flex-col gap-4 min-h-[280px]">
           <div className="flex justify-between items-center text-sm font-medium">
               <h3 className="text-gray-400">Social</h3>
               <span className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full">Relationships</span>
           </div>
           <div className="flex flex-col gap-3 mt-2">
               {[
                   {name: 'Vansh', status: 'Talked 3 days ago', action: 'Ping', actionColor: 'text-[#4AE189] bg-[#4AE189]/10'},
                   {name: 'Shreya', status: '2 weeks ago - overdue', action: 'Overdue', actionColor: 'text-[#F25A5A] bg-[#F25A5A]/10'}
               ].map((s, i) => (
                   <div key={i} className="flex justify-between items-center">
                       <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-gray-300">
                               {s.name[0]}
                           </div>
                           <div className="flex flex-col">
                               <span className="text-sm text-gray-200">{s.name}</span>
                               <span className="text-[10px] text-gray-500">{s.status}</span>
                           </div>
                       </div>
                       <button className={`text-[10px] px-2.5 py-1 rounded-full ${s.actionColor}`}>{s.action}</button>
                   </div>
               ))}
           </div>
       </div>
   );
};
