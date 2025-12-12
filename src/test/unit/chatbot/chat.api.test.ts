import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatApi } from '@/api/modules/chat.api';
import http from '@/api/httpClient';
import type { ChatResponse } from '@/types/AIChat';

// Mock del HTTP client
vi.mock('@/api/httpClient');

describe('Chat API - Flujo Principal', () => {
  const mockHttp = vi.mocked(http);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendMessage - Flujo Principal', () => {
    it('debería enviar mensaje y recibir respuesta exitosa', async () => {
      // Arrange
      const input = 'Hola, necesito ayuda';
      const expectedResponse: ChatResponse = {
        success: true,
        message: 'Success',
        output: '¡Hola! Estoy aquí para ayudarte. ¿En qué puedo asistirte?',
      };

      (mockHttp.post as any).mockResolvedValue({ data: expectedResponse });

      // Act
      const result = await chatApi.sendMessage(input);

      // Assert - Verificar llamada HTTP
      expect(mockHttp.post).toHaveBeenCalledWith('/ai-chat', { input });
      expect(mockHttp.post).toHaveBeenCalledTimes(1);

      // Assert - Verificar respuesta
      expect(result.success).toBe(true);
      expect(result.output).toBe('¡Hola! Estoy aquí para ayudarte. ¿En qué puedo asistirte?');
    });

    it('debería manejar errores de API', async () => {
      // Arrange
      const input = 'Test message';
      const apiError = new Error('Network Error');
      (mockHttp.post as any).mockRejectedValue(apiError);

      // Act & Assert
      await expect(chatApi.sendMessage(input)).rejects.toThrow('Network Error');
      expect(mockHttp.post).toHaveBeenCalledWith('/ai-chat', { input });
    });
  });
});
