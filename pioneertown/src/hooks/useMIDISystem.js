/**
 * React hooks for the decoupled MIDI system
 */

import { useState, useEffect } from 'react';
import { midiMessageQueue } from '../midi/MIDIMessageQueue';
import { midiControlManager } from '../midi/MIDIControlManager';

/**
 * Hook for subscribing to MIDI message updates
 */
export const useMIDIMessages = () => {
  const [messageData, setMessageData] = useState({
    latestMessages: [],
    recentActivity: [],
    stats: {}
  });

  useEffect(() => {
    const unsubscribe = midiMessageQueue.subscribe((data) => {
      setMessageData(data);
    });

    // Get initial data
    setMessageData({
      latestMessages: midiMessageQueue.getAllLatestMessages(),
      recentActivity: midiMessageQueue.getRecentActivity(),
      stats: midiMessageQueue.getStats()
    });

    return unsubscribe;
  }, []);

  return messageData;
};

/**
 * Hook for subscribing to MIDI control state updates
 */
export const useMIDIControls = () => {
  const [controlState, setControlState] = useState({
    sliders: {},
    buttons: {},
    mappings: {},
    learningState: { isLearning: false, controlType: null, controlId: null }
  });

  useEffect(() => {
    const unsubscribe = midiControlManager.subscribe((state) => {
      setControlState(state);
    });

    // Get initial state
    setControlState({
      sliders: midiControlManager.getSliders(),
      buttons: midiControlManager.getButtons(),
      mappings: midiControlManager.getMappings(),
      learningState: { ...midiControlManager.learningState }
    });

    return unsubscribe;
  }, []);

  return {
    ...controlState,
    // Control methods
    mapControl: (controlId, controlType, messageType, channel, data1) =>
      midiControlManager.mapControl(controlId, controlType, messageType, channel, data1),
    unmapControl: (controlId) => midiControlManager.unmapControl(controlId),
    startLearning: (controlType, controlId) => midiControlManager.startLearning(controlType, controlId),
    stopLearning: () => midiControlManager.stopLearning(),
    getSlider: (sliderId) => midiControlManager.getSlider(sliderId),
    getButton: (buttonId) => midiControlManager.getButton(buttonId),
  };
};

/**
 * Hook for a specific slider
 */
export const useMIDISlider = (sliderId) => {
  const [sliderState, setSliderState] = useState({ value: 0, midiValue: 0, lastUpdated: 0 });

  useEffect(() => {
    const unsubscribe = midiControlManager.subscribe((state) => {
      if (state.sliders[sliderId]) {
        setSliderState(state.sliders[sliderId]);
      }
    });

    // Get initial state
    setSliderState(midiControlManager.getSlider(sliderId));

    return unsubscribe;
  }, [sliderId]);

  return sliderState;
};

/**
 * Hook for a specific button
 */
export const useMIDIButton = (buttonId) => {
  const [buttonState, setButtonState] = useState({ isPressed: false, value: 0, lastUpdated: 0 });

  useEffect(() => {
    const unsubscribe = midiControlManager.subscribe((state) => {
      if (state.buttons[buttonId]) {
        setButtonState(state.buttons[buttonId]);
      }
    });

    // Get initial state
    setButtonState(midiControlManager.getButton(buttonId));

    return unsubscribe;
  }, [buttonId]);

  return buttonState;
};

/**
 * Hook for MIDI message statistics
 */
export const useMIDIStats = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const unsubscribe = midiMessageQueue.subscribe((data) => {
      setStats(data.stats);
    });

    // Get initial stats
    setStats(midiMessageQueue.getStats());

    return unsubscribe;
  }, []);

  return stats;
};