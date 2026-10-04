import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-ivory-light border-t border-stone text-slate-dark transition-colors mt-auto overflow-hidden">
      {/* Desktop / Tablet View */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20 space-y-10 sm:space-y-14">
        {/* Top Info Grid: Brand Description (Left) & Platform Links (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Brand Statement (Left 7-8 cols) */}
          <div className="md:col-span-7 lg:col-span-8 space-y-3">
            <p className="font-serif text-base sm:text-lg leading-relaxed text-slate-dark/85 max-w-md">
              A modern digital gallery for architectural practices, researchers, and creators to publish their work.
            </p>
          </div>

          {/* Platform Navigation Links (Right 5-4 cols) */}
          <div className="md:col-span-5 lg:col-span-4 space-y-3 md:pl-6 lg:pl-12">
            <h4 className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-cloud-dark">
              Platform
            </h4>
            <ul className="space-y-2 font-serif text-sm">
              <li>
                <Link to="/studio" className="text-slate-dark hover:text-clay transition-colors">
                  Studio
                </Link>
              </li>
              <li>
                <Link to="/career" className="text-slate-dark hover:text-clay transition-colors">
                  Career Hub
                </Link>
              </li>
              <li>
                <Link to="/posts/new" className="text-slate-dark hover:text-clay transition-colors">
                  New Project
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-slate-dark hover:text-clay transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Giant Bold Statement Typography (Centered - No Logo Icon) */}
        <div className="pt-4 sm:pt-8 border-t border-stone/60 overflow-hidden select-none flex justify-center">
          <h2 className="font-gothic font-black text-[17vw] sm:text-[16vw] md:text-[15vw] lg:text-[170px] xl:text-[200px] tracking-[-0.045em] text-slate-dark leading-[0.82] uppercase text-center truncate pointer-events-none w-full">
            Pority
          </h2>
        </div>

        {/* Bottom Bar: Copyright (Centered) */}
        <div className="pt-2 flex items-center justify-center gap-4 text-xs font-serif text-cloud-dark border-t border-stone/40 text-center">
          <p className="font-serif text-xs text-cloud-dark text-center">
            &copy; {currentYear} Pority. All rights reserved.
          </p>
          <span className="text-stone">&bull;</span>
          <div className="flex items-center gap-3">
            <Link to="/terms" className="text-cloud-dark hover:text-slate-dark transition-colors">
              Terms of Service
            </Link>
            <span className="text-stone">&bull;</span>
            <Link to="/privacy" className="text-cloud-dark hover:text-slate-dark transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Only View */}
      <div className="md:hidden py-4 px-4 border-t border-stone/40">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] font-serif text-cloud-dark text-center">
          <span>&copy; {currentYear} Pority. All rights reserved.</span>
          <span className="text-stone">&bull;</span>
          <Link to="/terms" className="text-cloud-dark hover:text-slate-dark transition-colors">
            Terms of Service
          </Link>
          <span className="text-stone">&bull;</span>
          <Link to="/privacy" className="text-cloud-dark hover:text-slate-dark transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};
