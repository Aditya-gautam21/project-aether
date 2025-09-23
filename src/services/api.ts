import { ApiResponse } from '../types';

export const chatService = {
  sendMessage: async (message: string): Promise<ApiResponse> => {
    // Mock response simulating backend reply, delay added for realism
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          result: `This is a mock response for: "${message}"`,
          status: 'success',
        });
      }, 1000);
    });
  },
  getChats: async () => [],
};
