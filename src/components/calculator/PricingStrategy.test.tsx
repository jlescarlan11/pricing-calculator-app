import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PricingStrategy } from './PricingStrategy';

describe('PricingStrategy', () => {
  const mockOnChange = vi.fn();

  it('renders with initial markup strategy', () => {
    render(
      <PricingStrategy strategy="markup" value={25} costPerUnit={100} onChange={mockOnChange} />
    );

    expect(screen.getByLabelText(/Markup Percentage/i)).toHaveValue(25);

    expect(
      screen.getByText(
        (_, element) => {
          return element?.textContent?.includes('Add 25% of the cost to your price') ?? false;
        },
        { selector: 'p' }
      )
    ).toBeInTheDocument();
  });

  it('renders with margin strategy', () => {
    render(
      <PricingStrategy strategy="margin" value={20} costPerUnit={100} onChange={mockOnChange} />
    );

    expect(screen.getByText(/Margin/i, { selector: 'button' })).toHaveClass('bg-clay');
    expect(screen.getByLabelText(/Margin Percentage/i)).toHaveValue(20);
    expect(
      screen.getByText(
        (_, element) => {
          return element?.textContent?.includes('Keep 20% of the price as your profit') ?? false;
        },
        { selector: 'p' }
      )
    ).toBeInTheDocument();
  });

  it('converts value correctly when switching strategy to maintain stable price', () => {
    render(
      <PricingStrategy strategy="markup" value={25} costPerUnit={100} onChange={mockOnChange} />
    );

    const marginBtn = screen.getByText(/Margin/i, { selector: 'button' });
    fireEvent.click(marginBtn);

    // 25% Markup on 100 cost = 125 price
    // Equivalent Margin = (125-100)/125 = 20%
    expect(mockOnChange).toHaveBeenCalledWith('margin', 20);
  });

  it('converts value correctly when switching from margin to markup', () => {
    render(
      <PricingStrategy strategy="margin" value={20} costPerUnit={100} onChange={mockOnChange} />
    );

    const markupBtn = screen.getByText(/Markup/i, { selector: 'button' });
    fireEvent.click(markupBtn);

    // 20% Margin on 100 cost = 125 price
    // Equivalent Markup = (125-100)/100 = 25%
    expect(mockOnChange).toHaveBeenCalledWith('markup', 25);
  });

  it('calls onChange when text input changes', () => {
    render(
      <PricingStrategy strategy="markup" value={25} costPerUnit={100} onChange={mockOnChange} />
    );

    const input = screen.getByLabelText(/Markup Percentage/i);
    fireEvent.change(input, { target: { value: '50' } });

    expect(mockOnChange).toHaveBeenCalledWith('markup', 50);
  });

  it('calls onChange when slider changes', () => {
    render(
      <PricingStrategy strategy="markup" value={25} costPerUnit={100} onChange={mockOnChange} />
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '100' } });

    expect(mockOnChange).toHaveBeenCalledWith('markup', 100);
  });

  it('constrains margin to 99.9%', () => {
    render(
      <PricingStrategy strategy="margin" value={20} costPerUnit={100} onChange={mockOnChange} />
    );

    const input = screen.getByLabelText(/Margin Percentage/i);
    fireEvent.change(input, { target: { value: '100' } });

    expect(mockOnChange).toHaveBeenCalledWith('margin', 99.9);
  });

  it('opens help modal when link clicked', () => {
    render(
      <PricingStrategy strategy="markup" value={25} costPerUnit={100} onChange={mockOnChange} />
    );

    expect(screen.queryByText(/Pricing Strategies Explained/i)).not.toBeInTheDocument();

    const helpBtn = screen.getByLabelText(/Help with pricing strategies/i);
    fireEvent.click(helpBtn);

    expect(screen.getByText(/Pricing Strategies Explained/i)).toBeInTheDocument();
  });

  it('calculates real-time example correctly', () => {
    render(
      <PricingStrategy strategy="markup" value={50} costPerUnit={100} onChange={mockOnChange} />
    );

    // Recommended Price: 100 + 50% = 150
    const priceDisplay = screen
      .getByText(/Recommended Price/i)
      .parentElement?.querySelector('.text-3xl');
    expect(priceDisplay).toHaveTextContent('₱150.00');

    // Profit per unit: 50
    // Margin for 50% markup is 33.33%, which is > 25% (moss)
    const profitDisplay = screen
      .getByText(/Profit per Unit/i)
      .parentElement?.querySelector('.text-moss');
    expect(profitDisplay).toHaveTextContent('+₱50.00');
  });

  it('updates visual explanation text dynamically when cost is provided', () => {
    const { rerender } = render(
      <PricingStrategy strategy="markup" value={25} costPerUnit={0} onChange={mockOnChange} />
    );

    // Initial state: no cost provided (uses fallback example)
    expect(screen.getByText(/Example: If your cost is ₱100.00/i)).toBeInTheDocument();

    // Rerender with valid cost
    rerender(
      <PricingStrategy strategy="markup" value={25} costPerUnit={200} onChange={mockOnChange} />
    );

    expect(screen.getByText(/With your cost of ₱200.00/i)).toBeInTheDocument();
  });
});
