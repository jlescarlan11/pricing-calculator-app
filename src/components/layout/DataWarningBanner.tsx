import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * A prominent banner that warns users about the session-based nature of their data.
 * It is dismissible for the current session but reappears on page reload.
 */
export const DataWarningBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="bg-amber-50 border-b border-amber-200"
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-amber-800">
              <span className="md:hidden">
                Data is session-only. It will be lost on tab close or clear.
              </span>
              <span className="hidden md:inline">
                Your data is only saved in this browser session. It will be lost if you close this tab or clear your browser.
              </span>
            </p>
          </div>
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="p-1.5 rounded-md text-amber-500 hover:text-amber-600 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
              aria-label="Dismiss warning"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
