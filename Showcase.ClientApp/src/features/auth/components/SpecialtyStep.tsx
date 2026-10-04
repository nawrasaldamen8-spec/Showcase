import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Search, Sparkles, X, XCircle } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { SPECIALTY_CATEGORIES, ALL_SPECIALTIES } from "@features/profile/constants.ts";

export interface SpecialtyStepProps {
  specialty: string | null;
  onSpecialtyChange: (value: string | null) => void;
  onBack: () => void;
  onNext: (selectedSpecialty: string | null) => void;
}

export const SpecialtyStep: React.FC<SpecialtyStepProps> = ({
  specialty,
  onSpecialtyChange,
  onBack,
  onNext,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return SPECIALTY_CATEGORIES.find((c) => c.id === selectedCategory) || null;
  }, [selectedCategory]);

  const displayedSpecialties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return ALL_SPECIALTIES.filter((s) => s.toLowerCase().includes(q));
    }
    if (activeCategoryObj) {
      return activeCategoryObj.specialties;
    }
    return [];
  }, [searchQuery, activeCategoryObj]);

  const handleSelectSpecialty = (item: string) => {
    onSpecialtyChange(item);
  };

  const handleChooseNoSpecialty = () => {
    onSpecialtyChange(null);
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
            <Sparkles className="w-3.5 h-3.5 text-clay" />
            <span>Primary Specialty / Field <span className="font-serif text-[11px] font-normal text-cloud-dark">(Optional)</span></span>
          </label>
          <span className="font-serif text-xs text-cloud-dark">Step 3 of 4</span>
        </div>
        <p className="font-serif text-xs text-cloud-dark leading-relaxed">
          Choose your professional field from the categories below, or choose to skip.
        </p>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cloud-dark pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search all disciplines (e.g. Medicine, Law, Architecture, Software)..."
          className="w-full pl-10 pr-9 py-2 bg-ivory-medium/80 border border-stone/70 rounded-xl font-serif text-xs sm:text-sm text-slate-dark placeholder-cloud-dark focus:outline-none focus:border-slate-dark focus:bg-ivory-light transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cloud-dark hover:text-slate-dark p-0.5"
            aria-label="Clear search query"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Prominent No Specialty Card */}
      <button
        type="button"
        onClick={handleChooseNoSpecialty}
        className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
          specialty === null && !searchQuery && !selectedCategory
            ? "bg-slate-dark text-ivory-light border-slate-dark font-medium"
            : "bg-ivory-medium/40 hover:bg-ivory-medium border-stone/60 text-slate-dark"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <XCircle className={`w-4 h-4 shrink-0 ${specialty === null && !searchQuery && !selectedCategory ? "text-clay" : "text-cloud-dark"}`} />
          <span className="font-serif text-xs sm:text-sm truncate">
            No Specialty (Skip / General Creator)
          </span>
        </div>
        {specialty === null && !searchQuery && !selectedCategory && <Check className="w-4 h-4 text-clay shrink-0" />}
      </button>

      {/* Selected Specialty Banner (if chosen) */}
      {specialty && (
        <div className="p-3 rounded-xl bg-clay/10 border border-clay/30 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-clay shrink-0" />
            <span className="font-serif text-xs font-semibold text-slate-dark truncate">
              Selected: {specialty}
            </span>
          </div>
          <button
            type="button"
            onClick={handleChooseNoSpecialty}
            className="font-gothic text-[10px] font-bold uppercase tracking-wider text-clay hover:underline ml-2 shrink-0"
          >
            Clear
          </button>
        </div>
      )}

      {/* Progressive View: If searching or category is chosen, show disciplines list with max-h limit */}
      {(searchQuery.trim() !== "" || selectedCategory !== null) ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {selectedCategory && !searchQuery && (
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="inline-flex items-center gap-1 font-gothic text-[11px] font-bold uppercase tracking-wider text-cloud-dark hover:text-slate-dark transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>All Categories</span>
              </button>
            )}
            <span className="font-gothic text-[10px] font-bold uppercase tracking-wider text-cloud-dark ml-auto">
              {displayedSpecialties.length} {displayedSpecialties.length === 1 ? "Specialty" : "Specialties"} Found
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-stone/30 border border-stone/60 rounded-xl p-2 bg-ivory-medium/30">
            {displayedSpecialties.map((item) => {
              const isSelected = specialty === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSelectSpecialty(item)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-dark text-ivory-light font-medium"
                      : "hover:bg-ivory-light text-slate-dark"
                  }`}
                >
                  <span className="font-serif text-xs truncate">{item}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-clay shrink-0" />}
                </button>
              );
            })}

            {displayedSpecialties.length === 0 && (
              <div className="py-6 text-center text-cloud-dark font-serif text-xs">
                No specialties match &ldquo;{searchQuery}&rdquo;.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Initial View: Responsive wrapped category cards */
        <div className="space-y-2">
          <p className="font-gothic text-[11px] font-bold uppercase tracking-[0.14em] text-cloud-dark">
            Browse By Category
          </p>

          <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
            {SPECIALTY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className="px-3.5 py-2.5 rounded-xl bg-ivory-medium/50 hover:bg-ivory-medium border border-stone/60 text-slate-dark hover:border-slate-dark font-gothic text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 grow sm:grow-0 text-left"
              >
                <span>{cat.name}</span>
                <span className="font-mono text-[10px] text-cloud-dark">({cat.specialties.length})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone/60">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNext(null)}
            className="px-3 py-2 font-gothic text-xs font-semibold uppercase tracking-wider text-cloud-dark hover:text-slate-dark transition-colors cursor-pointer"
          >
            Skip
          </button>

          <Button
            type="button"
            variant="clay"
            size="sm"
            onClick={() => onNext(specialty)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {specialty ? "Continue" : "Next Step"}
          </Button>
        </div>
      </div>
    </div>
  );
};
