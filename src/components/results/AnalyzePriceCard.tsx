import React from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Sparkles } from 'lucide-react';
import { checkRateLimit } from '../../utils/analysisRateLimit';

interface AnalyzePriceCardProps {
  onAnalyze?: () => void;
  isLoading?: boolean;
  className?: string;
  recommendations?: string[];
  isAnalyzed?: boolean;
}

/**
 * A call-to-action card for pricing analysis.
 * Follows the project's visual patterns: Ma (Negative Space), Kanso (Simplicity),
 * and the established Japanese aesthetic.
 */
export const AnalyzePriceCard: React.FC<AnalyzePriceCardProps> = ({
  onAnalyze,
  isLoading = false,
  className = '',
  recommendations = [],
  isAnalyzed = false,
}) => {
  const [rateLimitInfo, setRateLimitInfo] = React.useState(checkRateLimit());

  const handleAnalyzeClick = () => {
    const info = checkRateLimit();
    if (!info.allowed) {
      // Re-trigger state update to show rate limit UI if we want
      setRateLimitInfo(info);
      return;
    }
    onAnalyze?.();
  };

  // Sync rate limit info after analysis or when component mounts
  React.useEffect(() => {
    setRateLimitInfo(checkRateLimit());
  }, [isAnalyzed, isLoading]);

  return (
    <Card
      className={`bg-gradient-to-br from-surface to-bg-main border-clay/20 print:hidden transition-all duration-700 ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-lg">
        <div className="text-center sm:text-left">
          <h3 className="font-serif text-xl font-semibold text-ink-900 mb-xs">
            {isAnalyzed ? 'Analysis Complete' : 'Want a deeper look?'}
          </h3>
          <p className="text-ink-500 text-sm max-w-sm leading-relaxed">
            {isAnalyzed
              ? 'Based on your current margins, here are some points to consider:'
              : rateLimitInfo.allowed
                ? 'Get an automated analysis of your costs and discover opportunities to improve your profit margins.'
                : 'You have reached your daily limit of 5 AI analyses. Please come back tomorrow for more insights.'}
          </p>
          {!isAnalyzed && rateLimitInfo.allowed && (
            <p className="text-[10px] text-ink-300 mt-xs uppercase tracking-widest font-bold">
              {rateLimitInfo.remaining} analyses remaining today
            </p>
          )}
        </div>
        {!isAnalyzed && (
          <Button
            onClick={handleAnalyzeClick}
            variant="primary"
            isLoading={isLoading}
            disabled={!rateLimitInfo.allowed}
            className="gap-sm shadow-clay/10 shadow-lg hover:shadow-clay/20 transition-all active:scale-95 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            Analyze My Pricing
          </Button>
        )}
      </div>

      {isAnalyzed && recommendations.length > 0 && (
        <div className="mt-xl space-y-md animate-in fade-in slide-in-from-top-4 duration-700">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-start gap-md p-md bg-white/50 rounded-lg border border-border-subtle"
            >
              <div className="w-5 h-5 rounded-round bg-clay/10 text-clay flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                {index + 1}
              </div>
              <p className="text-sm text-ink-700 leading-relaxed italic">{rec}</p>
            </div>
          ))}
          <div className="pt-md flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAnalyze}
              className="text-ink-300 hover:text-ink-500 text-[10px] uppercase tracking-widest"
            >
              Refresh Analysis
            </Button>
          </div>
        </div>
      )}

      <p className="mt-lg pt-md border-t border-border-subtle/50 text-[10px] text-ink-300 leading-relaxed italic">
        We collect usage data to improve the tool. Data is automatically deleted if the product or
        account is removed.
      </p>
    </Card>
  );
};
