import React from 'react';
import MappingDisplay from './MappingDisplay';

const HorizontalSlider = ({ label, value, onChange, mapping, isLearning, onLearn, onMappingChange }) => {
  
  const handleManualMapping = () => {
    const messageType = prompt('Enter message type (cc, hrcc, note):', 'cc');
    if (!messageType) return;
    
    const channel = prompt('Enter channel (1-16, or leave empty for any):', '');
    const ccNumber = prompt('Enter CC/Note number (0-127):', '');
    
    if (ccNumber && !isNaN(ccNumber)) {
      onMappingChange?.(
        messageType, 
        channel ? parseInt(channel) : null, 
        parseInt(ccNumber)
      );
    }
  };
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-2">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <div className="flex items-center space-x-2 ml-4">
          <MappingDisplay mapping={mapping} />
          <button
            onClick={onLearn}
            className={`px-2 py-1 text-xs rounded ${
              isLearning 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
            }`}
            title={isLearning ? 'Learning... (Press Esc to cancel)' : 'Learn MIDI mapping'}
          >
            {isLearning ? 'Learning... (ESC)' : 'Learn'}
          </button>
          <button
            onClick={handleManualMapping}
            className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 text-gray-300"
            title="Manual mapping"
          >
            Map
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