import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PricingExplainerModal } from './PricingExplainerModal';

describe('PricingExplainerModal', () => {
  const mockOnClose = vi.fn();

  it('renders nothing when closed', () => {
    render(<PricingExplainerModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText(/Pricing Strategies Explained/i)).not.toBeInTheDocument();
  });

  it('renders markup tab by default', () => {
    render(<PricingExplainerModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Pricing Strategies Explained/i)).toBeInTheDocument();

    expect(screen.getByText(/Markup is when you/i)).toBeInTheDocument();

    expect(screen.getByText(/Example: 50% Markup/i)).toBeInTheDocument();

    expect(screen.getAllByText(/₱150.00/i).length).toBeGreaterThan(0);
  });

  it('switches to margin tab', () => {
    render(<PricingExplainerModal isOpen={true} onClose={mockOnClose} />);

    const marginBtn = screen.getByRole('button', { name: /Profit Margin/i });

    fireEvent.click(marginBtn);

    expect(screen.getByText(/Profit Margin is/i)).toBeInTheDocument();

    expect(screen.getByText(/Example: 50% Margin/i)).toBeInTheDocument();

    expect(screen.getAllByText(/₱200.00/i).length).toBeGreaterThan(0);
  });

  it('renders with margin tab initially if specified', () => {
    render(<PricingExplainerModal isOpen={true} onClose={mockOnClose} initialTab="margin" />);

    expect(screen.getByText(/Profit Margin is/i)).toBeInTheDocument();
  });

  it('shows comparison table', () => {
    render(<PricingExplainerModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Quick Comparison/i)).toBeInTheDocument();

    expect(screen.getByText(/Feature/i)).toBeInTheDocument();

    expect(screen.getAllByText(/Markup/i).length).toBeGreaterThan(0);

    expect(screen.getAllByText(/Margin/i).length).toBeGreaterThan(0);
  });

  it('calls onClose when close button or "Got it" button is clicked', () => {
    render(<PricingExplainerModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByRole('button', { name: /Mindfulness Gained/i });
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
