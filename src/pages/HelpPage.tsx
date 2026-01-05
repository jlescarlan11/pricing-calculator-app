import React from 'react';
import { HelpCircle } from 'lucide-react';
import { PricingGuide } from '../components/help/PricingGuide';
import { Card } from '../components/shared/Card';

export const HelpPage: React.FC = () => {
  return (
    <div className="space-y-2xl animate-in fade-in duration-700">
      <div className="flex items-center gap-lg mb-2xl px-lg sm:px-0">
        <div className="p-md bg-surface rounded-lg text-clay border border-border-subtle shadow-level-1">
          <HelpCircle size={32} />
        </div>
        <div>
          <h1 className="text-3xl text-ink-900">Understanding Pricing</h1>
          <p className="text-ink-500 font-medium mt-xs">
            Master the art of profitable pricing with intention.
          </p>
        </div>
      </div>

      <Card noPadding className="border-none bg-transparent shadow-none">
        <PricingGuide showActionButton={false} />
      </Card>
    </div>
  );
};
