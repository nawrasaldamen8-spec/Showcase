import React from "react";
import { Link, Outlet } from "react-router-dom";
import { BrandLogo } from "@shared/components/BrandLogo.tsx";

export const AuthLayout: React.FC = () => {
  return (
    <div className="relative min-h-dvh flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-10 selection:bg-clay selection:text-ivory-light overflow-x-hidden">
      {/* Persistent Full-screen Architectural Logo Background (Fit width & Pure Black) */}
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

      {/* Main Grid Content */}
      <div className="relative max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
        {/* Left Column: Platform Branding & Editorial Heading */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
          <div className="inline-block">
            <Link
              to="/"
              className="inline-block text-decoration-none group mix-blend-difference text-white"
              aria-label="Pority Home"
            >
              <BrandLogo
                variant="full"
                theme="current"
                size="md"
                className="group-hover:opacity-90 transition-opacity"
                textClassName="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white"
              />
            </Link>
          </div>

          <div className="space-y-2 sm:space-y-4">
            <h1 className="font-gothic font-extrabold text-3xl sm:text-5xl lg:text-6xl uppercase tracking-[-0.03em] text-white mix-blend-difference leading-[1.08] sm:leading-[1.05]">
              Curate Your Built Narrative.
            </h1>
          </div>
        </div>

        {/* Right Column: Active Card Route */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
