import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEscapeKey, useScrollLock } from '../hooks/index.ts';

export type DrawerPlacement = 'left' | 'right' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  placement = 'right',
  size = 'md',
  title,
  description,
  children,
  footer,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  useEscapeKey(onClose, isOpen && closeOnEscape);
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        drawerRef.current?.focus();
      }, 50);
    } else {
      previousActiveElement.current?.focus?.();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const widthSizes: Record<DrawerSize, string> = {
    sm: 'max-w-xs sm:w-80',
    md: 'max-w-md sm:w-[420px]',
    lg: 'max-w-lg sm:w-[560px]',
  };

  const placementClasses: Record<DrawerPlacement, { container: string; border: string }> = {
    right: {
      container: `fixed inset-y-0 right-0 w-full ${widthSizes[size]}`,
      border: 'border-l border-[#cccbc8]',
    },
    left: {
      container: `fixed inset-y-0 left-0 w-full ${widthSizes[size]}`,
      border: 'border-r border-[#cccbc8]',
    },
    bottom: {
      container: 'fixed inset-x-0 bottom-0 max-h-[85vh] w-full',
      border: 'border-t border-[#cccbc8]',
    },
  };

  const drawerContent = (
    <div className="fixed inset-0 z-50 overflow-hidden" role="presentation">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#141413]/60 backdrop-blur-[2px] transition-opacity"
        onClick={() => {
          if (closeOnBackdropClick) {
            onClose();
          }
        }}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        className={`${placementClasses[placement].container} ${placementClasses[placement].border} bg-[#faf9f5] flex flex-col z-10 outline-none h-full transition-transform duration-200 ease-out`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between px-6 py-5 border-b border-[#cccbc8]/60 shrink-0">
            <div>
              {title && (
                <h3
                  id={titleId}
                  className="font-gothic text-lg sm:text-xl font-bold tracking-tight text-[#141413]"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p id={descId} className="font-serif text-sm text-[#87867f] mt-1">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 -mr-1 text-[#87867f] hover:text-[#141413] hover:bg-[#cccbc8]/30 rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#141413]"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 font-serif text-body-sm text-[#141413]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#cccbc8]/60 bg-[#faf9f5] flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};
