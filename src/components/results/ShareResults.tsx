import React, { useState, useRef, useEffect } from 'react';
import { Share2, Printer, Copy, Mail, FileText, Check, ChevronDown } from 'lucide-react';
import { Button } from '../shared/Button';
import { triggerPrint, formatCalculationSummary, copyToClipboard } from '../../utils';
import type { CalculationResult, CalculationInput } from '../../types/calculator';

interface ShareResultsProps {
  results: CalculationResult | null | undefined;
  input: CalculationInput;
}

/**
 * ShareResults component provides a dropdown menu for sharing calculation results.
 * Features: Copy summary, Print, and placeholders for Email/PDF.
 */
export const ShareResults: React.FC<ShareResultsProps> = ({ results, input }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCopy = async () => {
    if (!results) return;

    const summary = formatCalculationSummary(input, results);
    const success = await copyToClipboard(summary);
    
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    // Keep open for feedback, or close? Usually better to close or show feedback in-menu.
    // Let's close after a short delay or stay open for feedback.
    // Here we'll stay open briefly then close or just let user close.
    // Actually, closing is cleaner for a menu.
    setTimeout(() => setIsOpen(false), 500);
  };

  const handlePrint = () => {
    triggerPrint();
    setIsOpen(false);
  };

  const isDisabled = !results;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="secondary"
        size="sm"
        disabled={isDisabled}
        onClick={() => setIsOpen(!isOpen)}
        className="gap-sm min-w-[100px]"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
        <ChevronDown 
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          aria-hidden="true"
        />
      </Button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-sm w-64 origin-top-right bg-bg-main border border-border-base rounded-2xl shadow-level-4 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="share-menu-button"
        >
          <div className="py-sm">
            <button
              onClick={handleCopy}
              className="flex items-center w-full px-lg py-md text-sm text-ink-700 hover:bg-surface-hover transition-colors text-left gap-md group"
              role="menuitem"
            >
              <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center group-hover:bg-bg-main transition-colors">
                {copied ? (
                  <Check className="w-4 h-4 text-moss" />
                ) : (
                  <Copy className="w-4 h-4 text-ink-500 group-hover:text-clay" />
                )}
              </div>
              <span className="flex-1 font-bold tracking-tight">{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center w-full px-lg py-md text-sm text-ink-700 hover:bg-surface-hover transition-colors text-left gap-md group"
              role="menuitem"
            >
              <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center group-hover:bg-bg-main transition-colors">
                <Printer className="w-4 h-4 text-ink-500 group-hover:text-clay" />
              </div>
              <span className="flex-1 font-bold tracking-tight">Print Results</span>
            </button>

            <div className="border-t border-border-subtle my-sm" />

            {/* Placeholder: Email */}
            <button
              disabled
              className="flex items-center w-full px-lg py-md text-sm text-ink-500 cursor-not-allowed text-left gap-md opacity-60"
              role="menuitem"
            >
              <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
                <Mail className="w-4 h-4 text-ink-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight">Email Report</span>
                <span className="text-[9px] uppercase tracking-[0.2em] font-black text-ink-400">Coming Soon</span>
              </div>
            </button>

            {/* Placeholder: PDF */}
            <button
              disabled
              className="flex items-center w-full px-lg py-md text-sm text-ink-500 cursor-not-allowed text-left gap-md opacity-60"
              role="menuitem"
            >
              <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
                <FileText className="w-4 h-4 text-ink-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight">Export PDF</span>
                <span className="text-[9px] uppercase tracking-[0.2em] font-black text-ink-400">Coming Soon</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
