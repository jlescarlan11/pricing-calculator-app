import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Calculator, HelpCircle, Menu, X, Lightbulb, User, LogIn, Package } from 'lucide-react';
import { PricingExplainerModal } from '../help/PricingExplainerModal';
import { FAQ } from '../help/FAQ';
import { Modal } from '../shared/Modal';
import { useAuth } from '../../hooks/useAuth';

export const Header: React.FC = () => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-sm px-md py-sm rounded-sm text-sm font-medium transition-all duration-300 ${
      isActive
        ? 'bg-clay/10 text-clay'
        : 'text-ink-700 hover:text-clay hover:bg-surface-hover'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-bg-main border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-md sm:px-lg lg:px-xl">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Title */}
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-md group">
              <div className="p-sm bg-clay rounded-md text-white shadow-level-1 transition-transform group-hover:scale-105 duration-300">
                <Calculator size={24} />
              </div>
              <div>
                <h1 className="text-xl text-ink-900 leading-none">PriceCraft</h1>
                <p className="text-xs text-ink-500 font-medium mt-xs uppercase tracking-wider">Mindful Pricing</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-sm">
              {user && (
                <NavLink to="/dashboard" className={navLinkClass}>
                  <Package size={18} />
                  <span>Dashboard</span>
                </NavLink>
              )}
              <NavLink to="/calculator/single" className={navLinkClass}>
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
              
              <div className="h-6 w-px bg-border-subtle mx-md" />
              
              {user ? (
                <NavLink to="/account" className={navLinkClass}>
                  <User size={18} />
                  <span>Account</span>
                </NavLink>
              ) : (
                <NavLink to="/auth" className={navLinkClass}>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </NavLink>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-sm">
               {user ? (
                <Link to="/account" className="p-sm rounded-sm text-ink-700 hover:text-clay">
                  <User size={24} />
                </Link>
              ) : (
                <Link to="/auth" className="p-sm rounded-sm text-ink-700 hover:text-clay">
                  <LogIn size={24} />
                </Link>
              )}
              <button
                type="button"
                className="p-sm rounded-sm text-ink-700 hover:text-clay hover:bg-surface-hover transition-colors"
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
          <div className="md:hidden border-t border-border-subtle bg-bg-main py-lg px-lg space-y-sm animate-in fade-in slide-in-from-top-4 duration-500">
            {user && (
              <NavLink 
                to="/dashboard" 
                className={navLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Package size={18} />
                Dashboard
              </NavLink>
            )}
            <NavLink 
              to="/calculator/single" 
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
             <NavLink 
              to={user ? "/account" : "/auth"}
              className={navLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {user ? <User size={18} /> : <LogIn size={18} />}
              {user ? "Account" : "Sign In"}
            </NavLink>
            <div className="pt-md flex items-center justify-between text-[10px] text-ink-500 px-md border-t border-border-subtle mt-md uppercase tracking-widest">
              <span>Version 0.1.0</span>
              <span>Made with intention</span>
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
