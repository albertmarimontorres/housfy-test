// =====================================================
// MAIN TEST CONFIGURATION
// =====================================================
// Central configuration file for all chatbot tests

// Re-export all utilities for easy access
export * from './utils/factories'
export * from './utils/test-helpers'

// Test setup configurations - These files are imported for side effects
// import './setup/vitest.setup'
// import './setup/vitest.minimal'

// =====================================================
// SHARED TEST CONSTANTS
// =====================================================

export const TEST_CONSTANTS = {
  TIMEOUTS: {
    SHORT: 100,
    MEDIUM: 500, 
    LONG: 1000,
  },
  SELECTORS: {
    CHAT_BUTTON: '[data-testid="chat-button"]',
    CHAT_INPUT: '[data-testid="chat-input"]',
    MESSAGE: '[data-testid="message"]',
    CLOSE_BUTTON: '[data-testid="close-button"]',
  },
  MOCK_TIMING: {
    FAST_RESPONSE: 100,
    MEDIUM_RESPONSE: 200,
    SLOW_RESPONSE: 300,
    TIMEOUT: 5000,
  }
}

// =====================================================
// CHATBOT SPECIFIC TEST CONFIG
// =====================================================

export const CHATBOT_TEST_CONFIG = {
  FIXTURES_PATH: './features/chatbot/__fixtures__',
  DEFAULT_USER_MESSAGE: 'Test message from user',
  DEFAULT_ASSISTANT_MESSAGE: '¡Hola! ¿Cómo puedo ayudarte?',
  WELCOME_MESSAGE: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
  ERROR_MESSAGES: {
    GENERIC: 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.',
    NETWORK: 'Lo siento, no puedo procesar tu mensaje en este momento. Por favor, inténtalo más tarde.',
    API: 'Error de servidor. Por favor, inténtalo más tarde.',
  }
}