import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Button, Tooltip } from '../shared';
import { SavePresetModal } from './SavePresetModal';
import type { ButtonVariant, ButtonSize } from '../shared/Button';
import type { CalculationInput, PricingConfig } from '../../types/calculator';

interface SavePresetButtonProps {
  /**
   * Current calculation input data
   */
  input: CalculationInput;
  /**
   * Current pricing configuration
   */
  config: PricingConfig;
  /**
   * Whether the button is disabled (e.g. form is invalid)
   */
  disabled?: boolean;
  /**
   * Optional custom className for the button
   */
  className?: string;
  /**
   * Button variant
   */
  variant?: ButtonVariant;
  /**
   * Button size
   */
  size?: ButtonSize;
}

/**
 * A button component that opens the SavePresetModal.
 * Features a tooltip and a disabled state for incomplete forms.
 */
export const SavePresetButton: React.FC<SavePresetButtonProps> = ({
  input,
  config,
  disabled = false,
  className = '',
  variant = 'secondary',
  size = 'md',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (!disabled) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const tooltipContent = disabled 
    ? "Complete all required fields to save this product" 
    : "Save this calculation to your presets for later use";

  return (
    <>
      <Tooltip content={tooltipContent} position="top">
        <Button
          variant={variant}
          size={size}
          onClick={handleOpenModal}
          disabled={disabled}
          className={`flex items-center gap-sm ${className}`}
          type="button"
          aria-label="Save current calculation as preset"
        >
          <Save className="w-4 h-4" />
          <span>Save Product</span>
        </Button>
      </Tooltip>

      <SavePresetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        input={input}
        config={config}
      />
    </>
  );
};
