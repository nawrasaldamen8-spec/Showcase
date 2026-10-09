import { ChevronLeft, ChevronRight, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEscapeKey, useScrollLock } from "../hooks/index.ts";
import { getOptimizedImageUrl } from "../utils/mediaUrl.ts";

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

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.5;

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
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posStartRef = useRef({ x: 0, y: 0 });
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const initialPinchDistRef = useRef<number | null>(null);
  const initialPinchScaleRef = useRef<number>(1);

  useEscapeKey(onClose, true);
  useScrollLock(true);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const clampPosition = useCallback((newPos: { x: number; y: number }, targetScale: number) => {
    if (targetScale <= 1) return { x: 0, y: 0 };
    if (!imageRef.current) return newPos;
    const rect = imageRef.current.getBoundingClientRect();
    const maxPanX = Math.max(0, (rect.width * targetScale - window.innerWidth * 0.9) / 2 + 80);
    const maxPanY = Math.max(0, (rect.height * targetScale - window.innerHeight * 0.85) / 2 + 80);
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, newPos.x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newPos.y)),
    };
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => {
      const next = Math.min(Math.round((prev + ZOOM_STEP) * 10) / 10, MAX_SCALE);
      return next;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(Math.round((prev - ZOOM_STEP) * 10) / 10, MIN_SCALE);
      if (next === MIN_SCALE) {
        setPosition({ x: 0, y: 0 });
      } else {
        setPosition((pos) => clampPosition(pos, next));
      }
      return next;
    });
  }, [clampPosition]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => {
      if (prev > 1) {
        setPosition({ x: 0, y: 0 });
        return 1;
      }
      return 2.5;
    });
  }, []);

  const goToPrev = useCallback(() => {
    if (total <= 1) return;
    resetZoom();
    setCurrentIndex((prev) => {
      const next = (prev - 1 + total) % total;
      onIndexChange?.(next);
      return next;
    });
  }, [total, onIndexChange, resetZoom]);

  const goToNext = useCallback(() => {
    if (total <= 1) return;
    resetZoom();
    setCurrentIndex((prev) => {
      const next = (prev + 1) % total;
      onIndexChange?.(next);
      return next;
    });
  }, [total, onIndexChange, resetZoom]);

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
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        resetZoom();
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
  }, [goToPrev, goToNext, handleZoomIn, handleZoomOut, resetZoom]);

  // Mouse Wheel Zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const zoomDelta = e.deltaY < 0 ? 0.25 : -0.25;
    setScale((prev) => {
      const next = Math.min(Math.max(Math.round((prev + zoomDelta) * 100) / 100, MIN_SCALE), MAX_SCALE);
      if (next === MIN_SCALE) {
        setPosition({ x: 0, y: 0 });
      } else {
        setPosition((pos) => clampPosition(pos, next));
      }
      return next;
    });
  }, [clampPosition]);

  // Mouse Drag / Pan Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1 || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...position };
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current || scale <= 1) return;
    e.preventDefault();
    e.stopPropagation();
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const rawPos = {
      x: posStartRef.current.x + deltaX,
      y: posStartRef.current.y + deltaY,
    };
    setPosition(clampPosition(rawPos, scale));
  }, [scale, clampPosition]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
    }
  }, []);

  // Touch handlers: 1-finger swipe when scale=1, 1-finger pan when scale>1, 2-finger pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      if (t1 && t2) {
        initialPinchDistRef.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        initialPinchScaleRef.current = scale;
      }
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (!touch) return;
      if (scale > 1) {
        isDraggingRef.current = true;
        setIsDragging(true);
        dragStartRef.current = { x: touch.clientX, y: touch.clientY };
        posStartRef.current = { ...position };
      } else {
        touchStartXRef.current = touch.clientX;
        touchStartYRef.current = touch.clientY;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      if (t1 && t2) {
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const ratio = currentDist / initialPinchDistRef.current;
        const newScale = Math.min(Math.max(Math.round(initialPinchScaleRef.current * ratio * 100) / 100, MIN_SCALE), MAX_SCALE);
        setScale(newScale);
        if (newScale === MIN_SCALE) {
          setPosition({ x: 0, y: 0 });
        }
      }
      return;
    }

    if (e.touches.length === 1 && scale > 1 && isDraggingRef.current) {
      const touch = e.touches[0];
      if (!touch) return;
      const deltaX = touch.clientX - dragStartRef.current.x;
      const deltaY = touch.clientY - dragStartRef.current.y;
      const rawPos = {
        x: posStartRef.current.x + deltaX,
        y: posStartRef.current.y + deltaY,
      };
      setPosition(clampPosition(rawPos, scale));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    initialPinchDistRef.current = null;

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      return;
    }

    if (scale === 1 && touchStartXRef.current !== null && touchStartYRef.current !== null) {
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
    }
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
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header / Bar */}
      <div className="absolute top-4 inset-x-4 sm:top-6 sm:inset-x-6 z-20 flex items-center justify-between pointer-events-none gap-2">
        {/* Left: Image Counter (if multiple) */}
        {total > 1 ? (
          <div className="bg-ivory-light/15 backdrop-blur-md text-ivory-light border border-white/10 px-3.5 py-1.5 rounded-full font-gothic text-xs font-semibold uppercase tracking-wider pointer-events-auto">
            <span>Image {currentIndex + 1} of {total}</span>
          </div>
        ) : (
          <div />
        )}

        {/* Center: Zoom Controls Toolbar Pill */}
        <div className="flex items-center gap-1 bg-ivory-light/15 backdrop-blur-md text-ivory-light border border-white/10 px-2 py-1 rounded-full font-gothic text-xs font-semibold pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            disabled={scale <= MIN_SCALE}
            title="Zoom out (-)"
            aria-label="Zoom out"
            className="p-1.5 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              resetZoom();
            }}
            title="Reset zoom (0)"
            aria-label="Reset zoom to 100%"
            className="px-2 py-0.5 font-mono text-xs hover:bg-white/20 rounded-md transition-colors cursor-pointer select-none"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            disabled={scale >= MAX_SCALE}
            title="Zoom in (+)"
            aria-label="Zoom in"
            className="p-1.5 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          {scale > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
              }}
              title="Reset view (0)"
              aria-label="Reset view"
              className="p-1.5 ml-0.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Right: Close Button */}
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
          className="absolute left-3 sm:left-6 z-20 p-2.5 sm:p-3 rounded-full bg-ivory-light/10 text-ivory-light hover:bg-ivory-light/25 focus-visible:outline-2 focus-visible:outline-ivory-light transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      )}

      {/* Main Image Container */}
      <div
        ref={imageContainerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative max-w-[94vw] max-h-[85vh] flex items-center justify-center overflow-hidden touch-none"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          ref={imageRef}
          key={currentImage.url}
          src={getOptimizedImageUrl(currentImage.url, "large")}
          alt={currentImage.alt || alt}
          onDoubleClick={handleDoubleClick}
          draggable={false}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
            cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
            willChange: "transform",
          }}
          className="max-h-[85vh] max-w-[92vw] object-contain rounded-xl select-none animate-in fade-in"
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
          className="absolute right-3 sm:right-6 z-20 p-2.5 sm:p-3 rounded-full bg-ivory-light/10 text-ivory-light hover:bg-ivory-light/25 focus-visible:outline-2 focus-visible:outline-ivory-light transition-colors cursor-pointer"
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
