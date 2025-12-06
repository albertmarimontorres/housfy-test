import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatWidget from '@/components/ui/ChatWidget.vue'
import http from '@/api/httpClient'
import { 
  mockSuccessResponse,
  mockFailureResponse,
  flushPromises,
  mockNetworkError
} from '@/test/utils/factories'

// Mock HTTP client instead of higher level services for integration tests
vi.mock('@/api/httpClient', () => ({
  default: {
    post: vi.fn(),
  }
}))

describe('Chatbot Integration Tests', () => {
  const mockPost = vi.mocked(http.post)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete conversation flow', () => {
    it('should handle a complete conversation from start to finish', async () => {
      // Setup responses for the conversation
      const responses = [
        mockSuccessResponse('¡Hola! ¿En qué puedo ayudarte?'),
        mockSuccessResponse('Claro, puedo ayudarte con información sobre propiedades.'),
        mockSuccessResponse('¿Te interesa comprar o alquilar una propiedad?')
      ]

      mockPost
        .mockResolvedValueOnce({ data: responses[0] })
        .mockResolvedValueOnce({ data: responses[1] })
        .mockResolvedValueOnce({ data: responses[2] })

      const wrapper = mount(ChatWidget)

      // 1. Open the chatbot
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      expect(wrapper.vm.isOpen).toBe(true)
      expect(wrapper.vm.messages).toHaveLength(1) // Welcome message

      // 2. Send first message
      wrapper.vm.currentMessage = 'Hola, necesito ayuda'
      await wrapper.vm.sendMessage()
      await flushPromises()

      expect(mockPost).toHaveBeenCalledWith('/ai-chat', { input: 'Hola, necesito ayuda' })
      expect(wrapper.vm.messages).toHaveLength(3) // Welcome + user + assistant

      // 3. Send second message
      wrapper.vm.currentMessage = 'Quiero información sobre propiedades'
      await wrapper.vm.sendMessage()
      await flushPromises()

      expect(wrapper.vm.messages).toHaveLength(5) // Previous + user + assistant

      // 4. Send third message
      wrapper.vm.currentMessage = 'Me interesa comprar'
      await wrapper.vm.sendMessage()
      await flushPromises()

      expect(wrapper.vm.messages).toHaveLength(7) // Previous + user + assistant
      expect(mockPost).toHaveBeenCalledTimes(3)
    })

    it('should maintain conversation context and message order', async () => {
      const wrapper = mount(ChatWidget)
      
      mockPost.mockResolvedValue({ data: mockSuccessResponse('Response') })

      // Open chat and send multiple messages
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      // Send messages in sequence
      const messageSequence = ['First message', 'Second message', 'Third message']
      
      for (const msg of messageSequence) {
        wrapper.vm.currentMessage = msg
        await wrapper.vm.sendMessage()
        await flushPromises()
      }

      // Verify message order is preserved
      const messages = wrapper.vm.messages
      const userMessages = messages.filter((m: any) => m.role === 'user')
      
      expect(userMessages).toHaveLength(3)
      expect(userMessages[0]?.content).toBe('First message')
      expect(userMessages[1]?.content).toBe('Second message')
      expect(userMessages[2]?.content).toBe('Third message')

      // Verify timestamps are in order
      for (let i = 1; i < userMessages.length; i++) {
        const currentTime = userMessages[i]?.timestamp.getTime()
        const previousTime = userMessages[i - 1]?.timestamp.getTime()
        
        expect(currentTime).toBeDefined()
        expect(previousTime).toBeDefined()
        expect(currentTime!).toBeGreaterThanOrEqual(previousTime!)
      }
    })
  })

  describe('Error scenarios and recovery', () => {
    it('should handle network failures gracefully', async () => {
      const wrapper = mount(ChatWidget)
      
      // First request succeeds
      mockPost.mockResolvedValueOnce({ data: mockSuccessResponse('Hello!') })
      
      // Second request fails
      mockPost.mockRejectedValueOnce(mockNetworkError())
      
      // Third request succeeds (recovery)
      mockPost.mockResolvedValueOnce({ data: mockSuccessResponse('I\'m back!') })

      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      // First successful message
      wrapper.vm.currentMessage = 'First message'
      await wrapper.vm.sendMessage()
      await flushPromises()

      expect(wrapper.vm.messages).toHaveLength(3) // Welcome + user + assistant

      // Failed message
      wrapper.vm.currentMessage = 'Second message'
      await wrapper.vm.sendMessage()
      await flushPromises()

      // Should show error message
      const errorMessage = wrapper.vm.messages[wrapper.vm.messages.length - 1]
      expect(errorMessage).toBeDefined()
      expect(errorMessage?.role).toBe('assistant')
      expect(errorMessage?.content).toContain('no puedo procesar')

      // Recovery message
      wrapper.vm.currentMessage = 'Third message'
      await wrapper.vm.sendMessage()
      await flushPromises()

      expect(wrapper.vm.messages).toHaveLength(7) // Previous + user + error + user + assistant
      expect(wrapper.vm.isLoading).toBe(false)
    })

    it('should handle server errors and continue working', async () => {
      const wrapper = mount(ChatWidget)
      
      // Server returns error response
      mockPost.mockResolvedValueOnce({ data: mockFailureResponse('Server overloaded') })
      
      // Next request succeeds
      mockPost.mockResolvedValueOnce({ data: mockSuccessResponse('Server is back up') })

      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      // Failed API response
      wrapper.vm.currentMessage = 'Test message'
      await wrapper.vm.sendMessage()
      await flushPromises()

      // Should show error message
      const errorMessage = wrapper.vm.messages[wrapper.vm.messages.length - 1]
      expect(errorMessage).toBeDefined()
      expect(errorMessage?.content).toContain('ha ocurrido un error')

      // Successful recovery
      wrapper.vm.currentMessage = 'Retry message'
      await wrapper.vm.sendMessage()
      await flushPromises()

      const lastMessage = wrapper.vm.messages[wrapper.vm.messages.length - 1]
      expect(lastMessage).toBeDefined()
      expect(lastMessage?.content).toBe('Server is back up')
    })

    it('should handle rapid user interactions without breaking', async () => {
      const wrapper = mount(ChatWidget)
      
      mockPost.mockResolvedValue({ data: mockSuccessResponse('Quick response') })

      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      // Send 5 messages very quickly
      const rapidMessages = ['Msg1', 'Msg2', 'Msg3', 'Msg4', 'Msg5']
      const promises = rapidMessages.map(async (msg) => {
        wrapper.vm.currentMessage = msg
        return wrapper.vm.sendMessage()
      })

      await Promise.all(promises)
      await flushPromises()

      // All messages should be processed
      expect(mockPost).toHaveBeenCalledTimes(5)
      expect(wrapper.vm.isLoading).toBe(false)
    })
  })

  describe('Chat state management', () => {
    it('should preserve conversation when minimizing and reopening', async () => {
      const wrapper = mount(ChatWidget)
      
      mockPost.mockResolvedValue({ data: mockSuccessResponse('Preserved message') })

      // Open and send message
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      wrapper.vm.currentMessage = 'Test message'
      await wrapper.vm.sendMessage()
      await flushPromises()

      const messageCount = wrapper.vm.messages.length

      // Minimize chat
      await wrapper.find('[data-testid="close-button"]').trigger('click')
      expect(wrapper.vm.isOpen).toBe(false)

      // Reopen chat
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      // Messages should be preserved
      expect(wrapper.vm.messages).toHaveLength(messageCount)
      expect(wrapper.vm.isOpen).toBe(true)
    })

    it('should handle chat widget lifecycle correctly', async () => {
      const wrapper = mount(ChatWidget)

      // Initial state
      expect(wrapper.vm.isOpen).toBe(false)
      expect(wrapper.vm.messages).toEqual([])
      expect(wrapper.vm.currentMessage).toBe('')
      expect(wrapper.vm.isLoading).toBe(false)

      // Open chat
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      expect(wrapper.vm.isOpen).toBe(true)
      expect(wrapper.vm.messages).toHaveLength(1) // Welcome message

      // Unmount component
      wrapper.unmount()

      // Component should clean up properly without errors
      expect(() => wrapper.unmount()).not.toThrow()
    })
  })

  describe('API integration edge cases', () => {
    it('should handle malformed API responses', async () => {
      const wrapper = mount(ChatWidget)
      
      // Return malformed response
      mockPost.mockResolvedValue({ data: { invalid: 'response' } })

      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      const input = wrapper.find('input[type="text"]')
      await input.setValue('Test')
      await input.trigger('keydown', { key: 'Enter' })
      await flushPromises()

      // Should not break the application
      expect(wrapper.vm.isLoading).toBe(false)
      expect(wrapper.vm.messages.length).toBeGreaterThan(1)
    })

    it('should handle very long API responses', async () => {
      const wrapper = mount(ChatWidget)
      
      const longResponse = 'a'.repeat(10000)
      mockPost.mockResolvedValue({ data: mockSuccessResponse(longResponse) })

      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      const input = wrapper.find('input[type="text"]')
      await input.setValue('Tell me a long story')
      await input.trigger('keydown', { key: 'Enter' })
      await flushPromises()

      const lastMessage = wrapper.vm.messages[wrapper.vm.messages.length - 1]
      expect(lastMessage).toBeDefined()
      expect(lastMessage?.content).toBe(longResponse)
      expect(lastMessage?.role).toBe('assistant')
    })

    it('should handle API responses with special characters', async () => {
      const wrapper = mount(ChatWidget)
      
      const specialContent = '¡Hola! 👋 Aquí tienes información con caracteres especiales: áéíóú, ñ, ¿pregunta?, "comillas", & símbolos'
      mockPost.mockResolvedValue({ data: mockSuccessResponse(specialContent) })

      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      const input = wrapper.find('input[type="text"]')
      await input.setValue('Envíame caracteres especiales')
      await input.trigger('keydown', { key: 'Enter' })
      await flushPromises()

      const lastMessage = wrapper.vm.messages[wrapper.vm.messages.length - 1]
      expect(lastMessage).toBeDefined()
      expect(lastMessage?.content).toBe(specialContent)
    })
  })

  describe('Performance under load', () => {
    it('should handle long conversations efficiently', async () => {
      const wrapper = mount(ChatWidget)
      
      mockPost.mockResolvedValue({ data: mockSuccessResponse('Response') })

      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      // Verify chat is open
      expect(wrapper.vm.isOpen).toBe(true)

      // Simulate a long conversation (50 messages) using direct method calls
      for (let i = 0; i < 50; i++) {
        wrapper.vm.currentMessage = `Message ${i}`
        await wrapper.vm.sendMessage()
        await flushPromises()
      }

      // Should handle all messages
      expect(wrapper.vm.messages).toHaveLength(101) // Welcome + 50 user + 50 assistant
      expect(wrapper.vm.isLoading).toBe(false)
    })

    it('should maintain responsiveness with concurrent operations', async () => {
      const wrapper = mount(ChatWidget)
      
      // Different response times to simulate real API behavior
      mockPost
        .mockImplementationOnce(() => new Promise(resolve => 
          setTimeout(() => resolve({ data: mockSuccessResponse('Fast') }), 100)
        ))
        .mockImplementationOnce(() => new Promise(resolve => 
          setTimeout(() => resolve({ data: mockSuccessResponse('Medium') }), 200)
        ))
        .mockImplementationOnce(() => new Promise(resolve => 
          setTimeout(() => resolve({ data: mockSuccessResponse('Slow') }), 300)
        ))

      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      // Verify chat is open
      expect(wrapper.vm.isOpen).toBe(true)
      
      // Send messages by directly calling the component method
      wrapper.vm.currentMessage = 'Message 1'
      await wrapper.vm.sendMessage()
      await flushPromises()
      
      wrapper.vm.currentMessage = 'Message 2'
      await wrapper.vm.sendMessage()
      await flushPromises()
      
      wrapper.vm.currentMessage = 'Message 3'
      await wrapper.vm.sendMessage()
      await flushPromises()

      // Wait for all async responses to complete (longest is 300ms + buffer)
      await new Promise(resolve => setTimeout(resolve, 600))
      await flushPromises()

      // All messages should be processed in order
      const userMessages = wrapper.vm.messages.filter((m: any) => m.role === 'user')
      expect(userMessages).toHaveLength(3)
      expect(userMessages[0]?.content).toBe('Message 1')
      expect(userMessages[1]?.content).toBe('Message 2')
      expect(userMessages[2]?.content).toBe('Message 3')
    })
  })
})