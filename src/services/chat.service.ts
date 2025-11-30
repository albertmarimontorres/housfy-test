import { chatApi, type ChatMessage, type ChatResponse } from '@/api/modules/chat.api';

export const chatService = {
  /**
   * Envía un mensaje y procesa la respuesta
   */
  async sendMessage(input: string): Promise<ChatResponse> {
    return await chatApi.sendMessage(input);
  },

  /**
   * Genera un ID único para los mensajes
   */
  generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Crea un mensaje de usuario
   */
  createUserMessage(content: string): ChatMessage {
    return {
      id: this.generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
  },

  /**
   * Crea un mensaje del asistente
   */
  createAssistantMessage(content: string): ChatMessage {
    return {
      id: this.generateMessageId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
  },

  /**
   * Formatea la hora del mensaje
   */
  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};