import { describe, it, expect, vi, beforeEach } from 'vitest'
import { chatService } from '@/services/chat.service'
import { chatApi } from '@/api/modules/chat.api'
import type { ChatMessage } from '@/types/AIChat'
import { 
  mockSuccessResponse,
  mockFailureResponse,
  mockNetworkError
} from '@/test/utils/factories'

// Mock del chat API
vi.mock('@/api/modules/chat.api', () => ({
  chatApi: {
    sendMessage: vi.fn(),
  }
}))

describe('ChatService', () => {
  const mockSendMessage = vi.mocked(chatApi.sendMessage)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendMessage', () => {
    it('should call chatApi.sendMessage with correct input', async () => {
      const mockResponse = mockSuccessResponse('Test AI response')
      mockSendMessage.mockResolvedValue(mockResponse)
      
      const result = await chatService.sendMessage('Test input')
      
      expect(mockSendMessage).toHaveBeenCalledWith('Test input')
      expect(mockSendMessage).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockResponse)
    })

    it('should handle successful responses', async () => {
      const mockResponse = mockSuccessResponse('¡Hola! ¿En qué puedo ayudarte?')
      mockSendMessage.mockResolvedValue(mockResponse)
      
      const result = await chatService.sendMessage('Hola')
      
      expect(result.success).toBe(true)
      expect(result.output).toBe('¡Hola! ¿En qué puedo ayudarte?')
    })

    it('should handle API failure responses', async () => {
      const mockResponse = mockFailureResponse('Service temporarily unavailable')
      mockSendMessage.mockResolvedValue(mockResponse)
      
      const result = await chatService.sendMessage('Test')
      
      expect(result.success).toBe(false)
      expect(result.message).toBe('Service temporarily unavailable')
    })

    it('should propagate API errors', async () => {
      const error = mockNetworkError()
      mockSendMessage.mockRejectedValue(error)
      
      await expect(chatService.sendMessage('Test input')).rejects.toMatchObject({
        message: 'Network Error',
        code: 'NETWORK_ERROR',
      })
    })

    it('should handle empty input', async () => {
      const mockResponse = mockSuccessResponse('Please provide a message')
      mockSendMessage.mockResolvedValue(mockResponse)
      
      await chatService.sendMessage('')
      
      expect(mockSendMessage).toHaveBeenCalledWith('')
    })

    it('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(5000)
      const mockResponse = mockSuccessResponse('Processed long message')
      mockSendMessage.mockResolvedValue(mockResponse)
      
      await chatService.sendMessage(longMessage)
      
      expect(mockSendMessage).toHaveBeenCalledWith(longMessage)
    })
  })

  describe('generateMessageId', () => {
    it('should generate unique IDs for each call', () => {
      const id1 = chatService.generateMessageId()
      const id2 = chatService.generateMessageId()
      const id3 = chatService.generateMessageId()
      
      expect(id1).not.toBe(id2)
      expect(id2).not.toBe(id3)
      expect(id1).not.toBe(id3)
    })

    it('should generate IDs with correct format', () => {
      const id = chatService.generateMessageId()
      
      expect(typeof id).toBe('string')
      expect(id).toMatch(/^msg-\d+-[a-z0-9]+$/)
    })

    it('should generate IDs with reasonable length', () => {
      const id = chatService.generateMessageId()
      
      expect(id.length).toBeGreaterThan(15)
      expect(id.length).toBeLessThan(50)
    })

    it('should generate multiple unique IDs rapidly', () => {
      const ids = Array.from({ length: 100 }, () => chatService.generateMessageId())
      const uniqueIds = new Set(ids)
      
      expect(uniqueIds.size).toBe(100) // All IDs should be unique
    })
  })

  describe('createUserMessage', () => {
    it('should create user message with correct properties', () => {
      const content = 'Hello, I need help with my account'
      const message = chatService.createUserMessage(content)
      
      expect(message.role).toBe('user')
      expect(message.content).toBe(content)
      expect(message.id).toBeDefined()
      expect(message.timestamp).toBeInstanceOf(Date)
    })

    it('should create message with unique ID', () => {
      const msg1 = chatService.createUserMessage('Message 1')
      const msg2 = chatService.createUserMessage('Message 2')
      
      expect(msg1.id).not.toBe(msg2.id)
    })

    it('should handle empty content', () => {
      const message = chatService.createUserMessage('')
      
      expect(message.content).toBe('')
      expect(message.role).toBe('user')
      expect(message.id).toBeDefined()
    })

    it('should handle special characters and emojis', () => {
      const content = 'Hello! 👋 ¿Cómo estás? 😊'
      const message = chatService.createUserMessage(content)
      
      expect(message.content).toBe(content)
      expect(message.role).toBe('user')
    })

    it('should create message with recent timestamp', () => {
      const before = new Date()
      const message = chatService.createUserMessage('Test')
      const after = new Date()
      
      expect(message.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(message.timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should handle very long content', () => {
      const longContent = 'a'.repeat(10000)
      const message = chatService.createUserMessage(longContent)
      
      expect(message.content).toBe(longContent)
      expect(message.role).toBe('user')
    })
  })

  describe('createAssistantMessage', () => {
    it('should create assistant message with correct properties', () => {
      const content = '¡Hola! Estoy aquí para ayudarte'
      const message = chatService.createAssistantMessage(content)
      
      expect(message.role).toBe('assistant')
      expect(message.content).toBe(content)
      expect(message.id).toBeDefined()
      expect(message.timestamp).toBeInstanceOf(Date)
    })

    it('should create message with unique ID', () => {
      const msg1 = chatService.createAssistantMessage('Response 1')
      const msg2 = chatService.createAssistantMessage('Response 2')
      
      expect(msg1.id).not.toBe(msg2.id)
    })

    it('should handle empty content', () => {
      const message = chatService.createAssistantMessage('')
      
      expect(message.content).toBe('')
      expect(message.role).toBe('assistant')
      expect(message.id).toBeDefined()
    })

    it('should handle markdown and HTML content', () => {
      const content = 'Here is a **bold** text and a [link](http://example.com)'
      const message = chatService.createAssistantMessage(content)
      
      expect(message.content).toBe(content)
      expect(message.role).toBe('assistant')
    })

    it('should handle multiline content', () => {
      const content = `Line 1
Line 2
Line 3`
      const message = chatService.createAssistantMessage(content)
      
      expect(message.content).toBe(content)
      expect(message.role).toBe('assistant')
    })
  })

  describe('formatTime', () => {
    it('should format time in Spanish locale', () => {
      const date = new Date('2023-12-01T14:30:15Z')
      const formatted = chatService.formatTime(date)
      
      expect(formatted).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should format different times correctly', () => {
      const morning = new Date('2023-12-01T09:05:00Z')
      const afternoon = new Date('2023-12-01T15:45:00Z')
      
      const morningFormatted = chatService.formatTime(morning)
      const afternoonFormatted = chatService.formatTime(afternoon)
      
      expect(morningFormatted).toMatch(/^0?\d:\d{2}$/)
      expect(afternoonFormatted).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should handle edge time cases', () => {
      const midnight = new Date('2023-12-01T00:00:00Z')
      const almostMidnight = new Date('2023-12-01T23:59:00Z')
      
      const midnightFormatted = chatService.formatTime(midnight)
      const almostMidnightFormatted = chatService.formatTime(almostMidnight)
      
      expect(midnightFormatted).toBeDefined()
      expect(almostMidnightFormatted).toBeDefined()
    })

    it('should be consistent with multiple calls for same time', () => {
      const date = new Date('2023-12-01T12:30:00Z')
      
      const formatted1 = chatService.formatTime(date)
      const formatted2 = chatService.formatTime(date)
      
      expect(formatted1).toBe(formatted2)
    })

    it('should handle current time', () => {
      const now = new Date()
      const formatted = chatService.formatTime(now)
      
      expect(formatted).toMatch(/^\d{1,2}:\d{2}$/)
      expect(formatted.length).toBeLessThanOrEqual(5)
    })
  })

  describe('Integration scenarios', () => {
    it('should create a complete conversation flow', () => {
      // User sends message
      const userMessage = chatService.createUserMessage('¿Puedes ayudarme?')
      expect(userMessage.role).toBe('user')
      
      // Assistant responds
      const assistantMessage = chatService.createAssistantMessage('¡Por supuesto! ¿En qué necesitas ayuda?')
      expect(assistantMessage.role).toBe('assistant')
      
      // Messages should have different IDs and recent timestamps
      expect(userMessage.id).not.toBe(assistantMessage.id)
      expect(assistantMessage.timestamp.getTime()).toBeGreaterThanOrEqual(userMessage.timestamp.getTime())
    })

    it('should handle rapid message creation', () => {
      const messages: ChatMessage[] = []
      
      // Create 10 messages rapidly
      for (let i = 0; i < 10; i++) {
        messages.push(chatService.createUserMessage(`Message ${i}`))
      }
      
      // All messages should have unique IDs
      const ids = messages.map(m => m.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(10)
      
      // All messages should have valid timestamps
      messages.forEach(msg => {
        expect(msg.timestamp).toBeInstanceOf(Date)
      })
    })

    it('should maintain message ordering by timestamp', () => {
      const msg1 = chatService.createUserMessage('First')
      // Small delay to ensure different timestamps
      const msg2 = chatService.createAssistantMessage('Second')
      
      expect(msg2.timestamp.getTime()).toBeGreaterThanOrEqual(msg1.timestamp.getTime())
    })
  })
})