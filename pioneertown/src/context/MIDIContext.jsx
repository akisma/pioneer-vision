import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const MIDIContext = createContext();

export const useMIDI = () => {
  const context = useContext(MIDIContext);
  if (!context) {
    throw new Error('useMIDI must be used within a MIDIProvider');
  }
  return context;
};

export const MIDIProvider = ({ children }) => {
  const [midiAccess, setMidiAccess] = useState(null);
  const [midiInputs, setMidiInputs] = useState([]);
  const [selectedInput, setSelectedInput] = useState(null);
  const [midiMessages, setMidiMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sliderValues, setSliderValues] = useState({
    lVolume: 50,
    rVolume: 75,
    xFader: 30
  });
  const [ccMappings, setCcMappings] = useState({});
  const [isLearning, setIsLearning] = useState(null);
  
  // Use refs to store current state to avoid closure issues
  const isLearningRef = useRef(null);
  const ccMappingsRef = useRef({});

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

  // Debug: Track isLearning state changes
  useEffect(() => {
    console.log('isLearning state changed to:', isLearning);
    isLearningRef.current = isLearning; // Keep ref in sync
  }, [isLearning]);

  // Debug: Track ccMappings changes
  useEffect(() => {
    console.log('ccMappings changed to:', ccMappings);
    ccMappingsRef.current = ccMappings; // Keep ref in sync
  }, [ccMappings]);

  const onMIDISuccess = (access) => {
    setMidiAccess(access);
    const inputs = Array.from(access.inputs.values());
    setMidiInputs(inputs);
    
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
    if (selectedInput) {
      selectedInput.onmidimessage = null;
    }

    setSelectedInput(input);
    setIsConnected(true);
    
    input.onmidimessage = (message) => {
      const [status, data1, data2] = message.data;
      const timestamp = new Date().toLocaleTimeString();
      
      console.log('MIDI message received:', { status, data1, data2, statusHex: status.toString(16), type: getMidiMessageType(status) });
      
      const newMessage = {
        id: Date.now(),
        timestamp,
        status,
        data1,
        data2,
        type: getMidiMessageType(status),
        raw: Array.from(message.data)
      };
      
      setMidiMessages(prev => [...prev.slice(-49), newMessage]);
      
      // Handle CC messages for slider control
      const isControlChange = (status & 0xF0) === 0xB0;
      console.log('Is Control Change?', isControlChange, 'Status & 0xF0:', (status & 0xF0).toString(16));
      
      if (isControlChange) { // Control Change
        console.log('Calling handleCCMessage with:', data1, data2);
        handleCCMessage(data1, data2);
      }
    };
  };

  const handleCCMessage = (ccNumber, value) => {
    const normalizedValue = Math.round((value / 127) * 100);
    const currentLearning = isLearningRef.current;
    const currentMappings = ccMappingsRef.current;
    
    console.log('=== handleCCMessage DEBUG ===');
    console.log('ccNumber:', ccNumber, 'value:', value, 'normalizedValue:', normalizedValue);
    console.log('isLearning (state):', isLearning);
    console.log('isLearningRef.current:', isLearningRef.current);
    console.log('currentLearning:', currentLearning);
    console.log('ccMappings (state):', ccMappings);
    console.log('ccMappingsRef.current:', ccMappingsRef.current);
    console.log('currentMappings:', currentMappings);
    
    // Check if this CC is mapped to a slider
    console.log('Checking for existing CC mappings...');
    console.log('currentMappings entries:', Object.entries(currentMappings));
    
    Object.entries(currentMappings).forEach(([slider, cc]) => {
      console.log('Checking mapping:', slider, '-> CC', cc, 'against incoming CC', ccNumber);
      if (cc === ccNumber) {
        console.log('*** MATCH FOUND! Updating slider value:', slider, normalizedValue);
        setSliderValues(prev => {
          const newValues = {
            ...prev,
            [slider]: normalizedValue
          };
          console.log('New slider values:', newValues);
          return newValues;
        });
      } else {
        console.log('No match: CC', cc, '!== CC', ccNumber);
      }
    });
    
    // If learning mode is active, map the CC to the learning slider
    console.log('About to check learning condition...');
    if (currentLearning) {
      console.log('*** LEARNING CONDITION MET ***');
      console.log('Learning mode active, mapping CC:', ccNumber, 'to slider:', currentLearning);
      setCcMappings(prev => {
        const newMappings = {
          ...prev,
          [currentLearning]: ccNumber
        };
        console.log('New CC mappings:', newMappings);
        return newMappings;
      });
      setIsLearning(null);
      console.log('Learning mode cleared');
    } else {
      console.log('*** LEARNING CONDITION NOT MET ***');
      console.log('currentLearning is falsy:', currentLearning);
    }
    console.log('=== END handleCCMessage DEBUG ===');
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
    setSliderValues(prev => ({
      ...prev,
      [slider]: value
    }));
  };

  const startLearning = (slider) => {
    console.log('startLearning called for slider:', slider);
    console.log('Previous isLearning state:', isLearning);
    setIsLearning(slider);
    console.log('Setting isLearning to:', slider);
  };

  const clearMessages = () => {
    setMidiMessages([]);
  };

  const value = {
    midiAccess,
    midiInputs,
    selectedInput,
    midiMessages,
    isConnected,
    sliderValues,
    ccMappings,
    isLearning,
    connectToInput,
    handleSliderChange,
    startLearning,
    clearMessages
  };

  return (
    <MIDIContext.Provider value={value}>
      {children}
    </MIDIContext.Provider>
  );
};