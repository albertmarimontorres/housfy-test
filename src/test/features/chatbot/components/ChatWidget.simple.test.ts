import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatWidget from '@/components/ui/ChatWidget.vue'
import { chatService } from '@/services/chat.service'
import { 
  mockSuccessResponse,
  mockFailureResponse,
  flushPromises
} from './factories'

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
  const mockSendMessage = vi.mocked(chatService.sendMessage)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic functionality', () => {
    it('should mount without errors', () => {
      const wrapper = mount(ChatWidget)
      expect(wrapper.vm).toBeDefined()
    })

    it('should have correct initial state', () => {
      const wrapper = mount(ChatWidget)
      const vm = wrapper.vm
      
      expect(vm.isOpen).toBe(false)
      expect(vm.messages).toEqual([])
      expect(vm.currentMessage).toBe('')
      expect(vm.isLoading).toBe(false)
    })

    it('should toggle chat state', async () => {
      const wrapper = mount(ChatWidget)
      
      expect(wrapper.vm.isOpen).toBe(false)
      
      await wrapper.vm.toggleChat()
      expect(wrapper.vm.isOpen).toBe(true)
      
      await wrapper.vm.toggleChat()
      expect(wrapper.vm.isOpen).toBe(false)
    })

    it('should add welcome message when opened', async () => {
      const wrapper = mount(ChatWidget)
      
      await wrapper.vm.toggleChat()
      
      expect(wrapper.vm.messages).toHaveLength(1)
      expect(wrapper.vm.messages[0]?.role).toBe('assistant')
    })
  })

  describe('Message sending', () => {
    it('should send message successfully', async () => {
      const wrapper = mount(ChatWidget)
      const mockResponse = mockSuccessResponse('Test response')
      mockSendMessage.mockResolvedValue(mockResponse)
      
      wrapper.vm.currentMessage = 'Test message'
      await wrapper.vm.sendMessage()
      
      expect(mockSendMessage).toHaveBeenCalledWith('Test message')
      expect(wrapper.vm.currentMessage).toBe('')
    })

    it('should handle API errors', async () => {
      const wrapper = mount(ChatWidget)
      const error = new Error('Network error')
      mockSendMessage.mockRejectedValue(error)
      
      wrapper.vm.currentMessage = 'Test message'
      await wrapper.vm.sendMessage()
      
      expect(wrapper.vm.isLoading).toBe(false)
      // Should have error message
      const errorMessage = wrapper.vm.messages.find((m: any) => 
        m.role === 'assistant' && m.content.includes('no puedo procesar')
      )
      expect(errorMessage).toBeDefined()
    })

    it('should not send empty messages', async () => {
      const wrapper = mount(ChatWidget)
      
      wrapper.vm.currentMessage = ''
      await wrapper.vm.sendMessage()
      
      expect(mockSendMessage).not.toHaveBeenCalled()
      
      wrapper.vm.currentMessage = '   '
      await wrapper.vm.sendMessage()
      
      expect(mockSendMessage).not.toHaveBeenCalled()
    })

    it('should handle loading state correctly', async () => {
      const wrapper = mount(ChatWidget)
      
      let resolvePromise: (value: any) => void
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      mockSendMessage.mockReturnValue(pendingPromise as any)
      
      wrapper.vm.currentMessage = 'Test message'
      const sendPromise = wrapper.vm.sendMessage()
      
      await flushPromises()
      expect(wrapper.vm.isLoading).toBe(true)
      
      resolvePromise!(mockSuccessResponse('Response'))
      await sendPromise
      await flushPromises()
      
      expect(wrapper.vm.isLoading).toBe(false)
    })
  })

  describe('Message management', () => {
    it('should add user and assistant messages correctly', async () => {
      const wrapper = mount(ChatWidget)
      const mockResponse = mockSuccessResponse('AI response')
      mockSendMessage.mockResolvedValue(mockResponse)
      
      wrapper.vm.currentMessage = 'User message'
      await wrapper.vm.sendMessage()
      await flushPromises()
      
      // Should have user message and AI response
      const userMessages = wrapper.vm.messages.filter((m: any) => m.role === 'user')
      const aiMessages = wrapper.vm.messages.filter((m: any) => m.role === 'assistant')
      
      expect(userMessages).toHaveLength(1)
      expect(aiMessages).toHaveLength(1)
      expect(userMessages[0]?.content).toBe('User message')
    })

    it('should maintain message order', async () => {
      const wrapper = mount(ChatWidget)
      mockSendMessage.mockResolvedValue(mockSuccessResponse('Response'))
      
      // Send multiple messages
      for (let i = 1; i <= 3; i++) {
        wrapper.vm.currentMessage = `Message ${i}`
        await wrapper.vm.sendMessage()
        await flushPromises()
      }
      
      const userMessages = wrapper.vm.messages.filter((m: any) => m.role === 'user')
      expect(userMessages).toHaveLength(3)
      expect(userMessages[0]?.content).toBe('Message 1')
      expect(userMessages[1]?.content).toBe('Message 2')
      expect(userMessages[2]?.content).toBe('Message 3')
    })
  })

  describe('Error handling', () => {
    it('should handle failed API responses', async () => {
      const wrapper = mount(ChatWidget)
      const failedResponse = mockFailureResponse('Service unavailable')
      mockSendMessage.mockResolvedValue(failedResponse)
      
      wrapper.vm.currentMessage = 'Test message'
      await wrapper.vm.sendMessage()
      await flushPromises()
      
      const errorMessage = wrapper.vm.messages[wrapper.vm.messages.length - 1]!
      expect(errorMessage).toBeDefined()
      expect(errorMessage.role).toBe('assistant')
      expect(errorMessage.content).toContain('ha ocurrido un error')
    })

    it('should reset loading state after error', async () => {
      const wrapper = mount(ChatWidget)
      const error = new Error('Network error')
      mockSendMessage.mockRejectedValue(error)
      
      wrapper.vm.currentMessage = 'Test message'
      await wrapper.vm.sendMessage()
      await flushPromises()
      
      expect(wrapper.vm.isLoading).toBe(false)
    })
  })
})