import React from 'react';

interface MarketPositionSpectrumProps {
  percentile: number | null;
  className?: string;
  showLabels?: boolean;
}

/**
 * A horizontal bar representing the market positioning spectrum.
 * Tiers: Budget, Mid-Market, Premium.
 */
export const MarketPositionSpectrum: React.FC<MarketPositionSpectrumProps> = ({
  percentile,
  className = '',
  showLabels = true,
}) => {
  const isEnabled = percentile !== null;

  return (
    <div className={`relative ${showLabels ? 'pt-6 pb-2' : 'py-1'} ${className}`}>
      {/* The Spectrum Bar */}
      <div className="h-2 w-full bg-border-subtle rounded-round flex overflow-hidden">
        {/* Tier segments (visual guides) */}
        <div className="h-full flex-1 border-r border-white/20 bg-ink-300/10" />
        <div className="h-full flex-1 border-r border-white/20 bg-ink-300/10" />
        <div className="h-full flex-1 bg-ink-300/10" />
      </div>

      {/* Positioning Indicator (The "You" pin) */}
      {isEnabled && (
        <div
          className="absolute top-4 transition-all duration-1000 ease-out"
          style={{
            left: `${Math.min(100, Math.max(0, percentile))}%`,
            transform: 'translateX(-50%)',
          }}
          aria-label={`Market position: ${percentile}%`}
        >
          <div className="flex flex-col items-center">
            {/* The Pin Head */}
            <div className="w-4 h-4 rounded-round bg-clay shadow-level-2 border-2 border-white" />
            
            {/* The Label */}
            {showLabels && (
              <span className="mt-2 text-[10px] font-bold text-clay uppercase tracking-tighter whitespace-nowrap">
                You
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tier Labels */}
      {showLabels && (
        <div className="flex justify-between mt-4 text-[10px] font-bold text-ink-300 uppercase tracking-widest px-1">
          <span className="w-1/3 text-left">Budget</span>
          <span className="w-1/3 text-center">Mid-Market</span>
          <span className="w-1/3 text-right">Premium</span>
        </div>
      )}
    </div>
  );
};
