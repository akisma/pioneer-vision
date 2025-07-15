import React from 'react';
import { getMappingText } from '../utils/mappingUtils';

/**
 * Component to display MIDI mapping information in a consistent format
 * @param {Object} mapping - The MIDI mapping object containing messageType, channel, and ccNumber
 * @returns {JSX.Element} Formatted mapping text in a span element
 */
const MappingDisplay = ({ mapping }) => {
  return (
    <span className="text-xs text-gray-400" title="Current mapping">
      {getMappingText(mapping)}
    </span>
  );
};

export default MappingDisplay;
