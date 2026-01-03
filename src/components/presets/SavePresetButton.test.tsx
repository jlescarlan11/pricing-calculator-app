import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SavePresetButton } from './SavePresetButton';
import type { CalculationInput, PricingConfig } from '../../types/calculator';

const mockInput: CalculationInput = {
  productName: 'Test Product',
  batchSize: 10,
  ingredients: [
    { id: '1', name: 'Ingredient 1', amount: 100, cost: 50 },
  ],
  laborCost: 20,
  overhead: 10,
};

const mockConfig: PricingConfig = {
  strategy: 'markup',
  value: 50,
};

// Mock SavePresetModal to avoid rendering its complexity
vi.mock('./SavePresetModal', () => ({
  SavePresetModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? (
      <div data-testid="mock-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null
}));

describe('SavePresetButton', () => {
  it('renders correctly', () => {
    render(
      <SavePresetButton
        input={mockInput}
        config={mockConfig}
      />
    );

    const button = screen.getByRole('button', { name: /save current calculation as preset/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/Save Product/i);
    expect(button).not.toBeDisabled();
  });

  it('is disabled when the disabled prop is true', () => {
    render(
      <SavePresetButton
        input={mockInput}
        config={mockConfig}
        disabled={true}
      />
    );

    const button = screen.getByRole('button', { name: /save current calculation as preset/i });
    expect(button).toBeDisabled();
  });

  it('opens the modal when clicked', () => {
    render(
      <SavePresetButton
        input={mockInput}
        config={mockConfig}
      />
    );

    const button = screen.getByRole('button', { name: /save current calculation as preset/i });
    fireEvent.click(button);

    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
  });

  it('closes the modal when onClose is called', () => {
    render(
      <SavePresetButton
        input={mockInput}
        config={mockConfig}
      />
    );

    const button = screen.getByRole('button', { name: /save current calculation as preset/i });
    fireEvent.click(button);
    
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();

    const closeBtn = screen.getByText(/Close Modal/i);
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
  });

  it('does not open modal when disabled and clicked', () => {
    render(
      <SavePresetButton
        input={mockInput}
        config={mockConfig}
        disabled={true}
      />
    );

    const button = screen.getByRole('button', { name: /save current calculation as preset/i });
    fireEvent.click(button);

    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
  });

  it('has a tooltip with correct content when enabled', () => {
    render(
      <SavePresetButton
        input={mockInput}
        config={mockConfig}
      />
    );

    const tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(tooltip).toHaveTextContent(/Save this calculation to your presets/i);
  });

  it('has a tooltip with correct content when disabled', () => {
    render(
      <SavePresetButton
        input={mockInput}
        config={mockConfig}
        disabled={true}
      />
    );

    const tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(tooltip).toHaveTextContent(/Complete all required fields/i);
  });
});
