import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HorizontalSlider from '../components/HorizontalSlider';

describe('HorizontalSlider', () => {
  const defaultProps = {
    label: 'Test Slider',
    value: 50,
    onChange: vi.fn(),
    mapping: null,
    isLearning: false,
    onLearn: vi.fn(),
    onMappingChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with label', () => {
    render(<HorizontalSlider {...defaultProps} />);
    expect(screen.getByText('Test Slider')).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(<HorizontalSlider {...defaultProps} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should show "Unmapped" when no mapping provided', () => {
    render(<HorizontalSlider {...defaultProps} />);
    expect(screen.getByText('Unmapped')).toBeInTheDocument();
  });

  it('should show mapping information when provided', () => {
    const mapping = {
      messageType: 'cc',
      ccNumber: 7,
      channel: 1
    };
    
    render(<HorizontalSlider {...defaultProps} mapping={mapping} />);
    expect(screen.getByText('CC7 Ch1')).toBeInTheDocument();
  });

  it('should call onChange when slider value changes', () => {
    const mockOnChange = vi.fn();
    render(<HorizontalSlider {...defaultProps} onChange={mockOnChange} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('75');
  });

  it('should call onLearn when Learn button is clicked', () => {
    const mockOnLearn = vi.fn();
    render(<HorizontalSlider {...defaultProps} onLearn={mockOnLearn} />);
    
    const learnButton = screen.getByText('Learn');
    fireEvent.click(learnButton);
    
    expect(mockOnLearn).toHaveBeenCalled();
  });

  it('should show "Learning... (ESC)" when isLearning is true', () => {
    render(<HorizontalSlider {...defaultProps} isLearning={true} />);
    expect(screen.getByText('Learning... (ESC)')).toBeInTheDocument();
  });

  it('should have correct tooltip when learning', () => {
    render(<HorizontalSlider {...defaultProps} isLearning={true} />);
    const learnButton = screen.getByText('Learning... (ESC)');
    expect(learnButton).toHaveAttribute('title', 'Learning... (Press Esc to cancel)');
  });

  it('should have correct tooltip when not learning', () => {
    render(<HorizontalSlider {...defaultProps} />);
    const learnButton = screen.getByText('Learn');
    expect(learnButton).toHaveAttribute('title', 'Learn MIDI mapping');
  });

  it('should render Map button', () => {
    render(<HorizontalSlider {...defaultProps} />);
    expect(screen.getByText('Map')).toBeInTheDocument();
  });

  it('should have correct slider range', () => {
    render(<HorizontalSlider {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
  });

  it('should set slider value correctly', () => {
    render(<HorizontalSlider {...defaultProps} value={75} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('75');
  });

  it('should update visual indicator with value', () => {
    const { container } = render(<HorizontalSlider {...defaultProps} value={30} />);
    const indicator = container.querySelector('[style*="width: 30%"]');
    expect(indicator).toBeInTheDocument();
  });
});
