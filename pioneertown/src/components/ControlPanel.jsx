import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateSliderValue, updateButtonState, startLearning, updateMappingValue } from '../store/slices/midiSlice';
import VerticalSlider from './VerticalSlider';
import HorizontalSlider from './HorizontalSlider';
import FXButton from './FXButton';

const ControlPanel = () => {
  const dispatch = useDispatch();
  
  // Add defensive selector with fallback values
  const midiState = useSelector(state => state?.midi || {});
  const { 
    sliders = {}, 
    buttons = {}, 
    learningState = { controlType: null, controlId: null }, 
    mappings = { slider: {}, button: {} } 
  } = midiState;
  
  const handleSliderChange = (sliderId, value) => {
    dispatch(updateSliderValue({ id: sliderId, value: parseFloat(value) }));
  };
  
  const handleButtonPress = (buttonId) => {
    dispatch(updateButtonState({ id: buttonId, isPressed: true }));
  };
  
  const handleButtonRelease = (buttonId) => {
    dispatch(updateButtonState({ id: buttonId, isPressed: false }));
  };
  
  const handleStartLearning = (controlType, controlId) => {
    dispatch(startLearning({ controlType, controlId }));
  };
  
  const handleMappingChange = (controlType, controlId, messageType, channel, ccNumber) => {
    dispatch(updateMappingValue({ 
      controlType, 
      controlId, 
      messageType,
      channel,
      ccNumber 
    }));
  };
  
  const getSliderMapping = (sliderId) => {
    return mappings?.slider?.[sliderId] || null;
  };
  
  const getButtonMapping = (buttonId) => {
    return mappings?.button?.[buttonId] || null;
  };
  
  const isSliderLearning = (sliderId) => {
    return learningState?.controlType === 'slider' && learningState?.controlId === sliderId;
  };
  
  const isButtonLearning = (buttonId) => {
    return learningState?.controlType === 'button' && learningState?.controlId === buttonId;
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
      <h2 className="text-lg font-semibold mb-4 text-orange-400">FX Buttons</h2>
      
      <div className="flex items-center justify-center space-x-6 mb-6">
        <FXButton
          label="FX1"
          isPressed={buttons.fx1?.isPressed || false}
          onPress={() => handleButtonPress('fx1')}
          onRelease={() => handleButtonRelease('fx1')}
          mapping={getButtonMapping('fx1')}
          isLearning={isButtonLearning('fx1')}
          onLearn={() => handleStartLearning('button', 'fx1')}
          onMappingChange={(messageType, channel, ccNumber) => 
            handleMappingChange('button', 'fx1', messageType, channel, ccNumber)
          }
        />
        
        <FXButton
          label="FX2"
          isPressed={buttons.fx2?.isPressed || false}
          onPress={() => handleButtonPress('fx2')}
          onRelease={() => handleButtonRelease('fx2')}
          mapping={getButtonMapping('fx2')}
          isLearning={isButtonLearning('fx2')}
          onLearn={() => handleStartLearning('button', 'fx2')}
          onMappingChange={(messageType, channel, ccNumber) => 
            handleMappingChange('button', 'fx2', messageType, channel, ccNumber)
          }
        />
      </div>
      
      <h2 className="text-lg font-semibold mb-4 text-orange-400">Control Sliders</h2>
      
      <div className="flex items-center justify-center space-x-8">
        <VerticalSlider
          label="L Volume"
          value={sliders.lVolume?.value || 50}
          onChange={(value) => handleSliderChange('lVolume', value)}
          mapping={getSliderMapping('lVolume')}
          isLearning={isSliderLearning('lVolume')}
          onLearn={() => handleStartLearning('slider', 'lVolume')}
          onMappingChange={(messageType, channel, ccNumber) => 
            handleMappingChange('slider', 'lVolume', messageType, channel, ccNumber)
          }
        />

        <HorizontalSlider
          label="X-Fader"
          value={sliders.xFader?.value || 30}
          onChange={(value) => handleSliderChange('xFader', value)}
          mapping={getSliderMapping('xFader')}
          isLearning={isSliderLearning('xFader')}
          onLearn={() => handleStartLearning('slider', 'xFader')}
          onMappingChange={(messageType, channel, ccNumber) => 
            handleMappingChange('slider', 'xFader', messageType, channel, ccNumber)
          }
        />

        <VerticalSlider
          label="R Volume"
          value={sliders.rVolume?.value || 75}
          onChange={(value) => handleSliderChange('rVolume', value)}
          mapping={getSliderMapping('rVolume')}
          isLearning={isSliderLearning('rVolume')}
          onLearn={() => handleStartLearning('slider', 'rVolume')}
          onMappingChange={(messageType, channel, ccNumber) => 
            handleMappingChange('slider', 'rVolume', messageType, channel, ccNumber)
          }
        />
      </div>
    </div>
  );
};

export default ControlPanel;