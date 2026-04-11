"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const DashboardContext = createContext<any>(null);

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useState({ tasks: [], habits: [], finances: [], social: [] });

    useEffect(() => {
        const fetchInitial = async () => {
             try {
                 // Providing a mock user_id for demo purposes (usually would come from auth context)
                 const res = await fetch('http://localhost:8000/api/dashboard/initial-state?user_id=123');
                 if (res.ok) {
                     const data = await res.json();
                     setState(data);
                 }
             } catch (e) {
                 console.error("Failed fetching dashboard state:", e);
             }
        };
        fetchInitial();
    }, []);

    const updateDashboardState = (newData: any) => {
        setState(prev => ({ ...prev, ...newData }));
    };

    return (
        <DashboardContext.Provider value={{ state, updateDashboardState }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => useContext(DashboardContext);
