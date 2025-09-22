import React from 'react';
import { Message } from '../types';
import { UserIcon, LogoIcon } from './icons';

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
