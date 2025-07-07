import React from 'react';
import { useMIDI } from '../hooks/useMIDI';
import VerticalSlider from './VerticalSlider';
import HorizontalSlider from './HorizontalSlider';
import FXButton from './FXButton';

const ControlPanel = () => {
  const { 
    sliderValues, 
    buttonStates, 
    ccMappings, 
    isLearning, 
    handleSliderChange, 
    handleButtonToggle, 
    startLearning 
  } = useMIDI();

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-6">
      
      <div className="flex items-center justify-center space-x-12">
        <div className="flex flex-col items-center">
          <FXButton
            label="FX"
            isOn={buttonStates.lFX}
            onToggle={() => handleButtonToggle('lFX')}
            ccMapping={ccMappings.lFX}
            isLearning={isLearning === 'lFX'}
            onLearn={() => startLearning('lFX')}
          />
          <VerticalSlider
            label="L Volume"
            value={sliderValues.lVolume}
            onChange={(value) => handleSliderChange('lVolume', value)}
            ccMapping={ccMappings.lVolume}
            isLearning={isLearning === 'lVolume'}
            onLearn={() => startLearning('lVolume')}
          />
        </div>

        <HorizontalSlider
          label="X-Fader"
          value={sliderValues.xFader}
          onChange={(value) => handleSliderChange('xFader', value)}
          ccMapping={ccMappings.xFader}
          isLearning={isLearning === 'xFader'}
          onLearn={() => startLearning('xFader')}
        />

        <div className="flex flex-col items-center">
          <FXButton
            label="FX"
            isOn={buttonStates.rFX}
            onToggle={() => handleButtonToggle('rFX')}
            ccMapping={ccMappings.rFX}
            isLearning={isLearning === 'rFX'}
            onLearn={() => startLearning('rFX')}
          />
          <VerticalSlider
            label="R Volume"
            value={sliderValues.rVolume}
            onChange={(value) => handleSliderChange('rVolume', value)}
            ccMapping={ccMappings.rVolume}
            isLearning={isLearning === 'rVolume'}
            onLearn={() => startLearning('rVolume')}
          />
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;