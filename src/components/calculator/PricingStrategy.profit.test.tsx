import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PricingStrategy } from './PricingStrategy';

describe('PricingStrategy - Profit Goal Mode', () => {
  const mockOnChange = vi.fn();
  const mockOnInputModeChange = vi.fn();

  it('switches between Percentage and Profit Goal modes', () => {
    const { rerender } = render(
      <PricingStrategy 
        strategy="markup" 
        value={50} 
        inputMode="percentage"
        costPerUnit={100} 
        onChange={mockOnChange} 
        onInputModeChange={mockOnInputModeChange}
      />
    );

    expect(screen.getByLabelText(/Markup Percentage/i)).toBeInTheDocument();
    
    const profitBtn = screen.getByText(/Profit Goal/i, { selector: 'button' });
    fireEvent.click(profitBtn);
    expect(mockOnInputModeChange).toHaveBeenCalledWith('profit');

    rerender(
      <PricingStrategy 
        strategy="markup" 
        value={50} 
        inputMode="profit"
        costPerUnit={100} 
        onChange={mockOnChange} 
        onInputModeChange={mockOnInputModeChange}
      />
    );

    expect(screen.getByLabelText(/Target Profit \(per unit\)/i)).toBeInTheDocument();
    // 50% markup on 100 cost = 50 profit
    expect(screen.getByLabelText(/Target Profit \(per unit\)/i)).toHaveValue(50);
  });

  it('updates percentage when profit goal changes in markup mode', () => {
    render(
      <PricingStrategy 
        strategy="markup" 
        value={50} 
        inputMode="profit"
        costPerUnit={100} 
        onChange={mockOnChange} 
      />
    );

    const input = screen.getByLabelText(/Target Profit \(per unit\)/i);
    fireEvent.change(input, { target: { value: '100' } });

    // 100 profit on 100 cost = 100% markup
    expect(mockOnChange).toHaveBeenCalledWith('markup', 100);
  });

  it('updates percentage when profit goal changes in margin mode', () => {
    render(
      <PricingStrategy 
        strategy="margin" 
        value={50} 
        inputMode="profit"
        costPerUnit={100} 
        onChange={mockOnChange} 
      />
    );

    const input = screen.getByLabelText(/Target Profit \(per unit\)/i);
    fireEvent.change(input, { target: { value: '100' } });

    // 100 profit on 100 cost = 200 price
    // Margin = 100 / 200 = 50%
    expect(mockOnChange).toHaveBeenCalledWith('margin', 50);
  });

  it('maintains slider functionality in profit mode', () => {
    render(
      <PricingStrategy 
        strategy="markup" 
        value={50} 
        inputMode="profit"
        costPerUnit={100} 
        onChange={mockOnChange} 
      />
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } });

    expect(mockOnChange).toHaveBeenCalledWith('markup', 75);
  });

  it('reflects correct profit when strategy changes', () => {
    const { rerender } = render(
      <PricingStrategy 
        strategy="markup" 
        value={50} 
        inputMode="profit"
        costPerUnit={100} 
        onChange={mockOnChange} 
      />
    );

    expect(screen.getByLabelText(/Target Profit \(per unit\)/i)).toHaveValue(50);

    // Switch to margin (parent would do this and update value)
    rerender(
      <PricingStrategy 
        strategy="margin" 
        value={50} 
        inputMode="profit"
        costPerUnit={100} 
        onChange={mockOnChange} 
      />
    );

    // 50% margin on 100 cost = 200 price = 100 profit
    expect(screen.getByLabelText(/Target Profit \(per unit\)/i)).toHaveValue(100);
  });
});
