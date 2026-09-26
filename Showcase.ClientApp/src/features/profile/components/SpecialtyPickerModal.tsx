import React, { useMemo, useState } from "react";
import { Check, Search, Sparkles, X } from "lucide-react";
import { Modal } from "@shared/components/Modal.tsx";
import { Button } from "@shared/components/Button.tsx";
import { CREATIVE_SPECIALTIES } from "../constants.ts";

export interface SpecialtyPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSpecialty?: string | null;
  onSelect: (specialty: string | null) => void;
}

export const SpecialtyPickerModal: React.FC<SpecialtyPickerModalProps> = ({
  isOpen,
  onClose,
  selectedSpecialty,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSpecialties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CREATIVE_SPECIALTIES;
    return CREATIVE_SPECIALTIES.filter((s) => s.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleSelect = (specialty: string) => {
    onSelect(specialty);
    onClose();
  };

  const handleClear = () => {
    onSelect(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Primary Specialty"
      description="Choose the specialty that best represents your skills and work."
      size="md"
    >
      <div className="space-y-4 pt-2">
        {/* Search Filter Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#87867f]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search specialties (e.g. Software, Design, Photography)..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#f0eee6]/70 border border-[#cccbc8] rounded-xl font-serif text-sm text-[#141413] placeholder-[#87867f] focus:outline-none focus:border-[#d97757] focus:bg-[#faf9f5] transition-all"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#87867f] hover:text-[#141413] p-0.5"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scrollable Disciplines List */}
        <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#cccbc8]/30">
          {filteredSpecialties.length > 0 ? (
            filteredSpecialties.map((specialty) => {
              const isSelected = selectedSpecialty === specialty;
              return (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => handleSelect(specialty)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#141413] text-[#faf9f5]"
                      : "hover:bg-[#e8e5dc]/60 text-[#141413]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Sparkles
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? "text-[#d97757]" : "text-[#87867f]"
                      }`}
                    />
                    <span className="font-serif text-sm font-medium truncate">
                      {specialty}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#d97757] shrink-0" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-[#87867f] font-serif text-sm">
              No specialties match &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-3 border-t border-[#cccbc8]/50 flex items-center justify-between">
          {selectedSpecialty ? (
            <button
              type="button"
              onClick={handleClear}
              className="font-gothic text-xs font-semibold uppercase tracking-wider text-[#d97757] hover:underline cursor-pointer"
            >
              Clear Selection
            </button>
          ) : (
            <span className="text-xs font-serif text-[#87867f]">
              Pick one specialty to display on your profile.
            </span>
          )}

          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
