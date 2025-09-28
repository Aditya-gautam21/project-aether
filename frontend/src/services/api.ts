import { Message } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const chatService = {
  sendMessage: async (content: string, chatId: string): Promise<Message> => {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, chat_id: chatId })
    });
    return response.json();
  }
};
