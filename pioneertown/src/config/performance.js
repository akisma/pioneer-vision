// Performance configuration for MIDI throttling
export const PERFORMANCE_CONFIG = {
  // Main throttle rate for CC/HRCC messages (milliseconds)
  MIDI_THROTTLE_RATE: 1,
  
  // Fallback throttle rate for slower devices (milliseconds)
  FALLBACK_THROTTLE_RATE: 5,
  
  // Maximum stored messages in monitor
  MESSAGE_LIMIT: 25,
  
  // Maximum displayed messages in monitor
  DISPLAY_LIMIT: 20,
  
  // Threshold for auto-adjustment (messages per second)
  AUTO_ADJUST_THRESHOLD: 100
};

// Easy access to main throttle rate
export const MIDI_THROTTLE_RATE = PERFORMANCE_CONFIG.MIDI_THROTTLE_RATE;
export const MESSAGE_LIMIT = PERFORMANCE_CONFIG.MESSAGE_LIMIT;
