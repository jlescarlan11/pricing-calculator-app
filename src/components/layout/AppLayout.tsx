import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { DataWarningBanner } from './DataWarningBanner';
import { SyncStatus } from '../sync-status';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [showTexture, setShowTexture] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pc-show-texture');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('pc-show-texture', JSON.stringify(showTexture));
  }, [showTexture]);

  return (
    <div className="min-h-screen bg-bg-main flex flex-col relative">
      {showTexture && <div className="paper-texture" />}
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <DataWarningBanner />
        <SyncStatus />
        <Header />

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto focus:outline-none">
            <div className="pt-2xl pb-3xl">
              <div className="max-w-[1200px] mx-auto px-lg md:px-[40px] lg:px-[60px]">
                {children}
              </div>
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-border-subtle py-xl md:py-2xl relative z-10">
          <div className="max-w-6xl mx-auto px-md sm:px-lg lg:px-xl">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex flex-col md:flex-row items-center space-y-md md:space-y-0 md:space-x-lg md:order-2">
                <button
                  onClick={() => setShowTexture(!showTexture)}
                  className="text-xs text-ink-500 hover:text-ink-700 transition-colors flex items-center space-x-sm cursor-pointer"
                  title={showTexture ? "Disable background texture" : "Enable background texture"}
                >
                  <span className={`w-3 h-3 rounded-full border border-current ${showTexture ? 'bg-moss border-moss' : 'bg-transparent'}`} />
                  <span>Texture {showTexture ? 'On' : 'Off'}</span>
                </button>
                <p className="text-center text-sm text-ink-500">
                  Designed for small food businesses in the Philippines.
                </p>
              </div>
              <div className="mt-xl md:mt-0 md:order-1 text-center md:text-left">
                <p className="text-sm text-ink-700">
                  &copy; {new Date().getFullYear()} PriceCraft Calculator. Version 0.1.0-alpha
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
