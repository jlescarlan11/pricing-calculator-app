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
  /**
   * Layout behavior on mobile screens.
   * - 'default': Standard row layout (Icon + Text)
   * - 'hidden': Text hidden (Icon only)
   * - 'vertical': Vertical stack (Icon top, Text bottom, small)
   * @default 'default'
   */
  mobileLabelLayout?: 'default' | 'hidden' | 'vertical';
  /**
   * Optional custom label for the button. Defaults to 'Save'.
   */
  label?: string;
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
  mobileLabelLayout = 'default',
  label = 'Save',
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
    ? 'Please complete the details above to save your progress.'
    : 'Keep this calculation for your future records.';

  const containerClasses =
    mobileLabelLayout === 'vertical'
      ? 'flex-col md:flex-row gap-0.5 md:gap-sm h-auto py-1 md:h-9 md:py-0 px-2 md:px-3'
      : 'flex-row gap-sm';

  const labelClasses =
    mobileLabelLayout === 'hidden'
      ? 'hidden sm:inline'
      : mobileLabelLayout === 'vertical'
        ? 'text-[10px] md:text-sm leading-none md:leading-normal font-medium md:font-normal'
        : '';

  return (
    <>
      <Tooltip content={tooltipContent} position="top">
        <Button
          variant={variant}
          size={size}
          onClick={handleOpenModal}
          disabled={disabled}
          className={`flex items-center ${containerClasses} ${className}`}
          type="button"
          aria-label={label === 'Save' ? 'Save current calculation as preset' : label}
        >
          <Save className="w-4 h-4" />
          <span className={labelClasses}>{label}</span>
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
