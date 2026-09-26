import { useCallback, useState } from "react";

export interface ImageDimension {
  naturalWidth: number;
  naturalHeight: number;
  aspectRatio: number;
}

export function useAdaptiveImageDimensions() {
  const [dimensions, setDimensions] = useState<Record<number, ImageDimension>>({});

  const handleImageLoad = useCallback((index: number, naturalWidth: number, naturalHeight: number) => {
    if (naturalWidth > 0 && naturalHeight > 0) {
      const aspectRatio = naturalWidth / naturalHeight;
      setDimensions((prev) => {
        if (prev[index]?.aspectRatio === aspectRatio) return prev;
        return {
          ...prev,
          [index]: {
            naturalWidth,
            naturalHeight,
            aspectRatio,
          },
        };
      });
    }
  }, []);

  const calculateOptimalHeight = useCallback(
    (
      index: number,
      containerWidth: number,
      viewportHeight: number,
      fallbackHeight = 360,
      maxViewportRatio = 0.70
    ): number => {
      const maxAllowedHeight = Math.max(260, Math.min(viewportHeight * maxViewportRatio, 620));
      const dim = dimensions[index];

      if (!dim || !containerWidth || containerWidth <= 0) {
        return Math.min(fallbackHeight, maxAllowedHeight);
      }

      // Height needed to display full width at natural aspect ratio
      const naturalDisplayHeight = containerWidth / dim.aspectRatio;

      // Clamp between minimum reasonable preview height (200px) and max allowed screen height
      return Math.round(Math.max(200, Math.min(naturalDisplayHeight, maxAllowedHeight)));
    },
    [dimensions]
  );

  return {
    dimensions,
    handleImageLoad,
    calculateOptimalHeight,
  };
}
