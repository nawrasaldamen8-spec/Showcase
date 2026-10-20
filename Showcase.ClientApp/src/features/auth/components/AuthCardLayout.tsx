import React from "react";
import { Link } from "react-router-dom";
import { BrandLogo } from "@shared/components/BrandLogo.tsx";

export interface AuthCardLayoutProps {
  title: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
}

export const AuthCardLayout: React.FC<AuthCardLayoutProps> = ({
  title,
  children,
  footerContent,
}) => {
  return (
    <div className="relative h-screen max-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 selection:bg-clay selection:text-ivory-light overflow-hidden">
      {/* Full-screen Architectural Logo Background (Fit width & Pure Black) */}
      <div
        className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden select-none"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 150"
          fill="#000000"
          className="w-full h-auto max-w-full object-contain"
        >
          <rect x="5" y="55" width="26" height="90" rx="1" />
          <path d="M 36 15 L 95 15 L 95 90 L 68 90 L 68 35 C 68 22, 36 22, 36 35 L 36 15 Z" />
          <rect x="49" y="90" width="19" height="55" rx="1" />
        </svg>
      </div>

      <div className="relative max-w-2xl lg:max-w-3xl w-full mx-auto my-auto space-y-2 sm:space-y-3">
        {/* Brand Navigation Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/feed"
            className="inline-block text-decoration-none group mix-blend-difference text-white"
            aria-label="Pority Home"
          >
            <BrandLogo
              variant="full"
              theme="current"
              size="md"
              className="group-hover:opacity-90 transition-opacity"
              textClassName="text-lg sm:text-xl font-serif font-bold tracking-tight text-white"
            />
          </Link>
        </div>

        {/* Screen Header - Title Only */}
        <header className="pb-1">
          <h1 className="font-gothic font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-white mix-blend-difference">
            {title}
          </h1>
        </header>

        {/* Main Canvas Container */}
        <div className="bg-ivory-light rounded-2xl sm:rounded-card border border-stone/60 p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-none">
          {children}

          {footerContent && (
            <div className="pt-3 border-t border-stone/60 text-center font-serif text-xs text-cloud-dark">
              {footerContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
