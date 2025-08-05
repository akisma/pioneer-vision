import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MappingDisplay from '../components/MappingDisplay';

describe('MappingDisplay', () => {
  it('should render "Unmapped" when no mapping is provided', () => {
    render(<MappingDisplay mapping={null} />);
    expect(screen.getByText('Unmapped')).toBeInTheDocument();
  });

  it('should render "Unmapped" when mapping is undefined', () => {
    render(<MappingDisplay />);
    expect(screen.getByText('Unmapped')).toBeInTheDocument();
  });

  it('should render CC mapping without channel', () => {
    const mapping = {
      messageType: 'cc',
      ccNumber: 7,
      channel: null
    };
    
    render(<MappingDisplay mapping={mapping} />);
    expect(screen.getByText('CC7')).toBeInTheDocument();
  });

  it('should render CC mapping with channel', () => {
    const mapping = {
      messageType: 'cc',
      ccNumber: 7,
      channel: 1
    };
    
    render(<MappingDisplay mapping={mapping} />);
    expect(screen.getByText('CC7 Ch1')).toBeInTheDocument();
  });

  it('should render HRCC mapping', () => {
    const mapping = {
      messageType: 'hrcc',
      ccNumber: 14,
      channel: 2
    };
    
    render(<MappingDisplay mapping={mapping} />);
    expect(screen.getByText('HRCC14 Ch2')).toBeInTheDocument();
  });

  it('should render Note mapping', () => {
    const mapping = {
      messageType: 'note',
      ccNumber: 60,
      channel: 3
    };
    
    render(<MappingDisplay mapping={mapping} />);
    expect(screen.getByText('Note60 Ch3')).toBeInTheDocument();
  });

  it('should render "Unknown" for invalid message type', () => {
    const mapping = {
      messageType: 'invalid',
      ccNumber: 7,
      channel: 1
    };
    
    render(<MappingDisplay mapping={mapping} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should have correct title attribute', () => {
    const mapping = {
      messageType: 'cc',
      ccNumber: 7,
      channel: 1
    };
    
    render(<MappingDisplay mapping={mapping} />);
    const element = screen.getByText('CC7 Ch1');
    expect(element).toHaveAttribute('title', 'Current mapping');
  });

  it('should have correct CSS classes', () => {
    const mapping = {
      messageType: 'cc',
      ccNumber: 7,
      channel: 1
    };
    
    render(<MappingDisplay mapping={mapping} />);
    const element = screen.getByText('CC7 Ch1');
    expect(element).toHaveClass('text-xs', 'text-gray-400');
  });
});
