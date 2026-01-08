import React, { useState, useEffect } from 'react';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [showTexture] = useState(() => {
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
    <div className="min-h-screen bg-bg-main flex flex-col relative overflow-x-hidden">
      {showTexture && <div className="paper-texture" />}

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 focus:outline-none">
          <div className="pt-lg md:pt-2xl pb-xl md:pb-3xl">
            <div className="max-w-[1200px] mx-auto px-md md:px-[40px] lg:px-[60px]">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};
