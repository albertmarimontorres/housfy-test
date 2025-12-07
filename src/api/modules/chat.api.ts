import http from '@/api/httpClient';
import type { ChatResponse } from '@/types/AIChat';

export const chatApi = {
  /**
   * Envía un mensaje al chatbot y retorna la respuesta
   */
  async sendMessage(input: string): Promise<ChatResponse> {
    const { data } = await http.post<ChatResponse>('/ai-chat', { input });
    return data;
  },
};