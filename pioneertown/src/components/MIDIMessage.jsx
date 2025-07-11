import React from 'react';

const MIDIMessage = React.memo(({ message }) => {
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
      {(message.type === 'Note On' || message.type === 'Note Off') && (
        <div className="mt-2 text-sm text-gray-400">
          Note{message.data1}: {message.data2} velocity
        </div>
      )}
    </div>
  );
});

MIDIMessage.displayName = 'MIDIMessage';

export default MIDIMessage;