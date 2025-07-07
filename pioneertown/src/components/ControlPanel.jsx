import React from 'react';
import { useMIDI } from '../context/MIDIContext';
import VerticalSlider from './VerticalSlider';
import HorizontalSlider from './HorizontalSlider';

const ControlPanel = () => {
  const { sliderValues, ccMappings, isLearning, handleSliderChange, startLearning } = useMIDI();

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-6 text-orange-400">Control Sliders</h2>
      
      <div className="flex items-center justify-center space-x-12">
        <VerticalSlider
          label="L Volume"
          value={sliderValues.lVolume}
          onChange={(value) => handleSliderChange('lVolume', value)}
          ccMapping={ccMappings.lVolume}
          isLearning={isLearning === 'lVolume'}
          onLearn={() => startLearning('lVolume')}
        />

        <HorizontalSlider
          label="X-Fader"
          value={sliderValues.xFader}
          onChange={(value) => handleSliderChange('xFader', value)}
          ccMapping={ccMappings.xFader}
          isLearning={isLearning === 'xFader'}
          onLearn={() => startLearning('xFader')}
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
  );
};

export default ControlPanel;