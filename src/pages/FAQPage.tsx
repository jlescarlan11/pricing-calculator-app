import React from 'react';
import { Lightbulb } from 'lucide-react';
import { FAQ } from '../components/help/FAQ';

export const FAQPage: React.FC = () => {
  return (
    <div className="space-y-2xl animate-in fade-in duration-700">
      <div className="flex items-center gap-lg mb-2xl px-lg sm:px-0">
        <div className="p-md bg-surface rounded-lg text-clay border border-border-subtle shadow-level-1">
          <Lightbulb size={32} />
        </div>
        <div>
          <h1 className="text-3xl text-ink-900">Pricing Knowledge</h1>
          <p className="text-ink-500 font-medium mt-xs">
            Expert guidance for sustainable business growth.
          </p>
        </div>
      </div>

      <FAQ />
    </div>
  );
};
