import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PricingStrategy } from './PricingStrategy';

describe('PricingStrategy', () => {
  const mockOnChange = vi.fn();

  it('renders with initial markup strategy', () => {
    render(
      <PricingStrategy 
        strategy="markup" 
        value={25} 
        costPerUnit={100} 
        onChange={mockOnChange} 
      />
    );
    
    expect(screen.getByText(/Markup/i, { selector: 'button' })).toHaveClass('bg-white');
    expect(screen.getByLabelText(/Markup Percentage/i)).toHaveValue(25);
    
    // Using a function matcher to handle text split by span
    expect(screen.getByText((_, element) => {
      return element?.textContent === "Add 25% to your cost";
    }, { selector: 'p' })).toBeInTheDocument();

    // Be specific about which price we are checking
    const priceDisplay = screen.getByText(/Recommended Price/i).parentElement?.querySelector('.text-2xl');
    expect(priceDisplay).toHaveTextContent('₱125.00');
  });

  it('renders with margin strategy', () => {
    render(
      <PricingStrategy 
        strategy="margin" 
        value={20} 
        costPerUnit={100} 
        onChange={mockOnChange} 
      />
    );
    
    expect(screen.getByText(/Profit Margin/i, { selector: 'button' })).toHaveClass('bg-white');
    expect(screen.getByLabelText(/Margin Percentage/i)).toHaveValue(20);
    
    expect(screen.getByText((_, element) => {
      return element?.textContent === "Keep 20% of sale price as profit";
    }, { selector: 'p' })).toBeInTheDocument();

    const priceDisplay = screen.getByText(/Recommended Price/i).parentElement?.querySelector('.text-2xl');
    expect(priceDisplay).toHaveTextContent('₱125.00');
  });

  it('switches strategy when button clicked', () => {
    render(
      <PricingStrategy 
        strategy="markup" 
        value={25} 
        costPerUnit={100} 
        onChange={mockOnChange} 
      />
    );
    
    const marginBtn = screen.getByText(/Profit Margin/i, { selector: 'button' });
    fireEvent.click(marginBtn);
    
    expect(mockOnChange).toHaveBeenCalledWith('margin', 25);
  });

  it('calls onChange when text input changes', () => {
    render(
      <PricingStrategy 
        strategy="markup" 
        value={25} 
        costPerUnit={100} 
        onChange={mockOnChange} 
      />
    );
    
    const input = screen.getByLabelText(/Markup Percentage/i);
    fireEvent.change(input, { target: { value: '50' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('markup', 50);
  });

  it('calls onChange when slider changes', () => {
    render(
      <PricingStrategy 
        strategy="markup" 
        value={25} 
        costPerUnit={100} 
        onChange={mockOnChange} 
      />
    );
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '100' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('markup', 100);
  });

  it('constrains margin to 99.9%', () => {
    render(
      <PricingStrategy 
        strategy="margin" 
        value={20} 
        costPerUnit={100} 
        onChange={mockOnChange} 
      />
    );
    
    const input = screen.getByLabelText(/Margin Percentage/i);
    fireEvent.change(input, { target: { value: '100' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('margin', 99.9);
  });

  it('opens help modal when link clicked', () => {
    render(
      <PricingStrategy 
        strategy="markup" 
        value={25} 
        costPerUnit={100} 
        onChange={mockOnChange} 
      />
    );
    
    expect(screen.queryByText(/Pricing Strategies Explained/i)).not.toBeInTheDocument();
    
    const helpBtn = screen.getByLabelText(/Help with pricing strategies/i);
    fireEvent.click(helpBtn);
    
    expect(screen.getByText(/Pricing Strategies Explained/i)).toBeInTheDocument();
  });

  it('calculates real-time example correctly', () => {
    render(
      <PricingStrategy 
        strategy="markup" 
        value={10} 
        costPerUnit={100} 
        onChange={mockOnChange} 
      />
    );
    
    // Recommended Price: 100 + 10% = 110
    const priceDisplay = screen.getByText(/Recommended Price/i).parentElement?.querySelector('.text-2xl');
    expect(priceDisplay).toHaveTextContent('₱110.00');
    
    // Profit per unit: 10
    const profitDisplay = screen.getByText(/Profit per Unit/i).parentElement?.querySelector('.text-green-600');
    expect(profitDisplay).toHaveTextContent('+₱10.00');
  });
});
