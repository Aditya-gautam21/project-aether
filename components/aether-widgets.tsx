"use client";
import React from 'react';
import { useDashboard } from '@/app/context/DashboardContext';

export const TasksWidget = () => {
   const { state } = useDashboard();
   return <div className="p-4 border rounded-xl flex items-center justify-center">Tasks: {state?.tasks?.length || 0}</div>;
};

export const HabitsWidget = () => {
   const { state } = useDashboard();
   return <div className="p-4 border rounded-xl flex items-center justify-center">Habits: {state?.habits?.length || 0}</div>;
};

export const FinanceWidget = () => {
   const { state } = useDashboard();
   return <div className="p-4 border rounded-xl flex items-center justify-center">Finances</div>;
};

export const SocialWidget = () => {
   const { state } = useDashboard();
   return <div className="p-4 border rounded-xl flex items-center justify-center">Social Health</div>;
};
