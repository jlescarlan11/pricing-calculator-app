import React from 'react';
import { Lightbulb } from 'lucide-react';
import { FAQ } from '../components/help/FAQ';
import { Card } from '../components/shared/Card';

export const FAQPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
          <Lightbulb size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing Tips & FAQ</h1>
          <p className="text-gray-500">Common questions and expert advice for pricing your products.</p>
        </div>
      </div>

      <Card className="p-6 md:p-8">
        <FAQ />
      </Card>
    </div>
  );
};
