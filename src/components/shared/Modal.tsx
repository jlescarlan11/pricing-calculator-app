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
          relative z-10 flex w-full h-full flex-col bg-white shadow-xl
          transition-all duration-300 ease-in-out
          md:h-auto md:max-h-[90vh] md:w-full md:rounded-lg
          ${maxWidth} ${className}
          ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}
        `}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-md py-sm md:px-lg md:py-md">
          <h2 id="modal-title" className="text-lg text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-xs text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-md py-md md:px-lg md:py-lg">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t bg-gray-50 px-md py-sm md:rounded-b-lg md:px-lg md:py-md">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
