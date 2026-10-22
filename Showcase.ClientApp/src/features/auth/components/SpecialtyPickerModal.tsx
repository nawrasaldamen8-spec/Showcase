import React, { useMemo, useState } from "react";
import { Check, ChevronLeft, Search, X, XCircle } from "lucide-react";
import { Modal } from "@shared/components/Modal.tsx";
import { useSpecialtiesQuery } from "@shared/hooks/index.ts";
import { ALL_SPECIALTIES, SPECIALTY_CATEGORIES } from "@features/profile/constants.ts";

export interface SpecialtyPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSpecialty: string | null;
  onSelect: (specialty: string | null) => void;
}

export const SpecialtyPickerModal: React.FC<SpecialtyPickerModalProps> = ({
  isOpen,
  onClose,
  selectedSpecialty,
  onSelect,
}) => {
  const { data: apiCategories = [], isLoading } = useSpecialtiesQuery();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = useMemo(() => {
    if (apiCategories && apiCategories.length > 0) {
      return apiCategories.map((c) => ({
        id: c.name,
        name: c.name,
        specialties: c.specialties.map((s) => s.name),
      }));
    }
    return SPECIALTY_CATEGORIES;
  }, [apiCategories]);

  const allSpecialtiesList = useMemo(() => {
    if (apiCategories && apiCategories.length > 0) {
      const set = new Set<string>();
      for (const cat of apiCategories) {
        for (const spec of cat.specialties) {
          set.add(spec.name);
        }
      }
      return Array.from(set);
    }
    return ALL_SPECIALTIES;
  }, [apiCategories]);

  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c) => c.id === selectedCategory) || null;
  }, [selectedCategory, categories]);

  const displayedSpecialties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return allSpecialtiesList.filter((s) => s.toLowerCase().includes(q));
    }
    if (activeCategoryObj) {
      return activeCategoryObj.specialties;
    }
    return [];
  }, [searchQuery, activeCategoryObj, allSpecialtiesList]);

  const handlePick = (item: string | null) => {
    onSelect(item);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Specialty / Field"
      size="md"
    >
      <div className="space-y-3 pt-1">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cloud-dark pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search disciplines..."
            className="w-full pl-10 pr-9 py-2.5 bg-ivory-medium/60 border border-stone/70 rounded-xl font-serif text-sm text-slate-dark placeholder-cloud-dark focus:outline-none focus:border-slate-dark focus:bg-ivory-light transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cloud-dark hover:text-slate-dark p-0.5"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Clear / No specialty option */}
        <button
          type="button"
          onClick={() => handlePick(null)}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between ${
            selectedSpecialty === null && !searchQuery && !selectedCategory
              ? "bg-slate-dark text-ivory-light border-slate-dark font-medium"
              : "bg-ivory-medium/30 hover:bg-ivory-medium border-stone/60 text-slate-dark"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <XCircle
              className={`w-4 h-4 shrink-0 ${
                selectedSpecialty === null && !searchQuery && !selectedCategory
                  ? "text-clay"
                  : "text-cloud-dark"
              }`}
            />
            <span className="font-serif text-xs sm:text-sm truncate">
              No Specialty (General Practitioner)
            </span>
          </div>
          {selectedSpecialty === null && !searchQuery && !selectedCategory && (
            <Check className="w-4 h-4 text-clay shrink-0" />
          )}
        </button>

        {/* Category or Results View */}
        {searchQuery.trim() !== "" || selectedCategory !== null ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
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
                {displayedSpecialties.length} Found
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 pr-1 border border-stone/60 rounded-xl p-2 bg-ivory-medium/20">
              {displayedSpecialties.map((item) => {
                const isSelected = selectedSpecialty === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handlePick(item)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-slate-dark text-ivory-light font-medium"
                        : "hover:bg-ivory-medium text-slate-dark"
                    }`}
                  >
                    <span className="font-serif text-xs truncate">{item}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-clay shrink-0" />}
                  </button>
                );
              })}

              {displayedSpecialties.length === 0 && (
                <div className="py-6 text-center text-cloud-dark font-serif text-xs">
                  {isLoading ? "Loading disciplines..." : `No specialties match "${searchQuery}"`}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="font-gothic text-[10px] font-bold uppercase tracking-wider text-cloud-dark block">
              Browse Categories
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="px-3 py-2.5 rounded-xl bg-ivory-medium/40 hover:bg-ivory-medium border border-stone/60 text-slate-dark hover:border-slate-dark font-gothic text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-between text-left"
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="font-mono text-[10px] text-cloud-dark ml-2 shrink-0">
                    ({cat.specialties.length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
