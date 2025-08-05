import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useCallback, useRef } from 'react';
import { performanceMonitor } from '../utils/PerformanceMonitor';
import {
  setMidiAccess,
  setMidiInputs,
  setSelectedInput,
  setIsConnected,
  addMidiMessage,
  clearMidiMessages,
  updateSliderValue,
  toggleButton,
  setIsLearning,
  handleCCMessage,
  handleNoteMessage,
  resetCalibration,
  messageReceived,
} from '../store/slices/midiSlice';

export const useMIDI = () => {
  const dispatch = useDispatch();
  const midiState = useSelector((state) => state?.midi || {});
  
  // Simplified throttling for monitor display only
  const lastMessageTime = useRef(0);
  const MESSAGE_THROTTLE = 200; // Throttle message logging to 5fps

  const connectToInput = useCallback((input) => {
    try {
      // Disconnect previous input
      if (midiState?.selectedInput) {
        midiState.selectedInput.onmidimessage = null;
      }

      dispatch(setSelectedInput(input));
      dispatch(setIsConnected(true));
    
    input.onmidimessage = (message) => {
      try {
        // Record message for performance monitoring
        performanceMonitor.recordMessage();
        
        // If performance is degraded, skip some messages
        if (performanceMonitor.shouldThrottle() && Math.random() > 0.5) {
          return; // Skip 50% of messages when throttled
        }
        
        const [status, data1, data2] = message.data;
        const timestamp = Date.now();
        
        const getMidiMessageType = (status) => {
          const type = status & 0xF0;
          switch (type) {
            case 0x80: return 'noteoff';
            case 0x90: return 'noteon';
            case 0xA0: return 'aftertouch';
            case 0xB0: return 'controlchange';
            case 0xC0: return 'programchange';
            case 0xD0: return 'channelpressure';
            case 0xE0: return 'pitchbend';
            default: return 'unknown';
          }
        };
        
        // Extract message info
        const messageType = status & 0xF0;
        const channel = (status & 0x0F) + 1; // Extract channel (0-15 becomes 1-16)
        const messageTypeString = getMidiMessageType(status);
        
        // Create standardized message object
        const messageObj = {
          messageType: messageTypeString,
          channel,
          cc: data1, // CC number for CC messages, note number for note messages
          value: data2 || 0,
          timestamp,
          status,
          data1,
          data2: data2 || 0,
          raw: Array.from(message.data)
        };

        // Dispatch to new throttling middleware system
        // Middleware will handle CC/HRCC throttling, other messages pass through
        dispatch(messageReceived(messageObj));
        
        // Throttled monitor display for all message types
        const now = Date.now();
        if (now - lastMessageTime.current > MESSAGE_THROTTLE) {
          lastMessageTime.current = now;
          
          const displayMessage = {
            id: `${now}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toLocaleTimeString(),
            status,
            data1,
            data2: data2 || 0,
            type: messageTypeString.charAt(0).toUpperCase() + messageTypeString.slice(1),
            raw: Array.from(message.data)
          };
          
          dispatch(addMidiMessage(displayMessage));
        }
      } catch (error) {
        console.error('Error processing MIDI message:', error);
      }
    };
    } catch (error) {
      console.error('Error connecting to MIDI input:', error);
      dispatch(setIsConnected(false));
    }
  }, [dispatch, midiState?.selectedInput]);

  const onMIDISuccess = useCallback((access) => {
    dispatch(setMidiAccess(access));
    const inputs = Array.from(access.inputs.values());
    dispatch(setMidiInputs(inputs));
    
    // Auto-select first input if available
    if (inputs.length > 0) {
      connectToInput(inputs[0]);
    }
  }, [dispatch, connectToInput]);

  const onMIDIFailure = (error) => {
    console.error('MIDI access failed:', error);
  };

  // Initialize MIDI access
  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess({ sysex: false })
        .then(onMIDISuccess)
        .catch(onMIDIFailure);
    } else {
      console.log('Web MIDI API not supported');
    }
  }, [onMIDISuccess]);

  const handleSliderChange = (slider, value) => {
    // Ensure value is a number
    const numericValue = parseInt(value, 10);
    dispatch(updateSliderValue({ slider, value: numericValue }));
  };

  const handleButtonToggle = (button) => {
    dispatch(toggleButton({ button }));
  };

  const startLearning = (control) => {
    dispatch(setIsLearning(control));
  };

  const clearMessages = () => {
    dispatch(clearMidiMessages());
  };

  const resetCalibrationHandler = (ccNumber = null) => {
    dispatch(resetCalibration(ccNumber));
  };

  return {
    ...midiState,
    connectToInput,
    handleSliderChange,
    handleButtonToggle,
    startLearning,
    clearMessages,
    resetCalibration: resetCalibrationHandler
  };
};
