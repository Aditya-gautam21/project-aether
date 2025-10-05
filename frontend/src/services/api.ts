import { Message, TaskStats } from '../types';

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
      timestamp: new Date(data.timestamp),
      status: 'completed'
    };
  },

  getStats: async (): Promise<TaskStats> => {
    // Mock data since backend doesn't have this endpoint yet
    return {
      total_tasks: 12,
      completed_tasks: 8,
      pending_tasks: 4
    };
  },

  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
};
