import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children correctly', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Trigger</button>
      </Tooltip>
    );
    expect(screen.getByRole('button', { name: /trigger/i })).toBeInTheDocument();
  });

  it('shows tooltip on hover after delay', () => {
    render(
      <Tooltip content="Tooltip text" delay={200}>
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: /trigger/i });
    
    // Initial state: hidden
    const tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(tooltip).toHaveClass('invisible');

    // Hover
    fireEvent.mouseEnter(trigger);

    // Should still be hidden immediately due to delay
    act(() => {
        vi.advanceTimersByTime(100);
    });
    expect(tooltip).toHaveClass('invisible');

    // After delay
    act(() => {
        vi.advanceTimersByTime(100);
    });
    expect(tooltip).toHaveClass('visible');
    expect(tooltip).toHaveTextContent('Tooltip text');
  });

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: /trigger/i });
    const tooltip = screen.getByRole('tooltip', { hidden: true });

    fireEvent.mouseEnter(trigger);
    act(() => {
        vi.runAllTimers();
    });
    expect(tooltip).toHaveClass('visible');

    fireEvent.mouseLeave(trigger);
    expect(tooltip).toHaveClass('invisible');
  });

  it('shows tooltip on focus and hides on blur', () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: /trigger/i });
    const tooltip = screen.getByRole('tooltip', { hidden: true });

    fireEvent.focus(trigger);
    act(() => {
        vi.runAllTimers();
    });
    expect(tooltip).toHaveClass('visible');

    fireEvent.blur(trigger);
    expect(tooltip).toHaveClass('invisible');
  });

  it('has correct accessibility attributes', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: /trigger/i });
    const tooltip = screen.getByRole('tooltip', { hidden: true });
    
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('applies correct position classes', () => {
    const { rerender } = render(
      <Tooltip content="Tooltip text" position="top">
        <button>Trigger</button>
      </Tooltip>
    );
    
    let tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(tooltip.className).toContain('bottom-full');

    rerender(
      <Tooltip content="Tooltip text" position="right">
        <button>Trigger</button>
      </Tooltip>
    );
    tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(tooltip.className).toContain('left-full');

    rerender(
      <Tooltip content="Tooltip text" position="bottom">
        <button>Trigger</button>
      </Tooltip>
    );
    tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(tooltip.className).toContain('top-full');

    rerender(
      <Tooltip content="Tooltip text" position="left">
        <button>Trigger</button>
      </Tooltip>
    );
    tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(tooltip.className).toContain('right-full');
  });
  
  it('toggles on click (simulating touch)', () => {
      render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: /trigger/i });
    const tooltip = screen.getByRole('tooltip', { hidden: true });

    // Simulate touch start to set isTouch flag
    fireEvent.touchStart(trigger);
    
    // First click shows it
    fireEvent.click(trigger);
    expect(tooltip).toHaveClass('visible');
    
    // Second click hides it
    fireEvent.click(trigger);
    expect(tooltip).toHaveClass('invisible');
  });
});
