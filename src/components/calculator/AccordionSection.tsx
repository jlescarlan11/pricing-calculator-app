import React from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  stepNumber: number;
  isOpen: boolean;
  isComplete: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  summary?: string;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  stepNumber,
  isOpen,
  isComplete,
  onToggle,
  children,
  summary,
}) => {
  return (
    <div
      className={`border rounded-xl transition-all duration-300 overflow-hidden ${
        isOpen
          ? 'border-clay shadow-md bg-bg-main'
          : 'border-border-subtle bg-surface hover:bg-surface-hover'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-lg text-left focus:outline-none group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-md">
          {/* Step Indicator */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0 border
              ${
                isComplete && !isOpen
                  ? 'bg-moss/10 border-moss/30 text-moss shadow-sm scale-95'
                  : isOpen
                    ? 'bg-clay border-clay text-white shadow-md ring-4 ring-clay/10 scale-105'
                    : 'bg-white border-border-base text-ink-500 group-hover:border-clay/30 group-hover:text-clay group-hover:bg-clay/5'
              }
            `}
          >
            {isComplete && !isOpen ? <Check className="w-5 h-5" strokeWidth={3} /> : stepNumber}
          </div>

          <div className="flex flex-col">
            <span
              className={`font-serif text-lg font-medium transition-colors duration-300 ${
                isOpen ? 'text-ink-900' : 'text-ink-700 group-hover:text-ink-900'
              }`}
            >
              {title}
            </span>
            {!isOpen && summary && (
              <span className="text-sm text-ink-500 animate-in fade-in slide-in-from-left-1">
                {summary}
              </span>
            )}
          </div>
        </div>

        <div
          className={`text-ink-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-clay' : 'group-hover:text-ink-600'}`}
        >
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>

      {/* Content */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen
            ? 'grid-rows-[1fr] opacity-100 pb-lg px-lg'
            : 'grid-rows-[0fr] opacity-0 pb-0 px-lg'
        }`}
      >
        <div className="overflow-hidden min-w-0">
          <div className="pt-sm border-t border-border-subtle/50 mt-2">{children}</div>
        </div>
      </div>
    </div>
  );
};
