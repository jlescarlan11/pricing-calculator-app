import React from 'react';
import { User, LogOut, Settings, Plus, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { type Preset } from '../../hooks/use-presets';
import { SyncStatus } from '../sync-status';
import { PresetsList } from '../presets';
import { Button } from '../shared';

interface DashboardProps {
  onLoadPreset: (preset: Preset) => void;
  onNewPreset: () => void;
  onEditPreset?: (preset: Preset) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLoadPreset, onNewPreset, onEditPreset }) => {
  const { user, signOut } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-md sm:px-lg lg:px-xl py-xl space-y-xl animate-in fade-in duration-500">
      <SyncStatus />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-lg border-b border-border-subtle pb-lg">
        <div>
          <h1 className="text-3xl font-bold text-ink-900 font-display">Dashboard</h1>
          <p className="text-ink-500 mt-xs">Manage your products and pricing.</p>
        </div>

        <div className="flex items-center gap-md w-full md:w-auto">
          {user && (
            <div className="flex items-center gap-sm px-md py-sm bg-surface rounded-full border border-border-subtle shadow-sm">
              <User size={16} className="text-ink-500" />
              <span className="text-sm font-medium text-ink-900 truncate max-w-[150px]" title={user.email}>
                {user.email}
              </span>
            </div>
          )}
          
          <div className="h-6 w-px bg-border-subtle mx-xs hidden md:block" />

          <Link 
            to="/settings" 
            className="p-sm text-ink-500 hover:text-clay hover:bg-surface-hover rounded-sm transition-colors"
            title="Settings"
          >
            <Settings size={20} />
          </Link>
          
          <button
            onClick={() => signOut()}
            className="p-sm text-ink-500 hover:text-rust hover:bg-rust/5 rounded-sm transition-colors"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <h2 className="text-xl font-bold text-ink-900 flex items-center gap-sm">
          <Package className="text-clay" />
          Your Products
        </h2>
        <Button 
          variant="primary" 
          onClick={() => onNewPreset()}
          className="gap-sm shadow-level-2 w-full sm:w-auto"
        >
          <Plus size={18} />
          New Preset
        </Button>
      </div>

      {/* Presets List */}
      <PresetsList 
        onLoad={onLoadPreset} 
        onEdit={onEditPreset || onLoadPreset} 
      />
    </div>
  );
};
