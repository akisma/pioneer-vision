/**
 * MIDI System - Decoupled Architecture
 * 
 * This module provides a completely decoupled MIDI message processing system
 * that separates message reception/storage from UI rendering and control state.
 * 
 * Architecture:
 * 1. MIDIMessageQueue - Raw message storage and management
 * 2. MIDIControlManager - Control state management (sliders/buttons)
 * 3. React hooks - UI integration layer
 * 
 * Usage:
 * import { useMIDIMessages, useMIDIControls } from './midi';
 */

// Core managers
export { midiMessageQueue, MIDIMessageQueue } from './MIDIMessageQueue.js';
export { midiControlManager, MIDIControlManager } from './MIDIControlManager.js';

// React hooks
export {
  useMIDIMessages,
  useMIDIControls,
  useMIDISlider,
  useMIDIButton,
  useMIDIStats
} from '../hooks/useMIDISystem.js';