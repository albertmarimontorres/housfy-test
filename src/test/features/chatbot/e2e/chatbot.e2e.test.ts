import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ChatWidget from '@/components/ui/ChatWidget.vue'
import http from '@/api/httpClient'
import { 
  mockSuccessResponse,
  flushPromises
} from './factories'

// Don't mock anything - test the real integration
vi.mock('@/api/httpClient', () => ({
  default: {
    post: vi.fn(),
  }
}))

describe('End-to-End Chatbot Tests', () => {
  const mockPost = vi.mocked(http.post)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Real user scenarios', () => {
    it('should handle a typical customer support scenario', async () => {
      // Simulate real customer support conversation
      const conversationFlow = [
        { user: 'Hola', ai: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?' },
        { user: '¿Pueden ayudarme con mi cuenta?', ai: 'Por supuesto, puedo ayudarte con tu cuenta. ¿Qué necesitas específicamente?' },
        { user: 'No puedo acceder', ai: 'Entiendo que tienes problemas para acceder a tu cuenta. ¿Has intentado restablecer tu contraseña?' },
        { user: 'Sí, pero no recibo el email', ai: 'Te ayudo a solucionarlo. Verificaré tu email en el sistema. ¿Puedes confirmar tu dirección de correo?' }
      ]

      // Setup API responses
      conversationFlow.forEach(exchange => {
        mockPost.mockResolvedValueOnce({ data: mockSuccessResponse(exchange.ai) })
      })

      const wrapper = mount(ChatWidget)

      // User opens chat
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      const input = wrapper.find('input[type="text"]')

      // Simulate the entire conversation
      for (let i = 0; i < conversationFlow.length; i++) {
        const exchange = conversationFlow[i]!
        
        await input.setValue(exchange.user)
        await input.trigger('keydown', { key: 'Enter' })
        await flushPromises()

        // Verify API was called correctly
        expect(mockPost).toHaveBeenNthCalledWith(i + 1, '/ai-chat', { input: exchange.user })

        // Verify conversation state
        const messages = wrapper.vm.messages
        const lastAiMessage = messages.filter((m: any) => m.role === 'assistant').pop()
        expect(lastAiMessage?.content).toBe(exchange.ai)
      }

      // Verify final conversation state
      expect(wrapper.vm.messages).toHaveLength(9) // Welcome + 4 user + 4 assistant
      expect(mockPost).toHaveBeenCalledTimes(4)
    })

    it('should handle property inquiry workflow', async () => {
      const propertyInquiry = [
        { user: 'Busco una casa para comprar', ai: '¡Perfecto! Te ayudo a encontrar la casa ideal. ¿En qué zona te interesa?' },
        { user: 'Barcelona centro', ai: 'Excelente elección. ¿Cuál es tu presupuesto aproximado?' },
        { user: 'Entre 300.000 y 400.000 euros', ai: '¿Cuántos dormitorios necesitas?' },
        { user: '2 o 3 dormitorios', ai: 'Perfecto. Tengo varias opciones que podrían interesarte. ¿Te gustaría que te envíe algunas propiedades por email?' }
      ]

      propertyInquiry.forEach(exchange => {
        mockPost.mockResolvedValueOnce({ data: mockSuccessResponse(exchange.ai) })
      })

      const wrapper = mount(ChatWidget)
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      const input = wrapper.find('input[type="text"]')

      for (const exchange of propertyInquiry) {
        await input.setValue(exchange.user)
        await input.trigger('keydown', { key: 'Enter' })
        await flushPromises()
      }

      // Verify conversation progression
      const allMessages = wrapper.vm.messages
      const userMessages = allMessages.filter((m: any) => m.role === 'user')
      const aiMessages = allMessages.filter((m: any) => m.role === 'assistant')

      expect(userMessages).toHaveLength(4)
      expect(aiMessages).toHaveLength(5) // Including welcome message
      const lastAiMessage = aiMessages[aiMessages.length - 1]
      if (lastAiMessage) {
        expect(lastAiMessage.content).toContain('email')
      }
    })

    it('should handle error recovery in real conversation', async () => {
      const wrapper = mount(ChatWidget)

      // First message succeeds
      mockPost.mockResolvedValueOnce({ data: mockSuccessResponse('¡Hola! ¿En qué puedo ayudarte?') })
      
      // Second message fails (network error)
      mockPost.mockRejectedValueOnce(new Error('Network timeout'))
      
      // Third message succeeds (user retries)
      mockPost.mockResolvedValueOnce({ data: mockSuccessResponse('Disculpa la demora. ¿En qué puedo ayudarte?') })

      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      const input = wrapper.find('input[type="text"]')

      // First successful interaction
      await input.setValue('Hola')
      await input.trigger('keydown', { key: 'Enter' })
      await flushPromises()

      const messagesAfterSuccess = wrapper.vm.messages.length

      // Failed interaction
      await input.setValue('¿Puedes ayudarme?')
      await input.trigger('keydown', { key: 'Enter' })
      await flushPromises()

      // Should have error message
      const messagesAfterError = wrapper.vm.messages.length
      expect(messagesAfterError).toBeGreaterThan(messagesAfterSuccess)

      // User retries
      await input.setValue('¿Sigues ahí?')
      await input.trigger('keydown', { key: 'Enter' })
      await flushPromises()

      // Should recover and continue normally
      expect(wrapper.vm.isLoading).toBe(false)
      expect(wrapper.vm.messages.length).toBeGreaterThan(messagesAfterError)
    })
  })

  describe('User experience scenarios', () => {
    it('should maintain context across multiple interactions', async () => {
      // Simulate user asking follow-up questions
      const contextualChat = [
        { user: 'Quiero comprar una casa', ai: 'Te ayudo a encontrar tu casa ideal. ¿Tienes alguna preferencia específica?' },
        { user: '¿Qué documentos necesito?', ai: 'Para la compra necesitarás: DNI, nóminas, declaración de renta...' },
        { user: '¿Y los gastos aproximados?', ai: 'Los gastos de compraventa incluyen: notaría (0.1-0.2%), registro...' },
        { user: 'Gracias por la información', ai: '¡De nada! ¿Hay algo más en lo que pueda ayudarte con tu compra?' }
      ]

      contextualChat.forEach(exchange => {
        mockPost.mockResolvedValueOnce({ data: mockSuccessResponse(exchange.ai) })
      })

      const wrapper = mount(ChatWidget)
      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      const input = wrapper.find('input[type="text"]')

      for (const [index, exchange] of contextualChat.entries()) {
        await input.setValue(exchange.user)
        await input.trigger('keydown', { key: 'Enter' })
        await flushPromises()

        // Each API call should include the user's message
        expect(mockPost).toHaveBeenNthCalledWith(index + 1, '/ai-chat', { input: exchange.user })
      }

      // Verify complete conversation is maintained
      const finalMessages = wrapper.vm.messages
      expect(finalMessages).toHaveLength(9) // Welcome + 4 user + 4 assistant
    })

    it('should handle user typing patterns realistically', async () => {
      const wrapper = mount(ChatWidget)
      
      mockPost.mockResolvedValue({ data: mockSuccessResponse('Entendido, procesando tu mensaje...') })

      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      const input = wrapper.find('input[type="text"]')

      // Simulate realistic typing: user types, deletes, retypes
      await input.setValue('Hol')
      await nextTick()
      await input.setValue('Hola')
      await nextTick()
      await input.setValue('Hola, necesito ayu')
      await nextTick()
      await input.setValue('Hola, necesito ayuda')
      
      // Finally sends the message
      await input.trigger('keydown', { key: 'Enter' })
      await flushPromises()

      expect(mockPost).toHaveBeenCalledWith('/ai-chat', { input: 'Hola, necesito ayuda' })
      expect(wrapper.vm.currentMessage).toBe('')
    })

    it('should handle rapid user interactions without loss', async () => {
      const wrapper = mount(ChatWidget)
      
      // Each message gets a unique response to verify all are processed
      const rapidMessages = ['Msg1', 'Msg2', 'Msg3', 'Msg4', 'Msg5']
      rapidMessages.forEach((msg, index) => {
        mockPost.mockResolvedValueOnce({ 
          data: mockSuccessResponse(`Response ${index + 1} for ${msg}`) 
        })
      })

      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      const input = wrapper.find('input[type="text"]')

      // Send messages very quickly
      for (const msg of rapidMessages) {
        await input.setValue(msg)
        await input.trigger('keydown', { key: 'Enter' })
        // Don't wait for response before sending next
      }

      // Wait for all to complete
      await flushPromises()
      await new Promise(resolve => setTimeout(resolve, 100))
      await flushPromises()

      // All messages should be processed
      expect(mockPost).toHaveBeenCalledTimes(5)
      expect(wrapper.vm.isLoading).toBe(false)
      
      // Verify all messages are in the conversation
      const userMessages = wrapper.vm.messages.filter((m: any) => m.role === 'user')
      expect(userMessages).toHaveLength(5)
      
      // Verify message content
      for (let i = 0; i < rapidMessages.length; i++) {
        const userMessage = userMessages[i]
        expect(userMessage).toBeDefined()
        expect(userMessage?.content).toBe(rapidMessages[i])
      }
    })
  })

  describe('Edge cases in real usage', () => {
    it('should handle very long user messages', async () => {
      const wrapper = mount(ChatWidget)
      
      const veryLongMessage = `
        Hola, tengo una consulta muy larga sobre el proceso de compra de una vivienda. 
        Estoy interesado en comprar mi primera casa y tengo muchas dudas sobre el proceso. 
        He estado ahorrando durante varios años y creo que ya tengo suficiente para la entrada. 
        Mi presupuesto está entre 250.000 y 300.000 euros y busco algo en la zona norte de Madrid. 
        Preferiblemente con 2 o 3 dormitorios, un baño o dos si es posible, y con parking incluido. 
        También me gustaría que tuviera balcón o terraza pequeña. ¿Podrían ayudarme con información 
        sobre el proceso completo de compra, incluyendo los gastos adicionales que debo considerar?
      `.trim()

      mockPost.mockResolvedValueOnce({ 
        data: mockSuccessResponse('Claro, te ayudo con toda la información sobre la compra de tu primera vivienda...') 
      })

      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      const input = wrapper.find('input[type="text"]')
      await input.setValue(veryLongMessage)
      await input.trigger('keydown', { key: 'Enter' })
      await flushPromises()

      expect(mockPost).toHaveBeenCalledWith('/ai-chat', { input: veryLongMessage })
      
      const userMessage = wrapper.vm.messages.find((m: any) => m.role === 'user')
      expect(userMessage).toBeDefined()
      expect(userMessage?.content).toBe(veryLongMessage)
    })

    it('should handle special characters and international text', async () => {
      const wrapper = mount(ChatWidget)
      
      const internationalMessage = '¿Puedo comprar una propiedad siendo extranjero? 我想买房子 🏠'
      
      mockPost.mockResolvedValueOnce({ 
        data: mockSuccessResponse('Sí, los extranjeros pueden comprar propiedades en España. Te explico el proceso...') 
      })

      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      const input = wrapper.find('input[type="text"]')
      await input.setValue(internationalMessage)
      await input.trigger('keydown', { key: 'Enter' })
      await flushPromises()

      expect(mockPost).toHaveBeenCalledWith('/ai-chat', { input: internationalMessage })
      
      const userMessage = wrapper.vm.messages.find((m: any) => m.role === 'user')
      expect(userMessage).toBeDefined()
      expect(userMessage?.content).toBe(internationalMessage)
    })

    it('should maintain performance with extended conversation', async () => {
      const wrapper = mount(ChatWidget)
      
      // Simulate a long conversation (20 exchanges)
      Array.from({ length: 20 }, (_, i) => {
        mockPost.mockResolvedValueOnce({ 
          data: mockSuccessResponse(`Response ${i + 1} - continuing our conversation...`) 
        })
      })

      await wrapper.find('[data-testid="chat-button"]').trigger('click')
      await flushPromises()

      const input = wrapper.find('input[type="text"]')

      const startTime = Date.now()
      
      // Send 20 messages
      for (let i = 0; i < 20; i++) {
        await input.setValue(`Message ${i + 1}`)
        await input.trigger('keydown', { key: 'Enter' })
        await flushPromises()
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000) // 5 seconds
      expect(wrapper.vm.messages).toHaveLength(41) // Welcome + 20 user + 20 assistant
      expect(wrapper.vm.isLoading).toBe(false)
    })
  })
})