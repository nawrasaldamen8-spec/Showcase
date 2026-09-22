import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#faf9f5] border-t border-[#cccbc8] text-[#141413] transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-[#cccbc8]/60">
          {/* Brand & Curation Statement (Left 6 cols) */}
          <div className="md:col-span-6 space-y-4">
            <Link to="/explore" className="inline-block text-decoration-none">
              <span className="font-gothic font-extrabold text-2xl tracking-[0.18em] uppercase text-[#141413] hover:text-[#d97757] transition-colors">
                SHOWCASE
              </span>
            </Link>
            <p className="font-serif text-base sm:text-lg leading-relaxed text-[#141413]/85 max-w-lg">
              An open-canvas digital exhibition celebrating visionary architecture, documentary photography, industrial design, and contemporary visual culture.
            </p>
            <p className="font-serif text-xs italic text-[#87867f]">
              Designed with the Warm Gallery aesthetic — where geometric headlines meet editorial reading text on ivory canvas.
            </p>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#87867f]">
              Exhibition
            </h4>
            <ul className="space-y-2 font-serif text-sm">
              <li>
                <Link to="/explore" className="text-[#141413] hover:text-[#d97757] transition-colors">
                  Curated Feed
                </Link>
              </li>
              <li>
                <Link to="/studio" className="text-[#141413] hover:text-[#d97757] transition-colors">
                  Creator Studio
                </Link>
              </li>
              <li>
                <Link to="/posts/new" className="text-[#141413] hover:text-[#d97757] transition-colors">
                  Submit a Work
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-[#141413] hover:text-[#d97757] transition-colors">
                  Artist Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Editorial & Connect (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#87867f]">
              Connect
            </h4>
            <ul className="space-y-2 font-serif text-sm">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#141413] hover:text-[#d97757] transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#141413] hover:text-[#d97757] transition-colors"
                >
                  Instagram Archives
                </a>
              </li>
              <li>
                <a
                  href="https://vsco.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#141413] hover:text-[#d97757] transition-colors"
                >
                  VSCO Visuals
                </a>
              </li>
              <li>
                <span className="text-[#87867f] text-xs">
                  Storage: Cloudflare R2
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-serif text-[#87867f]">
          <p>© {currentYear} SHOWCASE Gallery Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="font-gothic text-[11px] uppercase tracking-wider text-[#141413]/70">
              Ivory Medium Canvas (#f0eee6)
            </span>
            <span className="h-1 w-1 rounded-full bg-[#cccbc8]" />
            <span className="font-gothic text-[11px] uppercase tracking-wider text-[#d97757]">
              Clay Accent (#d97757)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
