import axios from 'axios';
import { ApiResponse } from '../types';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatService = {
  sendMessage: async (message: string): Promise<ApiResponse> => {
    try {
      const response = await api.post('/automate', { query: message });
      return response.data;
    } catch (error) {
      throw new Error('Failed to send message');
    }
  },

  // Add more API methods as needed
  getChats: async () => {
    // Implement when you have the backend endpoint
    return [];
  },
};
