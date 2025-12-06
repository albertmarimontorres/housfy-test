import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock completo de archivos de estilo
vi.mock('*.css', () => ({}))
vi.mock('*.scss', () => ({}))
vi.mock('*.sass', () => ({}))
vi.mock('*.less', () => ({}))

// Mock específicos para Vuetify
vi.mock('vuetify/styles', () => ({}))
vi.mock('vuetify/lib/styles/main.sass', () => ({}))

// Mock para componentes de Vuetify que podríamos usar
const mockVuetifyComponents = {
  VApp: { name: 'v-app', template: '<div><slot /></div>' },
  VBtn: { name: 'v-btn', template: '<button><slot /></button>' },
  VCard: { name: 'v-card', template: '<div><slot /></div>' },
  VCardTitle: { name: 'v-card-title', template: '<div><slot /></div>' },
  VCardText: { name: 'v-card-text', template: '<div><slot /></div>' },
  VIcon: { name: 'v-icon', template: '<i><slot /></i>' },
  VTextField: { name: 'v-text-field', template: '<input type="text" />' },
  VAvatar: { name: 'v-avatar', template: '<div><slot /></div>' },
  VTooltip: { name: 'v-tooltip', template: '<div><slot /></div>' },
  VDivider: { name: 'v-divider', template: '<hr />' },
}

// Configurar stubs globales para Vue Test Utils
config.global.stubs = mockVuetifyComponents

// Mocks para APIs del navegador
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
})

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
})

// Mock para requestAnimationFrame
Object.defineProperty(globalThis, 'requestAnimationFrame', {
  writable: true,
  value: vi.fn().mockImplementation((callback: FrameRequestCallback) => {
    setTimeout(callback, 16)
    return 1
  }),
})

Object.defineProperty(globalThis, 'cancelAnimationFrame', {
  writable: true,
  value: vi.fn(),
})