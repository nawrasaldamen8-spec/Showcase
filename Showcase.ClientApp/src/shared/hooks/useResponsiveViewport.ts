import { useEffect, useState } from "react";

export interface ResponsiveViewportState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  aspectRatio: number;
}

export function useResponsiveViewport(): ResponsiveViewportState {
  const [state, setState] = useState<ResponsiveViewportState>(() => {
    if (typeof window === "undefined") {
      return {
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        aspectRatio: 1024 / 768,
      };
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      width: w,
      height: h,
      isMobile: w < 768,
      isTablet: w >= 768 && w < 1024,
      isDesktop: w >= 1024,
      aspectRatio: h > 0 ? w / h : 1,
    };
  });

  useEffect(() => {
    let ticking = false;

    const updateDimensions = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          setState({
            width: w,
            height: h,
            isMobile: w < 768,
            isTablet: w >= 768 && w < 1024,
            isDesktop: w >= 1024,
            aspectRatio: h > 0 ? w / h : 1,
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("resize", updateDimensions);
    window.addEventListener("orientationchange", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("orientationchange", updateDimensions);
    };
  }, []);

  return state;
}
