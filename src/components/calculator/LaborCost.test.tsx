import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LaborCost } from './LaborCost';

describe('LaborCost', () => {
  const mockOnChange = vi.fn();

  it('renders with initial value', () => {
    render(<LaborCost value={100} onChange={mockOnChange} />);
    expect(screen.getByLabelText(/Total Labor Cost/i)).toHaveValue(100);
  });

  it('calls onChange when input changes', () => {
    render(<LaborCost value={0} onChange={mockOnChange} />);
    const input = screen.getByLabelText(/Total Labor Cost/i);
    fireEvent.change(input, { target: { value: '500' } });
    expect(mockOnChange).toHaveBeenCalledWith(500);
  });

  it('toggles calculator section', () => {
    render(<LaborCost value={0} onChange={mockOnChange} />);
    
    expect(screen.queryByLabelText(/Hours Worked/i)).not.toBeInTheDocument();
    
    const toggleBtn = screen.getByRole('button', { name: /Labor Calculator/i });
    fireEvent.click(toggleBtn);
    
    expect(screen.getByLabelText(/Hours Worked/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hourly Rate/i)).toBeInTheDocument();
    
    const hideBtn = screen.getByRole('button', { name: /Hide Calculator/i });
    fireEvent.click(hideBtn);
    
    expect(screen.queryByLabelText(/Hours Worked/i)).not.toBeInTheDocument();
  });

  it('calculates and displays total', () => {
    render(<LaborCost value={0} onChange={mockOnChange} />);
    
    // Open calculator
    fireEvent.click(screen.getByRole('button', { name: /Labor Calculator/i }));
    
    const hoursInput = screen.getByLabelText(/Hours Worked/i);
    const rateInput = screen.getByLabelText(/Hourly Rate/i);
    
    fireEvent.change(hoursInput, { target: { value: '5' } });
    fireEvent.change(rateInput, { target: { value: '60' } });
    
    // Check for calculated text "Calculated: ₱300.00"
    // Note: The component uses `toLocaleString` which might differ based on locale environment, 
    // but usually in node/jsdom it works. The component uses 'en-PH'.
    // 5 * 60 = 300.
    expect(screen.getByText(/₱300.00/i)).toBeInTheDocument();
  });

  it('applies calculated value', () => {
    render(<LaborCost value={0} onChange={mockOnChange} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Labor Calculator/i }));
    
    fireEvent.change(screen.getByLabelText(/Hours Worked/i), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText(/Hourly Rate/i), { target: { value: '100' } });
    
    const applyBtn = screen.getByRole('button', { name: /Apply to Total/i });
    fireEvent.click(applyBtn);
    
    expect(mockOnChange).toHaveBeenCalledWith(400);
  });
});
