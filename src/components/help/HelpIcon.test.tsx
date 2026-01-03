import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HelpIcon } from './HelpIcon';

describe('HelpIcon', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with default aria-label', () => {
    render(<HelpIcon />);
    expect(screen.getByLabelText('Help information')).toBeInTheDocument();
  });

  it('renders with custom aria-label', () => {
    render(<HelpIcon ariaLabel="More info" />);
    expect(screen.getByLabelText('More info')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<HelpIcon onClick={onClick} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows tooltip content on hover', () => {
    render(<HelpIcon helpText="Detailed help text" />);
    const button = screen.getByRole('button');
    
    // Initial state: tooltip hidden
    const tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(tooltip).toHaveClass('invisible');

    fireEvent.mouseEnter(button);
    
    act(() => {
      vi.runAllTimers();
    });

    expect(tooltip).toHaveClass('visible');
    expect(tooltip).toHaveTextContent('Detailed help text');
  });

  it('is keyboard accessible', () => {
    render(<HelpIcon />);
    const button = screen.getByRole('button');
    
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('applies custom className to the button', () => {
    render(<HelpIcon className="custom-test-class" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-test-class');
  });

  it('prevents tooltip toggle on click when onClick is provided', () => {
    const onClick = vi.fn();
    render(<HelpIcon helpText="Tooltip text" onClick={onClick} />);
    
    const button = screen.getByRole('button');
    const tooltip = screen.getByRole('tooltip', { hidden: true });

    // Simulate touch to enable toggleTooltip in Tooltip component
    fireEvent.touchStart(button);
    
    fireEvent.click(button);
    
    expect(onClick).toHaveBeenCalled();
    // Tooltip should remain invisible because of stopPropagation
    expect(tooltip).toHaveClass('invisible');
  });
});
