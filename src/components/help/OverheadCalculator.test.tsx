import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OverheadCalculator } from './OverheadCalculator';

describe('OverheadCalculator', () => {
  const mockOnApply = vi.fn();

  it('calculates total overhead correctly', () => {
    render(<OverheadCalculator onApply={mockOnApply} initialBatchSize={50} />);

    // Rent: 10000 / 20 = 500
    fireEvent.change(screen.getByLabelText(/Monthly Rent/i, { selector: 'input' }), {
      target: { value: '10000' },
    });
    fireEvent.change(screen.getByLabelText(/Batches per Month/i, { selector: 'input' }), {
      target: { value: '20' },
    });

    // Utilities: 2000 / 20 = 100
    fireEvent.change(screen.getByLabelText(/Monthly Utilities/i, { selector: 'input' }), {
      target: { value: '2000' },
    });

    // Packaging: 5 * 50 = 250
    fireEvent.change(screen.getByLabelText(/Packaging per Unit/i), { target: { value: '5' } });

    // Total = 500 + 100 + 250 = 850
    expect(screen.getByText(/₱850.00/i)).toBeInTheDocument();
  });

  it('updates when batch size changes', () => {
    const { rerender } = render(<OverheadCalculator onApply={mockOnApply} initialBatchSize={50} />);

    fireEvent.change(screen.getByLabelText(/Packaging per Unit/i), { target: { value: '10' } });

    // Packaging = 10 * 50 = 500
    // Total = 500 (since monthly costs are 0)
    expect(screen.getAllByText(/₱500.00/i).length).toBeGreaterThan(0);

    // Change prop to 100
    rerender(<OverheadCalculator onApply={mockOnApply} initialBatchSize={100} />);

    // Packaging = 10 * 100 = 1000
    expect(screen.getAllByText(/₱1,000.00/i).length).toBeGreaterThan(0);
  });

  it('calls onApply when apply button is clicked', () => {
    render(<OverheadCalculator onApply={mockOnApply} initialBatchSize={10} />);

    fireEvent.change(screen.getByLabelText(/Monthly Rent/i, { selector: 'input' }), {
      target: { value: '1000' },
    });
    fireEvent.change(screen.getByLabelText(/Batches per Month/i, { selector: 'input' }), {
      target: { value: '1' },
    });

    const applyBtn = screen.getByRole('button', { name: /Apply to Overhead Cost/i });
    fireEvent.click(applyBtn);

    expect(mockOnApply).toHaveBeenCalledWith(1000);
  });

  it('disables apply button when total is 0', () => {
    render(<OverheadCalculator onApply={mockOnApply} initialBatchSize={10} />);

    const applyBtn = screen.getByRole('button', { name: /Apply to Overhead Cost/i });
    expect(applyBtn).toBeDisabled();
  });
});
