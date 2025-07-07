import { configureStore } from '@reduxjs/toolkit';
import midiReducer from './slices/midiSlice';

export const store = configureStore({
  reducer: {
    midi: midiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore MIDI access objects and input objects as they're not serializable
        ignoredActions: ['midi/setMidiAccess', 'midi/setSelectedInput'],
        ignoredPaths: ['midi.midiAccess', 'midi.selectedInput', 'midi.midiInputs'],
      },
    }),
});
