import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useCallback, useRef } from 'react';
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { midiMessageQueue } from '../midi/MIDIMessageQueue';
import { midiControlManager } from '../midi/MIDIControlManager';
import {
  setMidiAccess,
  setMidiInputs,
  setSelectedInput,
  setIsConnected,
} from '../store/slices/midiSlice';

export const useMIDI = () => {
  const dispatch = useDispatch();
  const midiState = useSelector((state) => state?.midi || {});
  
  // Store reference to actual MIDI access and current input
  const midiAccessRef = useRef(null);
  const currentInputRef = useRef(null);

  // Connect dispatch to control manager for Redux bridge
  useEffect(() => {
    console.log('Setting up MIDI control manager with dispatch');
    midiControlManager.setDispatch(dispatch);
    
    // Set up some basic mappings for immediate functionality
    console.log('Setting up default control mappings');
    midiControlManager.mapControl('leftVolume', 'slider', 'controlchange', 1, 7);
    midiControlManager.mapControl('rightVolume', 'slider', 'controlchange', 1, 8);
    midiControlManager.mapControl('crossfader', 'slider', 'controlchange', 1, 9);
    
    console.log('Available mappings after setup:', midiControlManager.getMappings());
    
  }, [dispatch]);

  // Subscribe to the new MIDI system and bridge to Redux
  useEffect(() => {
    const unsubscribeMessages = midiMessageQueue.subscribe((data) => {
      // Bridge message queue data to Redux for UI display
      if (data.latestMessages.length > 0) {
        console.log('Bridging messages to Redux:', data.latestMessages.length, 'latest messages');
        dispatch({ type: 'midi/updateMIDIMessage', payload: data.latestMessages });
      }
      
      // Also bridge recent activity for the UI monitor
      if (data.recentActivity.length > 0) {
        console.log('Bridging recent activity to Redux:', data.recentActivity.length, 'recent messages');
        // Convert the new format to the format expected by the UI
        const formattedActivity = data.recentActivity.map(msg => ({
          id: msg.id,
          timestamp: msg.timestamp,
          status: msg.status,
          data1: msg.data1,
          data2: msg.data2 || msg.value,
          type: msg.messageType.charAt(0).toUpperCase() + msg.messageType.slice(1),
          channel: msg.channel,
          key: `${msg.messageType}-${msg.channel}-${msg.data1}`,
          inputId: 'unknown'
        }));
        
        dispatch({ 
          type: 'midi/updateRecentActivity', 
          payload: formattedActivity 
        });
      }
    });

    return () => {
      unsubscribeMessages();
    };
  }, [dispatch]);

  const connectToInput = useCallback((input) => {
    try {
      // Disconnect previous input
      if (currentInputRef.current) {
        currentInputRef.current.onmidimessage = null;
      }

      // Store actual input reference
      currentInputRef.current = input;
      
      // Store serializable version in Redux
      const serializableInput = {
        id: input.id,
        manufacturer: input.manufacturer || 'Unknown',
        name: input.name || 'Unknown Device',
        version: input.version || '',
        connection: input.connection,
        state: input.state,
        type: input.type
      };
      
      dispatch(setSelectedInput(serializableInput));
      dispatch(setIsConnected(true));
    
      input.onmidimessage = (message) => {
        try {
          performanceMonitor.recordMessage();
          
          if (performanceMonitor.shouldThrottle() && Math.random() > 0.5) {
            return;
          }
          
          const [status, data1, data2] = message.data;
          const timestamp = performance.now();
          
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
          
          const messageType = getMidiMessageType(status);
          const channel = (status & 0x0F) + 1;
          
          const messageObj = {
            messageType,
            channel,
            status,
            data1,
            data2: data2 || 0,
            timestamp,
            raw: Array.from(message.data)
          };

          midiMessageQueue.addMessage(messageObj);
          
        } catch (error) {
          console.error('Error processing MIDI message:', error);
        }
      };
    } catch (error) {
      console.error('Error connecting to MIDI input:', error);
      dispatch(setIsConnected(false));
    }
  }, [dispatch]);

  const onMIDISuccess = useCallback((access) => {
    midiAccessRef.current = access;
    
    dispatch(setMidiAccess({ connected: true, inputCount: access.inputs.size }));
    
    const serializableInputs = Array.from(access.inputs.values()).map(input => ({
      id: input.id,
      manufacturer: input.manufacturer || 'Unknown',
      name: input.name || 'Unknown Device',
      version: input.version || '',
      connection: input.connection,
      state: input.state,
      type: input.type
    }));
    
    dispatch(setMidiInputs(serializableInputs));
    
    if (access.inputs.size > 0) {
      const firstInput = Array.from(access.inputs.values())[0];
      connectToInput(firstInput);
    }
  }, [dispatch, connectToInput]);
  
  const connectToInputById = useCallback((inputId) => {
    if (midiAccessRef.current) {
      const input = midiAccessRef.current.inputs.get(inputId);
      if (input) {
        connectToInput(input);
      }
    }
  }, [connectToInput]);

  const onMIDIFailure = (error) => {
    console.error('MIDI access failed:', error);
  };

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
    console.warn('Manual slider changes should use MIDIControlManager directly');
  };

  const handleButtonToggle = (button) => {
    console.warn('Manual button changes should use MIDIControlManager directly');
  };

  const startLearning = (controlType, controlId) => {
    midiControlManager.startLearning(controlType, controlId);
  };

  const stopLearning = () => {
    midiControlManager.stopLearning();
  };

  const clearMessages = () => {
    midiMessageQueue.clear();
    midiControlManager.clear();
  };

  return {
    midiAccess: midiState.midiAccess,
    midiInputs: midiState.midiInputs,
    selectedInput: midiState.selectedInput,
    isConnected: midiState.isConnected,
    
    connectToInput,
    connectToInputById,
    
    handleSliderChange,
    handleButtonToggle,
    startLearning,
    stopLearning,
    clearMessages,
    
    messageQueue: midiMessageQueue,
    controlManager: midiControlManager,
  };
};
