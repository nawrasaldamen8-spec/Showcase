import React from "react";

export interface BrandLogoProps {
  variant?: "symbol" | "full" | "wordmark";
  theme?: "dark" | "light" | "auto" | "current";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  symbolClassName?: string;
  textClassName?: string;
}

const sizeConfig = {
  xs: {
    symbol: "h-5 w-auto",
    text: "text-sm",
    gap: "gap-1.5",
  },
  sm: {
    symbol: "h-6 w-auto",
    text: "text-base",
    gap: "gap-2",
  },
  md: {
    symbol: "h-7 sm:h-8 w-auto",
    text: "text-lg sm:text-xl",
    gap: "gap-2.5",
  },
  lg: {
    symbol: "h-9 sm:h-10 w-auto",
    text: "text-2xl sm:text-3xl",
    gap: "gap-3",
  },
  xl: {
    symbol: "h-12 sm:h-14 w-auto",
    text: "text-3xl sm:text-4xl",
    gap: "gap-3.5",
  },
};

export const PoritySymbol: React.FC<{
  className?: string;
  theme?: "dark" | "light" | "auto" | "current";
}> = ({ className = "h-8 w-auto", theme = "auto" }) => {
  // SVG vector geometry reproducing the architectural emblem with high precision
  return (
    <svg
      viewBox="0 0 100 120"
      fill="currentColor"
      className={`shrink-0 aspect-[100/120] ${
        theme === "dark"
          ? "text-[#faf9f5]"
          : theme === "light"
            ? "text-[#141413]"
            : ""
      } ${className}`}
      aria-hidden="true"
    >
      {/* 1. Left Lower Pillar */}
      <rect x="5" y="44" width="28" height="72" rx="0.5" />

      {/* 2. Main Arch Structure (Roof, Right Upper Column, and Smooth Arch Cutout) */}
      <path
        d="M 35 4 
           H 95 
           V 76 
           H 68 
           V 36 
           C 68 20, 35 20, 35 36 
           Z"
      />

      {/* 3. Lower Right Column / Step */}
      <rect x="51" y="78" width="17" height="38" rx="0.5" />
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "full",
  theme = "auto",
  size = "md",
  className = "",
  symbolClassName = "",
  textClassName = "",
}) => {
  const config = sizeConfig[size];

  const textColorClass =
    theme === "dark"
      ? "text-[#faf9f5]"
      : theme === "light"
        ? "text-[#141413]"
        : "";

  return (
    <div
      className={`inline-flex items-center select-none ${config.gap} ${className}`}
      aria-label="Pority"
    >
      {variant !== "wordmark" && (
        <PoritySymbol
          className={`${config.symbol} ${symbolClassName}`}
          theme={theme}
        />
      )}

      {variant !== "symbol" && (
        <span
          className={`font-serif font-normal tracking-[-0.02em] leading-none ${config.text} ${textColorClass} ${textClassName}`}
        >
          Pority
        </span>
      )}
    </div>
  );
};
