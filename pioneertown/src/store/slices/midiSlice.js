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
  buttonStates: {
    lFX: false,
    rFX: false
  },
  ccMappings: {}, // Will store { controlName: { channel: 1, cc: 7 } }
  isLearning: null,
  // Add calibration data for each CC mapping (keyed by "channel:cc")
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
    toggleButton: (state, action) => {
      const { button } = action.payload;
      state.buttonStates[button] = !state.buttonStates[button];
    },
    setCcMapping: (state, action) => {
      const { control, channel, ccNumber } = action.payload;
      state.ccMappings[control] = { channel, cc: ccNumber };
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
      const { ccNumber, value, channel } = action.payload;
      
      // Check if this CC+channel combination is mapped to any control
      Object.entries(state.ccMappings).forEach(([control, mapping]) => {
        if (mapping.cc === ccNumber && mapping.channel === channel) {
          // Handle buttons (assuming they're mapped with CC values)
          if (control.endsWith('FX')) {
            // For buttons, treat CC value > 64 as "on" (pressed)
            state.buttonStates[control] = value > 64;
          } else {
            // Handle sliders
            const calibrationKey = `${channel}:${ccNumber}`;
            
            // Initialize calibration data if not exists
            if (!state.ccCalibration[calibrationKey]) {
              state.ccCalibration[calibrationKey] = {
                min: value,
                max: value,
                lastValue: value
              };
            }
            
            const calibration = state.ccCalibration[calibrationKey];
            
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
            const currentValue = state.sliderValues[control];
            const smoothedValue = Math.round(currentValue * (1 - smoothingFactor) + normalizedValue * smoothingFactor);
            
            state.sliderValues[control] = smoothedValue;
            calibration.lastValue = value;
          }
        }
      });
      
      // If learning mode is active, map the CC+channel to the learning control
      if (state.isLearning) {
        state.ccMappings[state.isLearning] = { channel, cc: ccNumber };
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
  toggleButton,
  setCcMapping,
  setIsLearning,
  handleCCMessage,
  resetCcCalibration,
} = midiSlice.actions;

export default midiSlice.reducer;
