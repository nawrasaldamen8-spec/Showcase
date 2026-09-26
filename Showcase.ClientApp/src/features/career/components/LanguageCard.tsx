import { Pencil, Trash2 } from "lucide-react";
import React from "react";
import type { CareerLanguage } from "@shared/types/index.ts";

export interface LanguageCardProps {
  item: CareerLanguage;
  onEdit?: (item: CareerLanguage) => void;
  onDelete?: (item: CareerLanguage) => void;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({ item: lang, onEdit, onDelete }) => {
  const getProficiencyPercentage = (proficiency?: string) => {
    switch (proficiency?.toLowerCase()) {
      case "native":
      case "bilingual":
        return 100;
      case "fluent":
      case "full professional":
        return 85;
      case "professional working":
      case "advanced":
        return 70;
      case "intermediate":
      case "limited working":
        return 50;
      case "elementary":
      case "beginner":
        return 30;
      default:
        return 60;
    }
  };

  const percent = getProficiencyPercentage(lang.proficiency);

  return (
    <div className="p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-[24px] bg-[#faf9f5] border border-[#cccbc8]/60 hover:border-[#141413] transition-colors shadow-none">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <span className="font-gothic text-[10px] font-bold uppercase tracking-[0.16em] text-[#87867f] block">
            Fluency
          </span>
          <h3 className="font-gothic text-xl font-bold uppercase tracking-tight text-[#141413] break-words">
            {lang.language}
          </h3>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(lang)}
                className="p-1.5 rounded-lg text-[#87867f] hover:text-[#141413] hover:bg-[#f0eee6] transition-colors cursor-pointer"
                aria-label={`Edit ${lang.language}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(lang)}
                className="p-1.5 rounded-lg text-[#87867f] hover:text-red-600 hover:bg-red-50/40 transition-colors cursor-pointer"
                aria-label={`Delete ${lang.language}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-[#d97757] break-words">
          {lang.proficiency}
        </span>
        <span className="font-mono text-[11px] text-[#87867f] shrink-0">{percent}%</span>
      </div>

      {/* Editorial Meter Bar */}
      <div className="w-full h-1.5 rounded-full bg-[#f0eee6] border border-[#cccbc8]/40 overflow-hidden">
        <div
          className="h-full bg-[#141413] rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
