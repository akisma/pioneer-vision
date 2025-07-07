// App.jsx
import React from 'react';
import { MIDIProvider } from './context/MIDIContext';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import MIDIMonitor from './components/MIDIMonitor';
import './styles/globals.css';

const App = () => {
  return (
    <MIDIProvider>
      <div className="min-h-screen bg-gray-900 text-white font-mono">
        <Header />
        <div className="flex flex-col h-screen">
          <ControlPanel />
          <MIDIMonitor />
        </div>
      </div>
    </MIDIProvider>
  );
};

export default App;

// context/MIDIContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

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
      if ((status & 0xF0) === 0xB0) { // Control Change
        handleCCMessage(data1, data2);
      }
    };
  };

  const handleCCMessage = (ccNumber, value) => {
    const normalizedValue = Math.round((value / 127) * 100);
    
    // Check if this CC is mapped to a slider
    Object.entries(ccMappings).forEach(([slider, cc]) => {
      if (cc === ccNumber) {
        setSliderValues(prev => ({
          ...prev,
          [slider]: normalizedValue
        }));
      }
    });
    
    // If learning mode is active, map the CC to the learning slider
    if (isLearning) {
      setCcMappings(prev => ({
        ...prev,
        [isLearning]: ccNumber
      }));
      setIsLearning(null);
    }
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
    setIsLearning(slider);
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

// components/Header.jsx
import React from 'react';
import { useMIDI } from '../context/MIDIContext';

const Header = () => {
  const { midiInputs, selectedInput, isConnected, connectToInput, clearMessages } = useMIDI();

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-orange-400">PioneerVision</h1>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-300">
              {isConnected ? 'MIDI Connected' : 'MIDI Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
            onChange={(e) => {
              const input = midiInputs.find(i => i.id === e.target.value);
              if (input) connectToInput(input);
            }}
            value={selectedInput?.id || ''}
          >
            <option value="">Select MIDI Input</option>
            {midiInputs.map(input => (
              <option key={input.id} value={input.id}>
                {input.name}
              </option>
            ))}
          </select>
          
          <button 
            onClick={clearMessages}
            className="bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded text-sm transition-colors"
          >
            Clear Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;

// components/ControlPanel.jsx
import React from 'react';
import { useMIDI } from '../context/MIDIContext';
import VerticalSlider from './VerticalSlider';
import HorizontalSlider from './HorizontalSlider';

const ControlPanel = () => {
  const { sliderValues, ccMappings, isLearning, handleSliderChange, startLearning } = useMIDI();

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-6 text-orange-400">Control Sliders</h2>
      
      <div className="flex items-center justify-center space-x-12">
        <VerticalSlider
          label="L Volume"
          value={sliderValues.lVolume}
          onChange={(value) => handleSliderChange('lVolume', value)}
          ccMapping={ccMappings.lVolume}
          isLearning={isLearning === 'lVolume'}
          onLearn={() => startLearning('lVolume')}
        />

        <HorizontalSlider
          label="X-Fader"
          value={sliderValues.xFader}
          onChange={(value) => handleSliderChange('xFader', value)}
          ccMapping={ccMappings.xFader}
          isLearning={isLearning === 'xFader'}
          onLearn={() => startLearning('xFader')}
        />

        <VerticalSlider
          label="R Volume"
          value={sliderValues.rVolume}
          onChange={(value) => handleSliderChange('rVolume', value)}
          ccMapping={ccMappings.rVolume}
          isLearning={isLearning === 'rVolume'}
          onLearn={() => startLearning('rVolume')}
        />
      </div>
    </div>
  );
};

export default ControlPanel;

// components/VerticalSlider.jsx
import React from 'react';

const VerticalSlider = ({ label, value, onChange, ccMapping, isLearning, onLearn }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-2">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <div className="flex items-center space-x-2 ml-4">
          <span className="text-xs text-gray-400">
            {ccMapping ? `CC${ccMapping}` : 'Unmapped'}
          </span>
          <button
            onClick={onLearn}
            className={`px-2 py-1 text-xs rounded ${
              isLearning 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
            }`}
          >
            {isLearning ? 'Learning...' : 'Learn'}
          </button>
        </div>
      </div>
      <div className="relative h-48 w-8 bg-gray-700 rounded-lg">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute h-full w-8 appearance-none bg-transparent cursor-pointer slider-vertical"
          style={{ writingMode: 'bt-lr' }}
        />
        <div 
          className="absolute bottom-0 left-0 w-full bg-orange-500 rounded-lg transition-all duration-150"
          style={{ height: `${value}%` }}
        ></div>
      </div>
      <span className="text-sm text-gray-400 mt-2">{value}%</span>
    </div>
  );
};

export default VerticalSlider;

// components/HorizontalSlider.jsx
import React from 'react';

const HorizontalSlider = ({ label, value, onChange, ccMapping, isLearning, onLearn }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-2">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <div className="flex items-center space-x-2 ml-4">
          <span className="text-xs text-gray-400">
            {ccMapping ? `CC${ccMapping}` : 'Unmapped'}
          </span>
          <button
            onClick={onLearn}
            className={`px-2 py-1 text-xs rounded ${
              isLearning 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
            }`}
          >
            {isLearning ? 'Learning...' : 'Learn'}
          </button>
        </div>
      </div>
      <div className="relative h-8 w-64 bg-gray-700 rounded-lg">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute w-full h-8 appearance-none bg-transparent cursor-pointer"
        />
        <div 
          className="absolute top-0 left-0 h-full bg-orange-500 rounded-lg transition-all duration-150"
          style={{ width: `${value}%` }}
        ></div>
      </div>
      <span className="text-sm text-gray-400 mt-2">{value}%</span>
    </div>
  );
};

export default HorizontalSlider;

// components/MIDIMonitor.jsx
import React, { useRef, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { useMIDI } from '../context/MIDIContext';
import MIDIMessage from './MIDIMessage';

const MIDIMonitor = () => {
  const { midiMessages } = useMIDI();
  const messagesEndRef = useRef(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [midiMessages]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-orange-400 flex items-center">
            <Activity className="mr-2" size={20} />
            MIDI Monitor
          </h2>
          <div className="text-sm text-gray-400">
            {midiMessages.length} messages
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
        <div className="space-y-2">
          {midiMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <p>No MIDI messages received</p>
              <p className="text-sm">Connect a MIDI device and start playing</p>
            </div>
          ) : (
            midiMessages.map((message) => (
              <MIDIMessage key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default MIDIMonitor;

// components/MIDIMessage.jsx
import React from 'react';

const MIDIMessage = ({ message }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-orange-400 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-orange-400 font-mono text-sm">
            {message.timestamp}
          </span>
          <span className="bg-orange-500 text-black px-2 py-1 rounded text-xs font-semibold">
            {message.type}
          </span>
        </div>
        <div className="flex space-x-2 text-sm font-mono">
          {message.raw.map((byte, index) => (
            <span key={index} className="bg-gray-700 px-2 py-1 rounded">
              {byte.toString(16).padStart(2, '0').toUpperCase()}
            </span>
          ))}
        </div>
      </div>
      {message.type === 'Control Change' && (
        <div className="mt-2 text-sm text-gray-400">
          CC{message.data1}: {message.data2} ({Math.round((message.data2 / 127) * 100)}%)
        </div>
      )}
    </div>
  );
};

export default MIDIMessage;

// styles/globals.css
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-track {
  background: transparent;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #f97316;
  border: 2px solid #fff;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

input[type="range"]::-moz-range-track {
  background: transparent;
}

input[type="range"]::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #f97316;
  border: 2px solid #fff;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.slider-vertical {
  transform: rotate(-90deg);
  transform-origin: center;
}