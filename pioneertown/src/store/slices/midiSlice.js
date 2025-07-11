import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // MIDI Connection
  midiAccess: null,
  midiInputs: [],
  selectedInput: null,
  isConnected: false,
  
  // MIDI Messages
  midiMessages: [],
  
  // Control State
  sliders: {
    lVolume: { value: 64 },
    xFader: { value: 64 },
    rVolume: { value: 64 },
  },
  
  buttons: {
    fx1: { isPressed: false },
    fx2: { isPressed: false },
  },
  
  // Learning State
  learningState: {
    controlType: null, // 'slider' | 'button' | null
    controlId: null,   // control ID being learned
  },
  
  // Legacy learning support
  isLearning: null,
  
  // Mappings - supports CC, HRCC, and Note messages with channel support
  mappings: {
    slider: {
      // sliderId: { messageType: 'cc', channel: 1, ccNumber: 7 }
    },
    button: {
      // buttonId: { messageType: 'note', channel: 1, ccNumber: 60 }
    },
  },
  
  // Legacy CC mappings for backward compatibility
  ccMappings: {},
  
  // Legacy slider values for backward compatibility
  sliderValues: {},
  
  // Legacy button states for backward compatibility
  buttonStates: {},
  
  // Calibration data for smoothing and range mapping
  calibrationData: {
    // ccNumber: { min: 0, max: 127, smoothing: 0.8 }
  },
  
  // HRCC state tracking for paired MSB/LSB messages
  hrccState: {
    // ccNumber: { msb: null, lsb: null }
  },
};

const midiSlice = createSlice({
  name: 'midi',
  initialState,
  reducers: {
    // MIDI Connection Actions
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
    
    // MIDI Message Actions
    addMidiMessage: (state, action) => {
      try {
        // Validate payload
        if (!action.payload || typeof action.payload !== 'object') {
          return;
        }
        
        // Push new message
        state.midiMessages.push(action.payload);
        
        // Keep only the latest 25 messages (reduced further for crash prevention)
        if (state.midiMessages.length > 25) {
          state.midiMessages = state.midiMessages.slice(-25);
        }
      } catch (error) {
        console.error('Error adding MIDI message:', error);
        // Reset messages array on error to prevent further crashes
        state.midiMessages = [];
      }
    },
    
    clearMidiMessages: (state) => {
      state.midiMessages = [];
    },
    
    toggleButton: (state, action) => {
      const { button } = action.payload;
      if (!state.buttons[button]) {
        state.buttons[button] = { isPressed: false };
      }
      state.buttons[button].isPressed = !state.buttons[button].isPressed;
    },
    
    setButtonState: (state, action) => {
      const { button, value } = action.payload;
      if (!state.buttons[button]) {
        state.buttons[button] = { isPressed: false };
      }
      state.buttons[button].isPressed = value;
    },
    
    // Learning Actions
    setIsLearning: (state, action) => {
      state.isLearning = action.payload;
    },
    
    // CC Mapping Actions
    setCCMapping: (state, action) => {
      const { control, mapping } = action.payload;
      state.ccMappings[control] = mapping;
    },
    
    clearCCMapping: (state, action) => {
      const { control } = action.payload;
      state.ccMappings[control] = null;
    },
    
    // MIDI Message Handling Actions
    handleCCMessage: (state, action) => {
      try {
        const { ccNumber, value, channel } = action.payload;
        
        // Validate input with strict type checking
        if (!Number.isInteger(ccNumber) || !Number.isInteger(value) || !Number.isInteger(channel)) {
          console.warn('Invalid CC message data:', action.payload);
          return;
        }
        
        // Bounds checking
        if (ccNumber < 0 || ccNumber > 127 || value < 0 || value > 127 || channel < 1 || channel > 16) {
          console.warn('CC message data out of bounds:', action.payload);
          return;
        }
        
        // Apply calibration if available
        let calibratedValue = value;
        const calibration = state.calibrationData?.[ccNumber];
        if (calibration && typeof calibration === 'object') {
          const normalizedValue = (value - calibration.min) / (calibration.max - calibration.min);
          calibratedValue = Math.round(normalizedValue * 127);
          calibratedValue = Math.max(0, Math.min(127, calibratedValue));
        }
        
        // Check if we're in learning mode first (most common case)
        if (state.learningState?.controlType && state.learningState?.controlId) {
          const { controlType, controlId } = state.learningState;
          if (!state.mappings[controlType]) {
            state.mappings[controlType] = {};
          }
          state.mappings[controlType][controlId] = {
            messageType: 'cc',
            channel,
            ccNumber,
          };
          state.learningState = { controlType: null, controlId: null };
          return; // Exit early after learning
        }
        
        // Update controls based on new mappings structure (preferred)
        if (state.mappings?.slider && typeof state.mappings.slider === 'object') {
          for (const [sliderId, mapping] of Object.entries(state.mappings.slider)) {
            if (mapping?.messageType === 'cc' && 
                mapping?.ccNumber === ccNumber && 
                (!mapping.channel || mapping.channel === channel)) {
              if (!state.sliders[sliderId]) {
                state.sliders[sliderId] = { value: 0 };
              }
              state.sliders[sliderId].value = Math.max(0, Math.min(100, Math.round((calibratedValue / 127) * 100)));
              break; // Exit after first match for performance
            }
          }
        }
        
        // Legacy support - only if no new mapping found
        if (state.ccMappings && typeof state.ccMappings === 'object' && Object.keys(state.ccMappings).length > 0) {
          for (const [controlKey, mapping] of Object.entries(state.ccMappings)) {
            if (mapping?.type === 'cc' && mapping?.cc === ccNumber && mapping?.channel === channel) {
              // Update legacy sliderValues if exists
              if (state.sliderValues && typeof state.sliderValues === 'object' && controlKey in state.sliderValues) {
                state.sliderValues[controlKey] = calibratedValue;
              }
              // Update new sliders structure
              if (state.sliders?.[controlKey]) {
                state.sliders[controlKey].value = Math.max(0, Math.min(100, Math.round((calibratedValue / 127) * 100)));
              }
              break; // Exit after first match for performance
            }
          }
        }
        
        // Handle legacy learning mode
        if (state.isLearning && typeof state.isLearning === 'string') {
          state.ccMappings[state.isLearning] = {
            type: 'cc',
            channel,
            cc: ccNumber,
          };
          state.isLearning = null;
        }
      } catch (error) {
        console.error('Error handling CC message:', error);
        // Reset problematic state to prevent cascade failures
        state.learningState = { controlType: null, controlId: null };
        state.isLearning = null;
      }
    },
    
    handleHRCCMessage: (state, action) => {
      const { ccNumber, value, channel, isLSB } = action.payload;
      
      // HRCC uses CC pairs: MSB at ccNumber, LSB at ccNumber + 32
      const baseCCNumber = isLSB ? ccNumber - 32 : ccNumber;
      
      // Initialize HRCC state if not exists
      if (!state.hrccState[baseCCNumber]) {
        state.hrccState[baseCCNumber] = { msb: null, lsb: null };
      }
      
      // Update MSB or LSB
      if (isLSB) {
        state.hrccState[baseCCNumber].lsb = value;
      } else {
        state.hrccState[baseCCNumber].msb = value;
      }
      
      // If both MSB and LSB are available, calculate 14-bit value
      const hrccData = state.hrccState[baseCCNumber];
      if (hrccData.msb !== null && hrccData.lsb !== null) {
        const highResValue = (hrccData.msb << 7) | hrccData.lsb; // 14-bit value (0-16383)
        const normalizedValue = Math.round((highResValue / 16383) * 127); // Convert to 0-127
        
        // Find controls mapped to this HRCC
        Object.entries(state.ccMappings).forEach(([controlKey, mapping]) => {
          if (mapping && mapping.type === 'hrcc' && mapping.cc === baseCCNumber && mapping.channel === channel) {
            // Update legacy sliderValues if exists
            if (state.sliderValues && controlKey in state.sliderValues) {
              state.sliderValues[controlKey] = normalizedValue;
            }
            // Update new sliders structure
            if (state.sliders && state.sliders[controlKey]) {
              state.sliders[controlKey].value = Math.round((normalizedValue / 127) * 100);
            }
          }
        });
        
        // Also check new mappings structure
        if (state.mappings && state.mappings.slider) {
          Object.entries(state.mappings.slider).forEach(([sliderId, mapping]) => {
            if (mapping.messageType === 'hrcc' && 
                mapping.ccNumber === baseCCNumber && 
                (!mapping.channel || mapping.channel === channel)) {
              if (!state.sliders[sliderId]) {
                state.sliders[sliderId] = { value: 0 };
              }
              state.sliders[sliderId].value = Math.round((normalizedValue / 127) * 100);
            }
          });
        }
        
        // Handle learning mode
        if (state.isLearning) {
          state.ccMappings[state.isLearning] = {
            type: 'hrcc',
            channel,
            cc: baseCCNumber,
          };
          state.isLearning = null;
        }
        
        // Clear HRCC state after processing
        state.hrccState[baseCCNumber] = { msb: null, lsb: null };
      }
    },
    
    handleNoteMessage: (state, action) => {
      const { noteNumber, velocity, channel, isNoteOn } = action.payload;
      
      // Find controls mapped to this note
      Object.entries(state.ccMappings).forEach(([controlKey, mapping]) => {
        if (mapping && mapping.type === 'note' && mapping.note === noteNumber && mapping.channel === channel) {
          // Update legacy buttonStates if exists
          if (state.buttonStates && controlKey in state.buttonStates) {
            if (isNoteOn && velocity > 0) {
              state.buttonStates[controlKey] = !state.buttonStates[controlKey];
            }
          }
          // Update new buttons structure
          if (state.buttons && state.buttons[controlKey]) {
            state.buttons[controlKey].isPressed = isNoteOn && velocity > 0;
          }
          // Update legacy sliderValues if exists
          if (state.sliderValues && controlKey in state.sliderValues) {
            state.sliderValues[controlKey] = velocity;
          }
          // Update new sliders structure
          if (state.sliders && state.sliders[controlKey]) {
            state.sliders[controlKey].value = Math.round((velocity / 127) * 100);
          }
        }
      });
      
      // Also check new mappings structure
      if (state.mappings && state.mappings.button) {
        Object.entries(state.mappings.button).forEach(([buttonId, mapping]) => {
          if (mapping.messageType === 'note' && 
              mapping.ccNumber === noteNumber && 
              (!mapping.channel || mapping.channel === channel)) {
            if (!state.buttons[buttonId]) {
              state.buttons[buttonId] = { isPressed: false };
            }
            state.buttons[buttonId].isPressed = isNoteOn && velocity > 0;
          }
        });
      }
      
      // Handle learning mode (legacy)
      if (state.isLearning && isNoteOn && velocity > 0) {
        state.ccMappings[state.isLearning] = {
          type: 'note',
          channel,
          note: noteNumber,
        };
        state.isLearning = null;
      }
      
      // Handle new learning mode
      if (state.learningState.controlType && state.learningState.controlId && isNoteOn && velocity > 0) {
        const { controlType, controlId } = state.learningState;
        if (!state.mappings[controlType]) {
          state.mappings[controlType] = {};
        }
        state.mappings[controlType][controlId] = {
          messageType: 'note',
          channel,
          ccNumber: noteNumber,
        };
        state.learningState = { controlType: null, controlId: null };
      }
    },
    
    // Calibration Actions
    setCalibration: (state, action) => {
      const { ccNumber, min, max, smoothing } = action.payload;
      state.calibrationData[ccNumber] = { min, max, smoothing };
    },
    
    resetCalibration: (state, action) => {
      const { ccNumber } = action.payload;
      if (ccNumber) {
        delete state.calibrationData[ccNumber];
      } else {
        state.calibrationData = {};
      }
    },
    
    // HRCC State Management
    clearHRCCState: (state, action) => {
      const { ccNumber } = action.payload;
      if (ccNumber) {
        delete state.hrccState[ccNumber];
      } else {
        state.hrccState = {};
      }
    },
    
    // Control Actions
    updateSliderValue: (state, action) => {
      const { id, value } = action.payload;
      if (!state.sliders[id]) {
        state.sliders[id] = { value: 0 };
      }
      state.sliders[id].value = value;
    },

    updateButtonState: (state, action) => {
      const { id, isPressed } = action.payload;
      if (!state.buttons[id]) {
        state.buttons[id] = { isPressed: false };
      }
      state.buttons[id].isPressed = isPressed;
    },

    // Learning Actions
    startLearning: (state, action) => {
      const { controlType, controlId } = action.payload;
      state.learningState = { controlType, controlId };
    },

    stopLearning: (state) => {
      state.learningState = { controlType: null, controlId: null };
    },

    // Mapping Actions
    updateMappingValue: (state, action) => {
      const { controlType, controlId, messageType, channel, ccNumber } = action.payload;
      if (!state.mappings[controlType]) {
        state.mappings[controlType] = {};
      }
      state.mappings[controlType][controlId] = {
        messageType,
        channel,
        ccNumber,
      };
    },

    clearMapping: (state, action) => {
      const { controlType, controlId } = action.payload;
      if (state.mappings[controlType]) {
        delete state.mappings[controlType][controlId];
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
  setButtonState,
  setIsLearning,
  setCCMapping,
  clearCCMapping,
  handleCCMessage,
  handleHRCCMessage,
  handleNoteMessage,
  setCalibration,
  resetCalibration,
  clearHRCCState,
  updateButtonState,
  startLearning,
  stopLearning,
  updateMappingValue,
  clearMapping,
} = midiSlice.actions;

export default midiSlice.reducer;
