import React from 'react';
import { useSelector } from 'react-redux';

const ControlPanel = () => {
  const { sliders, buttons } = useSelector(state => state.midi);

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
      <h2 className="text-lg font-semibold mb-4 text-orange-400">FX Buttons</h2>
      <div className="flex items-center justify-center space-x-6 mb-6">
        <div className="text-white">FX1: {buttons.fx1?.isPressed ? 'ON' : 'OFF'}</div>
        <div className="text-white">FX2: {buttons.fx2?.isPressed ? 'ON' : 'OFF'}</div>
      </div>
      
      <h2 className="text-lg font-semibold mb-4 text-orange-400">Control Sliders</h2>
      <div className="flex items-center justify-center space-x-8">
        <div className="text-white">L Volume: {sliders.lVolume?.value || 0}</div>
        <div className="text-white">X-Fader: {sliders.xFader?.value || 0}</div>
        <div className="text-white">R Volume: {sliders.rVolume?.value || 0}</div>
      </div>
    </div>
  );
};

export default ControlPanel;
