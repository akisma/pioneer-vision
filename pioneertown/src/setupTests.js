import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web MIDI API since it's not available in test environment
Object.defineProperty(navigator, 'requestMIDIAccess', {
  writable: true,
  value: vi.fn(() => 
    Promise.resolve({
      inputs: new Map(),
      outputs: new Map(),
      onstatechange: null,
      sysexEnabled: false
    })
  )
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
  }
});

// Mock requestIdleCallback for performance monitoring
global.requestIdleCallback = global.requestIdleCallback || function(cb) {
  return setTimeout(cb, 0);
};

global.cancelIdleCallback = global.cancelIdleCallback || function(id) {
  clearTimeout(id);
};

// Mock requestAnimationFrame
global.requestAnimationFrame = global.requestAnimationFrame || function(cb) {
  return setTimeout(cb, 16);
};

global.cancelAnimationFrame = global.cancelAnimationFrame || function(id) {
  clearTimeout(id);
};
