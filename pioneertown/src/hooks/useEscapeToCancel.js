import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { stopLearning } from '../store/slices/midiSlice';

/**
 * Custom hook to handle escape key cancellation of MIDI learning mode
 */
export const useEscapeToCancel = () => {
  const dispatch = useDispatch();
  const learningState = useSelector(state => state.midi?.learningState);
  const learningStateRef = useRef(learningState);
  
  // Keep ref updated
  useEffect(() => {
    learningStateRef.current = learningState;
  }, [learningState]);
  
  // Extract values to avoid object reference issues
  const isInLearningMode = !!(learningState?.controlType && learningState?.controlId);
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if we're in learning mode and escape key was pressed
      if (event.key === 'Escape') {
        // Use ref to get current state
        const currentState = learningStateRef.current;
        
        if (currentState?.controlType && currentState?.controlId) {
          event.preventDefault();
          console.log('Learning mode cancelled by escape key');
          dispatch(stopLearning());
        }
      }
    };
    
    // Always add the listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch]); // Only depend on dispatch, which is stable
  
  // Return whether we're currently in learning mode
  return {
    isLearning: isInLearningMode,
    learningControl: learningState?.controlId,
    learningType: learningState?.controlType
  };
};
