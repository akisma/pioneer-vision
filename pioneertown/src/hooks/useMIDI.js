import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
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
  resetCcCalibration,
} from '../store/slices/midiSlice';

export const useMIDI = () => {
  const dispatch = useDispatch();
  const midiState = useSelector((state) => state.midi);

  // Initialize MIDI access
  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess({ sysex: false })
        .then(onMIDISuccess)
        .catch(onMIDIFailure);
    } else {
      console.log('Web MIDI API not supported');
    }
  }, []);

  const onMIDISuccess = (access) => {
    dispatch(setMidiAccess(access));
    const inputs = Array.from(access.inputs.values());
    dispatch(setMidiInputs(inputs));
    
    // Auto-select first input if available
    if (inputs.length > 0) {
      connectToInput(inputs[0]);
    }
  };

  const onMIDIFailure = (error) => {
    console.error('MIDI access failed:', error);
  };

  const connectToInput = (input) => {
    // Disconnect previous input
    if (midiState.selectedInput) {
      midiState.selectedInput.onmidimessage = null;
    }

    dispatch(setSelectedInput(input));
    dispatch(setIsConnected(true));
    
    input.onmidimessage = (message) => {
      const [status, data1, data2] = message.data;
      const timestamp = new Date().toLocaleTimeString();
      
      const newMessage = {
        id: Date.now(),
        timestamp,
        status,
        data1,
        data2,
        type: getMidiMessageType(status),
        raw: Array.from(message.data)
      };
      
      dispatch(addMidiMessage(newMessage));
      
      // Handle CC messages for slider control
      const isControlChange = (status & 0xF0) === 0xB0;
      
      if (isControlChange) {
        const channel = (status & 0x0F) + 1; // Extract channel (0-15 becomes 1-16)
        dispatch(handleCCMessage({ ccNumber: data1, value: data2, channel }));
      }
    };
  };

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

  const resetCalibration = (ccNumber = null) => {
    dispatch(resetCcCalibration(ccNumber));
  };

  return {
    ...midiState,
    connectToInput,
    handleSliderChange,
    handleButtonToggle,
    startLearning,
    clearMessages,
    resetCalibration
  };
};
