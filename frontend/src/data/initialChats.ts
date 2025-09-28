import { Chat } from '../types';

export const initialChats: Chat[] = [
  {
    id: 'chat-1',
    name: 'Plan a 30-day trip to Norway',
    messages: [],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    lastMessage: 'A 3-day trip to a new destination can be...'
  },
  {
    id: 'chat-2', 
    name: 'Ideas for a customer loyalty program',
    messages: [
      { 
        id: 'msg-1', 
        content: 'Give me some ideas for a customer loyalty program for a coffee shop.',
        isUser: true,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      { 
        id: 'msg-2', 
        content: 'Of course! How about a points-based system where customers earn a star for every coffee purchased? After 10 stars, they get a free drink. You could also offer exclusive discounts to members on their birthdays.',
        isUser: false,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 60000)
      }
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    lastMessage: 'Here are some ideas for a customer loyalty...'
  },
  {
    id: 'chat-3',
    name: 'Help me pack',
    messages: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastMessage: 'I need some advice for your moving deci...'
  }
];
