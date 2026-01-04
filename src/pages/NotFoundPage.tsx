import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center animate-in fade-in duration-500">
      <Card>
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-sakura/20 rounded-full text-rust">
            <span className="text-4xl font-bold">404</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-heading text-ink-900 mb-4">Page Not Found</h1>
        <p className="text-ink-700 mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <Button 
          onClick={() => navigate('/')} 
          className="w-full justify-center gap-2"
          size="lg"
        >
          <Home size={18} />
          Back to Home
        </Button>
      </Card>
    </div>
  );
};
