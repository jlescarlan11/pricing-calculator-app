import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OverheadCost } from './OverheadCost';

describe('OverheadCost', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    expect(screen.getByText(/Zero overhead\? This is rare but possible/i)).toBeInTheDocument();
  });

  it('toggles helper section', () => {
    render(<OverheadCost value={0} batchSize={10} onChange={mockOnChange} />);
    
    expect(screen.queryByLabelText(/Monthly Rent/i)).not.toBeInTheDocument();
    
    const toggleBtn = screen.getByRole('button', { name: /Helper/i });
    fireEvent.click(toggleBtn);
    
    expect(screen.getByRole('spinbutton', { name: /Monthly Rent/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /Monthly Utilities/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /Batches per Month/i })).toBeInTheDocument();
    
    const hideBtn = screen.getByRole('button', { name: /Hide/i });
    fireEvent.click(hideBtn);
    
    expect(screen.queryByRole('spinbutton', { name: /Monthly Rent/i })).not.toBeInTheDocument();
  });

  it('calculates total overhead correctly in helper', () => {
    render(<OverheadCost value={0} batchSize={50} onChange={mockOnChange} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Helper/i }));
    
    // Use spinbutton role to target inputs specifically
    fireEvent.change(screen.getByRole('spinbutton', { name: /Monthly Rent/i }), { target: { value: '10000' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Batches per Month/i }), { target: { value: '20' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Monthly Utilities/i }), { target: { value: '2000' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Packaging per Unit/i }), { target: { value: '5' } });
    
    // Total = 500 + 100 + 250 = 850
    // Use a flexible matcher for the currency formatted string
    expect(screen.getByText(/850\.00/)).toBeInTheDocument();
  });

  it('applies calculated value to overhead', () => {
    render(<OverheadCost value={0} batchSize={10} onChange={mockOnChange} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Helper/i }));
    
    fireEvent.change(screen.getByRole('spinbutton', { name: /Monthly Rent/i }), { target: { value: '200' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Batches per Month/i }), { target: { value: '1' } });
    
    // Target the specific Apply button in the calculator
    const applyBtn = screen.getByRole('button', { name: /Apply to Overhead Cost/i });
    fireEvent.click(applyBtn);
    
    expect(mockOnChange).toHaveBeenCalledWith(200);
  });
});
