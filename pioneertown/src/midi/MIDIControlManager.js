/**
 * MIDI Control Manager - Handles learning and mapping MIDI controls
 */
class MIDIControlManager {
  constructor() {
    this.mappings = new Map();
    this.sliders = new Map();
    this.buttons = new Map();
    this.learningState = {
      isLearning: false,
      controlType: null,
      controlId: null
    };
    this.subscribers = [];
    this.dispatch = null;
    this.updateScheduled = false;
  }

  /**
   * Set Redux dispatch function for state bridging
   */
  setDispatch(dispatch) {
    this.dispatch = dispatch;
  }

  /**
   * Subscribe to control manager updates
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers of state changes
   */
  notifySubscribers() {
    const state = {
      mappings: Object.fromEntries(this.mappings),
      sliders: Object.fromEntries(this.sliders),
      buttons: Object.fromEntries(this.buttons),
      learningState: { ...this.learningState }
    };

    this.subscribers.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in subscriber:', error);
      }
    });
  }

  /**
   * Process a message for mapped controls
   */
  processMessageForControls(message) {
    const { messageType, channel, data1 } = message;
    
    // Handle learning mode first
    if (this.learningState.isLearning) {
      
      // Check if this CC is already mapped to prevent conflicts
      const existingMapping = Array.from(this.mappings.entries()).find(([, mapping]) => 
        mapping.messageType === messageType && 
        mapping.channel === channel && 
        mapping.data1 === data1
      );
      
      if (existingMapping) {
        const [existingControlId] = existingMapping;
        
        // Remove the existing mapping to prevent conflicts
        this.mappings.delete(existingControlId);
      }
      
      const { controlType, controlId } = this.learningState;
      
      this.completeControlLearning(controlType, controlId, messageType, channel, data1);
      return;
    }
    
    // Check all mappings for matches
    for (const [controlId, mapping] of this.mappings.entries()) {
      if (this.isMessageForControl(message, mapping)) {
        this.updateControlFromMessage(controlId, mapping.controlType, message);
      }
    }
  }

  /**
   * Check if a message matches a control mapping
   */
  isMessageForControl(message, mapping) {
    return message.messageType === mapping.messageType &&
           message.channel === mapping.channel &&
           message.data1 === mapping.data1;
  }

  /**
   * Update control from MIDI message
   */
  updateControlFromMessage(controlId, controlType, message) {
    switch (controlType) {
      case 'slider':
        this.updateSlider(controlId, message.value || message.data2);
        break;
      case 'button':
        this.updateButton(controlId, message.value > 0);
        break;
    }
  }

  /**
   * Update slider value
   */
  updateSlider(sliderId, midiValue) {
    // Convert MIDI value (0-127) to percentage (0-100)
    const percentage = Math.round((midiValue / 127) * 100);
    
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
  updateButton(buttonId, isPressed) {
    const currentButton = this.buttons.get(buttonId);
    const newState = {
      isPressed,
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
   * Schedule an update notification
   */
  scheduleUpdate() {
    if (!this.updateScheduled) {
      this.updateScheduled = true;
      setTimeout(() => {
        this.notifySubscribers();
        this.updateScheduled = false;
      }, 16); // ~60fps
    }
  }

  /**
   * Start learning mode for a control
   */
  startLearning(controlType, controlId) {
    this.learningState = {
      isLearning: true,
      controlType,
      controlId
    };
    
    this.scheduleUpdate();
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
    
    // Also dispatch to Redux to sync UI state
    if (this.dispatch) {
      // Import the action creator if available, otherwise use raw action
      try {
        // We'll use the raw action for now since we don't want to create circular imports
        this.dispatch({
          type: 'midi/stopLearning'
        });
      } catch (error) {
        console.warn('Could not dispatch stopLearning action:', error);
      }
    }
    
    this.scheduleUpdate();
  }

  /**
   * Complete learning for a control
   */
  completeControlLearning(controlType, controlId, messageType, channel, data1) {
    // Create the mapping
    this.mapControl(controlId, controlType, messageType, channel, data1);
    
    // Stop learning mode
    this.stopLearning();
  }

  /**
   * Map a control to a MIDI message
   */
  mapControl(controlId, controlType, messageType, channel, data1) {
    const mapping = {
      controlType,
      messageType,
      channel,
      data1
    };
    
    this.mappings.set(controlId, mapping);
    this.scheduleUpdate();
  }

  /**
   * Get all current mappings
   */
  getMappings() {
    return Object.fromEntries(this.mappings);
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
   * Clear all mappings and states
   */
  clear() {
    this.mappings.clear();
    this.sliders.clear();
    this.buttons.clear();
    this.scheduleUpdate();
  }
}

// Create and export singleton instance
export const midiControlManager = new MIDIControlManager();