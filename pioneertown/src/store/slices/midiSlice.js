import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  midiAccess: null,
  midiInputs: [],
  selectedInput: null,
  midiMessages: [],
  isConnected: false,
  sliderValues: {
    lVolume: 50,
    rVolume: 75,
    xFader: 30
  },
  ccMappings: {},
  isLearning: null,
  // Add calibration data for each CC mapping
  ccCalibration: {},
};

const midiSlice = createSlice({
  name: 'midi',
  initialState,
  reducers: {
    setMidiAccess: (state, action) => {
      state.midiAccess = action.payload;
    },
    setMidiInputs: (state, action) => {
      state.midiInputs = action.payload;
    },
    setSelectedInput: (state, action) => {
      state.selectedInput = action.payload;
    },
    setIsConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    addMidiMessage: (state, action) => {
      // Keep only the last 50 messages
      state.midiMessages = [...state.midiMessages.slice(-49), action.payload];
    },
    clearMidiMessages: (state) => {
      state.midiMessages = [];
    },
    updateSliderValue: (state, action) => {
      const { slider, value } = action.payload;
      state.sliderValues[slider] = value;
    },
    setCcMapping: (state, action) => {
      const { slider, ccNumber } = action.payload;
      state.ccMappings[slider] = ccNumber;
    },
    setIsLearning: (state, action) => {
      state.isLearning = action.payload;
    },
    resetCcCalibration: (state, action) => {
      const ccNumber = action.payload;
      if (ccNumber) {
        delete state.ccCalibration[ccNumber];
      } else {
        state.ccCalibration = {};
      }
    },
    handleCCMessage: (state, action) => {
      const { ccNumber, value } = action.payload;
      
      // Check if this CC is mapped to a slider and update it
      Object.entries(state.ccMappings).forEach(([slider, cc]) => {
        if (cc === ccNumber) {
          // Initialize calibration data if not exists
          if (!state.ccCalibration[ccNumber]) {
            state.ccCalibration[ccNumber] = {
              min: value,
              max: value,
              lastValue: value
            };
          }
          
          const calibration = state.ccCalibration[ccNumber];
          
          // Update min/max ranges dynamically
          if (value < calibration.min) calibration.min = value;
          if (value > calibration.max) calibration.max = value;
          
          // Calculate normalized value based on actual range
          const range = calibration.max - calibration.min;
          let normalizedValue;
          
          if (range > 0) {
            normalizedValue = Math.round(((value - calibration.min) / range) * 100);
          } else {
            // Fallback to standard 0-127 normalization
            normalizedValue = Math.round((value / 127) * 100);
          }
          
          // Clamp to 0-100 range
          normalizedValue = Math.max(0, Math.min(100, normalizedValue));
          
          // Apply smoothing to reduce jitter (simple moving average)
          const smoothingFactor = 0.8; // Adjust between 0-1 for more/less smoothing
          const currentValue = state.sliderValues[slider];
          const smoothedValue = Math.round(currentValue * (1 - smoothingFactor) + normalizedValue * smoothingFactor);
          
          state.sliderValues[slider] = smoothedValue;
          calibration.lastValue = value;
        }
      });
      
      // If learning mode is active, map the CC to the learning slider
      if (state.isLearning) {
        state.ccMappings[state.isLearning] = ccNumber;
        state.isLearning = null;
      }
    },
  },
});

export const {
  setMidiAccess,
  setMidiInputs,
  setSelectedInput,
  setIsConnected,
  addMidiMessage,
  clearMidiMessages,
  updateSliderValue,
  setCcMapping,
  setIsLearning,
  handleCCMessage,
  resetCcCalibration,
} = midiSlice.actions;

export default midiSlice.reducer;
