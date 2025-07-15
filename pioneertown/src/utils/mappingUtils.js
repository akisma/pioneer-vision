/**
 * Utility function to get mapping text without rendering a component
 * @param {Object} mapping - The MIDI mapping object containing messageType, channel, and ccNumber
 * @returns {string} Formatted mapping text
 */
export const getMappingText = (mapping) => {
  if (!mapping) return 'Unmapped';
  
  const { messageType, channel, ccNumber } = mapping;
  const channelText = channel ? `Ch${channel}` : '';
  
  switch (messageType) {
    case 'cc':
      return `CC${ccNumber} ${channelText}`.trim();
    case 'hrcc':
      return `HRCC${ccNumber} ${channelText}`.trim();
    case 'note':
      return `Note${ccNumber} ${channelText}`.trim();
    default:
      return 'Unknown';
  }
};
