import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import ChatWidget from '@/components/ui/ChatWidget.vue'
import { chatService } from '@/services/chat.service'
import { 
  createMockChatMessage,
  createMockConversation,
  mockSuccessResponse,
  mockFailureResponse,
  flushPromises
} from '@/test/utils/factories'

// Mock del chat service
vi.mock('@/services/chat.service', () => ({
  chatService: {
    sendMessage: vi.fn(),
    createUserMessage: vi.fn((content: string) => ({
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content,
      timestamp: new Date()
    })),
    createAssistantMessage: vi.fn((content: string) => ({
      id: `assistant-${Date.now()}`,
      role: 'assistant' as const,
      content,
      timestamp: new Date()
    })),
    formatTime: vi.fn((date: Date) => 
      date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    ),
    generateMessageId: vi.fn(() => `msg-${Date.now()}-test`),
  }
}))

describe('ChatWidget', () => {
  let wrapper: VueWrapper<any>
  const mockSendMessage = vi.mocked(chatService.sendMessage)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Initial rendering', () => {
    it('should render the chat button when closed', () => {
      wrapper = mount(ChatWidget)
      
      expect(wrapper.find('[data-testid="chat-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="chat-container"]').exists()).toBe(false)
    })

    it('should have correct initial state', () => {
      wrapper = mount(ChatWidget)
      const vm = wrapper.vm
      
      expect(vm.isOpen).toBe(false)
      expect(vm.messages).toEqual([])
      expect(vm.currentMessage).toBe('')
      expect(vm.isLoading).toBe(false)
    })
  })

  describe('Chat interaction', () => {
    it('should open chat container when button is clicked', async () => {
      wrapper = mount(ChatWidget)
      
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await nextTick()
      
      expect(wrapper.vm.isOpen).toBe(true)
      expect(wrapper.find('[data-testid="chat-container"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="chat-button"]').exists()).toBe(false)
    })

    it('should show welcome message when opened for first time', async () => {
      wrapper = mount(ChatWidget)
      
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await nextTick()
      
      expect(wrapper.vm.messages).toHaveLength(1)
      expect(wrapper.vm.messages[0].role).toBe('assistant')
      expect(wrapper.vm.messages[0].content).toContain('¡Hola!')
    })

    it('should close chat when close button is clicked', async () => {
      wrapper = mount(ChatWidget)
      
      // Open chat first
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      expect(wrapper.vm.isOpen).toBe(true)
      
      // Close chat
      await wrapper.find('[data-testid="close-button"]').trigger('click')
      await nextTick()
      
      expect(wrapper.vm.isOpen).toBe(false)
      expect(wrapper.find('[data-testid="chat-container"]').exists()).toBe(false)
    })
  })

  describe('Message sending', () => {
    beforeEach(async () => {
      wrapper = mount(ChatWidget)
      // Open chat
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await nextTick()
    })

    it('should send message when send button is clicked', async () => {
      const mockResponse = mockSuccessResponse('¡Hola! ¿En qué puedo ayudarte?')
      mockSendMessage.mockResolvedValue(mockResponse)
      
      const input = wrapper.find('input[type="text"]')
      const sendButton = wrapper.find('[data-testid="send-button"]')
      
      await input.setValue('Hola')
      await sendButton.trigger('click')
      await flushPromises()
      
      expect(mockSendMessage).toHaveBeenCalledWith('Hola')
      expect(wrapper.vm.messages).toHaveLength(3) // Welcome + user + assistant
    })

    it('should send message when Enter key is pressed', async () => {
      const mockResponse = mockSuccessResponse('Respuesta del AI')
      mockSendMessage.mockResolvedValue(mockResponse)
      
      const input = wrapper.find('input[type="text"]')
      
      await input.setValue('Test message')
      await input.trigger('keydown', { key: 'Enter' })
      await flushPromises()
      
      expect(mockSendMessage).toHaveBeenCalledWith('Test message')
    })

    it('should not send empty messages', async () => {
      const sendButton = wrapper.find('[data-testid="send-button"]')
      
      expect(sendButton.attributes('disabled')).toBeDefined()
      
      await sendButton.trigger('click')
      
      expect(mockSendMessage).not.toHaveBeenCalled()
    })

    it('should not send messages with only whitespace', async () => {
      const input = wrapper.find('input[type="text"]')
      const sendButton = wrapper.find('[data-testid="send-button"]')
      
      await input.setValue('   ')
      
      expect(sendButton.attributes('disabled')).toBeDefined()
    })

    it('should clear input after sending message', async () => {
      const mockResponse = mockSuccessResponse('Response')
      mockSendMessage.mockResolvedValue(mockResponse)
      
      const input = wrapper.find('input[type="text"]')
      
      await input.setValue('Test message')
      expect(wrapper.vm.currentMessage).toBe('Test message')
      
      await input.trigger('keydown', { key: 'Enter' })
      await flushPromises()
      
      expect(wrapper.vm.currentMessage).toBe('')
    })

    it('should show loading state while sending message', async () => {
      let resolvePromise: (value: any) => void
      const pendingPromise = new Promise<any>((resolve) => {
        resolvePromise = resolve
      })
      mockSendMessage.mockReturnValue(pendingPromise as Promise<any>)
      
      const input = wrapper.find('input[type="text"]')
      
      await input.setValue('Test message')
      await input.trigger('keydown', { key: 'Enter' })
      await nextTick()
      
      // Should show loading
      expect(wrapper.vm.isLoading).toBe(true)
      expect(wrapper.find('[data-testid="typing-indicator"]').exists()).toBe(true)
      expect(input.attributes('disabled')).toBeDefined()
      
      // Resolve the promise
      resolvePromise!(mockSuccessResponse('Response'))
      await flushPromises()
      
      expect(wrapper.vm.isLoading).toBe(false)
    })

    it('should disable input and send button while loading', async () => {
      wrapper.vm.isLoading = true
      await nextTick()
      
      const input = wrapper.find('input[type="text"]')
      const sendButton = wrapper.find('[data-testid="send-button"]')
      
      expect(input.attributes('disabled')).toBeDefined()
      expect(sendButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('Message display', () => {
    beforeEach(async () => {
      wrapper = mount(ChatWidget)
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await nextTick()
    })

    it('should display user messages with correct styling', async () => {
      const userMessage = createMockChatMessage({ role: 'user', content: 'User test message' })
      wrapper.vm.messages.push(userMessage)
      await nextTick()
      
      const messageElements = wrapper.findAll('[data-testid="message"]')
      const userMessageEl = messageElements.find(el => 
        el.classes().includes('user-message')
      )
      
      expect(userMessageEl?.exists()).toBe(true)
      expect(userMessageEl?.text()).toContain('User test message')
    })

    it('should display assistant messages with correct styling', async () => {
      const assistantMessage = createMockChatMessage({ 
        role: 'assistant', 
        content: 'Assistant test message' 
      })
      wrapper.vm.messages.push(assistantMessage)
      await nextTick()
      
      const messageElements = wrapper.findAll('[data-testid="message"]')
      const assistantMessageEl = messageElements.find(el => 
        el.classes().includes('assistant-message')
      )
      
      expect(assistantMessageEl?.exists()).toBe(true)
      expect(assistantMessageEl?.text()).toContain('Assistant test message')
    })

    it('should show avatars for both user types', async () => {
      const conversation = createMockConversation(4)
      wrapper.vm.messages = conversation
      await nextTick()
      
      const userAvatars = wrapper.findAll('[data-testid="user-avatar"]')
      const assistantAvatars = wrapper.findAll('[data-testid="assistant-avatar"]')
      
      expect(userAvatars.length).toBeGreaterThan(0)
      expect(assistantAvatars.length).toBeGreaterThan(0)
    })

    it('should display message timestamps', async () => {
      const message = createMockChatMessage({ 
        timestamp: new Date('2023-12-01T14:30:00Z')
      })
      wrapper.vm.messages.push(message)
      await nextTick()
      
      const timestamps = wrapper.findAll('[data-testid="message-time"]')
      expect(timestamps.length).toBeGreaterThan(0)
    })

    it('should handle long messages properly', async () => {
      const longMessage = createMockChatMessage({
        content: 'a'.repeat(1000),
        role: 'assistant'
      })
      wrapper.vm.messages.push(longMessage)
      await nextTick()
      
      const messageEl = wrapper.find('[data-testid="message"]')
      expect(messageEl.exists()).toBe(true)
      expect(messageEl.text()).toContain('aaa')
    })

    it('should handle special characters and emojis', async () => {
      const specialMessage = createMockChatMessage({
        content: '¡Hola! 👋 ¿Cómo estás? 😊',
        role: 'assistant'
      })
      wrapper.vm.messages.push(specialMessage)
      await nextTick()
      
      const messageEl = wrapper.find('[data-testid="message"]')
      expect(messageEl.text()).toContain('¡Hola! 👋 ¿Cómo estás? 😊')
    })
  })

  describe('Error handling', () => {
    beforeEach(async () => {
      wrapper = mount(ChatWidget)
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await nextTick()
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('Network error')
      mockSendMessage.mockRejectedValue(error)
      
      const input = wrapper.find('input[type="text"]')
      
      await input.setValue('Test message')
      await input.trigger('keydown', { key: 'Enter' })
      await flushPromises()
      
      // Should show error message to user
      const messages = wrapper.vm.messages
      const errorMessage = messages[messages.length - 1]
      expect(errorMessage.role).toBe('assistant')
      expect(errorMessage.content).toContain('no puedo procesar')
    })

    it('should handle failed API responses', async () => {
      const failedResponse = mockFailureResponse('Service unavailable')
      mockSendMessage.mockResolvedValue(failedResponse)
      
      const input = wrapper.find('input[type="text"]')
      
      await input.setValue('Test message')
      await input.trigger('keydown', { key: 'Enter' })
      await flushPromises()
      
      // Should show error message to user
      const messages = wrapper.vm.messages
      const errorMessage = messages[messages.length - 1]
      expect(errorMessage.role).toBe('assistant')
      expect(errorMessage.content).toContain('ha ocurrido un error')
    })

    it('should reset loading state after error', async () => {
      const error = new Error('Network error')
      mockSendMessage.mockRejectedValue(error)
      
      const input = wrapper.find('input[type="text"]')
      
      await input.setValue('Test message')
      await input.trigger('keydown', { key: 'Enter' })
      await flushPromises()
      
      expect(wrapper.vm.isLoading).toBe(false)
    })
  })

  describe('Auto-scroll functionality', () => {
    beforeEach(async () => {
      wrapper = mount(ChatWidget)
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await nextTick()
    })

    it('should scroll to bottom when new messages are added', async () => {
      const scrollToBottomSpy = vi.spyOn(wrapper.vm, 'scrollToBottom')
      
      const mockResponse = mockSuccessResponse('New response')
      mockSendMessage.mockResolvedValue(mockResponse)
      
      const input = wrapper.find('input[type="text"]')
      await input.setValue('Test')
      await input.trigger('keydown', { key: 'Enter' })
      await flushPromises()
      
      expect(scrollToBottomSpy).toHaveBeenCalled()
    })

    it('should scroll to bottom when chat is opened', async () => {
      wrapper = mount(ChatWidget)
      const scrollToBottomSpy = vi.spyOn(wrapper.vm, 'scrollToBottom')
      
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await nextTick()
      
      expect(scrollToBottomSpy).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      wrapper = mount(ChatWidget)
      
      const chatButton = wrapper.find('[data-testid="chat-button"]')
      expect(chatButton.attributes('aria-label')).toBeDefined()
    })

    it('should handle keyboard navigation', async () => {
      wrapper = mount(ChatWidget)
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await nextTick()
      
      const input = wrapper.find('[data-testid="chat-input"]')
      expect(input.attributes('aria-describedby')).toBe('chat-input-description')
      expect(input.attributes('aria-label')).toBe('Escribe tu mensaje al asistente virtual')
    })

    it('should have proper focus management', async () => {
      wrapper = mount(ChatWidget)
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await nextTick()
      
      // Input should be focusable
      const input = wrapper.find('[data-testid="chat-input"]')
      expect(input.attributes('tabindex')).not.toBe('-1')
    })
  })

  describe('Performance', () => {
    it('should handle many messages efficiently', async () => {
      wrapper = mount(ChatWidget)
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await nextTick()
      
      // Add 100 messages
      const manyMessages = Array.from({ length: 100 }, (_, i) => 
        createMockChatMessage({
          id: `msg-${i}`,
          content: `Message ${i}`,
          role: i % 2 === 0 ? 'user' : 'assistant'
        })
      )
      
      wrapper.vm.messages = manyMessages
      await nextTick()
      
      const messageElements = wrapper.findAll('[data-testid="message"]')
      expect(messageElements.length).toBe(100)
    })

    it('should not cause memory leaks with rapid interactions', async () => {
      wrapper = mount(ChatWidget)
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await nextTick()
      
      // Rapid typing and clearing using direct component methods
      for (let i = 0; i < 50; i++) {
        wrapper.vm.currentMessage = `Message ${i}`
        wrapper.vm.currentMessage = ''
      }
      
      expect(wrapper.vm.currentMessage).toBe('')
    })
  })
})