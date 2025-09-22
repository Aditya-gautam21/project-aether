import { Chat } from './types';

// --- MOCK DATA (Replace with your actual data fetching) ---
export const initialChats: Chat[] = [
  {
    id: 'chat-1',
    title: 'Planes a 30-day trip to Norway',
    messages: [],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: 'chat-2',
    title: 'Ideas for a customer loyalty program',
    messages: [
        { id: 'msg-1', sender: 'user', text: 'Give me some ideas for a customer loyalty program for a coffee shop.' },
        { id: 'msg-2', sender: 'ai', text: 'Of course! How about a points-based system where customers earn a star for every coffee purchased? After 10 stars, they get a free drink. You could also offer exclusive discounts to members on their birthdays.' },
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: 'chat-3',
    title: 'Help me pack',
    messages: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
];
