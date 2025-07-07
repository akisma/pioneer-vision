import React, { useRef, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { useMIDI } from '../hooks/useMIDI';
import MIDIMessage from './MIDIMessage';

const MIDIMonitor = () => {
  const { midiMessages } = useMIDI();
  const messagesEndRef = useRef(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [midiMessages]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-orange-400 flex items-center">
            <Activity className="mr-2" size={20} />
            MIDI Monitor
          </h2>
          <div className="text-sm text-gray-400">
            {midiMessages.length} messages
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900 min-h-0">
        <div className="space-y-2">
          {midiMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <p>No MIDI messages received</p>
              <p className="text-sm">Connect a MIDI device and start playing</p>
            </div>
          ) : (
            midiMessages.map((message) => (
              <MIDIMessage key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default MIDIMonitor;