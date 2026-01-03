import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Calculator, HelpCircle, Menu, X, Lightbulb } from 'lucide-react';
import { PricingExplainerModal } from '../help/PricingExplainerModal';
import { FAQ } from '../help/FAQ';
import { Modal } from '../shared/Modal';

interface HeaderProps {
  onToggleSidebar?: () => void;
  showSidebarButton?: boolean;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  showSidebarButton = false,
  isSidebarOpen = false,
}) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-600'
        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Calculator size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-none">Pricing Calculator</h1>
                <p className="text-xs text-gray-500 font-medium mt-1">For Food Entrepreneurs.</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <NavLink to="/" className={navLinkClass}>
                <Calculator size={18} />
                <span>Calculator</span>
              </NavLink>
              <NavLink to="/help" className={navLinkClass}>
                <HelpCircle size={18} />
                <span>How it works</span>
              </NavLink>
              <NavLink to="/faq" className={navLinkClass}>
                <Lightbulb size={18} />
                <span>Pricing Tips</span>
              </NavLink>
              <div className="h-6 w-px bg-gray-200 mx-2" />
              <span className="text-sm text-gray-400 font-medium">v0.1.0-alpha</span>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              {showSidebarButton && (
                <button
                  type="button"
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={onToggleSidebar}
                  aria-expanded={isSidebarOpen}
                >
                  <span className="sr-only">Toggle sidebar</span>
                  {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
              
              <button
                type="button"
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white py-4 px-4 space-y-2 animate-in fade-in slide-in-from-top-2">
            <NavLink 
              to="/" 
              className={navLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Calculator size={18} />
              Calculator
            </NavLink>
            <NavLink 
              to="/help" 
              className={navLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <HelpCircle size={18} />
              How it works
            </NavLink>
            <NavLink 
              to="/faq" 
              className={navLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Lightbulb size={18} />
              Pricing Tips
            </NavLink>
            <div className="pt-2 flex items-center justify-between text-xs text-gray-500 px-2 border-t border-gray-50 mt-2">
              <span>Version 0.1.0-alpha</span>
              <span>Made for PH Food Businesses</span>
            </div>
          </div>
        )}
      </header>

      <PricingExplainerModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <Modal
        isOpen={isFAQModalOpen}
        onClose={() => setIsFAQModalOpen(false)}
        title="Pricing Tips & FAQ"
        maxWidth="max-w-2xl"
      >
        <FAQ />
      </Modal>
    </>
  );
};