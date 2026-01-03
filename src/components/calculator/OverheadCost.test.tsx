import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OverheadCost } from './OverheadCost';

describe('OverheadCost', () => {
  const mockOnChange = vi.fn();

  it('renders with initial value', () => {
    render(<OverheadCost value={150} batchSize={10} onChange={mockOnChange} />);
    expect(screen.getByLabelText(/Total Overhead Cost per Batch/i)).toHaveValue(150);
  });

  it('calls onChange when input changes', () => {
    render(<OverheadCost value={0} batchSize={10} onChange={mockOnChange} />);
    const input = screen.getByLabelText(/Total Overhead Cost per Batch/i);
    fireEvent.change(input, { target: { value: '250' } });
    expect(mockOnChange).toHaveBeenCalledWith(250);
  });

  it('shows warning when value is zero', () => {
    render(<OverheadCost value={0} batchSize={10} onChange={mockOnChange} />);
    expect(screen.getByText(/Overhead is zero. Are you sure?/i)).toBeInTheDocument();
  });

  it('toggles helper section', () => {
    render(<OverheadCost value={0} batchSize={10} onChange={mockOnChange} />);
    
    expect(screen.queryByLabelText(/Monthly Rent/i)).not.toBeInTheDocument();
    
    const toggleBtn = screen.getByRole('button', { name: /Overhead Helper/i });
    fireEvent.click(toggleBtn);
    
    expect(screen.getByLabelText(/Monthly Rent/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Monthly Utilities/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Batches per Month/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Packaging per Unit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Marketing Allocation/i)).toBeInTheDocument();
    
    const hideBtn = screen.getByRole('button', { name: /Hide Helper/i });
    fireEvent.click(hideBtn);
    
    expect(screen.queryByLabelText(/Monthly Rent/i)).not.toBeInTheDocument();
  });

  it('calculates total overhead correctly in helper', () => {
    render(<OverheadCost value={0} batchSize={50} onChange={mockOnChange} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Overhead Helper/i }));
    
    // Rent: 10000 / 20 = 500
    fireEvent.change(screen.getByLabelText(/Monthly Rent/i), { target: { value: '10000' } });
    fireEvent.change(screen.getByLabelText(/Batches per Month/i), { target: { value: '20' } });
    
    // Utilities: 2000 / 20 = 100
    fireEvent.change(screen.getByLabelText(/Monthly Utilities/i), { target: { value: '2000' } });
    
    // Packaging: 5 * 50 = 250
    fireEvent.change(screen.getByLabelText(/Packaging per Unit/i), { target: { value: '5' } });
    
    // Marketing: 150
    fireEvent.change(screen.getByLabelText(/Marketing Allocation/i), { target: { value: '150' } });
    
    // Total = 500 + 100 + 250 + 150 = 1000
    expect(screen.getByText(/₱1,000.00/i)).toBeInTheDocument();
  });

  it('applies calculated value to overhead', () => {
    render(<OverheadCost value={0} batchSize={10} onChange={mockOnChange} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Overhead Helper/i }));
    
    fireEvent.change(screen.getByLabelText(/Marketing Allocation/i), { target: { value: '200' } });
    
    const applyBtn = screen.getByRole('button', { name: /Apply to Overhead/i });
    fireEvent.click(applyBtn);
    
    expect(mockOnChange).toHaveBeenCalledWith(200);
  });
});
