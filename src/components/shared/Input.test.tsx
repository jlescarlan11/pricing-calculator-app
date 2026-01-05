import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders with label and placeholder', () => {
    render(<Input label="Test Input" value="" onChange={() => {}} placeholder="Enter text" />);
    expect(screen.getByLabelText(/Test Input/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter text/i)).toBeInTheDocument();
  });

  it('renders value and handles change', () => {
    const handleChange = vi.fn();
    render(<Input label="Test Input" value="Hello" onChange={handleChange} />);

    const input = screen.getByLabelText(/Test Input/i);
    expect(input).toHaveValue('Hello');

    fireEvent.change(input, { target: { value: 'World' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message and applies error styles', () => {
    render(<Input label="Test Input" value="" onChange={() => {}} error="This is an error" />);

    expect(screen.getByText(/This is an error/i)).toBeInTheDocument();
    const input = screen.getByLabelText(/Test Input/i);

    // Check for error classes
    expect(input).toHaveClass('border-rust');
    expect(input).toHaveClass('text-rust');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays helper text when no error', () => {
    render(<Input label="Test Input" value="" onChange={() => {}} helperText="Helpful tip" />);

    expect(screen.getByText(/Helpful tip/i)).toBeInTheDocument();
    expect(screen.getByText(/Helpful tip/i)).toHaveClass('text-ink-500');
  });

  it('renders currency symbol when enabled', () => {
    render(<Input label="Price" value="" onChange={() => {}} currency />);

    expect(screen.getByText('₱')).toBeInTheDocument();
    const input = screen.getByLabelText(/Price/i);
    expect(input).toHaveClass('pl-10'); // Extra padding for symbol
  });

  it('prevents negative sign for number inputs', () => {
    render(<Input label="Number" value="" onChange={() => {}} type="number" />);

    const input = screen.getByLabelText(/Number/i);

    const preventDefault = vi.fn();
    const event = createEvent.keyDown(input, { key: '-' });
    event.preventDefault = preventDefault;

    fireEvent(input, event);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('applies correct styling classes', () => {
    render(<Input label="Styled Input" value="" onChange={() => {}} />);

    const input = screen.getByLabelText(/Styled Input/i);

    // Check new styling requirements
    expect(input).toHaveClass('py-[14px]'); // Vertical padding
    expect(input).toHaveClass('pl-4'); // Horizontal padding (default)
    expect(input).toHaveClass('rounded-xl'); // Border radius
    expect(input).toHaveClass('border-border-subtle'); // Default border
    expect(input).toHaveClass('bg-bg-main'); // Background
    expect(input).toHaveClass('placeholder:italic'); // Placeholder style
    expect(input).toHaveClass('tabular-nums'); // Tabular numerals
  });

  it('applies focus styles correctly (via class check)', () => {
    render(<Input label="Focus Input" value="" onChange={() => {}} />);
    const input = screen.getByLabelText(/Focus Input/i);
    // Note: checking classes that are applied on focus pseudo-class
    expect(input.className).toContain('focus:border-clay');
  });
});
