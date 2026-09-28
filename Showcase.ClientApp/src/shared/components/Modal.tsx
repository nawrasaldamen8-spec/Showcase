import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEscapeKey, useScrollLock } from '../hooks/index.ts';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const FOCUSABLE_ELEMENTS_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  useEscapeKey(onClose, isOpen && closeOnEscape);
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;

      const timer = setTimeout(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusables = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR);
        if (focusables.length > 0 && focusables[0]) {
          focusables[0].focus();
        } else {
          dialog.focus();
        }
      }, 50);

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !dialogRef.current) return;

        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR)
        );

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first && last) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last && first) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleTabKey);
      };
    } else {
      previousActiveElement.current?.focus?.();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-dark/60 transition-opacity backdrop-blur-[2px]"
        onClick={() => {
          if (closeOnBackdropClick) {
            onClose();
          }
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        className={`relative w-full ${sizeClasses[size]} bg-ivory-light border border-stone rounded-2xl sm:rounded-card overflow-hidden flex flex-col z-10 transition-all outline-none my-4 sm:my-8`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-3 px-4 sm:px-8 pt-5 sm:pt-8 pb-3.5 sm:pb-4 border-b border-stone/50">
            <div className="min-w-0 flex-1">
              {title && (
                <h3
                  id={titleId}
                  className="font-gothic text-lg sm:text-2xl font-bold tracking-tight text-slate-dark break-words"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p id={descId} className="font-serif text-xs sm:text-sm text-cloud-dark mt-1 break-words">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2 -mr-1 sm:-mr-2 text-cloud-dark hover:text-slate-dark hover:bg-stone/30 rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-slate-dark shrink-0"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-4 sm:px-8 py-4 sm:py-6 overflow-y-auto max-h-[calc(85vh-180px)] text-slate-dark font-serif text-body-sm">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 px-4 sm:px-8 py-3.5 sm:py-5 border-t border-stone/50 bg-ivory-light">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
