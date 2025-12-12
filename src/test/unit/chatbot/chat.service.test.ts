import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatService } from '@/services/chat.service';
import { chatApi } from '@/api/modules/chat.api';
import type { ChatResponse } from '@/types/AIChat';

// Mock del chat API
vi.mock('@/api/modules/chat.api');

describe('Chat Service - Flujo Principal', () => {
  const mockChatApi = vi.mocked(chatApi);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendMessage - Flujo Principal', () => {
    it('debería enviar mensaje y retornar respuesta del API', async () => {
      // Arrange
      const input = 'Hola, ¿cómo funciona el servicio?';
      const expectedResponse: ChatResponse = {
        success: true,
        message: 'Success',
        output: 'Nuestro servicio funciona de manera muy sencilla...',
      };

      mockChatApi.sendMessage.mockResolvedValue(expectedResponse);

      // Act
      const result = await chatService.sendMessage(input);

      // Assert
      expect(mockChatApi.sendMessage).toHaveBeenCalledWith(input);
      expect(mockChatApi.sendMessage).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('debería validar input vacío', async () => {
      // Act & Assert
      await expect(chatService.sendMessage('')).rejects.toThrow('El mensaje no puede estar vacío');
      expect(mockChatApi.sendMessage).not.toHaveBeenCalled();
    });

    it('debería propagar errores del API', async () => {
      // Arrange
      const input = 'Test message';
      const apiError = new Error('API Error');
      mockChatApi.sendMessage.mockRejectedValue(apiError);

      // Act & Assert
      await expect(chatService.sendMessage(input)).rejects.toThrow('API Error');
    });
  });

  describe('createUserMessage - Flujo Principal', () => {
    it('debería crear mensaje de usuario correctamente', () => {
      // Arrange
      const content = 'Mi mensaje de prueba';

      // Act
      const result = chatService.createUserMessage(content);

      // Assert
      expect(result.role).toBe('user');
      expect(result.content).toBe(content);
      expect(result.id).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('createAssistantMessage - Flujo Principal', () => {
    it('debería crear mensaje del asistente correctamente', () => {
      // Arrange
      const content = 'Respuesta del asistente';

      // Act
      const result = chatService.createAssistantMessage(content);

      // Assert
      expect(result.role).toBe('assistant');
      expect(result.content).toBe(content);
      expect(result.id).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });
});
