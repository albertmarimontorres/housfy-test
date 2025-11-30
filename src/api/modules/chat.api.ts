import http from '../httpClient';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  input: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  output: string;
}

export const chatApi = {
  /**
   * Envía un mensaje al asistente virtual
   */
  async sendMessage(input: string): Promise<ChatResponse> {
    const { data } = await http.post<ChatResponse>('/ai-chat', { input });
    return data;
  },
};