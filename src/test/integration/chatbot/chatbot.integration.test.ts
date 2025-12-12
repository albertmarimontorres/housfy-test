import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatService } from '@/services/chat.service';
import http from '@/api/httpClient';
import type { ChatResponse } from '@/types/AIChat';

// Mock del HTTP client
vi.mock('@/api/httpClient');

describe('Chat Integration - Flujo Principal', () => {
  const mockHttp = vi.mocked(http);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Flujo completo: Service → API → HTTP', () => {
    it('debería enviar mensaje desde Service hasta HTTP y retornar respuesta', async () => {
      // Arrange
      const userInput = 'Quiero información sobre vuestros servicios';
      const httpResponse: ChatResponse = {
        success: true,
        message: 'Success',
        output: 'Ofrecemos servicios inmobiliarios integrales...',
      };

      (mockHttp.post as any).mockResolvedValue({ data: httpResponse });

      // Act
      const result = await chatService.sendMessage(userInput);

      // Assert - Verificar llamada HTTP
      expect(mockHttp.post).toHaveBeenCalledWith('/ai-chat', { input: userInput });

      // Assert - Verificar respuesta final
      expect(result.success).toBe(true);
      expect(result.output).toBe('Ofrecemos servicios inmobiliarios integrales...');
    });

    it('debería manejar error de red en toda la cadena', async () => {
      // Arrange
      const userInput = 'Test message';
      const networkError = new Error('Network timeout');
      (mockHttp.post as any).mockRejectedValue(networkError);

      // Act & Assert
      await expect(chatService.sendMessage(userInput)).rejects.toThrow('Network timeout');
      expect(mockHttp.post).toHaveBeenCalledWith('/ai-chat', { input: userInput });
    });
  });

  describe('Flujo de creación de mensajes', () => {
    it('debería crear conversación completa (usuario + asistente)', () => {
      // Arrange
      const userMessage = 'Hola';
      const assistantResponse = 'Hola, ¿en qué puedo ayudarte?';

      // Act
      const userMsg = chatService.createUserMessage(userMessage);
      const assistantMsg = chatService.createAssistantMessage(assistantResponse);

      // Assert - Verificar conversación
      expect(userMsg.role).toBe('user');
      expect(userMsg.content).toBe(userMessage);
      expect(assistantMsg.role).toBe('assistant');
      expect(assistantMsg.content).toBe(assistantResponse);

      // Verificar que los IDs son únicos
      expect(userMsg.id).not.toBe(assistantMsg.id);
    });
  });
});
