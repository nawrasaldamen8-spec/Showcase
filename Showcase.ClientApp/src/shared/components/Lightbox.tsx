import { ChevronLeft, ChevronRight, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import { animate, AnimatePresence, motion, useMotionValue } from "motion/react";
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

const MIN_SCALE = 1;
const MAX_SCALE = 4;

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
  const [dragBounds, setDragBounds] = useState({ left: 0, right: 0, top: 0, bottom: 0 });

  const imgRef = useRef<HTMLImageElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEscapeKey(onClose, true);
  useScrollLock(true);

  const resetZoom = useCallback(() => {
    setScale(1);
    animate(x, 0, { type: "spring", stiffness: 350, damping: 30 });
    animate(y, 0, { type: "spring", stiffness: 350, damping: 30 });
  }, [x, y]);

  const handleClose = useCallback(() => {
    resetZoom();
    onClose();
  }, [resetZoom, onClose]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    resetZoom();
    setCurrentIndex((prev) => {
      const next = (prev - 1 + total) % total;
      onIndexChange?.(next);
      return next;
    });
  }, [total, onIndexChange, resetZoom]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    resetZoom();
    setCurrentIndex((prev) => {
      const next = (prev + 1) % total;
      onIndexChange?.(next);
      return next;
    });
  }, [total, onIndexChange, resetZoom]);

  // Sync external index changes without remounting the dialog
  useEffect(() => {
    if (typeof initialIndex === "number" && initialIndex >= 0 && initialIndex < normalizedImages.length) {
      setCurrentIndex(initialIndex);
      resetZoom();
    }
  }, [initialIndex, normalizedImages.length, resetZoom]);

  // Update drag constraints dynamically based on image size and scale
  useEffect(() => {
    if (scale <= 1 || !imgRef.current) {
      setDragBounds({ left: 0, right: 0, top: 0, bottom: 0 });
      return;
    }

    const width = imgRef.current.offsetWidth || imgRef.current.naturalWidth || window.innerWidth * 0.9;
    const height = imgRef.current.offsetHeight || imgRef.current.naturalHeight || window.innerHeight * 0.85;

    const maxX = Math.max(120, (width * scale - window.innerWidth) / 2 + 100);
    const maxY = Math.max(120, (height * scale - window.innerHeight) / 2 + 100);

    setDragBounds({
      left: -maxX,
      right: maxX,
      top: -maxY,
      bottom: maxY,
    });
  }, [scale]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setScale((prev) => Math.min(MAX_SCALE, Number((prev + 0.5).toFixed(1))));
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setScale((prev) => {
          const next = Math.max(MIN_SCALE, Number((prev - 0.5).toFixed(1)));
          if (next === MIN_SCALE) resetZoom();
          return next;
        });
      } else if (e.key === "0") {
        e.preventDefault();
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, handlePrev, handleNext, resetZoom]);

  // Wheel Zoom with spring reset when dropping back to 1
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      setScale((prev) => {
        const next = Math.min(Math.max(MIN_SCALE, Number((prev + delta).toFixed(2))), MAX_SCALE);
        if (next <= MIN_SCALE) {
          animate(x, 0, { type: "spring", stiffness: 350, damping: 30 });
          animate(y, 0, { type: "spring", stiffness: 350, damping: 30 });
          return MIN_SCALE;
        }
        return next;
      });
    },
    [x, y]
  );

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (scale > 1) {
        resetZoom();
      } else {
        handleClose();
      }
    }
  };

  if (total === 0 || !normalizedImages[currentIndex]) return null;

  const currentImage = normalizedImages[currentIndex];

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        role="dialog"
        aria-modal="true"
        aria-label="Image inspection viewer"
        className="fixed inset-0 z-50 bg-slate-dark/95 backdrop-blur-md select-none overflow-hidden touch-none"
        onClick={handleBackdropClick}
      >
        {/* Full Viewport Image Canvas / Stage */}
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden touch-none z-10"
          onClick={handleBackdropClick}
          onWheel={handleWheel}
        >
          <motion.img
            ref={imgRef}
            src={getOptimizedImageUrl(currentImage.url, "large")}
            alt={currentImage.alt || alt}
            draggable={false}
            drag={scale > 1}
            dragConstraints={dragBounds}
            dragElastic={0.15}
            style={{ x, y }}
            animate={{ scale }}
            transition={{
              scale: { type: "spring", stiffness: 350, damping: 28 },
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (scale === 1) {
                setScale(2);
              } else {
                resetZoom();
              }
            }}
            className={`max-w-[94vw] max-h-[90vh] w-auto h-auto object-contain select-none pointer-events-auto ${
              scale > 1 ? "cursor-grab active:cursor-grabbing rounded-none" : "cursor-zoom-in rounded-xl"
            }`}
          />
        </div>

        {/* Floating Top Header with Drop Shadow over Image */}
        <div
          className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/75 via-black/35 to-transparent pointer-events-none select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Zoom Controls Pill (Plate counter removed as requested) */}
          <div className="flex items-center gap-1 bg-ivory-light/15 backdrop-blur-md border border-white/10 rounded-full px-2 py-1 shadow-sm pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                setScale((prev) => {
                  const next = Math.max(MIN_SCALE, Number((prev - 0.5).toFixed(1)));
                  if (next === MIN_SCALE) resetZoom();
                  return next;
                });
              }}
              disabled={scale <= MIN_SCALE}
              className="p-1.5 rounded-full text-ivory-light hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Zoom out (-)"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={resetZoom}
              className="text-xs font-mono px-2 py-0.5 text-ivory-light hover:bg-white/20 rounded transition-colors cursor-pointer min-w-[3.2rem] text-center"
              title="Reset zoom (0)"
              aria-label="Reset zoom"
            >
              {Math.round(scale * 100)}%
            </button>

            <button
              type="button"
              onClick={() => {
                setScale((prev) => Math.min(MAX_SCALE, Number((prev + 0.5).toFixed(1))));
              }}
              disabled={scale >= MAX_SCALE}
              className="p-1.5 rounded-full text-ivory-light hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Zoom in (+)"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {scale > 1 && (
              <button
                type="button"
                onClick={resetZoom}
                className="p-1.5 rounded-full hover:bg-white/20 text-ivory-light transition-colors cursor-pointer"
                title="Reset view (0)"
                aria-label="Reset view"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="pointer-events-auto w-10 h-10 rounded-full bg-ivory-light/15 hover:bg-ivory-light/30 text-ivory-light backdrop-blur-md border border-white/10 flex items-center justify-center transition-colors cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-white/40"
            title="Close (Esc)"
            aria-label="Close image inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Previous Button */}
        {total > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className={`absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-ivory-light/15 hover:bg-ivory-light/30 text-ivory-light backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-300 z-30 pointer-events-auto cursor-pointer shadow-md focus-visible:outline-2 focus-visible:outline-white/40 ${
              scale > 1 ? "opacity-0 pointer-events-none scale-90" : "opacity-100 pointer-events-auto scale-100"
            }`}
            title="Previous plate (ArrowLeft)"
            aria-label="Previous plate"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {total > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className={`absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-ivory-light/15 hover:bg-ivory-light/30 text-ivory-light backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-300 z-30 pointer-events-auto cursor-pointer shadow-md focus-visible:outline-2 focus-visible:outline-white/40 ${
              scale > 1 ? "opacity-0 pointer-events-none scale-90" : "opacity-100 pointer-events-auto scale-100"
            }`}
            title="Next plate (ArrowRight)"
            aria-label="Next plate"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Bottom floating reset button when zoomed (Drag to pan removed as requested) */}
        {scale > 1 && (
          <div className="absolute bottom-5 inset-x-0 flex justify-center pointer-events-none z-30 animate-in fade-in duration-200">
            <button
              type="button"
              onClick={resetZoom}
              className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-slate-dark/85 backdrop-blur-md border border-white/15 text-xs text-ivory-light hover:text-white hover:bg-slate-dark shadow-lg font-gothic tracking-wide transition-all cursor-pointer"
              title="Reset view (0)"
              aria-label="Reset view"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset view</span>
            </button>
          </div>
        )}

        {/* Bottom dots indicator when not zoomed */}
        {total > 1 && scale === 1 && (
          <div className="absolute bottom-5 inset-x-0 flex items-center justify-center pointer-events-none z-30 transition-opacity duration-300">
            <div className="bg-slate-dark/70 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-white/10 pointer-events-auto shadow-md">
              {normalizedImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetZoom();
                    setCurrentIndex(idx);
                    onIndexChange?.(idx);
                  }}
                  aria-label={`Go to image ${idx + 1}`}
                  className={`transition-all rounded-full p-0 border-none cursor-pointer ${
                    currentIndex === idx
                      ? "w-4 h-1.5 bg-ivory-light"
                      : "w-1.5 h-1.5 bg-ivory-light/40 hover:bg-ivory-light/70"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export const Lightbox: React.FC<LightboxProps> = (props) => {
  const { images, imageUrl } = props;
  const hasContent = (images && images.length > 0) || Boolean(imageUrl);

  if (!hasContent) return null;

  return <LightboxDialog {...props} />;
};
