import { vi } from 'vitest';

// =====================================================
// SHARED TEST MOCKS
// =====================================================

// Mock para el cliente HTTP
export const createMockHttpClient = () => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
});

// Mock para el servicio de chat
export const createMockChatService = () => ({
  sendMessage: vi.fn(),
  createUserMessage: vi.fn(),
  createAssistantMessage: vi.fn(),
  formatTime: vi.fn(),
  generateMessageId: vi.fn(),
});

// Mock para el chat API
export const createMockChatApi = () => ({
  sendMessage: vi.fn(),
});

// =====================================================
// COMPONENT TEST HELPERS
// =====================================================

// Helper para montar el ChatWidget con configuración común
export const createChatWidgetWrapper = async (
  mountFn: any,
  component: any,
  overrides: any = {}
) => {
  const wrapper = mountFn(component, {
    ...overrides,
  });

  return wrapper;
};

// Helper para abrir el chat en tests
export const openChatWidget = async (wrapper: any) => {
  await wrapper.find('[data-testid="chat-button"]').trigger('click');
  await wrapper.vm.$nextTick();
};

// Helper para enviar mensaje en tests
export const sendMessageInTest = async (wrapper: any, message: string) => {
  wrapper.vm.currentMessage = message;
  await wrapper.vm.sendMessage();
  await wrapper.vm.$nextTick();
};

// =====================================================
// DOM TESTING UTILITIES
// =====================================================

// Verificar que un elemento esté visible
export const expectElementToBeVisible = (wrapper: any, selector: string) => {
  const element = wrapper.find(selector);
  expect(element.exists()).toBe(true);
  expect(element.isVisible()).toBe(true);
};

// Verificar estructura de mensajes
export const expectMessagesToHaveStructure = (
  wrapper: any,
  expectedCount: number,
  messageTypes: string[]
) => {
  const messages = wrapper.findAll('[data-testid="message"]');
  expect(messages).toHaveLength(expectedCount);

  messageTypes.forEach((type, index) => {
    expect(messages[index].classes()).toContain(`${type}-message`);
  });
};
