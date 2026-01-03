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

const ANIMATION_DURATION = 300;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md:max-w-lg',
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
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className={`
          relative z-10 flex flex-col bg-white shadow-level-3
          transition-all duration-300 ease-in-out
          w-full mx-md shrink-0 md:h-auto md:max-h-[90vh] md:rounded-md
          ${maxWidth} ${className}
          ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}
        `}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-lg py-md md:px-xl md:py-lg">
          <div id="modal-title" className="text-xl font-bold text-ink-900">
            {title}
          </div>
          <button
            onClick={onClose}
            className="rounded-round p-sm text-ink-400 hover:bg-surface-hover hover:text-ink-900 focus:outline-none focus:ring-2 focus:ring-clay/20 transition-all"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-lg py-lg md:px-xl md:py-xl">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t bg-surface/50 px-lg py-md md:rounded-b-md md:px-xl md:py-lg">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
