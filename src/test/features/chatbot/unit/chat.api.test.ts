import { describe, it, expect, vi, beforeEach } from 'vitest'
import { chatApi } from '@/api/modules/chat.api'
import http from '@/api/httpClient'
import { 
  mockHttpError, 
  mockNetworkError,
  mockSuccessResponse,
  mockFailureResponse 
} from '@/test/utils/factories'

// Mock del httpClient
vi.mock('@/api/httpClient', () => ({
  default: {
    post: vi.fn(),
  }
}))

describe('ChatAPI', () => {
  const mockPost = vi.mocked(http.post)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendMessage', () => {
    it('should send POST request to correct endpoint with proper format', async () => {
      const mockResponse = mockSuccessResponse('Hello from AI!')
      mockPost.mockResolvedValue({ data: mockResponse })
      
      const result = await chatApi.sendMessage('Hello AI')
      
      expect(mockPost).toHaveBeenCalledWith('/ai-chat', { input: 'Hello AI' })
      expect(mockPost).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockResponse)
    })

    it('should handle successful AI responses', async () => {
      const expectedOutput = '¡Hola! ¿En qué puedo ayudarte?'
      const mockResponse = mockSuccessResponse(expectedOutput)
      mockPost.mockResolvedValue({ data: mockResponse })
      
      const result = await chatApi.sendMessage('Hola')
      
      expect(result.success).toBe(true)
      expect(result.output).toBe(expectedOutput)
      expect(result.message).toBe('Success')
    })

    it('should handle API failure responses', async () => {
      const mockResponse = mockFailureResponse('AI service unavailable')
      mockPost.mockResolvedValue({ data: mockResponse })
      
      const result = await chatApi.sendMessage('Test message')
      
      expect(result.success).toBe(false)
      expect(result.message).toBe('AI service unavailable')
      expect(result.output).toBe('')
    })

    it('should handle empty input messages', async () => {
      const mockResponse = mockSuccessResponse('Please provide a message')
      mockPost.mockResolvedValue({ data: mockResponse })
      
      await chatApi.sendMessage('')
      
      expect(mockPost).toHaveBeenCalledWith('/ai-chat', { input: '' })
    })

    it('should handle very long input messages', async () => {
      const longMessage = 'a'.repeat(10000)
      const mockResponse = mockSuccessResponse('Response to long message')
      mockPost.mockResolvedValue({ data: mockResponse })
      
      await chatApi.sendMessage(longMessage)
      
      expect(mockPost).toHaveBeenCalledWith('/ai-chat', { input: longMessage })
    })

    it('should handle special characters and emojis in input', async () => {
      const specialMessage = 'Hello! 👋 ¿Cómo estás? 😊 <script>alert("test")</script>'
      const mockResponse = mockSuccessResponse('Response with special chars')
      mockPost.mockResolvedValue({ data: mockResponse })
      
      await chatApi.sendMessage(specialMessage)
      
      expect(mockPost).toHaveBeenCalledWith('/ai-chat', { input: specialMessage })
    })

    describe('Error handling', () => {
      it('should handle 500 server errors', async () => {
        const error = mockHttpError(500, 'Internal Server Error')
        mockPost.mockRejectedValue(error)
        
        await expect(chatApi.sendMessage('Test')).rejects.toMatchObject({
          response: {
            status: 500,
          }
        })
      })

      it('should handle 429 rate limit errors', async () => {
        const error = mockHttpError(429, 'Too Many Requests')
        mockPost.mockRejectedValue(error)
        
        await expect(chatApi.sendMessage('Test')).rejects.toMatchObject({
          response: {
            status: 429,
          }
        })
      })

      it('should handle 400 bad request errors', async () => {
        const error = mockHttpError(400, 'Invalid input format')
        mockPost.mockRejectedValue(error)
        
        await expect(chatApi.sendMessage('Test')).rejects.toMatchObject({
          response: {
            status: 400,
          }
        })
      })

      it('should handle network connection errors', async () => {
        const error = mockNetworkError()
        mockPost.mockRejectedValue(error)
        
        await expect(chatApi.sendMessage('Test')).rejects.toMatchObject({
          message: 'Network Error',
          code: 'NETWORK_ERROR',
        })
      })

      it('should handle timeout errors', async () => {
        const timeoutError = {
          message: 'Request timeout',
          name: 'TimeoutError',
          code: 'ECONNABORTED',
        }
        mockPost.mockRejectedValue(timeoutError)
        
        await expect(chatApi.sendMessage('Test')).rejects.toMatchObject({
          code: 'ECONNABORTED',
        })
      })

      it('should handle malformed response data', async () => {
        mockPost.mockResolvedValue({ data: null })
        
        const result = await chatApi.sendMessage('Test')
        
        expect(result).toBeNull()
      })
    })

    describe('Performance and reliability', () => {
      it('should handle concurrent requests', async () => {
        const responses = [
          mockSuccessResponse('Response 1'),
          mockSuccessResponse('Response 2'),
          mockSuccessResponse('Response 3'),
        ]
        
        mockPost
          .mockResolvedValueOnce({ data: responses[0] })
          .mockResolvedValueOnce({ data: responses[1] })
          .mockResolvedValueOnce({ data: responses[2] })
        
        const promises = [
          chatApi.sendMessage('Message 1'),
          chatApi.sendMessage('Message 2'),
          chatApi.sendMessage('Message 3'),
        ]
        
        const results = await Promise.all(promises)
        
        expect(results).toHaveLength(3)
        expect(results[0]?.output).toBe('Response 1')
        expect(results[1]?.output).toBe('Response 2')
        expect(results[2]?.output).toBe('Response 3')
        expect(mockPost).toHaveBeenCalledTimes(3)
      })

      it('should maintain request order with sequential calls', async () => {
        const callOrder: string[] = []
        
        mockPost.mockImplementation(async (__url, data) => {
          callOrder.push((data as any).input)
          return { data: mockSuccessResponse(`Response to: ${(data as any).input}`) } as any
        })
        
        await chatApi.sendMessage('First')
        await chatApi.sendMessage('Second')
        await chatApi.sendMessage('Third')
        
        expect(callOrder).toEqual(['First', 'Second', 'Third'])
      })

      it('should handle rapid successive calls', async () => {
        mockPost.mockResolvedValue({ data: mockSuccessResponse() })
        
        const rapidCalls = Array.from({ length: 10 }, (_, i) => 
          chatApi.sendMessage(`Message ${i}`)
        )
        
        await Promise.all(rapidCalls)
        
        expect(mockPost).toHaveBeenCalledTimes(10)
      })
    })
  })
})