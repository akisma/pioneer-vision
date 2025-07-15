import { describe, it, expect } from 'vitest';
import { getMappingText } from '../utils/mappingUtils';

describe('getMappingText', () => {
  it('should return "Unmapped" for null mapping', () => {
    expect(getMappingText(null)).toBe('Unmapped');
  });

  it('should return "Unmapped" for undefined mapping', () => {
    expect(getMappingText(undefined)).toBe('Unmapped');
  });

  it('should return "Unknown" for empty object', () => {
    expect(getMappingText({})).toBe('Unknown');
  });

  it('should format CC mapping without channel', () => {
    const mapping = {
      messageType: 'cc',
      ccNumber: 7,
      channel: null
    };
    
    expect(getMappingText(mapping)).toBe('CC7');
  });

  it('should format CC mapping with channel', () => {
    const mapping = {
      messageType: 'cc',
      ccNumber: 7,
      channel: 1
    };
    
    expect(getMappingText(mapping)).toBe('CC7 Ch1');
  });

  it('should format HRCC mapping', () => {
    const mapping = {
      messageType: 'hrcc',
      ccNumber: 14,
      channel: 2
    };
    
    expect(getMappingText(mapping)).toBe('HRCC14 Ch2');
  });

  it('should format Note mapping', () => {
    const mapping = {
      messageType: 'note',
      ccNumber: 60,
      channel: 10
    };
    
    expect(getMappingText(mapping)).toBe('Note60 Ch10');
  });

  it('should return "Unknown" for unsupported message type', () => {
    const mapping = {
      messageType: 'pitchbend',
      ccNumber: 0,
      channel: 1
    };
    
    expect(getMappingText(mapping)).toBe('Unknown');
  });

  it('should handle channel 0 as falsy', () => {
    const mapping = {
      messageType: 'cc',
      ccNumber: 7,
      channel: 0
    };
    
    expect(getMappingText(mapping)).toBe('CC7');
  });

  it('should handle high CC numbers', () => {
    const mapping = {
      messageType: 'cc',
      ccNumber: 127,
      channel: 16
    };
    
    expect(getMappingText(mapping)).toBe('CC127 Ch16');
  });

  it('should trim whitespace correctly', () => {
    const mapping = {
      messageType: 'cc',
      ccNumber: 1,
      channel: null
    };
    
    const result = getMappingText(mapping);
    expect(result).toBe('CC1');
    expect(result).not.toMatch(/\s$/); // No trailing whitespace
  });
});
