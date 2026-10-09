import React from "react";
import { Link } from "react-router-dom";
import { BrandLogo } from "@shared/components/BrandLogo.tsx";

export interface AuthCardLayoutProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
}

export const AuthCardLayout: React.FC<AuthCardLayoutProps> = ({
  title,
  subtitle,
  badge = "Portfolio Access",
  children,
  footerContent,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-[85vh] selection:bg-clay selection:text-ivory-light">
      {/* Brand Navigation Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/feed" className="inline-block text-decoration-none group" aria-label="Pority Home">
          <BrandLogo
            variant="full"
            theme="light"
            size="md"
            className="group-hover:opacity-90 transition-opacity"
            textClassName="text-xl font-serif font-bold tracking-tight text-slate-dark"
          />
        </Link>
      </div>

      {/* Screen Header */}
      <header className="border-b border-stone pb-6 mb-8 space-y-2">
        {badge && (
          <div className="flex items-center gap-2">
            <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-clay">
              {badge}
            </span>
          </div>
        )}

        <h1 className="font-gothic font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-slate-dark">
          {title}
        </h1>

        {subtitle && (
          <p className="font-serif text-sm sm:text-base text-slate-dark/75 leading-relaxed">
            {subtitle}
          </p>
        )}
      </header>

      {/* Main Canvas Container */}
      <div className="bg-ivory-light rounded-2xl sm:rounded-card border border-stone/60 p-6 sm:p-8 space-y-6">
        {children}

        {footerContent && (
          <div className="pt-5 border-t border-stone/60 text-center font-serif text-xs text-cloud-dark">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};
