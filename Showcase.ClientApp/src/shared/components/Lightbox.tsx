import { ChevronLeft, ChevronRight, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEscapeKey, useScrollLock } from "../hooks/index.ts";

export interface LightboxImageItem {
  url: string;
  alt?: string;
}

export interface LightboxProps {
  imageUrl?: string | null;
  images?: Array<LightboxImageItem | string>;
  initialIndex?: number;
  alt?: string;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

const FOCUSABLE_ELEMENTS_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const LightboxDialog: React.FC<LightboxProps> = ({
  imageUrl,
  images,
  initialIndex = 0,
  alt = "Inspected plate detail",
  onClose,
  onIndexChange,
}) => {
  const normalizedImages: LightboxImageItem[] = useMemo(() => {
    if (images && images.length > 0) {
      return images.map((item) =>
        typeof item === "string" ? { url: item, alt } : { url: item.url, alt: item.alt || alt }
      );
    }
    if (imageUrl) {
      return [{ url: imageUrl, alt }];
    }
    return [];
  }, [images, imageUrl, alt]);

  const total = normalizedImages.length;

  const initialIdx = useMemo(() => {
    if (imageUrl && normalizedImages.length > 0) {
      const foundIdx = normalizedImages.findIndex((img) => img.url === imageUrl);
      if (foundIdx >= 0) return foundIdx;
    }
    if (initialIndex >= 0 && initialIndex < normalizedImages.length) {
      return initialIndex;
    }
    return 0;
  }, [imageUrl, normalizedImages, initialIndex]);

  const [currentIndex, setCurrentIndex] = useState(initialIdx);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  useEscapeKey(onClose, true);
  useScrollLock(true);

  const goToPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => {
      const next = (prev - 1 + total) % total;
      onIndexChange?.(next);
      return next;
    });
  }, [total, onIndexChange]);

  const goToNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => {
      const next = (prev + 1) % total;
      onIndexChange?.(next);
      return next;
    });
  }, [total, onIndexChange]);

  // Focus management and keyboard navigation
  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;

    const timer = setTimeout(() => {
      containerRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "Tab" && containerRef.current) {
        const focusables = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR)
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement.current?.focus?.();
    };
  }, [goToPrev, goToNext]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  if (total === 0 || !normalizedImages[currentIndex]) return null;

  const currentImage = normalizedImages[currentIndex];

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image inspection viewer"
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-slate-dark/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 md:p-8 animate-in fade-in duration-200 outline-none select-none"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header / Bar */}
      <div className="absolute top-4 inset-x-4 sm:top-6 sm:inset-x-6 z-10 flex items-center justify-between pointer-events-none">
        {total > 1 ? (
          <div className="bg-ivory-light/15 backdrop-blur-md text-ivory-light border border-white/10 px-3.5 py-1.5 rounded-full font-gothic text-xs font-semibold uppercase tracking-wider shadow-sm">
            <span>Image {currentIndex + 1} of {total}</span>
          </div>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close image inspector"
          className="pointer-events-auto p-2.5 rounded-full bg-ivory-light/10 text-ivory-light hover:bg-ivory-light/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory-light transition-colors cursor-pointer"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      {/* Previous Button */}
      {total > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          aria-label="Previous plate"
          className="absolute left-3 sm:left-6 z-10 p-2.5 sm:p-3 rounded-full bg-ivory-light/10 text-ivory-light hover:bg-ivory-light/25 focus-visible:outline-2 focus-visible:outline-ivory-light transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      )}

      {/* Main Image Container */}
      <div
        className="relative max-w-[94vw] max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={currentImage.url}
          src={currentImage.url}
          alt={currentImage.alt || alt}
          className="max-h-[85vh] max-w-[92vw] object-contain rounded-xl select-none shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95"
          draggable={false}
        />
      </div>

      {/* Next Button */}
      {total > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          aria-label="Next plate"
          className="absolute right-3 sm:right-6 z-10 p-2.5 sm:p-3 rounded-full bg-ivory-light/10 text-ivory-light hover:bg-ivory-light/25 focus-visible:outline-2 focus-visible:outline-ivory-light transition-colors cursor-pointer"
        >
          <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      )}

      {/* Bottom dots indicator for mobile/quick reference */}
      {total > 1 && (
        <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none z-10">
          <div className="bg-slate-dark/70 backdrop-blur-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
            {normalizedImages.map((_, idx) => (
              <span
                key={idx}
                className={`transition-all rounded-full ${
                  currentIndex === idx ? "w-4 h-1.5 bg-ivory-light" : "w-1.5 h-1.5 bg-ivory-light/40"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export const Lightbox: React.FC<LightboxProps> = (props) => {
  const { images, imageUrl, initialIndex } = props;
  const hasContent = (images && images.length > 0) || Boolean(imageUrl);

  if (!hasContent) return null;

  return (
    <LightboxDialog
      key={`${imageUrl ?? ''}_${initialIndex ?? 0}_${Array.isArray(images) ? images.length : 0}`}
      {...props}
    />
  );
};
