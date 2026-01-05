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
    <div className="bg-sakura/10 border-b border-sakura/20" role="alert" aria-live="polite">
      <div className="max-w-6xl mx-auto px-md sm:px-lg lg:px-xl py-md">
        <div className="flex items-center justify-between gap-lg">
          <div className="flex items-center gap-md">
            <div className="shrink-0 p-xs bg-sakura/20 rounded-sm">
              <AlertTriangle className="h-5 w-5 text-ink-700" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-ink-900 leading-relaxed">
              <span className="md:hidden">A gentle reminder: your progress is temporary.</span>
              <span className="hidden md:inline">
                A gentle reminder: your progress is temporary and stays with this tab.
              </span>
            </p>
          </div>
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="p-sm rounded-sm text-ink-500 hover:text-ink-900 hover:bg-sakura/20 focus:outline-none transition-all duration-300"
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
