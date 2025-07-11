import React from 'react';

const VerticalSlider = ({ label, value, onChange, mapping, isLearning, onLearn, onMappingChange }) => {
  const getMappingText = () => {
    if (!mapping) return 'Unmapped';
    
    const { messageType, channel, ccNumber } = mapping;
    const channelText = channel ? `Ch${channel}` : '';
    
    switch (messageType) {
      case 'cc':
        return `CC${ccNumber} ${channelText}`.trim();
      case 'hrcc':
        return `HRCC${ccNumber} ${channelText}`.trim();
      case 'note':
        return `Note${ccNumber} ${channelText}`.trim();
      default:
        return 'Unknown';
    }
  };
  
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
          <span className="text-xs text-gray-400" title="Current mapping">
            {getMappingText()}
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
          <button
            onClick={handleManualMapping}
            className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 text-gray-300"
            title="Manual mapping"
          >
            Map
          </button>
        </div>
      </div>
      <div className="relative h-32 w-8 bg-gray-700 rounded-lg">
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