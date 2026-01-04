import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '../components/dashboard';
import { type Preset } from '../hooks/use-presets';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoadPreset = (preset: Preset) => {
    navigate(`/calculator/single/${preset.id}`);
  };

  const handleNewPreset = () => {
    navigate('/calculator/single');
  };

  return <Dashboard onLoadPreset={handleLoadPreset} onNewPreset={handleNewPreset} />;
};
