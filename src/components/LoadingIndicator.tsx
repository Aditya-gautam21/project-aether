import React, { FC, SVGProps } from 'react';

// --- SVG ICON (Moved here to resolve import issue) ---
const LogoIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM8.22 15.655l-1.875-1.082a.5.5 0 01-.22-.41V9.837a.5.5 0 01.22-.41l1.875-1.083a.5.5 0 01.75.41v5.5a.5.5 0 01-.75.41zm3.945.75a.5.5 0 00.75-.41v-5.5a.5.5 0 00-.75-.41L9.04 8.752a.5.5 0 00-.22.41v5.5a.5.5 0 00.22.41l3.125 1.812zm3.125-1.812l1.875-1.083a.5.5 0 00.22-.41V9.837a.5.5 0 00-.22-.41l-1.875-1.083a.5.5 0 00-.75.41v5.5a.5.5 0 00.75.41z" fill="currentColor"/>
  </svg>
);


export const LoadingIndicator = () => (
    <div className="flex items-start gap-4 p-4 bg-gray-800/50">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 animate-pulse">
            <LogoIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-grow pt-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>
    </div>
);

