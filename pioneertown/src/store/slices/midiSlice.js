import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // MIDI Connection
  midiAccess: null,
  midiInputs: [],
  selectedInput: null,
  isConnected: false,
  
  // MIDI Messages
  midiMessages: [],
  latestMessages: {}, // Store latest message per channel/type/key
  recentActivity: [], // Store recent 20 messages for display
  
  // Control State
  sliders: {
    leftVolume: 0,
    rightVolume: 0,
    crossfader: 0,
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
  
  // Mappings - supports CC and Note messages with channel support
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
      const message = action.payload;
      
      // Create unique message with timestamp if not present
      const messageWithId = {
        ...message,
        id: message.id || `${Date.now()}-${Math.random()}`,
        timestamp: message.timestamp || performance.now()
      };
      
      state.midiMessages.push(messageWithId);
      
      // Keep only the last 50 messages to prevent memory issues
      if (state.midiMessages.length > 50) {
        state.midiMessages = state.midiMessages.slice(-50);
      }
    },
    
    updateMIDIMessage: (state, action) => {
      const messages = Array.isArray(action.payload) ? action.payload : [action.payload];
      
      messages.forEach(message => {
        if (!message?.key) return;
        
        // Update latest message for this key
        state.latestMessages[message.key] = message;
        
        // Add to recent activity (for display)
        state.recentActivity.unshift(message);
        
        // Keep only last 20 for display
        if (state.recentActivity.length > 20) {
          state.recentActivity = state.recentActivity.slice(0, 20);
        }
      });
    },
    clearMidiMessages: (state) => {
      state.midiMessages = [];
      state.latestMessages = {};
      state.recentActivity = [];
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
              // Convert MIDI value (0-127) to percentage (0-100) with proper precision
              state.sliders[sliderId].value = Math.round((calibratedValue / 127) * 100);
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
              // Update new sliders structure with proper MIDI to percentage conversion
              if (state.sliders?.[controlKey]) {
                state.sliders[controlKey].value = Math.round((calibratedValue / 127) * 100);
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
    
    // Control Actions
    updateSliderValue: (state, action) => {
      const { id, value } = action.payload;
      if (!state.sliders[id]) {
        state.sliders[id] = { value: 0 };
      }
      // If value is already in percentage (0-100), use as-is
      // If value is in MIDI range (0-127), convert to percentage
      const finalValue = value > 100 ? Math.round((value / 127) * 100) : value;
      state.sliders[id].value = Math.max(0, Math.min(100, finalValue));
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

    // Batched MIDI Controls Update (for throttling middleware)
    updateMIDIControlsBatch: (state, action) => {
      try {
        const messages = action.payload; // Array of latest messages per channel+CC
        
        if (!Array.isArray(messages)) {
          console.warn('updateMIDIControlsBatch: payload must be an array');
          return;
        }
        
        messages.forEach(message => {
          const { channel, cc, value, messageType } = message;
          
          // Validate message data
          if (!Number.isInteger(channel) || !Number.isInteger(cc) || !Number.isInteger(value)) {
            console.warn('Invalid message data in batch:', message);
            return;
          }
          
          // Update control states (sliders/buttons) for CC messages
          if (messageType === 'controlchange') {
            // Find mapped control for this channel+CC combination
            const mappingKey = `ch${channel}-cc${cc}`;
            
            // Check new mappings structure first
            if (state.mappings?.slider) {
              for (const [sliderId, mapping] of Object.entries(state.mappings.slider)) {
                if (mapping?.messageType === messageType && 
                    mapping?.ccNumber === cc && 
                    (!mapping.channel || mapping.channel === channel)) {
                  
                  if (!state.sliders[sliderId]) {
                    state.sliders[sliderId] = { value: 0 };
                  }
                  
                  // Convert MIDI value (0-127) to percentage (0-100) with proper precision
                  const normalizedValue = Math.round((value / 127) * 100);
                  state.sliders[sliderId].value = normalizedValue;
                  state.sliders[sliderId].lastUpdated = message.timestamp || Date.now();
                  break; // Exit after first match
                }
              }
            }
            
            // Check button mappings
            if (state.mappings?.button) {
              for (const [buttonId, mapping] of Object.entries(state.mappings.button)) {
                if (mapping?.messageType === messageType && 
                    mapping?.ccNumber === cc && 
                    (!mapping.channel || mapping.channel === channel)) {
                  
                  if (!state.buttons[buttonId]) {
                    state.buttons[buttonId] = { isPressed: false };
                  }
                  
                  // Convert MIDI value to button state (>= 64 = pressed)
                  state.buttons[buttonId].isPressed = value >= 64;
                  state.buttons[buttonId].value = value;
                  state.buttons[buttonId].lastUpdated = message.timestamp || Date.now();
                  break; // Exit after first match
                }
              }
            }
            
            // Add to monitor display (with limit)
            state.midiMessages.unshift({
              ...message,
              id: `${message.channel}-${message.cc}-${message.timestamp || Date.now()}`,
              timestamp: message.timestamp || Date.now()
            });
          }
        });
        
        // Trim monitor messages to limit
        if (state.midiMessages.length > 25) {
          state.midiMessages = state.midiMessages.slice(0, 25);
        }
        
      } catch (error) {
        console.error('Error in updateMIDIControlsBatch:', error);
        // Don't reset state on error to prevent data loss
      }
    },

    // MIDI Message Received (for throttling middleware)
    messageReceived: (state, action) => {
      // This action is intercepted by middleware for CC/HRCC messages
      // Other message types (Note On/Off) are processed here immediately
      const { messageType } = action.payload;
      
      if (messageType === 'noteon' || messageType === 'noteoff') {
        // Handle Note messages immediately (no throttling)
        // Implementation similar to handleNoteMessage if needed
      }
      
      // Add all messages to monitor (throttled messages will be added by batch update)
      if (messageType !== 'controlchange') {
        state.midiMessages.unshift({
          ...action.payload,
          id: `${action.payload.channel}-${action.payload.cc || action.payload.note}-${Date.now()}`,
          timestamp: Date.now()
        });
        
        // Trim monitor messages
        if (state.midiMessages.length > 25) {
          state.midiMessages = state.midiMessages.slice(0, 25);
        }
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
  updateMIDIMessage,
  clearMidiMessages,
  updateSliderValue,
  toggleButton,
  setButtonState,
  setIsLearning,
  setCCMapping,
  clearCCMapping,
  handleCCMessage,
  handleNoteMessage,
  setCalibration,
  resetCalibration,
  updateButtonState,
  startLearning,
  stopLearning,
  updateMappingValue,
  clearMapping,
  updateMIDIControlsBatch,
  messageReceived,
} = midiSlice.actions;

export default midiSlice.reducer;
