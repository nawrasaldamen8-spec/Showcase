import React from "react";
import type { CareerLanguage } from "@shared/types/index.ts";
import { getLanguageProficiencyPercentage } from "../constants.ts";
import { CareerCardActions } from "./CareerCardActions.tsx";
import { CareerCardShell } from "./CareerCardShell.tsx";

export interface LanguageCardProps {
  item: CareerLanguage;
  onEdit?: (item: CareerLanguage) => void;
  onDelete?: (item: CareerLanguage) => void;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({ item: lang, onEdit, onDelete }) => {
  const percent = getLanguageProficiencyPercentage(lang.proficiency);

  return (
    <CareerCardShell className="p-4 sm:p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <span className="font-gothic text-[10px] font-bold uppercase tracking-[0.16em] text-cloud-dark block">
            Fluency
          </span>
          <h3 className="font-gothic text-xl font-bold uppercase tracking-tight text-slate-dark break-words">
            {lang.language}
          </h3>
        </div>

        <CareerCardActions
          itemName={lang.language}
          onEdit={onEdit ? () => onEdit(lang) : undefined}
          onDelete={onDelete ? () => onDelete(lang) : undefined}
          compact
        />
      </div>

      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-clay break-words">
          {lang.proficiency}
        </span>
        <span className="font-mono text-[11px] text-cloud-dark shrink-0">{percent}%</span>
      </div>

      {/* Editorial Meter Bar */}
      <div className="w-full h-1.5 rounded-full bg-ivory-medium border border-stone/40 overflow-hidden">
        <div
          className="h-full bg-slate-dark rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </CareerCardShell>
  );
};
