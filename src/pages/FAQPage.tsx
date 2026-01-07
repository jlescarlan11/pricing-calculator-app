import React from 'react';
import { FAQ } from '../components/help/FAQ';

export const FAQPage: React.FC = () => {
  return (
    <div className="space-y-2xl animate-in fade-in duration-700">
      <div className="mb-2xl">
        <h1 className="text-3xl text-ink-900">Pricing Knowledge</h1>
        <p className="text-ink-500 font-medium mt-xs">
          Expert guidance for sustainable business growth.
        </p>
      </div>

      <FAQ />
    </div>
  );
};
