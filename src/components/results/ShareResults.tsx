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
        className="gap-2 shadow-sm min-w-[100px]"
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
          className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="share-menu-button"
        >
          <div className="py-1">
            <button
              onClick={handleCopy}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left gap-3"
              role="menuitem"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
              <span className="flex-1 font-medium">{copied ? 'Copied to Clipboard' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left gap-3"
              role="menuitem"
            >
              <Printer className="w-4 h-4 text-gray-400" />
              <span className="flex-1 font-medium">Print Results</span>
            </button>

            <div className="border-t border-gray-100 my-1" />

            {/* Placeholder: Email */}
            <button
              disabled
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed text-left gap-3 group"
              role="menuitem"
            >
              <Mail className="w-4 h-4 text-gray-300" />
              <div className="flex flex-col">
                <span className="font-medium">Email Report</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Coming Soon</span>
              </div>
            </button>

            {/* Placeholder: PDF */}
            <button
              disabled
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed text-left gap-3"
              role="menuitem"
            >
              <FileText className="w-4 h-4 text-gray-300" />
              <div className="flex flex-col">
                <span className="font-medium">Export PDF</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Coming Soon</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
