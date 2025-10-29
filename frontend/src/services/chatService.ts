import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const chatService = {
  async sendMessage(text: string) {
    const response = await axios.post(`${API_URL}/api/chat`, { text });
    return response.data;
  }
};
