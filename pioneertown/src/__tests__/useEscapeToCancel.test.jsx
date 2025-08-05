import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEscapeToCancel } from '../hooks/useEscapeToCancel';
import midiReducer, { startLearning } from '../store/slices/midiSlice';

// Mock store setup
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      midi: midiReducer,
    },
    preloadedState: {
      midi: {
        learningState: { controlType: null, controlId: null },
        ...initialState,
      },
    },
  });
};

const wrapper = ({ children, store }) => (
  <Provider store={store}>{children}</Provider>
);

describe('useEscapeToCancel', () => {
  let mockStore;
  let addEventListenerSpy;
  let removeEventListenerSpy;

  beforeEach(() => {
    mockStore = createMockStore();
    addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
  });

  afterEach(() => {
    vi.clearAllMocks();
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should add event listener on mount', () => {
    renderHook(() => useEscapeToCancel(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => useEscapeToCancel(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should return correct learning state', () => {
    const { result } = renderHook(() => useEscapeToCancel(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    expect(result.current.isLearning).toBe(false);
    expect(result.current.learningControl).toBeNull();
    expect(result.current.learningType).toBeNull();
  });

  it('should return true when in learning mode', () => {
    mockStore.dispatch(startLearning({ controlType: 'slider', controlId: 'test' }));

    const { result } = renderHook(() => useEscapeToCancel(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    expect(result.current.isLearning).toBe(true);
    expect(result.current.learningControl).toBe('test');
    expect(result.current.learningType).toBe('slider');
  });

  it('should dispatch stopLearning when Escape is pressed while learning', () => {
    // Start learning mode
    mockStore.dispatch(startLearning({ controlType: 'slider', controlId: 'test' }));

    renderHook(() => useEscapeToCancel(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    // Simulate Escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    act(() => {
      document.dispatchEvent(escapeEvent);
    });

    // Check if learning state was cleared
    const state = mockStore.getState();
    expect(state.midi.learningState.controlType).toBeNull();
    expect(state.midi.learningState.controlId).toBeNull();
  });

  it('should not dispatch stopLearning when Escape is pressed while not learning', () => {
    const initialState = mockStore.getState();

    renderHook(() => useEscapeToCancel(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    // Simulate Escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    act(() => {
      document.dispatchEvent(escapeEvent);
    });

    // State should remain unchanged
    const finalState = mockStore.getState();
    expect(finalState).toEqual(initialState);
  });

  it('should not dispatch stopLearning for other keys', () => {
    // Start learning mode
    mockStore.dispatch(startLearning({ controlType: 'slider', controlId: 'test' }));

    renderHook(() => useEscapeToCancel(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    // Simulate other key press
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    act(() => {
      document.dispatchEvent(enterEvent);
    });

    // Learning state should remain unchanged
    const state = mockStore.getState();
    expect(state.midi.learningState.controlType).toBe('slider');
    expect(state.midi.learningState.controlId).toBe('test');
  });
});
