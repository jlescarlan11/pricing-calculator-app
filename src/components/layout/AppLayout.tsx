import React, { useState } from 'react';
import { X, Package } from 'lucide-react';
import { Button } from '../shared/Button';
import { Header } from './Header';
import { DataWarningBanner } from './DataWarningBanner';

interface AppLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, sidebar }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DataWarningBanner />
      <Header 
        onToggleSidebar={toggleSidebar} 
        showSidebarButton={!!sidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Backdrop */}
        {sidebar && isSidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-gray-600/75 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Container */}
        {sidebar && (
          <aside
            className={`
              fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
          >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between md:hidden">
                <div className="flex items-center gap-2">
                  <Package className="text-blue-600" size={20} />
                  <span className="font-semibold">Saved Products</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
                  <X size={20} />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sidebar}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center space-x-6 md:order-2">
              <p className="text-center text-sm text-gray-400">
                Designed for small food businesses in the Philippines.
              </p>
            </div>
            <div className="mt-8 md:mt-0 md:order-1 text-center md:text-left">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} PriceCraft Calculator. Version 0.1.0-alpha
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
