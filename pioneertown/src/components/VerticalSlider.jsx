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
          className="absolute h-full w-8 appearance-none bg-transparent cursor-pointer"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            width: '192px', // height of container (48 * 4 = 192px)
            height: '32px', // width of container (8 * 4 = 32px)
            left: '50%',
            top: '50%',
            marginLeft: '-96px', // -width/2
            marginTop: '-16px', // -height/2
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-full bg-orange-500 rounded-lg pointer-events-none"
          style={{ height: `${value}%` }}
        ></div>
      </div>
      <span className="text-sm text-gray-400 mt-2">{value}%</span>
    </div>
  );
};

export default VerticalSlider;