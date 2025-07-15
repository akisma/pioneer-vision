import React from 'react';
import MappingDisplay from './MappingDisplay';

const FXButton = ({ label, isPressed, onPress, onRelease, mapping, isLearning, onLearn, onMappingChange }) => {
  
  const handleManualMapping = () => {
    const messageType = prompt('Enter message type (cc, hrcc, note):', 'note');
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
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center justify-between w-full">
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
      
      <button
        onMouseDown={onPress}
        onMouseUp={onRelease}
        onMouseLeave={onRelease}
        className={`w-16 h-16 rounded-lg border-2 transition-all duration-150 ${
          isPressed 
            ? 'bg-orange-500 border-orange-400 text-white shadow-lg' 
            : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
        }`}
      >
        FX
      </button>
    </div>
  );
};

export default FXButton;
