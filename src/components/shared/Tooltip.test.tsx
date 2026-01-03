import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 100,
      height: 40,
      top: 100,
      left: 100,
      bottom: 140,
      right: 200,
      x: 100,
      y: 100,
      toJSON: () => {},
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Trigger</button>
      </Tooltip>
    );
    expect(screen.getByRole('button', { name: /trigger/i })).toBeInTheDocument();
  });

  it('shows tooltip on hover after delay', async () => {
    render(
      <Tooltip content="Tooltip text" delay={200}>
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: /trigger/i });
    
    // Initial state: not in document (conditional rendering)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Hover
    fireEvent.mouseEnter(trigger);

    // Should still be hidden immediately due to delay
    act(() => {
        vi.advanceTimersByTime(100);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // After delay
    act(() => {
        vi.advanceTimersByTime(100);
    });
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Tooltip text');
    // Check for opacity 1 (isAnimating true)
    expect(tooltip.style.opacity).toBe('1');
  });

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: /trigger/i });
    
    fireEvent.mouseEnter(trigger);
    act(() => {
        vi.runAllTimers();
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);
    
    // Immediately after mouseLeave, isAnimating should be false but still in DOM
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.style.opacity).toBe('0');

    // After fade-out duration
    act(() => {
        vi.advanceTimersByTime(150);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus and hides on blur', () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: /trigger/i });

    fireEvent.focus(trigger);
    act(() => {
        vi.runAllTimers();
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(trigger);
    act(() => {
        vi.advanceTimersByTime(150);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('has correct accessibility attributes when visible', () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: /trigger/i });
    
    fireEvent.focus(trigger);
    act(() => {
        vi.runAllTimers();
    });
    
    const tooltip = screen.getByRole('tooltip');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('toggles on click', () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: /trigger/i });

    // First click shows it
    fireEvent.click(trigger);
    act(() => {
        vi.runAllTimers();
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    
    // Second click hides it
    fireEvent.click(trigger);
    act(() => {
        vi.advanceTimersByTime(150);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('hides on click outside', () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: /trigger/i });

    fireEvent.click(trigger);
    act(() => {
        vi.runAllTimers();
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Click elsewhere in document
    fireEvent.mouseDown(document.body);
    act(() => {
        vi.advanceTimersByTime(150);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});