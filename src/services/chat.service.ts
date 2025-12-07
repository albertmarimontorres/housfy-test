import { chatApi } from '@/api/modules/chat.api';
import type { ChatMessage, ChatResponse } from '@/types/AIChat';

/**
 * Valida el input del mensaje de chat
 */
const validateMessageInput = (input: string): void => {
  if (typeof input !== 'string') {
    throw new Error('El mensaje debe ser una cadena de texto');
  }
  
  if (!input.trim()) {
    throw new Error('El mensaje no puede estar vacío');
  }
  
  if (input.length > 1000) {
    throw new Error('El mensaje no puede exceder 1000 caracteres');
  }
};

/**
 * Valida el contenido del mensaje
 */
const validateMessageContent = (content: string): void => {
  if (typeof content !== 'string') {
    throw new Error('El contenido del mensaje debe ser una cadena de texto');
  }
  
  if (!content.trim()) {
    throw new Error('El contenido del mensaje no puede estar vacío');
  }
};

/**
 * Valida que el timestamp sea válido
 */
const validateTimestamp = (timestamp: Date): void => {
  if (!(timestamp instanceof Date)) {
    throw new Error('El timestamp debe ser una instancia de Date');
  }
  
  if (isNaN(timestamp.getTime())) {
    throw new Error('El timestamp no es válido');
  }
};

export const chatService = {
  /**
   * Envía un mensaje y procesa la respuesta
   */
  async sendMessage(messageInput: string): Promise<ChatResponse> {
    // Early return para validaciones
    validateMessageInput(messageInput);
    
    const cleanInput = messageInput.trim();
    
    try {
      return await chatApi.sendMessage(cleanInput);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido al enviar el mensaje');
    }
  },

  /**
   * Genera un ID único para los mensajes
   */
  generateMessageId(): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 11);
    
    return `msg-${timestamp}-${randomString}`;
  },

  /**
   * Crea un mensaje de usuario
   */
  createUserMessage(messageContent: string): ChatMessage {
    // Early return para validaciones
    validateMessageContent(messageContent);
    
    const currentTimestamp = new Date();
    const cleanContent = messageContent.trim();
    
    return {
      id: this.generateMessageId(),
      role: 'user',
      content: cleanContent,
      timestamp: currentTimestamp,
    };
  },

  /**
   * Crea un mensaje del asistente
   */
  createAssistantMessage(messageContent: string): ChatMessage {
    // Early return para validaciones
    validateMessageContent(messageContent);
    
    const currentTimestamp = new Date();
    const cleanContent = messageContent.trim();
    
    return {
      id: this.generateMessageId(),
      role: 'assistant',
      content: cleanContent,
      timestamp: currentTimestamp,
    };
  },

  /**
   * Formatea la hora del mensaje
   */
  formatTime(messageTimestamp: Date): string {
    // Early return para validación
    validateTimestamp(messageTimestamp);
    
    try {
      return messageTimestamp.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      // Fallback si hay problema con la localización
      return messageTimestamp.toTimeString().substring(0, 5);
    }
  }
};