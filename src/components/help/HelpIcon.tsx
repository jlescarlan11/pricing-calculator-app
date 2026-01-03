import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip } from '../shared/Tooltip';

interface HelpIconProps {
  /** Text to show in a tooltip on hover/focus */
  helpText?: React.ReactNode;
  /** Function to call when the icon is clicked */
  onClick?: () => void;
  /** Accessibility label */
  ariaLabel?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Size of the icon in pixels. Defaults to 16. */
  size?: number;
}

/**
 * A reusable help icon component that can display a tooltip or trigger a modal.
 * Designed to be consistent, accessible, and easy to use across the application.
 */
export const HelpIcon: React.FC<HelpIconProps> = ({
  helpText,
  onClick,
  ariaLabel = 'Help information',
  className = '',
  size = 16,
}) => {
  const icon = (
    <HelpCircle 
      size={size} 
      aria-hidden="true"
    />
  );

  const buttonContent = (
    <button
      type="button"
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`inline-flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 p-0.5 ${className}`}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );

  if (helpText) {
    return (
      <Tooltip content={helpText}>
        {buttonContent}
      </Tooltip>
    );
  }

  return buttonContent;
};
