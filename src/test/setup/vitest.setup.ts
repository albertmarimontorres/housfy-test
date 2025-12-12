import { vi } from 'vitest';
import { config } from '@vue/test-utils';

// Mock CSS y archivos de estilo
vi.mock('*.css', () => ({}));
vi.mock('*.scss', () => ({}));
vi.mock('*.sass', () => ({}));

// Mock de Vuetify CSS imports que causan problemas
vi.mock('vuetify/lib/components/VCode/VCode.css', () => ({}));
vi.mock('vuetify/styles', () => ({}));

// Configurar Vuetify para los tests de forma simplificada
import { createVuetify } from 'vuetify';

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
  },
  display: {
    mobileBreakpoint: 'sm',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

// Configurar Vue Test Utils para usar Vuetify
config.global.plugins = [vuetify];

// Mock para window.matchMedia (requerido por algunos componentes de Vuetify)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock para ResizeObserver
Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Mock para IntersectionObserver
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});
