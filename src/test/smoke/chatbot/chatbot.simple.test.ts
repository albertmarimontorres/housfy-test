import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ChatWidget from '@/components/ui/ChatWidget.vue';
import { chatService } from '@/services/chat.service';
import { nextTick } from 'vue';

// Mock del chat service
vi.mock('@/services/chat.service', () => ({
  chatService: {
    sendMessage: vi.fn(),
    createUserMessage: vi.fn(),
    createAssistantMessage: vi.fn(),
    formatTime: vi.fn(),
  },
}));

describe('ChatWidget - Flujo Principal (Smoke)', () => {
  let mockChatService: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Obtener el mock después del clearAllMocks
    mockChatService = vi.mocked(chatService);

    // Mock de los métodos necesarios con implementaciones por defecto
    mockChatService.createUserMessage.mockImplementation((content: string) => ({
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content,
      timestamp: new Date(),
    }));

    mockChatService.createAssistantMessage.mockImplementation((content: string) => ({
      id: `assistant-${Date.now()}`,
      role: 'assistant' as const,
      content,
      timestamp: new Date(),
    }));

    mockChatService.sendMessage.mockResolvedValue({
      success: true,
      message: 'Success',
      output: 'Respuesta del chatbot',
    });

    mockChatService.formatTime.mockImplementation((date: Date) => {
      if (!date || !(date instanceof Date)) return '00:00';
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    });
  });

  it('debería abrir el chat', async () => {
    // Arrange
    const wrapper = mount(ChatWidget);

    // Act
    wrapper.vm.toggleChat();
    await nextTick();

    // Assert
    expect(wrapper.vm.isOpen).toBe(true);
  });

  it('debería enviar mensaje usando el service', async () => {
    // Arrange
    const wrapper = mount(ChatWidget);

    // Act - Establecer mensaje y enviar directamente
    wrapper.vm.currentMessage = 'Hola';
    await wrapper.vm.sendMessage();
    await flushPromises();

    // Assert - Verificar que se llamó al service
    expect(mockChatService.sendMessage).toHaveBeenCalledWith('Hola');
    expect(mockChatService.createUserMessage).toHaveBeenCalledWith('Hola');
    expect(mockChatService.createAssistantMessage).toHaveBeenCalledWith('Respuesta del chatbot');
  });

  it('debería validar mensaje vacío', async () => {
    // Arrange
    const wrapper = mount(ChatWidget);

    // Act - Intentar enviar mensaje vacío
    wrapper.vm.currentMessage = '';
    await wrapper.vm.sendMessage();

    // Assert - No debe llamar al service
    expect(mockChatService.sendMessage).not.toHaveBeenCalled();
  });
});
