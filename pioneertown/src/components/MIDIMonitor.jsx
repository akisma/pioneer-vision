import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearMidiMessages } from '../store/slices/midiSlice';

const MIDIMonitor = () => {
  const dispatch = useDispatch();
  
  // Get MIDI state from Redux - use recentActivity for messages
  const { 
    recentActivity, 
    latestMessages, 
    isConnected,
    midiInputs,
    selectedInput
  } = useSelector((state) => state.midi);

  // Use recentActivity for recent activity display
  const displayMessages = recentActivity || [];
  
  // Get current control states for display
  const currentStates = latestMessages || {};

  const clearMessages = () => {
    dispatch(clearMidiMessages());
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'No timestamp';
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + '.' + String(date.getMilliseconds()).padStart(3, '0');
  };

  const formatMessageType = (type) => {
    if (!type) return 'Unknown';
    return type.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className="flex-1 bg-gray-800 p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">MIDI Monitor</h2>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-900 text-green-300 border border-green-600' 
              : 'bg-red-900 text-red-300 border border-red-600'
          }`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          <button 
            onClick={clearMessages} 
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Clear Messages
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full overflow-hidden">
        {/* Current Control States */}
        <div className="bg-gray-900 rounded-lg p-4 overflow-hidden">
          <h3 className="text-lg font-semibold mb-3 text-orange-400">Current Control States</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Object.keys(currentStates).length === 0 ? (
              <div className="text-gray-400 text-center py-4">No control states available</div>
            ) : (
              Object.entries(currentStates).map(([key, message]) => (
                <div key={key} className="bg-gray-800 p-3 rounded border border-gray-700">
                  <div className="text-sm font-medium text-orange-300">{key}</div>
                  <div className="text-xs text-gray-300 mt-1">
                    Ch:{message.channel} | CC:{message.data1} | Val:{message.data2}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Message Activity */}
        <div className="bg-gray-900 rounded-lg p-4 overflow-hidden">
          <h3 className="text-lg font-semibold mb-3 text-orange-400">
            Recent Message Activity ({displayMessages.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {displayMessages.length === 0 ? (
              <div className="text-gray-400 text-center py-4">
                <div>No MIDI messages received</div>
                <div className="text-xs mt-2 space-y-1">
                  <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
                  <div>Available Inputs: {midiInputs?.length || 0}</div>
                  <div>Selected: {selectedInput?.name || 'None'}</div>
                  <div>Messages Array Length: {displayMessages?.length || 0}</div>
                </div>
              </div>
            ) : (
              displayMessages.map((message, index) => (
                <div key={message.id || index} className="bg-gray-800 p-3 rounded border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs text-gray-400">
                      {formatTimestamp(message.timestamp)}
                    </div>
                    <div className="text-xs text-blue-400 font-medium">
                      {formatMessageType(message.type)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">
                    Ch: {message.channel} | 
                    {message.type && message.type.toLowerCase().includes('note') ? 
                      ` Note: ${message.data1} | Vel: ${message.data2}` : 
                      ` CC: ${message.data1} | Val: ${message.data2}`
                    }
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Raw: [{message.status}, {message.data1}, {message.data2}]
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MIDIMonitor;