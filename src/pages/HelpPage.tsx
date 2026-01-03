import React from 'react';
import { HelpCircle } from 'lucide-react';
import { PricingGuide } from '../components/help/PricingGuide';
import { Card } from '../components/shared/Card';

export const HelpPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
          <HelpCircle size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">How it Works</h1>
          <p className="text-gray-500">Learn about pricing strategies and how to use this tool effectively.</p>
        </div>
      </div>

      <Card className="p-6 md:p-8">
        <PricingGuide showActionButton={false} />
      </Card>
    </div>
  );
};
