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
  badge,
  children,
  footerContent,
}) => {
  return (
    <div className="min-h-screen bg-[#f0eee6] flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 selection:bg-[#d97757] selection:text-[#faf9f5]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Brand Logo */}
        <div className="flex justify-center">
          <Link to="/studio" className="inline-block text-decoration-none group" aria-label="Pority Home">
            <BrandLogo
              variant="full"
              theme="light"
              size="lg"
              className="group-hover:opacity-90 transition-opacity"
              textClassName="text-2xl font-serif font-bold tracking-tight text-[#141413]"
            />
          </Link>
        </div>

        {badge && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8e5dc] border border-[#cccbc8] font-gothic text-[11px] font-bold uppercase tracking-[0.14em] text-[#d97757]">
            {badge}
          </div>
        )}

        <h1 className="font-gothic font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-[#141413]">
          {title}
        </h1>

        {subtitle && (
          <p className="font-serif text-sm text-[#141413]/70 max-w-sm mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-[#faf9f5] py-8 px-6 sm:px-10 border border-[#cccbc8] rounded-2xl shadow-none space-y-6">
          {children}

          {footerContent && (
            <div className="pt-5 border-t border-[#cccbc8]/60 text-center font-serif text-xs text-[#87867f]">
              {footerContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
