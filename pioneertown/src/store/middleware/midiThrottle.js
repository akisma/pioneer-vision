import throttle from 'lodash.throttle';
import { MIDI_THROTTLE_RATE } from '../../config/performance.js';

/**
 * Redux middleware that throttles MIDI CC/HRCC messages to prevent UI flooding
 * Buffers messages by channel+CC combination and flushes at configured rate
 */
const createMidiThrottleMiddleware = () => {
  // Buffer for CC/HRCC messages - Key: `ch${channel}-cc${cc}`, Value: latest message
  const ccMessageBuffer = new Map();
  
  return (store) => {
    // Throttled function to flush buffered messages
    const flushCCBuffer = throttle(() => {
      if (ccMessageBuffer.size === 0) return;
      
      // Get all latest values for each channel+CC combination
      const batchedCCMessages = Array.from(ccMessageBuffer.values());
      ccMessageBuffer.clear();
      
      // Dispatch single batched update containing latest value per channel+CC
      store.dispatch({
        type: 'midi/updateMIDIControlsBatch',
        payload: batchedCCMessages
      });
    }, MIDI_THROTTLE_RATE);
    
    return (next) => (action) => {
      if (action.type === 'midi/messageReceived') {
        const { messageType, channel, cc } = action.payload;
        
        // Only throttle CC and HRCC messages
        if (messageType === 'controlchange' || messageType === 'hrcc') {
          // Create unique key for this channel+CC combination
          const key = `ch${channel}-cc${cc}`;
          
          // Store/overwrite with latest message for this specific channel+CC
          ccMessageBuffer.set(key, {
            ...action.payload,
            timestamp: action.payload.timestamp || Date.now()
          });
          
          // Trigger throttled flush
          flushCCBuffer();
          return; // Don't pass through immediately
        }
        
        // Pass through other message types immediately (Note On/Off, etc.)
        return next(action);
      }
      
      return next(action);
    };
  };
};

export default createMidiThrottleMiddleware;
