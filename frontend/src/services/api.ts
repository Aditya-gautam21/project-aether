import { Message, TaskStats, Task } from '../types';

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
      status: data.status || 'completed',
      suggestions: data.suggestions || [],  // NEW
      intent: data.intent  // NEW
    };
  },

  getSuggestions: async (): Promise<string[]> => {
    const response = await fetch(`${API_URL}/api/suggestions`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.suggestions || [];
  },

  getInsights: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/api/insights`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getAnalytics: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/api/analytics`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getStats: async (): Promise<TaskStats> => {
    const response = await fetch(`${API_URL}/api/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getTasks: async (): Promise<Task[]> => {
    const response = await fetch(`${API_URL}/api/tasks`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.tasks || [];
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
