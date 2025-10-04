import { Message } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const chatService = {
  sendMessage: async (content: string, chatId: string): Promise<Message> => {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: content, chat_id: chatId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      id: data.id,
      content: data.content,
      isUser: false,
      timestamp: new Date(data.timestamp)
    };
  }
};
