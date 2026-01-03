import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CurrentPrice } from './CurrentPrice';

describe('CurrentPrice', () => {
  const mockOnChange = vi.fn();

  it('is hidden by default when value is undefined', () => {
    render(<CurrentPrice value={undefined} onChange={mockOnChange} />);
    expect(screen.queryByLabelText(/Current Selling Price/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Compare Current/i)).toBeInTheDocument();
  });

  it('is visible when value is provided and greater than 0', () => {
    render(<CurrentPrice value={150} onChange={mockOnChange} />);
    expect(screen.getByLabelText(/Current Selling Price/i)).toHaveValue(150);
    expect(screen.getByText(/Remove Comparison/i)).toBeInTheDocument();
  });

  it('toggles visibility when button is clicked', () => {
    render(<CurrentPrice value={undefined} onChange={mockOnChange} />);
    
    const toggleBtn = screen.getByRole('button', { name: /Compare Current/i });
    fireEvent.click(toggleBtn);
    
    expect(screen.getByLabelText(/Current Selling Price/i)).toBeInTheDocument();
    
    const hideBtn = screen.getByRole('button', { name: /Remove Comparison/i });
    fireEvent.click(hideBtn);
    
    expect(screen.queryByLabelText(/Current Selling Price/i)).not.toBeInTheDocument();
    expect(mockOnChange).toHaveBeenCalledWith(undefined);
  });

  it('calls onChange when input changes', () => {
    // Start visible by providing a value
    render(<CurrentPrice value={100} onChange={mockOnChange} />);
    
    const input = screen.getByLabelText(/Current Selling Price/i);
    fireEvent.change(input, { target: { value: '200' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(200);
  });

  it('displays helper text when visible', () => {
    render(<CurrentPrice value={100} onChange={mockOnChange} />);
    expect(screen.getByText(/Compare what you currently charge/i)).toBeInTheDocument();
  });

  it('handles invalid input by calling onChange with undefined', () => {
    render(<CurrentPrice value={100} onChange={mockOnChange} />);
    const input = screen.getByLabelText(/Current Selling Price/i);
    fireEvent.change(input, { target: { value: '' } });
    expect(mockOnChange).toHaveBeenCalledWith(undefined);
  });
});
