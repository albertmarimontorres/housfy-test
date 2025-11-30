import http from '../httpClient';
import type { ChatResponse } from '../../types/AIChat';

export const chatApi = {
  /**
   * Envía un mensaje al asistente virtual
   */
  async sendMessage(input: string): Promise<ChatResponse> {
    const { data } = await http.post<ChatResponse>('/ai-chat', { input });
    return data;
  },
};

export default chatApi;