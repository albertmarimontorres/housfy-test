import type { ChatMessage, ChatRequest, ChatResponse } from '@/types/AIChat';

// =====================================================
// CHATBOT TEST FACTORIES
// =====================================================
// Centralized factories for creating test data consistently

export const createMockChatMessage = (overrides?: Partial<ChatMessage>): ChatMessage => ({
  id: 'test-msg-123',
  role: 'user',
  content: 'Test message content',
  timestamp: new Date('2023-12-01T10:00:00Z'),
  ...overrides,
});

export const createMockChatRequest = (overrides?: Partial<ChatRequest>): ChatRequest => ({
  input: 'Test input message',
  ...overrides,
});

export const createMockChatResponse = (overrides?: Partial<ChatResponse>): ChatResponse => ({
  success: true,
  message: 'Success',
  output: 'Test AI response',
  ...overrides,
});

// Factory para crear múltiples mensajes
export const createMockConversation = (length: number = 3): ChatMessage[] => {
  const messages: ChatMessage[] = [];

  for (let i = 0; i < length; i++) {
    const isUser = i % 2 === 0;
    messages.push(
      createMockChatMessage({
        id: `msg-${i + 1}`,
        role: isUser ? 'user' : 'assistant',
        content: `${isUser ? 'User' : 'Assistant'} message ${i + 1}`,
        timestamp: new Date(`2023-12-01T10:0${i}:00Z`),
      })
    );
  }

  return messages;
};

// =====================================================
// ERROR MOCKS
// =====================================================

export const mockHttpError = (status: number = 500, message: string = 'Server Error') => ({
  response: {
    status,
    data: { message },
  },
  message,
  name: 'HttpError',
});

export const mockNetworkError = () => ({
  message: 'Network Error',
  name: 'NetworkError',
  code: 'NETWORK_ERROR',
});

// =====================================================
// API RESPONSE MOCKS
// =====================================================

export const mockSuccessResponse = (output: string = 'AI response'): ChatResponse =>
  createMockChatResponse({ output });

export const mockFailureResponse = (message: string = 'API Error'): ChatResponse =>
  createMockChatResponse({
    success: false,
    message,
    output: '',
  });

// =====================================================
// TIMING UTILITIES
// =====================================================

export const createMessageWithTimestamp = (minutesAgo: number): ChatMessage =>
  createMockChatMessage({
    timestamp: new Date(Date.now() - minutesAgo * 60 * 1000),
  });

// Helpers para testing async
export const waitFor = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const flushPromises = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0));
