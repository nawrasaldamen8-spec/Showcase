import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    if (!closeOnEscape) {
      e.preventDefault();
      return;
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (!closeOnBackdropClick) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!isInDialog) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      className={`fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-full ${sizeClasses[size]} bg-ivory-light border border-stone rounded-2xl sm:rounded-card p-0 text-slate-dark outline-none z-50 backdrop:bg-slate-dark/60 backdrop:backdrop-blur-[2px] transition-all my-auto max-h-[90vh] flex flex-col overflow-hidden`}
    >
      {/* Header */}
      {(title || showCloseButton) && (
        <div className="flex items-start justify-between gap-3 px-4 sm:px-8 pt-5 sm:pt-8 pb-3.5 sm:pb-4 border-b border-stone/50 shrink-0">
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
      <div className="px-4 sm:px-8 py-4 sm:py-6 overflow-y-auto max-h-[calc(85vh-180px)] text-slate-dark font-serif text-body-sm flex-1">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 px-4 sm:px-8 py-3.5 sm:py-5 border-t border-stone/50 bg-ivory-light shrink-0">
          {footer}
        </div>
      )}
    </dialog>
  );

  return createPortal(modalContent, document.body);
};
