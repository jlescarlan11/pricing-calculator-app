import React, { useState, useId } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const tooltipId = useId();
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const toggleTooltip = () => {
    if (isTouch) {
      setIsVisible(!isVisible);
    }
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => {
        setIsTouch(false);
        showTooltip();
      }}
      onMouseLeave={hideTooltip}
      onTouchStart={() => setIsTouch(true)}
      onClick={toggleTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {React.cloneElement(children as React.ReactElement, {
        'aria-describedby': tooltipId,
      } as any)}
      
      <div
        id={tooltipId}
        role="tooltip"
        className={`absolute z-50 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-lg transition-all duration-200 ease-in-out ${
          positionClasses[position]
        } ${
          isVisible
            ? 'visible opacity-100 scale-100'
            : 'invisible opacity-0 scale-95'
        }`}
      >
        {content}
        {/* Arrow */}
        <div
          className={`absolute border-4 ${arrowClasses[position]}`}
        ></div>
      </div>
    </div>
  );
};
