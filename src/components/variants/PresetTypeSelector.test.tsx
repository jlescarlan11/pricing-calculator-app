import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PresetTypeSelector } from './PresetTypeSelector';

describe('PresetTypeSelector', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSelect: vi.fn(),
  };

  it('renders correctly when open', () => {
    render(<PresetTypeSelector {...defaultProps} />);
    
    expect(screen.getByText('Choose Preset Type')).toBeInTheDocument();
    expect(screen.getByText('Single Product')).toBeInTheDocument();
    expect(screen.getByText('Multiple Variants')).toBeInTheDocument();
    expect(screen.getByText("What's the difference?")).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<PresetTypeSelector {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Choose Preset Type')).not.toBeInTheDocument();
  });

  it('starts with no selection and disabled continue button', () => {
    render(<PresetTypeSelector {...defaultProps} />);
    
    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).toBeDisabled();
    
    const radios = screen.getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio).toHaveAttribute('aria-checked', 'false');
    });
  });

  it('enables continue button when a type is selected', () => {
    render(<PresetTypeSelector {...defaultProps} />);
    
    const singleOption = screen.getByText('Single Product').closest('[role="radio"]');
    expect(singleOption).toBeInTheDocument();
    fireEvent.click(singleOption!);
    
    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).toBeEnabled();
    expect(singleOption).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onSelect with correct type when continue is clicked', () => {
    render(<PresetTypeSelector {...defaultProps} />);
    
    const variantOption = screen.getByText('Multiple Variants').closest('[role="radio"]');
    expect(variantOption).toBeInTheDocument();
    fireEvent.click(variantOption!);
    
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);
    
    expect(defaultProps.onSelect).toHaveBeenCalledWith('variant');
  });

  it('handles keyboard selection', () => {
    render(<PresetTypeSelector {...defaultProps} />);
    
    const singleOption = screen.getByText('Single Product').closest('[role="radio"]');
    expect(singleOption).toBeInTheDocument();
    
    singleOption!.focus();
    fireEvent.keyDown(singleOption!, { key: 'Enter' });
    
    expect(singleOption).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled();
  });

  it('toggles details section', async () => {
    render(<PresetTypeSelector {...defaultProps} />);
    
    const detailsButton = screen.getByText("What's the difference?").closest('button');
    expect(detailsButton).toBeInTheDocument();
    
    // Initially closed
    expect(screen.queryByText(/Use this for simple items/i)).not.toBeInTheDocument();
    
    // Open
    fireEvent.click(detailsButton!);
    expect(screen.getByText(/Use this for simple items/i)).toBeInTheDocument();
    
    // Close
    fireEvent.click(detailsButton!);
    
    await waitFor(() => {
        expect(screen.queryByText(/Use this for simple items/i)).not.toBeInTheDocument();
    });
  });

  it('calls onClose when cancel is clicked', () => {
    render(<PresetTypeSelector {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
