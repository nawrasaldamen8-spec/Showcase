import { ArrowUpDown, Search, X } from "lucide-react";
import React from "react";

export type StudioTabFilter = "all" | "published" | "drafts";
export type StudioSortOption = "newest" | "oldest" | "title";

export interface StudioFilterBarProps {
  activeTab: StudioTabFilter;
  onTabChange: (tab: StudioTabFilter) => void;
  counts: { total: number; published: number; drafts: number };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: StudioSortOption;
  onSortChange: (sort: StudioSortOption) => void;
}

export const StudioFilterBar: React.FC<StudioFilterBarProps> = ({
  activeTab,
  onTabChange,
  counts,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#cccbc8]">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <nav className="flex items-center gap-4 sm:gap-6" aria-label="Status filter tabs">
          <button
            type="button"
            onClick={() => onTabChange("all")}
            className={`font-gothic text-[13px] font-semibold uppercase tracking-[0.10em] pb-2 border-b-2 -mb-[13px] transition-colors cursor-pointer ${
              activeTab === "all"
                ? "text-[#141413] border-[#141413]"
                : "text-[#87867f] border-transparent hover:text-[#141413]"
            }`}
          >
            All
            <span className="ml-1.5 text-xs font-normal opacity-75 font-serif">({counts.total})</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("published")}
            className={`font-gothic text-[13px] font-semibold uppercase tracking-[0.10em] pb-2 border-b-2 -mb-[13px] transition-colors cursor-pointer ${
              activeTab === "published"
                ? "text-[#141413] border-[#141413]"
                : "text-[#87867f] border-transparent hover:text-[#141413]"
            }`}
          >
            Published
            <span className="ml-1.5 text-xs font-normal opacity-75 font-serif">({counts.published})</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("drafts")}
            className={`font-gothic text-[13px] font-semibold uppercase tracking-[0.10em] pb-2 border-b-2 -mb-[13px] transition-colors cursor-pointer ${
              activeTab === "drafts"
                ? "text-[#141413] border-[#141413]"
                : "text-[#87867f] border-transparent hover:text-[#141413]"
            }`}
          >
            Drafts
            <span className="ml-1.5 text-xs font-normal opacity-75 font-serif">({counts.drafts})</span>
          </button>
        </nav>

        <div className="hidden sm:block h-4 w-px bg-[#cccbc8]" />

        <div className="relative flex-1 sm:w-60 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#87867f]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-8 pr-7 py-2 min-h-[38px] bg-[#faf9f5] border border-[#cccbc8] rounded-xl text-xs font-serif text-[#141413] placeholder-[#87867f] focus:outline-none focus:border-[#141413] shadow-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#87867f] hover:text-[#141413] cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
        <div className="flex items-center gap-1.5 bg-[#faf9f5] border border-[#cccbc8] rounded-xl px-3 py-2 min-h-[38px] shadow-none">
          <ArrowUpDown className="h-3.5 w-3.5 text-[#87867f] shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as StudioSortOption)}
            className="bg-transparent text-xs font-gothic uppercase tracking-wider text-[#141413] cursor-pointer focus:outline-none pr-1"
            aria-label="Sort projects"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
