import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useCallback, useRef } from 'react';
import { performanceMonitor } from '../utils/PerformanceMonitor';
import {
  setMidiAccess,
  setMidiInputs,
  setSelectedInput,
  setIsConnected,
  addMidiMessage,
  updateMIDIMessage,
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
  
  // Track latest message per channel/type/key combination
  const latestMessages = useRef(new Map());
  const lastUpdateTime = useRef(0);
  
  // Simple throttled update without lodash
  const updateMessages = useCallback(() => {
    const now = performance.now();
    if (now - lastUpdateTime.current >= 16) { // 60fps throttle
      const messagesToUpdate = Array.from(latestMessages.current.values());
      if (messagesToUpdate.length > 0) {
        dispatch(updateMIDIMessage(messagesToUpdate));
        latestMessages.current.clear();
      }
      lastUpdateTime.current = now;
    }
  }, [dispatch]);

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
          const timestamp = performance.now();
          
          const getMidiMessageType = (status) => {
            const type = status & 0xF0;
            switch (type) {
              case 0x80: return 'Note Off';
              case 0x90: return 'Note On';
              case 0xA0: return 'Aftertouch';
              case 0xB0: return 'Control Change';
              case 0xC0: return 'Program Change';
              case 0xD0: return 'Channel Pressure';
              case 0xE0: return 'Pitch Bend';
              default: return 'Unknown';
            }
          };
          
          // Extract message info
          const messageType = status & 0xF0;
          const channel = (status & 0x0F) + 1; // Extract channel (0-15 becomes 1-16)
          const messageTypeString = getMidiMessageType(status);
          
          // Create standardized message object
          const messageObj = {
            messageType: messageTypeString.toLowerCase().replace(' ', ''),
            channel,
            cc: data1, // CC number for CC messages, note number for note messages
            value: data2 || 0,
            timestamp,
            status,
            data1,
            data2: data2 || 0,
            raw: Array.from(message.data)
          };

          // Dispatch to existing system for control handling
          dispatch(messageReceived(messageObj));
          
          // Create message for new throttled monitor system
          const displayMessage = {
            id: Date.now() + Math.random(),
            timestamp,
            status,
            data1,
            data2: data2 || 0,
            type: messageTypeString,
            channel,
            inputId: input.id || 'unknown'
          };

          // Create unique key for this message type/channel/data1 combination
          const messageKey = `${messageTypeString}-${channel}-${data1}`;
          
          // Store only the latest message for each key (ignoring excess input)
          latestMessages.current.set(messageKey, {
            ...displayMessage,
            key: messageKey
          });
          
          // Trigger throttled update
          updateMessages();
          
        } catch (error) {
          console.error('Error processing MIDI message:', error);
        }
      };
    } catch (error) {
      console.error('Error connecting to MIDI input:', error);
      dispatch(setIsConnected(false));
    }
  }, [dispatch, midiState?.selectedInput, updateMessages]);

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
    latestMessages.current.clear(); // Clear the local message cache too
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