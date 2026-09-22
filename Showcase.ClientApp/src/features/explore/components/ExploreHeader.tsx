import React from 'react';
import { Search, X } from 'lucide-react';
import { CATEGORIES } from '../types.ts';

export interface ExploreHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  totalCount?: number;
}

export const ExploreHeader: React.FC<ExploreHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  totalCount,
}) => {
  return (
    <section className="pt-6 sm:pt-10 pb-8 border-b border-[#cccbc8]/60">
      {/* Editorial Headline & Subtitle Hero Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-baseline">
        <div className="lg:col-span-7">
          <span className="font-gothic text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-[#87867f] block mb-2 sm:mb-3">
            Exhibition Archive &bull; Vol. 01
          </span>
          <h1 className="font-gothic font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#141413] tracking-[-0.04em] leading-[1.05]">
            Curated Visual Showcase
          </h1>
        </div>

        <div className="lg:col-span-5">
          <p className="font-serif text-[17px] sm:text-[19px] leading-relaxed text-[#141413]/85">
            An open-canvas digital exhibition exploring brutalist architecture, tactile industrial design, documentary photographic essays, and typographic studies.
          </p>
          {totalCount !== undefined && (
            <p className="mt-2 font-gothic text-xs uppercase tracking-[0.12em] text-[#87867f]">
              {totalCount} {totalCount === 1 ? 'Exhibition Plate' : 'Exhibition Plates'} Indexed
            </p>
          )}
        </div>
      </div>

      {/* Real-time Search Input */}
      <div className="mt-8 sm:mt-10 max-w-xl">
        <div className="relative flex items-center">
          <Search
            className="absolute left-4 h-4 w-4 text-[#87867f] pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, description, artist, or tag..."
            aria-label="Search curated works"
            className="w-full bg-[#faf9f5] text-[#141413] font-serif text-[15px] sm:text-[16px] pl-11 pr-10 py-3 rounded-full border border-[#cccbc8] focus:border-[#141413] outline-none transition-colors placeholder:text-[#87867f]/70"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search input"
              className="absolute right-3.5 p-1 rounded-full text-[#87867f] hover:text-[#141413] hover:bg-[#cccbc8]/20 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Pure Typographic Category / Tag Filter Tabs */}
      <nav
        className="mt-8 flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth"
        aria-label="Filter works by category"
      >
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory.toLowerCase() === category.toLowerCase();
          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              aria-current={isActive ? 'page' : undefined}
              className={`font-gothic text-[13px] font-semibold uppercase tracking-[0.10em] pb-2 transition-all whitespace-nowrap cursor-pointer border-b ${
                isActive
                  ? 'text-[#141413] border-[#141413]'
                  : 'text-[#87867f] border-transparent hover:text-[#141413] hover:border-[#cccbc8]'
              }`}
            >
              {category}
            </button>
          );
        })}
      </nav>
    </section>
  );
};
