import { describe, it, expect } from 'vitest';
import { chatService } from '@/services/chat.service';

describe('Chat Validation - Flujo Principal', () => {
  describe('Validación de input de mensajes', () => {
    it('debería validar mensaje válido', async () => {
      // Act & Assert - No debe lanzar error
      expect(() => {
        chatService.createUserMessage('Mensaje válido');
      }).not.toThrow();
    });

    it('debería rechazar mensaje vacío', async () => {
      // Act & Assert
      await expect(chatService.sendMessage('')).rejects.toThrow('El mensaje no puede estar vacío');
      expect(() => chatService.createUserMessage('')).toThrow(
        'El contenido del mensaje no puede estar vacío'
      );
    });

    it('debería rechazar mensaje solo con espacios', async () => {
      // Act & Assert
      await expect(chatService.sendMessage('   ')).rejects.toThrow(
        'El mensaje no puede estar vacío'
      );
    });

    it('debería rechazar mensaje demasiado largo', async () => {
      // Arrange
      const longMessage = 'a'.repeat(1001);

      // Act & Assert
      await expect(chatService.sendMessage(longMessage)).rejects.toThrow(
        'El mensaje no puede exceder 1000 caracteres'
      );
    });

    it('debería aceptar mensaje en el límite de caracteres', async () => {
      // Arrange
      const maxLengthMessage = 'a'.repeat(1000);

      // Act & Assert - No debe lanzar error en validación
      expect(() => {
        chatService.createUserMessage(maxLengthMessage);
      }).not.toThrow();
    });
  });

  describe('Validación de estructura de mensajes', () => {
    it('debería crear mensaje con estructura correcta', () => {
      // Arrange
      const content = 'Mensaje de prueba';

      // Act
      const userMessage = chatService.createUserMessage(content);
      const assistantMessage = chatService.createAssistantMessage(content);

      // Assert - Estructura usuario
      expect(userMessage).toHaveProperty('id');
      expect(userMessage).toHaveProperty('role', 'user');
      expect(userMessage).toHaveProperty('content', content);
      expect(userMessage).toHaveProperty('timestamp');
      expect(userMessage.timestamp).toBeInstanceOf(Date);

      // Assert - Estructura asistente
      expect(assistantMessage).toHaveProperty('id');
      expect(assistantMessage).toHaveProperty('role', 'assistant');
      expect(assistantMessage).toHaveProperty('content', content);
      expect(assistantMessage).toHaveProperty('timestamp');
      expect(assistantMessage.timestamp).toBeInstanceOf(Date);
    });

    it('debería generar IDs únicos', () => {
      // Act
      const id1 = chatService.generateMessageId();
      const id2 = chatService.generateMessageId();
      const id3 = chatService.generateMessageId();

      // Assert
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);

      // Verificar formato
      expect(id1).toMatch(/^msg-\d+-[a-z0-9]+$/);
    });
  });
});
