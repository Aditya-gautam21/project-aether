"use client";
import React, { createContext, useContext, useState } from 'react';

const DashboardContext = createContext<any>(null);

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useState({ tasks: [], habits: [], finances: [], social: [] });

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
