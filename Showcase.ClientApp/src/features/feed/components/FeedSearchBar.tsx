import { Search } from "lucide-react";
import React from "react";

export interface FeedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  className?: string;
}

export const FeedSearchBar: React.FC<FeedSearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search people...",
  className = "w-full md:w-80 lg:w-96",
}) => {
  return (
    <form onSubmit={onSubmit} className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cloud-dark" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-3.5 py-2.5 min-h-[42px] bg-ivory-light border border-stone rounded-xl font-serif text-sm text-slate-dark placeholder-cloud-dark focus:outline-none focus:border-clay transition-all"
        />
      </div>
      <button
        type="submit"
        aria-label="Search"
        className="h-[42px] px-3.5 sm:px-4 rounded-xl bg-clay hover:bg-[#c86646] text-ivory-light flex items-center justify-center gap-1.5 font-gothic text-xs font-bold uppercase tracking-wider active:scale-95 transition-all cursor-pointer shrink-0"
      >
        <Search className="w-4 h-4 stroke-[2.2]" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  );
};
