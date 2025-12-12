<template>
  <!-- Botón flotante -->
  <div class="chat-widget">
    <v-btn
      v-if="!isOpen"
      @click="toggleChat"
      class="chat-button"
      data-testid="chat-button"
      color="primary"
      size="large"
      elevation="8"
      fab
      aria-label="Abrir chat con asistente virtual"
    >
      <v-icon size="28">mdi-robot-outline</v-icon>

      <!-- Tooltip que aparece al hover -->
      <v-tooltip activator="parent" location="left" :open-delay="200">
        <span class="tooltip-text">¿Necesitas ayuda?</span>
      </v-tooltip>
    </v-btn>

    <!-- Chat expandido -->
    <v-card v-if="isOpen" class="chat-container" elevation="12" rounded="lg">
      <!-- Header del chat -->
      <v-card-title class="chat-header d-flex align-center pa-4">
        <v-avatar size="32" color="primary" class="mr-3">
          <v-icon color="white">mdi-robot-outline</v-icon>
        </v-avatar>
        <div class="flex-grow-1">
          <div class="text-subtitle-1 font-weight-bold">Asistente Virtual</div>
          <div class="text-caption" style="color: rgba(255, 255, 255, 0.8)">En línea</div>
        </div>
        <v-btn @click="toggleChat" data-testid="close-button" icon size="small" variant="text">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <!-- Área de mensajes -->
      <div class="chat-messages pa-4" ref="messagesContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-wrapper mb-4"
          :class="message.role === 'user' ? 'user-message' : 'assistant-message'"
          data-testid="message"
        >
          <div class="d-flex" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
            <!-- Avatar del asistente -->
            <v-avatar
              v-if="message.role === 'assistant'"
              size="28"
              color="primary"
              class="mr-2 mt-1"
            >
              <v-icon size="16" color="white">mdi-robot-outline</v-icon>
            </v-avatar>

            <!-- Burbuja del mensaje -->
            <div
              class="message-bubble pa-3"
              :class="message.role === 'user' ? 'user-bubble' : 'assistant-bubble'"
            >
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time text-caption mt-1">
                {{ chatService.formatTime(message.timestamp) }}
              </div>
            </div>

            <!-- Avatar del usuario -->
            <v-avatar
              v-if="message.role === 'user'"
              size="28"
              color="grey-lighten-1"
              class="ml-2 mt-1"
            >
              <v-icon size="16">mdi-account</v-icon>
            </v-avatar>
          </div>
        </div>

        <!-- Indicador de escritura -->
        <div v-if="isLoading" class="d-flex justify-start mb-4">
          <v-avatar size="28" color="primary" class="mr-2 mt-1">
            <v-icon size="16" color="white">mdi-robot-outline</v-icon>
          </v-avatar>
          <div class="typing-indicator pa-3">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <v-divider />

      <!-- Input para escribir -->
      <div class="chat-input pa-4">
        <div id="chat-input-description" class="sr-only">
          Escribe tu mensaje y presiona Enter o haz clic en enviar
        </div>
        <v-text-field
          v-model="currentMessage"
          @keydown.enter="sendMessage"
          placeholder="Escribe tu mensaje..."
          variant="outlined"
          density="compact"
          hide-details
          :disabled="isLoading"
          data-testid="chat-input"
          aria-label="Escribe tu mensaje al asistente virtual"
          aria-describedby="chat-input-description"
        >
          <template #append-inner>
            <v-btn
              @click="sendMessage"
              :disabled="!currentMessage.trim() || isLoading"
              icon
              size="small"
              color="primary"
              variant="text"
            >
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import { chatService } from '@/services/chat.service';
import type { ChatMessage } from '@/types/AIChat';

export default defineComponent({
  name: 'ChatWidget',
  data() {
    return {
      isOpen: false,
      messages: [] as ChatMessage[],
      currentMessage: '',
      isLoading: false,
      chatService, // Hacer chatService accesible en el template
    };
  },
  methods: {
    // Función para alternar el chat
    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen && this.messages.length === 0) {
        // Mensaje de bienvenida
        this.messages.push(
          chatService.createAssistantMessage(
            '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'
          )
        );
      }
      nextTick(() => {
        this.scrollToBottom();
      });
    },

    // Función para enviar mensaje
    async sendMessage() {
      if (!this.currentMessage.trim() || this.isLoading) return;

      const userMessage = chatService.createUserMessage(this.currentMessage);
      this.messages.push(userMessage);

      const messageToSend = this.currentMessage;
      this.currentMessage = '';
      this.isLoading = true;

      await nextTick();
      this.scrollToBottom();

      try {
        const response = await chatService.sendMessage(messageToSend);

        if (response.success) {
          const assistantMessage = chatService.createAssistantMessage(response.output);
          this.messages.push(assistantMessage);
        } else {
          const errorMessage = chatService.createAssistantMessage(
            'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.'
          );
          this.messages.push(errorMessage);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = chatService.createAssistantMessage(
          'Lo siento, no puedo procesar tu mensaje en este momento. Por favor, inténtalo más tarde.'
        );
        this.messages.push(errorMessage);
      } finally {
        this.isLoading = false;
        await nextTick();
        this.scrollToBottom();
      }
    },

    // Función para hacer scroll al final
    scrollToBottom() {
      const container = this.$refs.messagesContainer as HTMLElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
  },
  mounted() {
    // Auto-focus en el input cuando se abre el chat
    if (this.isOpen) {
      nextTick(() => {
        const input = document.querySelector('.chat-input input') as HTMLElement;
        input?.focus();
      });
    }
  },
});
</script>

<style scoped>
.chat-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.chat-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-button:hover {
  transform: scale(1.1);
}

.tooltip-text {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.chat-container {
  width: 380px;
  height: 500px;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.chat-header {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-primary-darken-1)) 100%
  );
  color: white;
  flex-shrink: 0;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
  max-height: 340px;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.message-wrapper.user-message {
  margin-left: 60px;
}

.message-wrapper.assistant-message {
  margin-right: 60px;
}

.message-bubble {
  border-radius: 18px;
  max-width: 100%;
  word-wrap: break-word;
}

.user-bubble {
  background: rgb(var(--v-theme-primary));
  color: white;
}

.assistant-bubble {
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
}

.message-text {
  line-height: 1.4;
}

.message-time {
  opacity: 0.7;
  font-size: 11px;
  text-align: right;
}

.user-bubble .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.typing-indicator {
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 18px;
  display: flex;
  align-items: center;
  height: 40px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.4;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.chat-input {
  flex-shrink: 0;
}

/* Accessibility utilities */
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Responsive para pantallas pequeñas */
@media (max-width: 480px) {
  .chat-widget {
    bottom: 16px;
    right: 16px;
  }

  .chat-container {
    width: calc(100vw - 32px);
    height: calc(100vh - 200px);
    max-width: 380px;
    max-height: 500px;
  }

  .message-wrapper.user-message {
    margin-left: 40px;
  }

  .message-wrapper.assistant-message {
    margin-right: 40px;
  }
}
</style>
