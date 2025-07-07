import React from 'react';

const FXButton = ({ label, isOn, onToggle, ccMapping, isLearning, onLearn }) => {
  return (
    <div className="flex flex-col items-center mb-4">
      <div className="flex items-center justify-between w-full mb-2">
        <label className="text-xs font-medium text-gray-300">{label}</label>
        <div className="flex items-center space-x-2 ml-4">
          <span className="text-xs text-gray-400">
            {ccMapping ? `CC${ccMapping}` : 'Unmapped'}
          </span>
          <button
            onClick={onLearn}
            className={`px-1 py-0.5 text-xs rounded ${
              isLearning 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
            }`}
          >
            {isLearning ? 'Learning...' : 'Learn'}
          </button>
        </div>
      </div>
      
      {/* Lightswitch Button */}
      <div className="relative">
        <button
          onClick={onToggle}
          className={`
            w-8 h-12 bg-gray-700 border-2 border-gray-600 rounded-md
            shadow-inner transition-all duration-75
            ${isOn ? 'shadow-lg' : 'shadow-md'}
          `}
        >
          {/* Switch plate */}
          <div
            className={`
              w-6 h-4 mx-auto rounded-sm transition-all duration-75
              ${isOn 
                ? 'bg-orange-500 transform -translate-y-1 shadow-md' 
                : 'bg-gray-500 transform translate-y-1 shadow-sm'
              }
            `}
          />
        </button>
        
        {/* Status indicator */}
        <div className={`
          absolute -bottom-1 left-1/2 transform -translate-x-1/2
          w-2 h-2 rounded-full
          ${isOn ? 'bg-orange-400' : 'bg-gray-600'}
        `} />
      </div>
      
      <span className="text-xs text-gray-400 mt-1">
        {isOn ? 'ON' : 'OFF'}
      </span>
    </div>
  );
};

export default FXButton;
