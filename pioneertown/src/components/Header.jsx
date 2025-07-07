import React from 'react';
import { useMIDI } from '../hooks/useMIDI';

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