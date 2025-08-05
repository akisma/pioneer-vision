import { configureStore } from '@reduxjs/toolkit';
import midiReducer from './slices/midiSlice';
import createMidiThrottleMiddleware from './middleware/midiThrottle';

export const store = configureStore({
  reducer: {
    midi: midiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore MIDI objects as they contain non-serializable data
        ignoredActions: ['midi/setMidiAccess', 'midi/setSelectedInput'],
        ignoredPaths: ['midi.midiAccess', 'midi.selectedInput', 'midi.midiInputs'],
      },
    }).concat(createMidiThrottleMiddleware()),
});

export default store;
