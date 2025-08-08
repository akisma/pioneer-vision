/**
 * MIDI Control State Manager
 * 
 * Manages the state of MIDI-controlled elements (sliders, buttons)
 * separately from message storage. Subscribes to message queue
 * and updates control states based on mappings.
 */

import { midiMessageQueue } from './MIDIMessageQueue.js';

class MIDIControlManager {
  constructor() {
    // Control states
    this.sliders = new Map();
    this.buttons = new Map();
    
    // Mappings: controlId -> { messageType, channel, data1 }
    this.mappings = new Map();
    
    // Learning state
    this.learningState = {
      isLearning: false,
      controlType: null, // 'slider' | 'button'
      controlId: null
    };
    
    // Subscribers for control state changes
    this.subscribers = new Set();
    
    // Redux dispatch function (set by useMIDI hook)
    this.dispatch = null;
    
    // Subscribe to message queue
    this.messageQueueUnsubscribe = midiMessageQueue.subscribe(
      this.handleMessageUpdate.bind(this)
    );
    
    // Performance optimization: batch updates
    this.pendingUpdates = new Set();
    this.updateScheduled = false;
  }
  
  /**
   * Set Redux dispatch function for legacy compatibility
   */
  setDispatch(dispatch) {
    this.dispatch = dispatch;
  }
  
  /**
   * Handle updates from message queue
   */
  handleMessageUpdate({ latestMessages }) {
    latestMessages.forEach(message => {
      this.processMessageForControls(message);
    });
  }
  
  /**
   * Process a message for mapped controls
   */
  processMessageForControls(message) {
    const { messageType, channel, data1, value } = message;
    
    console.log('Processing message for controls:', { messageType, channel, data1, value });
    
    // Handle learning mode first
    if (this.learningState.isLearning) {
      this.completeLearning(messageType, channel, data1);
      return;
    }
    
    // Check all mappings for matches
    let foundMapping = false;
    for (const [controlId, mapping] of this.mappings.entries()) {
      if (this.isMessageForControl(message, mapping)) {
        console.log('Found mapping for control:', controlId, mapping);
        this.updateControlFromMessage(controlId, mapping.controlType, message);
        foundMapping = true;
      }
    }
    
    if (!foundMapping) {
      console.log('No mapping found for message:', { messageType, channel, data1 });
      console.log('Available mappings:', Array.from(this.mappings.entries()));
    }
  }
  
  /**
   * Check if message matches control mapping
   */
  isMessageForControl(message, mapping) {
    return (
      mapping.messageType === message.messageType &&
      mapping.channel === message.channel &&
      mapping.data1 === message.data1
    );
  }
  
  /**
   * Update control state from message
   */
  updateControlFromMessage(controlId, controlType, message) {
    if (controlType === 'slider') {
      this.updateSlider(controlId, message.value);
    } else if (controlType === 'button') {
      this.updateButton(controlId, message);
    }
  }
  
  /**
   * Update slider value
   */
  updateSlider(sliderId, midiValue) {
    // Convert MIDI value (0-127) to percentage (0-100)
    const percentage = Math.round((midiValue / 127) * 100);
    
    console.log('Updating slider:', sliderId, 'MIDI value:', midiValue, 'Percentage:', percentage);
    
    const currentSlider = this.sliders.get(sliderId);
    const newValue = {
      value: percentage,
      midiValue: midiValue,
      lastUpdated: Date.now()
    };
    
    // Only update if value changed
    if (!currentSlider || currentSlider.value !== percentage) {
      this.sliders.set(sliderId, newValue);
      
      // Also dispatch to Redux for legacy UI components
      if (this.dispatch) {
        console.log('Dispatching Redux action for slider:', sliderId, percentage);
        this.dispatch({
          type: 'midi/updateSliderValue',
          payload: { id: sliderId, value: percentage }
        });
      } else {
        console.warn('No dispatch function available for Redux bridge');
      }
      
      this.scheduleUpdate();
    }
  }
  
  /**
   * Update button state
   */
  updateButton(buttonId, message) {
    const { messageType, value } = message;
    
    let isPressed = false;
    
    if (messageType === 'noteon') {
      isPressed = value > 0;
    } else if (messageType === 'controlchange') {
      // CC messages: >= 64 = pressed
      isPressed = value >= 64;
    }
    
    const currentButton = this.buttons.get(buttonId);
    const newState = {
      isPressed,
      value: value,
      lastUpdated: Date.now()
    };
    
    // Only update if state changed
    if (!currentButton || currentButton.isPressed !== isPressed) {
      this.buttons.set(buttonId, newState);
      
      // Also dispatch to Redux for legacy UI components
      if (this.dispatch) {
        this.dispatch({
          type: 'midi/updateButtonState',
          payload: { id: buttonId, isPressed }
        });
      }
      
      this.scheduleUpdate();
    }
  }
  
  /**
   * Map a control to a MIDI message
   */
  mapControl(controlId, controlType, messageType, channel, data1) {
    this.mappings.set(controlId, {
      controlType,
      messageType,
      channel,
      data1
    });
    
    // Initialize control state if it doesn't exist
    if (controlType === 'slider' && !this.sliders.has(controlId)) {
      this.sliders.set(controlId, { value: 0, midiValue: 0, lastUpdated: Date.now() });
    } else if (controlType === 'button' && !this.buttons.has(controlId)) {
      this.buttons.set(controlId, { isPressed: false, value: 0, lastUpdated: Date.now() });
    }
    
    this.scheduleUpdate();
  }
  
  /**
   * Remove control mapping
   */
  unmapControl(controlId) {
    this.mappings.delete(controlId);
    this.scheduleUpdate();
  }
  
  /**
   * Start learning mode
   */
  startLearning(controlType, controlId) {
    this.learningState = {
      isLearning: true,
      controlType,
      controlId
    };
  }
  
  /**
   * Stop learning mode
   */
  stopLearning() {
    this.learningState = {
      isLearning: false,
      controlType: null,
      controlId: null
    };
  }
  
  /**
   * Complete learning process
   */
  completeLearning(messageType, channel, data1) {
    const { controlType, controlId } = this.learningState;
    
    if (controlType && controlId) {
      this.mapControl(controlId, controlType, messageType, channel, data1);
    }
    
    this.stopLearning();
  }
  
  /**
   * Get all slider states
   */
  getSliders() {
    return Object.fromEntries(this.sliders);
  }
  
  /**
   * Get all button states
   */
  getButtons() {
    return Object.fromEntries(this.buttons);
  }
  
  /**
   * Get specific slider value
   */
  getSlider(sliderId) {
    return this.sliders.get(sliderId) || { value: 0, midiValue: 0, lastUpdated: 0 };
  }
  
  /**
   * Get specific button state
   */
  getButton(buttonId) {
    return this.buttons.get(buttonId) || { isPressed: false, value: 0, lastUpdated: 0 };
  }
  
  /**
   * Get all mappings
   */
  getMappings() {
    return Object.fromEntries(this.mappings);
  }
  
  /**
   * Subscribe to control state updates
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }
  
  /**
   * Schedule batched update notification
   */
  scheduleUpdate() {
    if (!this.updateScheduled) {
      this.updateScheduled = true;
      
      requestAnimationFrame(() => {
        this.notifySubscribers();
        this.updateScheduled = false;
      });
    }
  }
  
  /**
   * Notify subscribers of state changes
   */
  notifySubscribers() {
    const state = {
      sliders: this.getSliders(),
      buttons: this.getButtons(),
      mappings: this.getMappings(),
      learningState: { ...this.learningState }
    };
    
    this.subscribers.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in MIDI control subscriber:', error);
      }
    });
  }
  
  /**
   * Clear all control states
   */
  clear() {
    this.sliders.clear();
    this.buttons.clear();
    this.mappings.clear();
    this.stopLearning();
    this.scheduleUpdate();
  }
  
  /**
   * Cleanup
   */
  destroy() {
    if (this.messageQueueUnsubscribe) {
      this.messageQueueUnsubscribe();
    }
    this.subscribers.clear();
  }
}

// Global singleton instance
export const midiControlManager = new MIDIControlManager();

// Export the class for testing
export { MIDIControlManager };