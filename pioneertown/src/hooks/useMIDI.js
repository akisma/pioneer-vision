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
} from '../store/slices/midiSlice';

export const useMIDI = () => {
  const dispatch = useDispatch();
  const midiState = useSelector((state) => state?.midi || {});
  
  // Throttle mechanism to prevent excessive updates
  const lastUpdateTime = useRef({});
  const lastMessageTime = useRef(0);
  const messageQueue = useRef([]);
  const processingQueue = useRef(false);
  const THROTTLE_DELAY = 100; // Increased to 100ms (~10fps) for crash prevention
  const MESSAGE_THROTTLE = 200; // Throttle message logging to 5fps
  const MAX_QUEUE_SIZE = 10; // Limit queue size to prevent memory issues

  // Batch process queued messages
  const processMessageQueue = useCallback(() => {
    if (processingQueue.current || messageQueue.current.length === 0) {
      return;
    }
    
    processingQueue.current = true;
    
    // Process all queued messages in a single batch
    const messagesToProcess = messageQueue.current.splice(0);
    
    requestIdleCallback(() => {
      try {
        messagesToProcess.forEach(({ messageType, channel, data1, data2 }) => {
          if (messageType === 0xB0) {
            // Control Change
            const key = `cc-${data1}-${channel}`;
            const now = Date.now();
            if (!lastUpdateTime.current[key] || now - lastUpdateTime.current[key] > THROTTLE_DELAY) {
              lastUpdateTime.current[key] = now;
              dispatch(handleCCMessage({ ccNumber: data1, value: data2, channel }));
            }
          } else if (messageType === 0x90 || messageType === 0x80) {
            // Note On/Off
            const key = `note-${data1}-${channel}`;
            const now = Date.now();
            if (!lastUpdateTime.current[key] || now - lastUpdateTime.current[key] > THROTTLE_DELAY) {
              lastUpdateTime.current[key] = now;
              const isNoteOn = messageType === 0x90 && data2 > 0;
              dispatch(handleNoteMessage({ 
                noteNumber: data1, 
                velocity: data2, 
                channel, 
                isNoteOn 
              }));
            }
          }
        });
      } catch (error) {
        console.error('Error processing MIDI message queue:', error);
      } finally {
        processingQueue.current = false;
        // Schedule next batch if there are more messages
        if (messageQueue.current.length > 0) {
          setTimeout(processMessageQueue, 50);
        }
      }
    });
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
        const timestamp = new Date().toLocaleTimeString();
        
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
        
        // Throttle message logging to prevent overwhelming the UI
        const now = Date.now();
        if (now - lastMessageTime.current > MESSAGE_THROTTLE) {
          lastMessageTime.current = now;
          
          const newMessage = {
            id: `${now}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp,
            status,
            data1,
            data2: data2 || 0,
            type: getMidiMessageType(status),
            raw: Array.from(message.data)
          };
          
          dispatch(addMidiMessage(newMessage));
        }
        
        // Queue MIDI messages for batch processing
        const messageType = status & 0xF0;
        const channel = (status & 0x0F) + 1; // Extract channel (0-15 becomes 1-16)
        
        if (messageType === 0xB0 || messageType === 0x90 || messageType === 0x80) {
          // Add to queue, but limit queue size to prevent memory issues
          if (messageQueue.current.length < MAX_QUEUE_SIZE) {
            messageQueue.current.push({ messageType, channel, data1, data2: data2 || 0 });
          }
          
          // Start processing if not already running
          if (!processingQueue.current) {
            processMessageQueue();
          }
        }
      } catch (error) {
        console.error('Error processing MIDI message:', error);
      }
    };
    } catch (error) {
      console.error('Error connecting to MIDI input:', error);
    }
  }, [dispatch, midiState?.selectedInput, processMessageQueue]);

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
