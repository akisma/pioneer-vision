import React from 'react';
import { Activity } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { clearMidiMessages } from '../store/slices/midiSlice';

const MIDIMonitor = () => {
  const dispatch = useDispatch();
  const latestMessages = useSelector(state => state.midi?.latestMessages || {});
  const recentActivity = useSelector(state => state.midi?.recentActivity || []);

  const handleClearMessages = () => {
    dispatch(clearMidiMessages());
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const seconds = Math.floor(timestamp / 1000) % 60;
    const minutes = Math.floor(timestamp / 60000) % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Convert latest messages to array for display
  const latestMessagesArray = Object.values(latestMessages);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-orange-400 flex items-center">
            <Activity className="mr-2" size={20} />
            MIDI Monitor
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              {latestMessagesArray.length} active controls, {recentActivity.length} recent
            </div>
            <button 
              onClick={handleClearMessages}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-gray-900 min-h-0">
        {/* Current Control States */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-orange-400 font-medium mb-3">Current Control States</h3>
          {latestMessagesArray.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <p>No active controls</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {latestMessagesArray.map((message) => (
                <div key={message.key} className="bg-blue-900/30 border border-blue-700/50 rounded p-3 text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-blue-300 font-medium">{message.type}</span>
                    <span className="text-xs text-gray-400">Ch{message.channel}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-blue-400 font-bold">
                      {message.type === 'Control Change' ? `CC${message.data1}` : 
                       message.type === 'Note On' || message.type === 'Note Off' ? `Note${message.data1}` :
                       `${message.data1}`}
                    </span>
                    <span className="text-green-400 font-bold text-lg">{message.data2}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="p-4">
          <h3 className="text-orange-400 font-medium mb-3">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <p>No MIDI messages received</p>
              <p className="text-sm">Connect a MIDI device and start playing</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentActivity.slice(0, 20).map((message, index) => (
                <div key={`${message.id}-${index}`} className="bg-gray-800/50 rounded px-3 py-2 text-sm flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-12">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    <span className="text-gray-300">{message.type}</span>
                    <span className="text-blue-400">Ch{message.channel}</span>
                  </div>
                  <div className="text-gray-400 font-mono text-xs">
                    {(message.status || 0).toString(16).toUpperCase()} {message.data1 || 0} {message.data2 || 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MIDIMonitor;