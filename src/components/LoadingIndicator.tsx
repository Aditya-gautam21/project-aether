import React, { FC, SVGProps } from 'react';
import { Message } from '../types';

// --- SVG ICONS (Moved here to resolve import issue) ---
const UserIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const LogoIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM8.22 15.655l-1.875-1.082a.5.5 0 01-.22-.41V9.837a.5.5 0 01.22-.41l1.875-1.083a.5.5 0 01.75.41v5.5a.5.5 0 01-.75.41zm3.945.75a.5.5 0 00.75-.41v-5.5a.5.5 0 00-.75-.41L9.04 8.752a.5.5 0 00-.22.41v5.5a.5.5 0 00.22.41l3.125 1.812zm3.125-1.812l1.875-1.083a.5.5 0 00.22-.41V9.837a.5.5 0 00-.22-.41l-1.875-1.083a.5.5 0 00-.75.41v5.5a.5.5 0 00.75.41z" fill="currentColor"/>
  </svg>
);


export const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user';
  return (
      <div className={`flex items-start gap-4 p-4 ${isUser ? '' : 'bg-gray-800/50'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-indigo-500' : 'bg-green-500'}`}>
              {isUser ? <UserIcon className="w-5 h-5 text-white" /> : <LogoIcon className="w-6 h-6 text-white" />}
          </div>
          <div className="flex-grow pt-1">
              <p className="text-gray-200 leading-relaxed">{message.text}</p>
          </div>
      </div>
  );
};

