import { test, expect } from '@playwright/test'

// ============================================
// CHATBOT E2E TESTS WITH PLAYWRIGHT
// ============================================

test.describe('Chatbot E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto('/')
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle')
  })

  test('should display floating chat button', async ({ page }) => {
    // Verificar que el botón del chat esté visible
    const chatButton = page.getByTestId('chat-button')
    await expect(chatButton).toBeVisible()
    
    // Verificar que tenga el ícono correcto
    await expect(chatButton.locator('i')).toHaveClass(/mdi-robot-outline/)
  })

  test('should open chat widget when clicking button', async ({ page }) => {
    // Hacer clic en el botón del chat
    await page.getByTestId('chat-button').click()
    
    // Verificar que el chat se abra
    await expect(page.locator('.chat-container')).toBeVisible()
    
    // Verificar que muestre el mensaje de bienvenida
    const welcomeMessage = page.getByText('¡Hola! Soy tu asistente virtual')
    await expect(welcomeMessage).toBeVisible()
    
    // Verificar que el botón flotante desaparezca
    await expect(page.getByTestId('chat-button')).not.toBeVisible()
  })

  test('should allow typing and sending messages', async ({ page }) => {
    // Abrir el chat
    await page.getByTestId('chat-button').click()
    
    // Encontrar el input de texto
    const chatInput = page.getByTestId('chat-input')
    await expect(chatInput).toBeVisible()
    
    // Escribir un mensaje
    await chatInput.fill('Hola, necesito ayuda')
    
    // Verificar que el texto esté en el input
    await expect(chatInput).toHaveValue('Hola, necesito ayuda')
    
    // Enviar el mensaje presionando Enter
    await chatInput.press('Enter')
    
    // Verificar que el input se limpie
    await expect(chatInput).toHaveValue('')
    
    // Verificar que el mensaje del usuario aparezca
    const userMessage = page.getByTestId('message').filter({ hasText: 'Hola, necesito ayuda' })
    await expect(userMessage).toBeVisible()
  })

  test('should handle customer support conversation flow', async ({ page }) => {
    // Mock de respuestas de la API
    await page.route('/api/ai-chat', async (route) => {
      const request = route.request()
      const postData = request.postDataJSON()
      
      let response = { success: true, output: 'Respuesta por defecto' }
      
      if (postData.input.includes('Hola')) {
        response.output = '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'
      } else if (postData.input.includes('cuenta')) {
        response.output = 'Por supuesto, puedo ayudarte con tu cuenta. ¿Qué necesitas específicamente?'
      } else if (postData.input.includes('contraseña')) {
        response.output = 'Te ayudo con el cambio de contraseña. Te enviaré un enlace para restablecerla.'
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    })

    await page.getByTestId('chat-button').click()
    
    const conversationFlow = [
      { user: 'Hola', expected: '¡Hola! Soy tu asistente virtual' },
      { user: '¿Pueden ayudarme con mi cuenta?', expected: 'puedo ayudarte con tu cuenta' },
      { user: 'Necesito cambiar mi contraseña', expected: 'cambio de contraseña' }
    ]
    
    const chatInput = page.getByTestId('chat-input')
    
    for (const step of conversationFlow) {
      // Enviar mensaje del usuario
      await chatInput.fill(step.user)
      await chatInput.press('Enter')
      
      // Verificar que aparece el mensaje del usuario
      await expect(page.getByTestId('message').filter({ hasText: step.user })).toBeVisible()
      
      // Esperar y verificar respuesta de la IA
      await expect(page.getByTestId('message').filter({ hasText: step.expected })).toBeVisible()
      
      // Pequeña pausa entre mensajes para simular conversación real
      await page.waitForTimeout(500)
    }
  })

  test('should show loading indicator while waiting for response', async ({ page }) => {
    // Mock para respuesta lenta
    await page.route('/api/ai-chat', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1 segundo de delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, output: 'Respuesta tras espera' }),
      })
    })

    await page.getByTestId('chat-button').click()
    
    const chatInput = page.getByTestId('chat-input')
    await chatInput.fill('Mensaje de prueba')
    await chatInput.press('Enter')
    
    // Verificar que aparece el indicador de carga
    await expect(page.locator('.typing-indicator')).toBeVisible()
    
    // Verificar que desaparece cuando llega la respuesta
    await expect(page.getByText('Respuesta tras espera')).toBeVisible()
    await expect(page.locator('.typing-indicator')).not.toBeVisible()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock para error de API
    await page.route('/api/ai-chat', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      })
    })

    await page.getByTestId('chat-button').click()
    
    const chatInput = page.getByTestId('chat-input')
    await chatInput.fill('Mensaje que causará error')
    await chatInput.press('Enter')
    
    // Verificar que aparece mensaje de error
    await expect(page.getByText('ha ocurrido un error')).toBeVisible()
  })

  test('should close chat widget when clicking close button', async ({ page }) => {
    // Abrir chat
    await page.getByTestId('chat-button').click()
    await expect(page.locator('.chat-container')).toBeVisible()
    
    // Cerrar chat
    await page.getByTestId('close-button').click()
    
    // Verificar que el chat se cierra
    await expect(page.locator('.chat-container')).not.toBeVisible()
    
    // Verificar que el botón flotante vuelve a aparecer
    await expect(page.getByTestId('chat-button')).toBeVisible()
  })

  test('should preserve conversation when reopening chat', async ({ page }) => {
    // Mock de respuesta
    await page.route('/api/ai-chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, output: 'Respuesta de prueba' }),
      })
    })

    // Abrir chat y enviar mensaje
    await page.getByTestId('chat-button').click()
    
    const chatInput = page.getByTestId('chat-input')
    await chatInput.fill('Mensaje de prueba')
    await chatInput.press('Enter')
    
    // Esperar respuesta
    await expect(page.getByText('Respuesta de prueba')).toBeVisible()
    
    // Cerrar chat
    await page.getByTestId('close-button').click()
    
    // Reabrir chat
    await page.getByTestId('chat-button').click()
    
    // Verificar que los mensajes están preservados
    await expect(page.getByText('Mensaje de prueba')).toBeVisible()
    await expect(page.getByText('Respuesta de prueba')).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Simular dispositivo móvil
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.getByTestId('chat-button').click()
    
    // Verificar que el chat se adapta al tamaño móvil
    const chatContainer = page.locator('.chat-container')
    await expect(chatContainer).toBeVisible()
    
    // Verificar que el ancho es apropiado para móvil
    const boundingBox = await chatContainer.boundingBox()
    expect(boundingBox?.width).toBeLessThan(400)
  })

  test('should handle rapid user interactions', async ({ page }) => {
    await page.route('/api/ai-chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, output: 'Respuesta rápida' }),
      })
    })

    await page.getByTestId('chat-button').click()
    
    const chatInput = page.getByTestId('chat-input')
    
    // Enviar múltiples mensajes rápidamente
    const messages = ['Mensaje 1', 'Mensaje 2', 'Mensaje 3']
    
    for (const message of messages) {
      await chatInput.fill(message)
      await chatInput.press('Enter')
      await page.waitForTimeout(100) // Pequeña pausa entre mensajes
    }
    
    // Verificar que todos los mensajes aparecen
    for (const message of messages) {
      await expect(page.getByTestId('message').filter({ hasText: message })).toBeVisible()
    }
  })
})