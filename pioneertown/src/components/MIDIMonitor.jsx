import React, { useRef, useEffect, useMemo } from 'react';
import { Activity } from 'lucide-react';
import { useSelector } from 'react-redux';
import MIDIMessage from './MIDIMessage';

const MIDIMonitor = React.memo(() => {
  const midiState = useSelector(state => state?.midi || {});
  const { midiMessages = [] } = midiState;
  const messagesEndRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Memoize the last few messages to reduce render load
  const displayMessages = useMemo(() => {
    // Only show the last 20 messages to prevent UI lag
    const maxDisplayMessages = 20;
    return midiMessages.slice(-maxDisplayMessages);
  }, [midiMessages]);

  // Throttled scroll to bottom
  useEffect(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      try {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end' 
        });
      } catch (error) {
        console.warn('Scroll error:', error);
      }
    }, 100); // Debounce scroll updates
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [displayMessages]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-orange-400 flex items-center">
            <Activity className="mr-2" size={20} />
            MIDI Monitor
          </h2>
          <div className="text-sm text-gray-400">
            {midiMessages.length} messages {displayMessages.length < midiMessages.length && `(showing last ${displayMessages.length})`}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900 min-h-0">
        <div className="space-y-2">
          {displayMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <p>No MIDI messages received</p>
              <p className="text-sm">Connect a MIDI device and start playing</p>
            </div>
          ) : (
            displayMessages.map((message) => (
              <MIDIMessage key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
});

MIDIMonitor.displayName = 'MIDIMonitor';

export default MIDIMonitor;