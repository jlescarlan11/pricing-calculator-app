import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

const ANIMATION_DURATION = 400;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-[500px]',
  className = '',
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync shouldRender with isOpen immediately when opening
  if (isOpen && !shouldRender) {
    setShouldRender(true);
  }

  // Handle unmounting with delay for animation
  useEffect(() => {
    if (!isOpen && shouldRender) {
      const timeoutId = setTimeout(() => setShouldRender(false), ANIMATION_DURATION);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, shouldRender]);

  // Lock body scroll
  useEffect(() => {
    if (shouldRender) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [shouldRender]);

  // Focus trap
  useEffect(() => {
    if (!shouldRender) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (!modalRef.current) return;
      
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab') {
        handleTabKey(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Initial focus
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    } else {
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shouldRender, onClose]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-md max-[480px]:p-0`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-[rgba(58,54,50,0.3)] backdrop-blur-[4px] transition-opacity duration-300 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className={`
          relative z-10 flex flex-col bg-bg-main shadow-level-3 rounded-[16px]
          transition-all duration-400 [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)]
          w-full shrink-0 max-h-[90vh]
          max-[480px]:h-full max-[480px]:max-h-none max-[480px]:rounded-none
          p-[40px] max-[480px]:p-lg
          ${maxWidth} ${className}
          ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}
        `}
        tabIndex={-1}
      >
        {/* Close Button (Ghost Style) */}
        <button
          onClick={onClose}
          className="absolute top-md right-md rounded-round p-sm text-ink-500 hover:bg-surface-hover hover:text-ink-900 focus:outline-none focus:ring-2 focus:ring-clay/20 transition-all z-20"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="mb-lg pr-[60px]">
          <h2 id="modal-title" className="text-[28px] font-serif font-semibold text-ink-900 leading-heading">
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-xl pt-lg border-t border-border-subtle">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
